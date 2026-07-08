import { NextRequest, NextResponse } from 'next/server'
import { transcribeAudio } from '@/lib/whisper'
import { LANGUAGES } from '@/lib/languages'
import { createClient } from '@/lib/supabase/server'
import { checkRateLimit, checkIpRateLimit } from '@/lib/rateLimit'
import { getClientIp, hashIp } from '@/lib/clientIp'
import { logger } from '@/lib/logger'

// Whisper's hard limit is 25 MB. Cap below that — a symptom description in
// webm/opus is well under 1 MB, so anything large is either a long clip or abuse.
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
    const langCode = form.get('langCode')

    if (!(audio instanceof Blob)) {
      return NextResponse.json({ error: 'Missing audio' }, { status: 400 })
    }
    if (typeof langCode !== 'string' || !LANGUAGES.some(l => l.code === langCode)) {
      return NextResponse.json({ error: 'Unsupported language' }, { status: 400 })
    }
    if (audio.size === 0) {
      return NextResponse.json({ error: 'Empty audio' }, { status: 400 })
    }
    if (audio.size > MAX_AUDIO_BYTES) {
      return NextResponse.json({ error: 'Audio too long' }, { status: 413 })
    }
    // Guard the codec too — Whisper only accepts a fixed set of container types.
    const baseType = audio.type.split(';')[0].trim()
    if (baseType && !ALLOWED_AUDIO_TYPES.includes(baseType)) {
      return NextResponse.json({ error: 'Unsupported audio format' }, { status: 415 })
    }

    const { text } = await transcribeAudio(audio, langCode)

    // Log the language only — never the transcribed text (it's patient health info)
    logger.info('transcription_requested', '/api/transcribe', user.id, { langCode })

    return NextResponse.json({ text })
  } catch (err) {
    logger.error('api_error', '/api/transcribe', undefined, {
      message: err instanceof Error ? err.message : 'unknown',
    })
    return NextResponse.json({ error: 'Transcription failed' }, { status: 500 })
  }
}
