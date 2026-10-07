import { test } from '../fixtures/keiro'
import { expectNoA11yViolations, gotoAndSettle } from '../fixtures/a11y'

/**
 * Accessibility regression gate — every public route, scanned with axe-core.
 * Critical/serious violations fail the suite (see fixtures/a11y.ts).
 *
 * When you add a page, add its route here. The authed pages (/chat, /history,
 * /settings) live in tests/e2e/a11y-authed/ so they reuse the shared guest
 * session instead of hammering Supabase's per-IP anonymous sign-in limit.
 */
const PUBLIC_ROUTES = [
  '/',
  '/about',
  '/accessibility',
  '/auth',
  '/auth/reset-password',
  '/contact',
  '/emergency',
  '/for-clinics',
  '/languages',
  '/meet-kai',
  '/onboarding',
  '/onboarding/confirm',
  '/privacy',
  '/privacy-safety',
  '/report',
  '/terms',
]

for (const route of PUBLIC_ROUTES) {
  test(`axe: ${route} has no critical/serious violations`, async ({ page }) => {
    await gotoAndSettle(page, route)
    await expectNoA11yViolations(page, route)
  })
}
