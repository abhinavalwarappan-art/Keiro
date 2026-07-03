'use client'

import { useEffect, useState } from 'react'
import en from './en.json'

/** Every UI string key that exists in the English source dictionary. */
export type MessageKey = keyof typeof en

type Dictionary = Partial<Record<MessageKey, string>>

type Params = Record<string, string | number>

function interpolate(template: string, params?: Params): string {
  if (!params) return template
  return template.replace(/\{(\w+)\}/g, (match, key: string) =>
    key in params ? String(params[key]) : match,
  )
}

/**
 * Translate function returned by {@link useTranslations}. Falls back to the
 * English source string (then the raw key) when a translation is missing, so
 * the UI always renders something readable.
 */
export type TranslateFn = (key: MessageKey, params?: Params) => string

/**
 * Loads the UI dictionary for the active app language and returns a `t()`
 * lookup. English ships in the bundle as the instant fallback; the target
 * locale is fetched lazily and swapped in when ready.
 *
 * @param langCode Full app language code, e.g. `es-ES` (from the URL/profile).
 */
export function useTranslations(langCode: string): TranslateFn {
  const [dict, setDict] = useState<Dictionary>(en)

  useEffect(() => {
    let cancelled = false
    // Route English through the same async loader so the effect never calls
    // setState synchronously; `en` is already the initial state and fallback.
    const code = !langCode || langCode.split('-')[0] === 'en' ? 'en-US' : langCode
    import(`./locales/${code}.json`)
      .then(mod => {
        if (!cancelled) setDict(mod.default as Dictionary)
      })
      .catch(() => {
        // Missing/failed locale file — stay on the English fallback.
        if (!cancelled) setDict(en)
      })

    return () => {
      cancelled = true
    }
  }, [langCode])

  return (key, params) => interpolate(dict[key] ?? en[key] ?? key, params)
}
