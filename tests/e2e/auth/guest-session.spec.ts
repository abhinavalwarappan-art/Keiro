import { test, expect, guestLogin } from '../fixtures/keiro'

/**
 * Genuine sign-in check. Runs in the default (unauthenticated) project — no
 * shared storageState — so it actually verifies that guestLogin establishes a
 * real Supabase session, rather than passing trivially off a preloaded cookie.
 */
test('guest login establishes a real Supabase session cookie', async ({ page }) => {
  await guestLogin(page)
  const cookies = await page.context().cookies()
  const authCookie = cookies.find((c) => c.name.startsWith('sb-') && c.name.includes('auth-token'))
  expect(authCookie, 'expected a Supabase auth-token cookie after guest sign-in').toBeTruthy()
})