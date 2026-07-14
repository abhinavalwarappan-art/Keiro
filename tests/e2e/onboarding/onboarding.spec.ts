import { test, expect } from '../fixtures/keiro'

// Stable test language (from src/lib/languages.ts):
//   code: 'es-ES', en: 'Spanish', native: 'Español', roman: 'Espanyol'
const LANG_CODE = 'es-ES'
const LANG_EN = 'Spanish'
const LANG_NATIVE = 'Español'

// Suppress the cookie-consent banner so it can't intercept clicks.
// The banner only appears if 'keiro_cookie_consent' is unset; marking it
// 'declined' is the minimal way to keep the banner hidden without
// triggering PostHog init side-effects.
async function dismissCookieBanner(page: import('@playwright/test').Page) {
  await page.addInitScript(() => {
    localStorage.setItem('keiro_cookie_consent', 'declined')
  })
}

test.describe('onboarding — language picker (/onboarding)', () => {
  test.beforeEach(async ({ page }) => {
    await dismissCookieBanner(page)
  })

  test('renders search input and at least one language option', async ({ page }) => {
    await page.goto('/onboarding')
    const searchInput = page.getByLabel('Search languages')
    await expect(searchInput).toBeVisible()
    // The listbox must contain at least one option
    const firstOption = page.getByRole('option').first()
    await expect(firstOption).toBeVisible()
  })

  test('search filters the language list', async ({ page }) => {
    await page.goto('/onboarding')
    const searchInput = page.getByLabel('Search languages')
    await searchInput.fill('Spanish')
    // After filtering, "Spanish" option must be visible
    await expect(page.getByRole('option', { name: /Spanish/i }).first()).toBeVisible()
    // A language that does NOT match should not be present
    await expect(page.getByRole('option', { name: /^French/i }).first()).not.toBeVisible()
  })

  test('searching for a non-existent term shows empty state', async ({ page }) => {
    await page.goto('/onboarding')
    const searchInput = page.getByLabel('Search languages')
    await searchInput.fill('xyzzy_no_such_language')
    await expect(page.getByText(/no languages match/i)).toBeVisible()
  })

  test('picking a language navigates to /onboarding/confirm?lang=<code>', async ({ page }) => {
    await page.goto('/onboarding')
    const searchInput = page.getByLabel('Search languages')
    await searchInput.fill('Spanish')
    // Click the Spanish option
    await page.getByRole('option', { name: /Spanish/i }).first().click()
    // Should land on confirm page with the lang query param
    await page.waitForURL(`**/onboarding/confirm?lang=${LANG_CODE}`)
    expect(page.url()).toContain(`lang=${LANG_CODE}`)
  })
})

