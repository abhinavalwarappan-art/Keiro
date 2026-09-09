import { test, expect } from '@playwright/test'

/**
 * Request-level API contract tests (no browser, no mocks) — exercises the real
 * route handlers + middleware. Validates the public contracts and the auth gate.
 * Uses raw `request` so there is no Supabase session: protected routes must reject.
 */

test.describe('GET /api/health', () => {
  test('public probe returns {status:"ok"}', async ({ request }) => {
    const res = await request.get('/api/health')
    expect(res.status()).toBe(200)
    expect(await res.json()).toEqual({ status: 'ok' })
  })
})

test.describe('protected APIs reject anonymous requests', () => {
  // Middleware (src/proxy.ts) gates these; no session ⇒ 401 (or 403 on CSRF/origin checks).
  for (const path of ['/api/chat', '/api/report', '/api/translate', '/api/feedback'] as const) {
    test(`POST ${path} without a session is rejected`, async ({ request }) => {
      const res = await request.post(path, { data: {} })
      expect([401, 403]).toContain(res.status())
    })
  }
})

test.describe('POST /api/contact (public)', () => {
  // The route checks an IP-based limit (5/15min, Supabase-backed, shared under the
  // localhost "unknown" IP) BEFORE validating, and counts every attempt — so on
  // repeated suite runs a request may legitimately get 429 instead of 400. Both are
  // correct rejections; we assert "client-rejected with an error" and verify the
  // specific 400 message only when not rate-limited.
  test('missing required fields is rejected', async ({ request }) => {
    const res = await request.post('/api/contact', { data: { clinicName: 'Clinic' } })
    expect([400, 429]).toContain(res.status())
    const body: unknown = await res.json()
    expect(body).toBeTruthy()
    expect(typeof body === 'object' && body !== null && 'error' in body).toBe(true)
    const typedBody = body as { error: unknown }
    expect(typedBody.error).toBeTruthy()
    if (res.status() === 400) expect(String(typedBody.error)).toMatch(/required|missing/i)
  })

  test('invalid email is rejected', async ({ request }) => {
    const res = await request.post('/api/contact', {
      data: { clinicName: 'Clinic', contactName: 'Jane', email: 'not-an-email' },
    })
    expect([400, 429]).toContain(res.status())
    const body: unknown = await res.json()
    expect(body).toBeTruthy()
    expect(typeof body === 'object' && body !== null && 'error' in body).toBe(true)
    const typedBody = body as { error: unknown }
    expect(typedBody.error).toBeTruthy()
    if (res.status() === 400) expect(String(typedBody.error)).toMatch(/email/i)
  })

  // NOTE: a valid submission is intentionally NOT tested here — it sends a real
  // email via Resend. Successful-submit UX is covered (mocked) at the page level.
})
