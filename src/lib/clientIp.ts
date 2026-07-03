import type { NextRequest } from 'next/server'

/**
 * Best-effort client IP from the standard proxy headers. Returns 'unknown' when
 * no forwarding header is present (e.g. a direct local request in dev).
 */
export function getClientIp(req: NextRequest): string {
  return (
    req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    req.headers.get('x-real-ip') ||
    'unknown'
  )
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
