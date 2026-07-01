import { test as setup, guestLogin } from './fixtures/keiro'

/**
 * Authenticate ONCE per run as an anonymous guest and persist the session.
 * The `chromium-authed` project loads this storageState so the chat specs reuse
 * a single real Supabase session instead of each calling signInAnonymously
 * (which Supabase rate-limits per IP/hour).
 */
const GUEST_STATE = 'tests/e2e/.auth/guest.json'

setup('authenticate as guest', async ({ page }) => {
  await guestLogin(page)
  await page.context().storageState({ path: GUEST_STATE })
})