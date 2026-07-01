import { NextRequest, NextResponse } from 'next/server'
import { translateText } from '@/lib/translate'
import { LANGUAGES, resolveLanguage } from '@/lib/languages'
import { createClient } from '@/lib/supabase/server'
import { checkRateLimit } from '@/lib/rateLimit'
import { logger } from '@/lib/logger'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      logger.warn('auth_failure', '/api/translate')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { allowed } = await checkRateLimit(user.id, 'translate', supabase)
    if (!allowed) {
      logger.warn('rate_limit_hit', '/api/translate', user.id)
      return NextResponse.json(
        { error: 'Please wait a moment before continuing.' },
        { status: 429 }
      )
    }

    let body: unknown
    try {
      body = await request.json()
    } catch {
      return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
    }

    if (!body || typeof body !== 'object' || Array.isArray(body)) {
      return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
    }

    const { text, targetLangCode, sourceLang } = body as Record<string, unknown>

    if (!text || typeof text !== 'string' || !targetLangCode || typeof targetLangCode !== 'string') {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
    }

    if (text.length > 5000) {
      return NextResponse.json({ error: 'Text too long' }, { status: 400 })
    }

    if (sourceLang !== undefined && typeof sourceLang !== 'string') {
      return NextResponse.json({ error: 'Invalid sourceLang' }, { status: 400 })
    }

    const lang = LANGUAGES.find(l => l.code === targetLangCode)
    if (!lang) {
      return NextResponse.json({ error: 'Unsupported language' }, { status: 400 })
    }

    // Google Translate expects base ISO codes (e.g. 'es'), not regional codes
    // (e.g. 'es-ES'); use each language's googleCode for the fallback path.
    const sourceCode = resolveLanguage(String(sourceLang || 'en'))?.googleCode ?? 'en'
    const translated = await translateText(text, lang.googleCode, sourceCode, lang.deeplCode)

    // Log target language code only — never log the text being translated
    logger.info('translation_requested', '/api/translate', user.id, { targetLangCode })

    return NextResponse.json({ translated })
  } catch (err) {
    logger.error('api_error', '/api/translate', undefined, {
      message: err instanceof Error ? err.message : 'unknown',
    })
    return NextResponse.json({ error: 'Translation failed' }, { status: 500 })
  }
}