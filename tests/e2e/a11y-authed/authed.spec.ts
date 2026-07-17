import { test, mockChat, startGuestSession } from '../fixtures/keiro'
import { expectNoA11yViolations, gotoAndSettle } from '../fixtures/a11y'

/**
 * Accessibility regression gate for the session-gated surfaces. Runs in the
 * `chromium-authed` project so all specs share the single guest session
 * (Supabase rate-limits anonymous sign-in per IP — never sign in per-test).
 * Chat replies are mocked so the scan sees a deterministic conversation.
 */

test('axe: /chat conversation has no critical/serious violations', async ({ page }) => {
  await mockChat(page)
  await startGuestSession(page)
  await expectNoA11yViolations(page, '/chat')
})

for (const route of ['/history', '/settings']) {
  test(`axe: ${route} has no critical/serious violations`, async ({ page }) => {
    await gotoAndSettle(page, route)
    await expectNoA11yViolations(page, route)
  })
}
