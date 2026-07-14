import { describe, it, expect } from 'vitest'
import type { NextRequest } from 'next/server'
import { getClientIp, hashIp, UNKNOWN_IP } from '@/lib/clientIp'

/** Minimal stand-in — getClientIp only ever reads req.headers. */
function reqWith(headers: Record<string, string>): NextRequest {
  return { headers: new Headers(headers) } as unknown as NextRequest
}

/** The value the rate limiters actually key on. */
const bucketFor = (headers: Record<string, string>) => hashIp(getClientIp(reqWith(headers)))

describe('getClientIp', () => {
  // The bug this fixes: a proxy APPENDS to x-forwarded-for, so a client that sends the
  // header itself owns the LEFTMOST entry. Keying on it let an attacker mint a fresh
  // rate-limit bucket per request just by varying one header.
  it('ignores a client-seeded leftmost hop and takes the rightmost', () => {
    const ip = getClientIp(reqWith({ 'x-forwarded-for': '6.6.6.6, 203.0.113.9' }))
    expect(ip).toBe('203.0.113.9')
  })

  it('rate-limits two requests with DIFFERENT spoofed XFF values as the SAME client', async () => {
    // Same attacker (real IP 203.0.113.9 appended by our proxy), two spoof attempts.
    const first = await bucketFor({ 'x-forwarded-for': '6.6.6.6, 203.0.113.9' })
    const second = await bucketFor({ 'x-forwarded-for': '7.7.7.7, 203.0.113.9' })

    expect(first).toBe(second)

    // Sanity: the old leftmost rule would have produced two different buckets.
    const leftmostFirst = await hashIp('6.6.6.6')
    const leftmostSecond = await hashIp('7.7.7.7')
    expect(leftmostFirst).not.toBe(leftmostSecond)
  })

  it('still separates two genuinely different clients', async () => {
    const a = await bucketFor({ 'x-forwarded-for': '203.0.113.9' })
    const b = await bucketFor({ 'x-forwarded-for': '198.51.100.4' })
    expect(a).not.toBe(b)
  })

  it('handles the single-value header Vercel actually sends', () => {
    // Vercel's edge overwrites x-forwarded-for with the true client IP, so it arrives
    // unchained. Rightmost must degrade to exactly that value.
    expect(getClientIp(reqWith({ 'x-forwarded-for': '203.0.113.9' }))).toBe('203.0.113.9')
  })

  it('does NOT trust x-real-ip, which a client can set freely off-platform', () => {
    expect(getClientIp(reqWith({ 'x-real-ip': '6.6.6.6' }))).toBe(UNKNOWN_IP)
  })

  it('reports UNKNOWN_IP when no forwarding header is present', () => {
    expect(getClientIp(reqWith({}))).toBe(UNKNOWN_IP)
  })

  it('tolerates whitespace and empty hops rather than keying on an empty string', () => {
    expect(getClientIp(reqWith({ 'x-forwarded-for': '6.6.6.6,   203.0.113.9  , ' }))).toBe('203.0.113.9')
    expect(getClientIp(reqWith({ 'x-forwarded-for': '   ' }))).toBe(UNKNOWN_IP)
  })
})
