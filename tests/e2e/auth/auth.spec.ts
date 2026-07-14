import { test, expect, silenceSpeech, guestLogin } from '../fixtures/keiro'

// ─── helpers ───────────────────────────────────────────────────────────────

/** Navigate to /auth with standard English params. */
async function gotoAuth(page: Parameters<typeof silenceSpeech>[0]) {
  await silenceSpeech(page)
  await page.goto('/auth?lang=en-US&langName=English&langNative=English&roman=0')
}

/**
 * Locate a visible role="alert" element that is NOT the Next.js route announcer.
 * Next.js injects a hidden `<div role="alert" id="__next-route-announcer__">` on
 * every page, which causes strict-mode violations when querying getByRole('alert').
 */
function appAlert(page: Parameters<typeof silenceSpeech>[0]) {
  return page.locator('[role="alert"]:not([id="__next-route-announcer__"])')
}

// ─── /auth screen (guest-only) ──────────────────────────────────────────────
//
// Keiro is guest-only: /auth offers anonymous sign-in and nothing else. The
// method screen (Continue with email / phone / Google) and its email and phone
// steps were removed in the rebuild, and their specs deleted with them.

test.describe('/auth screen (guest-only)', () => {
  test('language badge shows the native language name', async ({ page }) => {
    await silenceSpeech(page)
    await page.goto('/auth?lang=es-MX&langName=Spanish&langNative=Español&roman=0')
    // The badge renders {langNative} from the search param (auth/page.tsx line 156)
    await expect(page.locator('span').filter({ hasText: 'Español' }).first()).toBeVisible()
  })

  test('back button has accessible label', async ({ page }) => {
    await gotoAuth(page)
    await expect(page.getByRole('button', { name: 'Go back' })).toBeVisible()
  })

  test('guest start completes real anon auth and lands on /chat', async ({ page }) => {
    // guestLogin is the shared fixture that drives this exact flow
    await guestLogin(page)
    await expect(page).toHaveURL(/\/chat/)
    // Verify a Supabase auth cookie was set
    const cookies = await page.context().cookies()
    const authCookie = cookies.find((c) => c.name.startsWith('sb-') && c.name.includes('auth-token'))
    expect(authCookie, 'expected a Supabase auth-token cookie').toBeTruthy()
  })
})


// ─── reset-password page ─────────────────────────────────────────────────────

test.describe('reset-password page', () => {
  test.beforeEach(async ({ page }) => {
    await silenceSpeech(page)
    // Navigate directly — no recovery token present, so we only test UI gates
    await page.goto('/auth/reset-password')
  })

  test('renders new-password and confirm-password inputs and Update button', async ({ page }) => {
    await expect(page.locator('#new-password')).toBeVisible()
    await expect(page.locator('#confirm-password')).toBeVisible()
    await expect(page.getByRole('button', { name: /update password/i })).toBeVisible()
  })

  test('Update password is disabled when fields are empty', async ({ page }) => {
    await expect(page.getByRole('button', { name: /update password/i })).toBeDisabled()
  })

  test('Update password is disabled when password < 8 chars', async ({ page }) => {
    await page.locator('#new-password').fill('short')
    await page.locator('#confirm-password').fill('short')
    await expect(page.getByRole('button', { name: /update password/i })).toBeDisabled()
  })

  test('mismatch alert visible when confirm differs from new password', async ({ page }) => {
    await page.locator('#new-password').fill('mypassword123')
    await page.locator('#confirm-password').fill('different123')
    await expect(appAlert(page)).toBeVisible()
    await expect(appAlert(page)).toContainText(/don't match/i)
  })

  test('mismatch alert absent when fields match', async ({ page }) => {
    await page.locator('#new-password').fill('mypassword123')
    await page.locator('#confirm-password').fill('mypassword123')
    await expect(appAlert(page)).not.toBeVisible()
  })

  test('Update password enabled only when pw >= 8 and both fields match', async ({ page }) => {
    await page.locator('#new-password').fill('securepass1')
    await page.locator('#confirm-password').fill('securepass1')
    // canSubmit = true; button is enabled. Clicking it will fail (no recovery token)
    // but we only assert the gated state here.
    await expect(page.getByRole('button', { name: /update password/i })).toBeEnabled()
  })

  /**
   * BUG NOTE: When the submit fires without a valid recovery token (no ?code= in URL),
   * Supabase updateUser returns an error. The page currently shows the error via
   * role="alert" — verify that path renders gracefully without crashing.
   *
   * This test intentionally clicks a gated-but-enabled button to exercise the error branch.
   */
  test('submitting without recovery token shows role="alert" error gracefully', async ({ page }) => {
    await page.locator('#new-password').fill('securepass1')
    await page.locator('#confirm-password').fill('securepass1')
    await page.getByRole('button', { name: /update password/i }).click()
    // updateUser rejects with no recovery session; handleSubmit maps it to the
    // friendly "reset link may have expired" message rendered as role="alert"
    // (reset-password/page.tsx lines 36-42). The page must not crash.
    await expect(appAlert(page)).toBeVisible()
    await expect(appAlert(page)).toContainText(/could not update|expired|request a new/i)
  })
})