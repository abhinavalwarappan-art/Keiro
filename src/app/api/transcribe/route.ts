import { NextRequest, NextResponse } from 'next/server'
import { transcribeSpeech, isFishAsrConfigured } from '@/lib/fishAudio'
import { LANGUAGES } from '@/lib/languages'
import { createClient } from '@/lib/supabase/server'
import { checkRateLimit, checkIpRateLimit } from '@/lib/rateLimit'
import { getClientIp, hashIp } from '@/lib/clientIp'
import { logger } from '@/lib/logger'
import { UpstreamError } from '@/lib/upstream'

// Uploading audio + a Fish round-trip can outrun Vercel's default cap; give the
// route room so a slow mobile upload isn't killed by the platform mid-request.
export const maxDuration = 60

// A symptom description in webm/opus is well under 1 MB, so anything near this
// is either a very long clip or abuse. Kept well below the platform's 100 MB
// request ceiling so an oversized upload is refused here, cheaply, with a
// message — rather than by the runtime, opaquely.
const MAX_AUDIO_BYTES = 20 * 1024 * 1024

const ALLOWED_AUDIO_TYPES = ['audio/webm', 'audio/ogg', 'audio/mp4', 'audio/mpeg', 'audio/wav', 'audio/x-wav']

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      logger.warn('auth_failure', '/api/transcribe')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const ipHash = await hashIp(getClientIp(request))
    const [userLimit, ipLimit] = await Promise.all([
      checkRateLimit(user.id, 'transcribe', supabase),
      checkIpRateLimit(ipHash, 'transcribe', supabase),
    ])
    if (!userLimit.allowed || !ipLimit.allowed) {
      logger.warn('rate_limit_hit', '/api/transcribe', user.id)
      return NextResponse.json(
        { error: 'Please wait a moment before continuing.' },
        { status: 429 }
      )
    }

    let form: FormData
    try {
      form = await request.formData()
    } catch {
      return NextResponse.json({ error: 'Invalid form data' }, { status: 400 })
    }

    const audio = form.get('audio')
    const rawLangCode = form.get('langCode')

    if (!(audio instanceof Blob)) {
      return NextResponse.json({ error: 'Missing audio' }, { status: 400 })
    }
    // The language is a hint, not a requirement: before the patient has picked
    // one there is nothing honest to send, and Fish auto-detects. An absent
    // hint is therefore valid — but a hint we don't recognise is not, and is
    // refused here rather than forwarded upstream.
    const langCode = typeof rawLangCode === 'string' && rawLangCode ? rawLangCode : undefined
    if (langCode && !LANGUAGES.some(l => l.code === langCode)) {
      return NextResponse.json({ error: 'Unsupported language' }, { status: 400 })
    }
    if (audio.size === 0) {
      return NextResponse.json({ error: 'Empty audio' }, { status: 400 })
    }
    if (audio.size > MAX_AUDIO_BYTES) {
      return NextResponse.json({ error: 'Audio too long' }, { status: 413 })
    }
    // Guard the container too. The mic always sends WAV (the client re-encodes,
    // because Fish decodes none of the formats a browser records); the rest of
    // this list stays accepted so a client running stale JS is refused by Fish
    // with a logged upstream error rather than by a bare 415 here.
    const baseType = audio.type.split(';')[0].trim()
    if (baseType && !ALLOWED_AUDIO_TYPES.includes(baseType)) {
      return NextResponse.json({ error: 'Unsupported audio format' }, { status: 415 })
    }
    // Answer the misconfiguration directly instead of letting it surface as a
    // generic upstream fault — voice is optional, and this is the one failure
    // mode a deploy can fix.
    if (!isFishAsrConfigured()) {
      logger.error('transcription_unconfigured', '/api/transcribe', user.id)
      return NextResponse.json({ error: 'Transcription unavailable' }, { status: 503 })
    }

    const { text, detectedLanguage } = await transcribeSpeech(audio, langCode)

    // Log the languages only — never the transcribed text (it's patient health
    // info). The detected language is worth keeping next to the hint: a
    // persistent mismatch means the picker and the patient disagree.
    logger.info('transcription_requested', '/api/transcribe', user.id, {
      langCode: langCode ?? 'auto',
      detectedLanguage,
    })

    return NextResponse.json({ text })
  } catch (err) {
    // Never log err.message for upstream faults — it carries Fish's response body,
    // which can echo the transcript (patient health information).
    if (err instanceof UpstreamError) {
      logger.error('upstream_error', '/api/transcribe', undefined, {
        provider: err.provider,
        kind: err.kind,
        upstreamStatus: err.status,
      })
      return NextResponse.json({ error: 'Transcription failed' }, { status: err.clientStatus })
    }
    logger.error('api_error', '/api/transcribe', undefined, {
      message: err instanceof Error ? err.message : 'unknown',
    })
    return NextResponse.json({ error: 'Transcription failed' }, { status: 500 })
  }
}
