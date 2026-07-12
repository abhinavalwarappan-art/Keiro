import { fetchUpstream, UpstreamError } from '@/lib/upstream'

const TRANSLATE_TIMEOUT_MS = 10_000

/**
 * Best-effort in-process translation cache.
 *
 * This is per-instance, not shared: Vercel functions are ephemeral, so a warm
 * instance may serve some hits and a cold one none. It is a latency optimisation,
 * never a source of truth — correctness must not depend on a hit.
 *
 * It is capped because it was previously an unbounded Map. Keys include the full
 * source text, so on a long-lived warm instance it grew without limit — a slow
 * memory leak that also kept translated patient-adjacent strings resident far
 * longer than the request that produced them. Oldest-first eviction keeps the
 * working set bounded; Map preserves insertion order, so the first key is the
 * oldest.
 */
const TRANSLATION_CACHE_MAX = 500
const translationCache = new Map<string, string>()

function cacheTranslation(key: string, value: string): void {
  if (translationCache.size >= TRANSLATION_CACHE_MAX) {
    const oldest = translationCache.keys().next().value
    if (oldest !== undefined) translationCache.delete(oldest)
  }
  translationCache.set(key, value)
}

export async function translateText(
  text: string,
  targetLang: string,
  sourceLang: string = 'en',
  deeplCode?: string
): Promise<string> {
  if (!text) {
    return text
  }

  const cacheKey = `${sourceLang}:${targetLang}:${text}`
  const cached = translationCache.get(cacheKey)
  if (cached !== undefined) {
    return cached
  }

  let translated: string

  if (deeplCode && process.env.DEEPL_API_KEY) {
    try {
      translated = await translateWithDeepL(text, deeplCode, sourceLang)
    } catch {
      // DeepL doesn't cover every language we ship, and its free tier has a hard
      // monthly quota — fall back to Google rather than failing the request.
      translated = await translateWithGoogle(text, targetLang, sourceLang)
    }
  } else {
    translated = await translateWithGoogle(text, targetLang, sourceLang)
  }

  cacheTranslation(cacheKey, translated)
  return translated
}

async function translateWithDeepL(text: string, targetLang: string, sourceLang: string): Promise<string> {
  const response = await fetchUpstream(
    'deepl',
    'https://api-free.deepl.com/v2/translate',
    {
      method: 'POST',
      headers: {
        'Authorization': `DeepL-Auth-Key ${process.env.DEEPL_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text: [text],
        target_lang: targetLang,
        source_lang: sourceLang.toUpperCase(),
      }),
    },
    TRANSLATE_TIMEOUT_MS
  )

  const data = await response.json()

  if (!data?.translations?.[0]?.text) {
    throw new UpstreamError('deepl', 'bad_response', 'DeepL returned an unexpected response shape')
  }

  return data.translations[0].text
}

async function translateWithGoogle(text: string, targetLang: string, sourceLang: string): Promise<string> {
  if (!process.env.GOOGLE_TRANSLATE_KEY) {
    throw new Error('GOOGLE_TRANSLATE_KEY environment variable is not set')
  }

  const params = new URLSearchParams({
    key: process.env.GOOGLE_TRANSLATE_KEY,
    q: text,
    target: targetLang,
    source: sourceLang,
    format: 'text',
  })

  const response = await fetchUpstream(
    'google_translate',
    `https://translation.googleapis.com/language/translate/v2?${params}`,
    {},
    TRANSLATE_TIMEOUT_MS
  )

  const data = await response.json()

  if (!data?.data?.translations?.[0]?.translatedText) {
    throw new UpstreamError('google_translate', 'bad_response', 'Google Translate returned an unexpected response shape')
  }

  return data.data.translations[0].translatedText
}