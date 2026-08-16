import { NextRequest, NextResponse } from 'next/server'
import { isFishConfigured, synthesizeSpeech, MAX_TTS_CHARS } from '@/lib/fishAudio'
import { createClient } from '@/lib/supabase/server'
import { checkRateLimit, checkIpRateLimit } from '@/lib/rateLimit'
import { getClientIp, hashIp } from '@/lib/clientIp'
import { logger } from '@/lib/logger'
import { UpstreamError } from '@/lib/upstream'

// Synthesis plus streaming the MP3 back can outrun the default cap on a cold
// upstream; the Fish call itself is bounded at 30s inside synthesizeSpeech.
export const maxDuration = 45

/**
 * Speak Kai's text in Kai's one voice.
 *
 * Every failure here is survivable: the client falls back to browser speech on
 * any non-200, so an unset key, a rate limit, or a Fish outage costs voice
 * quality rather than voice itself.
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      logger.warn('auth_failure', '/api/tts')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const ipHash = await hashIp(getClientIp(request))
    const [userLimit, ipLimit] = await Promise.all([
      checkRateLimit(user.id, 'tts', supabase),
      checkIpRateLimit(ipHash, 'tts', supabase),
    ])
    if (!userLimit.allowed || !ipLimit.allowed) {
      logger.warn('rate_limit_hit', '/api/tts', user.id)
      return NextResponse.json({ error: 'Too many requests' }, { status: 429 })
    }

    let body: unknown
    try {
      body = await request.json()
    } catch {
      return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
    }

    const { text } = (body ?? {}) as { text?: unknown }

    if (typeof text !== 'string' || text.trim().length === 0) {
      return NextResponse.json({ error: 'Missing text' }, { status: 400 })
    }
    if (text.length > MAX_TTS_CHARS) {
      return NextResponse.json({ error: 'Text too long' }, { status: 413 })
    }

    if (!isFishConfigured()) {
      // Not an error state — a deploy without Fish credentials speaks in the
      // browser instead. Logged at info so it's visible without paging anyone.
      logger.info('tts_unconfigured', '/api/tts', user.id)
      return NextResponse.json({ error: 'Voice unavailable' }, { status: 503 })
    }

    const audio = await synthesizeSpeech(text)

    // Log the size only — never the text. It is Kai's clinical dialogue with the
    // patient, which is health information.
    logger.info('tts_requested', '/api/tts', user.id, { bytes: audio.byteLength })

    return new NextResponse(audio, {
      status: 200,
      headers: {
        'Content-Type': 'audio/mpeg',
        'Content-Length': String(audio.byteLength),
        // Patient-derived audio must not sit in any shared cache.
        'Cache-Control': 'no-store',
      },
    })
  } catch (err) {
    // Never log err.message for upstream faults — it carries Fish's response
    // body, which can echo the submitted text back.
    if (err instanceof UpstreamError) {
      logger.error('upstream_error', '/api/tts', undefined, {
        provider: err.provider,
        kind: err.kind,
        upstreamStatus: err.status,
      })
      return NextResponse.json({ error: 'Speech failed' }, { status: err.clientStatus })
    }
    logger.error('api_error', '/api/tts', undefined, {
      message: err instanceof Error ? err.message : 'unknown',
    })
    return NextResponse.json({ error: 'Speech failed' }, { status: 500 })
  }
}
