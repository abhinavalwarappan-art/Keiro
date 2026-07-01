import { test, expect } from '@playwright/test'

/**
 * Harness smoke test — proves the Playwright setup runs against the live app.
 * No mocks, no auth: just public routes, the landing page, and the health probe.
 */

const PUBLIC_ROUTES = ['/', '/privacy', '/terms', '/emergency', '/auth', '/onboarding'] as const

test.describe('public routes load', () => {
  for (const path of PUBLIC_ROUTES) {
    test(`GET ${path} renders without server error`, async ({ page }) => {
      const response = await page.goto(path, { waitUntil: 'domcontentloaded' })
      expect(response, `no response for ${path}`).not.toBeNull()
      expect(response!.status(), `bad status for ${path}`).toBeLessThan(400)
      // Something real painted — not a blank error shell.
      await expect(page.locator('body')).not.toBeEmpty()
    })
  }
})

test('landing page has expected title and a visible heading', async ({ page }) => {
  await page.goto('/')
  await expect(page).toHaveTitle(/Keiro/i)
  await expect(page.locator('h1').first()).toBeVisible()
})

test('GET /api/health returns ok', async ({ request }) => {
  const res = await request.get('/api/health')
  expect(res.status()).toBe(200)
  expect(await res.json()).toEqual({ status: 'ok' })
})

test('protected API rejects unauthenticated POST', async ({ request }) => {
  // /api/chat is gated by middleware — no Supabase session means no entry.
  const res = await request.post('/api/chat', {
    data: { messages: [], language: 'English' },
    headers: { 'Content-Type': 'application/json' },
  })
  expect([401, 403]).toContain(res.status())
})