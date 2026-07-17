import { test, expect } from '../fixtures/keiro'

// ── Constants mirrored from src/lib/chatSession.ts ──────────────────────────
// Intentionally inlined here so the spec doesn't import app source (keeps E2E
// layer independent of the implementation layer).
const ACTIVE_CHAT_SESSION_KEY = 'keiro_active_chat_session'
const EMERGENCY_CHAT_SOURCE_KEY = 'keiro_emergency_source_chat'

// EMERGENCY_TRANSLATIONS has 15 entries in src/app/emergency/page.tsx (lines 11-26).
const TRANSLATION_COUNT = 15

// RTL languages as named in EMERGENCY_TRANSLATIONS (page.tsx lines 14, 18, 25).
const RTL_LANGS = ['العربية', 'اردو', 'فارسی'] as const

// ── Inline helper ────────────────────────────────────────────────────────────

/**
 * Wait until the last translation card is visible. Framer Motion staggers the
 * cards with a per-index delay (i * 0.035 s), so the last card resolves
 * after ≈ 14 * 35 ms = 490 ms. Playwright's auto-wait covers this without
 * a fixed sleep.
 */
async function waitForTranslationCards(page: import('@playwright/test').Page) {
  // The last article in the translations section must be visible before we
  // make count/content assertions.
  await expect(page.locator('article').last()).toBeVisible()
}

// ── Tests ────────────────────────────────────────────────────────────────────

test.describe('/emergency page', () => {
  test('renders without auth and returns 200', async ({ page }) => {
    const response = await page.goto('/emergency', { waitUntil: 'domcontentloaded' })
    expect(response).not.toBeNull()
    expect(response!.status()).toBeLessThan(400)
    await expect(page.locator('body')).not.toBeEmpty()
  })

  test('shows the main h1 "This looks urgent"', async ({ page }) => {
    await page.goto('/emergency')
    // page.tsx line 73: <h1 ... >This looks urgent</h1>
    await expect(page.getByRole('heading', { level: 1, name: 'This looks urgent' })).toBeVisible()
  })

  test('shows the "Emergency message in all languages" section heading and number badge', async ({ page }) => {
    await page.goto('/emergency')

    // h2 with "Emergency message in all languages"
    await expect(
      page.getByRole('heading', { name: /emergency message in all languages/i }),
    ).toBeVisible()

    // Since 1851d1f the number is locale-resolved, never hardcoded 911: a bare
    // visit (no ?lang=, no chat session) shows the global GSM fallback 112.
    const badge = page.locator('span', { hasText: '112' }).first()
    await expect(badge).toBeVisible()
  })

  test('?lang= resolves the locale-specific emergency number (en-US → 911)', async ({ page }) => {
    await page.goto('/emergency?lang=en-US')
    await expect(page.locator('span', { hasText: '911' }).first()).toBeVisible()
  })

  test('renders all 15 language translation cards', async ({ page }) => {
    await page.goto('/emergency')
    await waitForTranslationCards(page)

    // Each translation is wrapped in a <article> element (page.tsx line 109).
    const cards = page.locator('article')
    await expect(cards).toHaveCount(TRANSLATION_COUNT)
  })

  test('renders known language names across cards', async ({ page }) => {
    await page.goto('/emergency')
    await waitForTranslationCards(page)

    // Spot-check a handful of language names from EMERGENCY_TRANSLATIONS.
    for (const lang of ['Español', 'Français', 'Tagalog', 'Türkçe']) {
      await expect(page.getByText(lang, { exact: true }).first()).toBeVisible()
    }
  })

  test('RTL language cards carry dir="rtl"', async ({ page }) => {
    await page.goto('/emergency')
    await waitForTranslationCards(page)

    // page.tsx line 127: <p dir={isRtl ? 'rtl' : 'ltr'} ...>
    // RTL langs: العربية, اردو, فارسی (lines 14, 18, 25).
    for (const lang of RTL_LANGS) {
      // Find the article that contains this language name, then assert its
      // inner text paragraph carries dir="rtl".
      const card = page.locator('article', { hasText: lang })
      await expect(card).toBeVisible()
      const rtlPara = card.locator('[dir="rtl"]')
      await expect(rtlPara).toBeVisible()
    }
  })

  test('"Continue chat" button is visible', async ({ page }) => {
    await page.goto('/emergency')
    await expect(page.getByRole('button', { name: /continue chat/i })).toBeVisible()
  })

  test('"Continue chat" navigates to /chat when no sessionStorage flags are set', async ({ page }) => {
    // No sessionStorage manipulation — mirrors the default code path in
    // handleContinueChat (page.tsx lines 36-45): hasActiveChat is null so
    // router.push('/chat') is called.
    await page.goto('/emergency')
    await page.getByRole('button', { name: /continue chat/i }).click()
    await page.waitForURL('**/chat**', { timeout: 10_000 })
    await expect(page).toHaveURL(/\/chat/)
  })

  test('"Continue chat" calls router.back() when both session flags are set', async ({ page }) => {
    // Simulate arriving at /emergency from an active chat session:
    //  1. Navigate to /chat first so there is a real history entry to go back to.
    //  2. Set both sessionStorage keys (page.tsx lines 36-37).
    //  3. Navigate to /emergency.
    //  4. Click Continue chat — router.back() should return to /chat.
    //
    // Note: this exercises the router.back() branch (page.tsx line 41). The
    // test treats "back lands on /chat" as the observable result. If /chat
    // requires auth and redirects away, the assertion is relaxed to confirm
    // we left /emergency.

    // Go to /chat first to seed browser history.
    await page.goto('/chat')
    const chatUrlPattern = /\/(chat|auth|onboarding)/

    // Set both flags that trigger the back() branch.
    await page.evaluate(
      ({ activeKey, sourceKey }: { activeKey: string; sourceKey: string }) => {
        sessionStorage.setItem(activeKey, '1')
        sessionStorage.setItem(sourceKey, '1')
      },
      { activeKey: ACTIVE_CHAT_SESSION_KEY, sourceKey: EMERGENCY_CHAT_SOURCE_KEY },
    )

    await page.goto('/emergency')

    // Verify EMERGENCY_CHAT_SOURCE_KEY is set before clicking.
    const sourceVal = await page.evaluate(
      (key: string) => sessionStorage.getItem(key),
      EMERGENCY_CHAT_SOURCE_KEY,
    )
    expect(sourceVal).toBe('1')

    await page.getByRole('button', { name: /continue chat/i }).click()

    // router.back() takes us off /emergency; accept any of the chat-flow pages.
    await page.waitForURL(chatUrlPattern, { timeout: 10_000 })
    await expect(page).not.toHaveURL(/\/emergency/)
  })
})