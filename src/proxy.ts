import { type NextRequest, NextResponse } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'

// API routes that require a valid Supabase session
const PROTECTED_API_ROUTES = ['/api/chat', '/api/report', '/api/translate']

// Pages that require a session — guests (anonymous auth) qualify.
// /chat is intentionally not gated: it starts a guest session client-side.
const PROTECTED_PAGES = ['/history', '/settings']

// Per-IP rate limits for API routes.
// These are a shared-WiFi safety net — per-session limits in rateLimit.ts are the primary tier.
const IP_LIMITS: Record<string, { limit: number; windowMs: number }> = {
  '/api/chat':      { limit: 200, windowMs: 60 * 60 * 1000 }, // 200 requests/IP/hour
  '/api/report':    { limit: 20,  windowMs: 60 * 60 * 1000 }, // 20 reports/IP/hour
  '/api/translate': { limit: 500, windowMs: 60 * 60 * 1000 }, // 500 translations/IP/hour
}

// Defense-in-depth only: this Map resets on every Vercel cold start and is not
// shared across serverless instances. Per-user DB limits in rateLimit.ts are
// the primary enforcement layer.
const ipAttempts = new Map<string, { count: number; resetAt: number }>()

function getClientIp(req: NextRequest): string {
  return (
    req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    req.headers.get('x-real-ip') ||
    'unknown'
  )
}

// Mirrors RATE_LIMIT_DISABLED in rateLimit.ts — bypasses the per-IP tier too.
const RATE_LIMIT_DISABLED = process.env.RATE_LIMIT_DISABLED === 'true'

function isIpOverLimit(ip: string, route: string): boolean {
  if (RATE_LIMIT_DISABLED) return false
  const config = IP_LIMITS[route]
  if (!config) return false
  const key = `${ip}:${route}`
  const now = Date.now()
  const record = ipAttempts.get(key)
  if (!record || now > record.resetAt) {
    ipAttempts.set(key, { count: 1, resetAt: now + config.windowMs })
    return false
  }
  if (record.count >= config.limit) return true
  record.count += 1
  return false
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl
  const isProtectedApi = PROTECTED_API_ROUTES.includes(pathname)
  const isProtectedPage = PROTECTED_PAGES.some(p => pathname.startsWith(p))

  if (!isProtectedApi && !isProtectedPage) return NextResponse.next()

  if (isProtectedApi) {
    // CSRF: Origin must match the app's own origin for state-changing requests.
    // Blocks cross-site form submissions and third-party fetch calls.
    // Check all methods that mutate state, not just POST.
    if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(request.method)) {
      const origin = request.headers.get('origin')
      // Reject requests that have an origin header that doesn't match.
      // Requests with no origin header (e.g. same-origin server-side) are allowed.
      if (origin !== null && origin !== request.nextUrl.origin) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
      }
    }

    // Per-IP rate limit (second tier, shared-WiFi aware).
    // Reject requests from unknown IPs to prevent rate-limit bypass.
    const ip = getClientIp(request)
    if (ip === 'unknown') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }
    if (isIpOverLimit(ip, pathname)) {
      return NextResponse.json(
        { error: 'Please wait a moment before continuing.' },
        { status: 429 }
      )
    }
  }

  // Auth gate: refresh the session and reject/redirect when absent
  const { user, response } = await updateSession(request)

  if (!user) {
    if (isProtectedApi) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const redirectUrl = new URL('/auth', request.url)
    redirectUrl.searchParams.set('next', pathname)
    return NextResponse.redirect(redirectUrl)
  }

  return response
}

export const config = {
  matcher: ['/api/chat', '/api/report', '/api/translate', '/history/:path*', '/settings/:path*'],
}