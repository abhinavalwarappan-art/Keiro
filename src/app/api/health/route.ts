import { NextRequest, NextResponse } from 'next/server'

/**
 * GET /api/health
 *
 * Liveness probe. Without the x-health-token header it returns a bare ok
 * (safe for public uptime monitors). With the correct token it returns
 * version and timestamp for deployment verification.
 *
 * Example (public):
 *   curl https://keiro.space/api/health
 *   {"status":"ok"}
 *
 * Example (internal):
 *   curl -H "x-health-token: $HEALTH_CHECK_SECRET" https://keiro.space/api/health
 *   {"status":"ok","version":"v1.4.2","timestamp":"2026-06-09T12:00:00.000Z"}
 */
export async function GET(request: NextRequest) {
  const token = request.headers.get('x-health-token')
  const secret = process.env.HEALTH_CHECK_SECRET

  if (!secret || !token || token !== secret) {
    return NextResponse.json({ status: 'ok' })
  }

  return NextResponse.json({
    status: 'ok',
    version: process.env.DEPLOYMENT_VERSION ?? 'unknown',
    timestamp: new Date().toISOString(),
  })
}