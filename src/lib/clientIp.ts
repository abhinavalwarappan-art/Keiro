import type { NextRequest } from 'next/server'

/** No proxy header present — there is no trustworthy client IP for this request. */
export const UNKNOWN_IP = 'unknown'

/**
 * The client IP used to key the per-IP rate limiters.
 *
 * TRUST MODEL — read before changing this.
 *
 * `x-forwarded-for` is a CHAIN. Each proxy APPENDS the address it received the
 * connection from, so the chain reads `<client>, <proxy1>, <proxy2>`. A client can
 * seed that chain by sending the header itself, which means the LEFTMOST entry is
 * fully attacker-controlled and the RIGHTMOST is the one written by the proxy
 * closest to us — the only hop we actually observed. We take the rightmost.
 *
 * On Vercel (our deployment target — see README) this is belt-and-braces: the edge
 * overwrites `x-forwarded-for` with the true client IP and does not forward external
 * ones, so the header arrives as a single trustworthy value and rightmost == leftmost.
 * https://vercel.com/docs/headers/request-headers
 *
 * It stops being belt-and-braces the moment Keiro runs anywhere else — self-hosted by
 * a clinic, behind nginx or Cloudflare, or on Vercel Enterprise with a trusted proxy
 * configured (which per those same docs DOES forward external IPs). In every one of
 * those cases the old leftmost read let a client pick its own rate-limit bucket by
 * sending one header. Reading the rightmost is correct under all of them.
 *
 * `x-real-ip` is deliberately NOT consulted: on Vercel it is redundant (the edge always
 * sets `x-forwarded-for`), and off Vercel it is a single unchained value a client can
 * set at will — i.e. it only ever adds the bypass back.
 *
 * Returns UNKNOWN_IP when no forwarding header is present at all. That means there is
 * no trustworthy IP — not that the IP is safe to guess. Callers decide what to do
 * (proxy.ts rejects; the public contact form shares one bucket).
 */
export function getClientIp(req: NextRequest): string {
  const forwarded = req.headers.get('x-forwarded-for')
  if (!forwarded) return UNKNOWN_IP

  const hops = forwarded
    .split(',')
    .map(hop => hop.trim())
    .filter(Boolean)

  return hops[hops.length - 1] ?? UNKNOWN_IP
}

/**
 * SHA-256 the IP and keep the first 32 hex chars. We never store or log raw IPs;
 * the hash is only ever compared for equality inside a rate-limit window.
 */
export async function hashIp(ip: string): Promise<string> {
  const data = new TextEncoder().encode(ip)
  const buf = await crypto.subtle.digest('SHA-256', data)
  return Array.from(new Uint8Array(buf))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('')
    .slice(0, 32)
}
