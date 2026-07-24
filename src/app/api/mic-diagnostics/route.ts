import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getClientIp, hashIp } from '@/lib/clientIp'
import { checkIpRateLimit } from '@/lib/rateLimit'
import { logger } from '@/lib/logger'

/**
 * Microphone failure diagnostics sink.
 *
 * The client fires these and never reads the response (see reportMicFailure in
 * src/lib/micDiagnostics.ts), so this route's only jobs are to validate, clamp,
 * and store. It always answers 204 — a diagnostics failure must never turn into
 * a visible error for a patient who already can't use their microphone.
 */

const ERROR_KINDS = new Set([
  'denied',
  'no-hardware',
  'in-use',
  'insecure',
  'unsupported',
  'unknown',
])
const SOURCES = new Set(['getUserMedia', 'speech-recognition'])
const PERMISSION_STATES = new Set(['granted', 'denied', 'prompt', 'unsupported'])
const PLATFORMS = new Set(['ios-safari', 'android-chrome', 'other'])

/** User agents are long and attacker-controlled — cap every free-text field. */
const MAX_USER_AGENT = 400
const MAX_TEXT = 300

function text(value: unknown, max: number): string | null {
  if (typeof value !== 'string') return null
  const trimmed = value.replace(/\0/g, '').trim()
  if (!trimmed) return null
  return trimmed.slice(0, max)
}

/** Free-text only survives if it is one of ours — anything else is dropped, not stored. */
function oneOf(value: unknown, allowed: Set<string>): string | null {
  return typeof value === 'string' && allowed.has(value) ? value : null
}

function bool(value: unknown): boolean | null {
  return typeof value === 'boolean' ? value : null
}

export async function POST(request: NextRequest) {
  try {
    let body: unknown
    try {
      body = await request.json()
    } catch {
      return new NextResponse(null, { status: 204 })
    }
    if (typeof body !== 'object' || body === null) {
      return new NextResponse(null, { status: 204 })
    }

    const raw = body as Record<string, unknown>

    const errorKind = oneOf(raw.errorKind, ERROR_KINDS)
    const source = oneOf(raw.source, SOURCES)
    // Without these two the row can't be triaged, so there's nothing worth storing.
    if (!errorKind || !source) {
      return new NextResponse(null, { status: 204 })
    }

    const ipHash = await hashIp(getClientIp(request))
    const supabase = await createClient()

    // This endpoint is unauthenticated by necessity — the mic can fail before a
    // patient has any session — so the per-IP tier is the only thing bounding
    // writes to the table. Silently drop over-limit reports: the client never
    // reads the response, and a diagnostics 429 must not become a patient-facing
    // error on a device whose mic is already broken.
    const { allowed } = await checkIpRateLimit(ipHash, 'mic_diagnostics', supabase)
    if (!allowed) {
      logger.warn('rate_limit_hit', '/api/mic-diagnostics')
      return new NextResponse(null, { status: 204 })
    }

    const { error } = await supabase.rpc('record_mic_diagnostic', {
      p_error_kind: errorKind,
      p_error_name: text(raw.errorName, MAX_TEXT),
      p_error_message: text(raw.errorMessage, MAX_TEXT),
      p_source: source,
      p_lang_code: text(raw.langCode, 20),
      p_permission_state: oneOf(raw.permissionState, PERMISSION_STATES),
      p_in_app_browser: text(raw.inAppBrowser, 40),
      p_platform: oneOf(raw.platform, PLATFORMS),
      p_user_agent: text(raw.userAgent, MAX_USER_AGENT),
      p_secure_context: bool(raw.secureContext),
      p_has_media_devices: bool(raw.hasMediaDevices),
      p_ip_hash: ipHash,
    })

    if (error) {
      logger.error('mic_diagnostic_insert_failed', '/api/mic-diagnostics', undefined, {
        message: error.message,
      })
      return new NextResponse(null, { status: 204 })
    }

    // Mirrored to the app log so a failure spike is visible without a DB query.
    logger.warn('mic_failure', '/api/mic-diagnostics', undefined, {
      errorKind,
      errorName: text(raw.errorName, MAX_TEXT),
      source,
      permissionState: oneOf(raw.permissionState, PERMISSION_STATES),
      inAppBrowser: text(raw.inAppBrowser, 40),
      platform: oneOf(raw.platform, PLATFORMS),
    })

    return new NextResponse(null, { status: 204 })
  } catch (err) {
    logger.error('api_error', '/api/mic-diagnostics', undefined, {
      message: err instanceof Error ? err.message : 'unknown',
    })
    return new NextResponse(null, { status: 204 })
  }
}
