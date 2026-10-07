'use client'

import { useEffect, useState } from 'react'
import en from './en.json'
import { useLanguage } from '@/context/LanguageContext'

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
  const { locale, dictionary } = useLanguage()
  const [loaded, setLoaded] = useState<{ code: string; dict: Dictionary } | null>(null)

  useEffect(() => {
    let cancelled = false
    // English is the source dictionary; en-US.json is a legacy snapshot and
    // must not override copy changes made in en.json.
    const code = !langCode || langCode.split('-')[0] === 'en' ? 'en-US' : langCode
    const messages = code === 'en-US' ? Promise.resolve({ default: en }) : import(`./locales/${code}.json`)
    messages
      .then(mod => {
        if (!cancelled) setLoaded({ code, dict: mod.default as Dictionary })
      })
      .catch(() => {
        // Missing/failed locale file — stay on the English fallback.
        if (!cancelled) setLoaded({ code, dict: en })
      })

    return () => {
      cancelled = true
    }
  }, [langCode])

  const dict = loaded?.code === langCode ? loaded.dict : locale === langCode ? dictionary : en
  return (key, params) => interpolate(dict[key] ?? en[key] ?? key, params)
}
