const translationCache = new Map<string, string>()

export async function translateText(
  text: string,
  targetLang: string,
  sourceLang: string = 'en',
  deeplCode?: string
): Promise<string> {
  const cacheKey = `${sourceLang}:${targetLang}:${text}`
  if (translationCache.has(cacheKey)) {
    return translationCache.get(cacheKey)!
  }

  let translated: string

  if (deeplCode && process.env.DEEPL_API_KEY) {
    try {
      translated = await translateWithDeepL(text, deeplCode, sourceLang)
    } catch {
      translated = await translateWithGoogle(text, targetLang, sourceLang)
    }
  } else {
    translated = await translateWithGoogle(text, targetLang, sourceLang)
  }

  translationCache.set(cacheKey, translated)
  return translated
}

async function translateWithDeepL(text: string, targetLang: string, sourceLang: string): Promise<string> {
  const response = await fetch('https://api-free.deepl.com/v2/translate', {
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
  })

  const data = await response.json()
  return data.translations[0].text
}

async function translateWithGoogle(text: string, targetLang: string, sourceLang: string): Promise<string> {
  const params = new URLSearchParams({
    key: process.env.GOOGLE_TRANSLATE_KEY!,
    q: text,
    target: targetLang,
    source: sourceLang,
    format: 'text',
  })

  const response = await fetch(
    `https://translation.googleapis.com/language/translate/v2?${params}`
  )

  const data = await response.json()
  return data.data.translations[0].translatedText
}
