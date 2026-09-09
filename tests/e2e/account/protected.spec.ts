import { test, expect, guestLogin } from '../fixtures/keiro'
import type { Page, Browser, BrowserContext } from '@playwright/test'

// ─── inline helper ─────────────────────────────────────────────────────────

/**
 * Create a browser context with cookie-banner suppression and TTS silencing.
 * Mirrors the initScript in the shared `test` fixture (fixtures/keiro.ts:26-44).
 * Without this, the cookie consent banner overlays interactive elements like
 * the romanization switch, causing clicks to go to the banner.
 */
async function makeContext(browser: Browser): Promise<BrowserContext> {
  const ctx = await browser.newContext()
  await ctx.addInitScript(() => {
    try {
      localStorage.setItem('keiro_cookie_consent', 'declined')
    } catch { /* opaque origin (about:blank) */ }
    try {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.getVoices = () => []
        window.speechSynthesis.speak = () => {}
      }
    } catch { /* no-op */ }
  })
  return ctx
}

/** Wait for Settings h1 — only mounts after loading=false (settings/page.tsx:208) */
async function waitForSettings(page: Page): Promise<void> {
  await expect(page.getByRole('heading', { name: 'Settings', level: 1 })).toBeVisible()
}

/** Wait for "Past visits" h1 — only mounts after loading=false (history/page.tsx:73) */
async function waitForHistory(page: Page): Promise<void> {
  await expect(page.getByRole('heading', { name: 'Past visits', level: 1 })).toBeVisible()
}

// ─── redirect: logged-out user ───────────────────────────────────────────────
// Uses the base fixture's fresh context — no auth cookie, no guestLogin call.

test.describe('logged-out redirect', () => {
  test('redirects /history to /auth?next=/history when not logged in', async ({ page }) => {
    await page.goto('/history')
    await page.waitForURL(/\/auth/)
    // src/proxy.ts:85-87: searchParams.set('next', '/history') → ?next=%2Fhistory
    await expect(page).toHaveURL(
      /\/auth\?.*next=%2Fhistory|\/auth\?.*next=\/history/
    )
  })

  test('redirects /settings to /auth?next=/settings when not logged in', async ({ page }) => {
    await page.goto('/settings')
    await page.waitForURL(/\/auth/)
    await expect(page).toHaveURL(
      /\/auth\?.*next=%2Fsettings|\/auth\?.*next=\/settings/
    )
  })
})

// ─── all authenticated tests — ONE guestLogin, serial order ───────────────
//
// Single outer describe.serial with one beforeAll/afterAll.
// ONE signInAnonymously call covers /history, /settings, and sign-out.
// Sign-out runs last to avoid invalidating the session before other tests.

test.describe('guest access to protected pages', () => {
  test.describe.configure({ mode: 'serial' })

  let ctx: BrowserContext
  let page: Page

  test.beforeAll(async ({ browser }) => {
    ctx = await makeContext(browser)
    page = await ctx.newPage()
    // Single guestLogin for all tests in this block
    await guestLogin(page)
  })

  test.afterAll(async () => {
    await ctx.close()
  })

  // ── /history ──────────────────────────────────────────────────────────

  test('guest /history: renders "Past visits" h1', async () => {
    await page.goto('/history')
    await waitForHistory(page)
    // src/app/history/page.tsx:73
    await expect(page.getByRole('heading', { name: 'Past visits', level: 1 })).toBeVisible()
  })

  test('guest /history: shows empty state for a fresh guest with no reports', async () => {
    // Page already at /history from previous test (serial mode)
    // src/app/history/page.tsx:107-108
    await expect(page.getByText('No visits yet')).toBeVisible()
    await expect(page.getByText('Your past reports will appear here')).toBeVisible()
  })

  test('guest /history: back button is present with correct aria-label', async () => {
    // src/app/history/page.tsx:69 — aria-label="Go back"
    await expect(page.getByRole('button', { name: 'Go back' })).toBeVisible()
  })

  // ── /settings ─────────────────────────────────────────────────────────

  test('guest /settings: renders "Settings" h1', async () => {
    await page.goto('/settings')
    await waitForSettings(page)
    // src/app/settings/page.tsx:208
    await expect(page.getByRole('heading', { name: 'Settings', level: 1 })).toBeVisible()
  })

  test('guest /settings: renders expected section headings', async () => {
    // SectionCard labels (src/app/settings/page.tsx)
    // CSS text-transform:uppercase is visual only; DOM text nodes are unchanged
    await expect(page.getByText('Language')).toBeVisible()
    await expect(page.getByText('Data & Privacy')).toBeVisible()
  })

  test('guest /settings: analytics switch is visible and toggleable', async () => {
    // Always rendered, not gated by profile row (src/app/settings/page.tsx:307-320)
    const sw = page.getByRole('switch', { name: 'Anonymous analytics' })
    await expect(sw).toBeVisible()

    const before = await sw.getAttribute('aria-checked')
    await sw.click()
    await expect(sw).not.toHaveAttribute('aria-checked', before ?? 'false')
    // Restore original state so later tests start with consistent state
    await sw.click()
  })

  test('guest /settings: romanization switch is visible and toggleable when profile row exists', async () => {
    // Gated by `{profile && <SectionCard label="Display">}` (settings/page.tsx:274)
    // A guest user may not have a profiles DB row → switch absent → skip gracefully.
    const sw = page.getByRole('switch', { name: 'Show romanized text' })
    const visible = await sw.isVisible()

    if (!visible) {
      test.info().annotations.push({
        type: 'note',
        description:
          'Romanization switch absent — guest has no profiles row. ' +
          'Display section intentionally hidden (settings/page.tsx:274).',
      })
      return
    }

    const before = await sw.getAttribute('aria-checked')
    await sw.click()
    await expect(sw).not.toHaveAttribute('aria-checked', before ?? 'false')
    // Restore
    await sw.click()
  })

  test('guest /settings: "Download my data" button is present', async () => {
    // src/app/settings/page.tsx:323-340
    await expect(page.getByRole('button', { name: /Download my data/i })).toBeVisible()
  })

  test('guest /settings: "Sign out" button is present', async () => {
    // src/app/settings/page.tsx:375-381
    await expect(page.getByRole('button', { name: /Sign out/i })).toBeVisible()
  })

  test('guest /settings: feedback is submitted through the server endpoint', async () => {
    let submitted: unknown
    await page.route('**/api/feedback', async route => {
      submitted = route.request().postDataJSON()
      await route.fulfill({ status: 201, contentType: 'application/json', body: '{"success":true}' })
    })

    await page.getByRole('button', { name: /Send feedback/i }).click()
    await page.getByPlaceholder("Tell us what's on your mind…").fill('Pilot feedback test')
    await page.getByRole('button', { name: 'Send', exact: true }).click()

    await expect(page.getByRole('button', { name: 'Sent!', exact: true })).toBeVisible()
    expect(submitted).toEqual({
      type: 'general',
      message: 'Pilot feedback test',
      pageUrl: '/settings',
    })
  })

  // Sign-out runs LAST — it invalidates the session. After this, the shared
  // `page` would no longer be authenticated, so no further tests should use it.
  test('sign out from /settings redirects to /', async () => {
    // src/app/settings/page.tsx:163-166 — handleSignOut: signOut() + router.push('/')
    await page.getByRole('button', { name: /Sign out/i }).click()
    await page.waitForURL('/')
    await expect(page).toHaveURL('/')
  })
})
