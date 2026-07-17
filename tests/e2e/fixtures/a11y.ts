import { AxeBuilder } from '@axe-core/playwright'
import { expect, type Page } from '@playwright/test'

/**
 * Shared axe-core scan for the accessibility regression suite.
 *
 * Contract: CRITICAL and SERIOUS violations fail the run — that is the
 * regression gate that keeps new pages from re-accumulating a11y debt.
 * Moderate/minor findings are logged as warnings so they stay visible
 * without making the suite flaky over judgement-call rules.
 *
 * The tag set matches the full audit that took the site from 224 violation
 * nodes to 0 (July 2026): WCAG 2.0/2.1/2.2 A+AA plus axe's best-practice
 * rules (region, skip-link, heading-order, landmark-one-main — all of which
 * were real failures for screen-reader users here, not style points).
 */
export const AXE_TAGS = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa', 'best-practice']

export async function expectNoA11yViolations(page: Page, route: string): Promise<void> {
  const results = await new AxeBuilder({ page }).withTags(AXE_TAGS).analyze()

  const blocking = results.violations.filter(
    (v) => v.impact === 'critical' || v.impact === 'serious'
  )
  const advisory = results.violations.filter(
    (v) => v.impact !== 'critical' && v.impact !== 'serious'
  )

  for (const v of advisory) {
    console.warn(
      `[a11y advisory] ${route}: [${v.impact}] ${v.id} — ${v.nodes.length} node(s): ${v.help}`
    )
  }

  const report = blocking.map(
    (v) =>
      `[${v.impact}] ${v.id} (${v.nodes.length} node(s)) — ${v.help}\n` +
      v.nodes
        .slice(0, 5)
        .map((n) => `    ${n.target.join(' ')}`)
        .join('\n')
  )
  expect(report, `${route} has critical/serious accessibility violations`).toEqual([])
}

/** Navigate and let deferred UI (cookie banner slot, reveals, fonts) settle. */
export async function gotoAndSettle(page: Page, route: string): Promise<void> {
  await page.goto(route, { waitUntil: 'load' })
  await page.waitForTimeout(1200)
}