test.describe('onboarding — confirm screen (/onboarding/confirm)', () => {
  test.beforeEach(async ({ page }) => {
    await dismissCookieBanner(page)
  })

  test('shows the chosen language name and a Continue button', async ({ page }) => {
    await page.goto(`/onboarding/confirm?lang=${LANG_CODE}`)
    // The page has a setTimeout(0) before populating state; wait for the button.
    await expect(page.getByTestId('confirm-continue')).toBeVisible()
    // The chosen language label should appear somewhere on screen
    await expect(page.getByText(LANG_EN).first()).toBeVisible()
  })

  test('romanization toggle flips aria-pressed', async ({ page }) => {
    await page.goto(`/onboarding/confirm?lang=${LANG_CODE}`)
    // Wait for the confirm content to render (setTimeout(0) delay)
    const continueBtn = page.getByTestId('confirm-continue')
    await expect(continueBtn).toBeVisible()

    const toggle = page.getByRole('button', { name: 'Toggle romanized script' })
    await expect(toggle).toBeVisible()
    // Initially romanization is off (aria-pressed = false)
    await expect(toggle).toHaveAttribute('aria-pressed', 'false')
    // Click to enable
    await toggle.click()
    await expect(toggle).toHaveAttribute('aria-pressed', 'true')
    // Click again to disable
    await toggle.click()
    await expect(toggle).toHaveAttribute('aria-pressed', 'false')
  })

  test('"Continue in <language>" navigates to /auth with expected query params and sets localStorage', async ({ page }) => {
    await page.goto(`/onboarding/confirm?lang=${LANG_CODE}`)
    const continueBtn = page.getByTestId('confirm-continue')
    await expect(continueBtn).toBeVisible()
    await continueBtn.click()

    // Should navigate to /auth
    await page.waitForURL('**/auth**')
    const url = new URL(page.url())
    expect(url.pathname).toBe('/auth')
    expect(url.searchParams.get('lang')).toBe(LANG_CODE)
    expect(url.searchParams.get('langName')).toBe(LANG_EN)
    expect(url.searchParams.get('langNative')).toBe(LANG_NATIVE)
    // roman param should be '0' (romanization off by default)
    expect(url.searchParams.get('roman')).toBe('0')

    // localStorage key should have been written before navigation
    const keiroRoman = await page.evaluate(() => localStorage.getItem('keiro-roman'))
    expect(keiroRoman).toBe('0')
  })

  test('"Continue in <language>" with romanization on sets roman=1 and localStorage keiro-roman=1', async ({ page }) => {
    await page.goto(`/onboarding/confirm?lang=${LANG_CODE}`)
    const continueBtn = page.getByTestId('confirm-continue')
    await expect(continueBtn).toBeVisible()

    // Enable romanization toggle
    const toggle = page.getByRole('button', { name: 'Toggle romanized script' })
    await toggle.click()
    await expect(toggle).toHaveAttribute('aria-pressed', 'true')

    await continueBtn.click()
    await page.waitForURL('**/auth**')

    const url = new URL(page.url())
    expect(url.searchParams.get('roman')).toBe('1')

    const keiroRoman = await page.evaluate(() => localStorage.getItem('keiro-roman'))
    expect(keiroRoman).toBe('1')
  })

  test('"← All languages" link returns to /onboarding', async ({ page }) => {
    await page.goto(`/onboarding/confirm?lang=${LANG_CODE}`)
    // Wait for content to load
    await expect(page.getByTestId('confirm-continue')).toBeVisible()

    const backLink = page.getByTestId('confirm-all-languages')
    await expect(backLink).toBeVisible()
    await backLink.click()
    // /onboarding?fresh=1 — must not still be on /confirm
    await page.waitForURL(/\/onboarding(\?|$)/)
    expect(page.url()).not.toContain('/confirm')
    await expect(page.getByLabel('Search languages')).toBeVisible()
  })

  test('redirects to /onboarding when no lang param is provided', async ({ page }) => {
    await page.goto('/onboarding/confirm')
    // The setTimeout(0) fires, detects no lang, and calls router.replace('/onboarding')
    // Wait until we leave /confirm entirely
    await page.waitForURL(/\/onboarding(\?|$)/, { timeout: 5000 })
    expect(page.url()).not.toContain('/confirm')
  })

  test('redirects to /onboarding when an invalid lang param is provided', async ({ page }) => {
    await page.goto('/onboarding/confirm?lang=not-a-real-language-code')
    // resolveLanguage returns undefined → router.replace('/onboarding')
    // waitForURL must match a URL that is /onboarding but NOT /confirm
    await page.waitForURL(/\/onboarding(\?|$)/, { timeout: 5000 })
    expect(page.url()).not.toContain('/confirm')
  })
})

test.describe('onboarding — deep-link behaviour', () => {
  test.beforeEach(async ({ page }) => {
    await dismissCookieBanner(page)
  })

  test('/onboarding?lang=<code> skips picker and lands on confirm', async ({ page }) => {
    await page.goto(`/onboarding?lang=${LANG_CODE}`)
    await page.waitForURL(`**/onboarding/confirm?lang=${LANG_CODE}`)
    expect(page.url()).toContain(`lang=${LANG_CODE}`)
    await expect(page.getByTestId('confirm-continue')).toBeVisible()
  })

  test('/onboarding?fresh=1 clears saved language from localStorage', async ({ page }) => {
    // Navigate to /onboarding first so we can seed localStorage in the same origin
    await page.goto('/onboarding')
    await expect(page.getByLabel('Search languages')).toBeVisible()
    await page.evaluate(() => {
      localStorage.setItem('keiro_onboarding_lang', JSON.stringify({ code: 'es-ES', en: 'Spanish' }))
    })
    // Verify it is set
    const before = await page.evaluate(() => localStorage.getItem('keiro_onboarding_lang'))
    expect(before).not.toBeNull()

    // Navigate with fresh=1 — the onboarding page useEffect removes the key
    await page.goto('/onboarding?fresh=1')
    await expect(page.getByLabel('Search languages')).toBeVisible()
    // Wait for the useEffect to fire and remove the key (it runs after mount/render)
    await page.waitForFunction(() => localStorage.getItem('keiro_onboarding_lang') === null)
    const saved = await page.evaluate(() => localStorage.getItem('keiro_onboarding_lang'))
    expect(saved).toBeNull()
  })
})