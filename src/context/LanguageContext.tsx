'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { Language, LANGUAGES, getLanguageByCode, type SupportedLocale } from '@/lib/languages'
import type { Dictionary } from '@/i18n/dictionaries'
import en from '@/i18n/en.json'

interface LanguageContextValue {
  locale: SupportedLocale
  dictionary: Dictionary
  language: Language | null
  setLanguage: (lang: Language) => void
  romanization: boolean
  setRomanization: (v: boolean) => void
}

const LanguageContext = createContext<LanguageContextValue | null>(null)

export function LanguageProvider({ children, initialLocale, initialDictionary }: { children: React.ReactNode; initialLocale: SupportedLocale; initialDictionary: Dictionary }) {
  const [language, setLanguageState] = useState<Language | null>(() => getLanguageByCode(initialLocale) ?? null)
  const [romanization, setRomanization] = useState(false)

  useEffect(() => {
    // Deferred so the restore doesn't cascade renders during hydration
    const timer = setTimeout(() => {
      try {
        setRomanization(localStorage.getItem('keiro-roman') === '1')
      } catch {
        // localStorage may be unavailable (e.g. private browsing restrictions)
      }
    }, 0)
    return () => clearTimeout(timer)
  }, [])

  const setLanguage = (lang: Language) => {
    setLanguageState(lang)
    try {
      localStorage.setItem('keiro-lang', lang.code)
      document.cookie = `keiro-locale=${encodeURIComponent(lang.code)}; Path=/; Max-Age=31536000; SameSite=Lax`
    } catch {
      // localStorage may be unavailable
    }
  }

  const setRomanizationPersist = (v: boolean) => {
    setRomanization(v)
    try {
      localStorage.setItem('keiro-roman', v ? '1' : '0')
    } catch {
      // localStorage may be unavailable
    }
  }

  return (
    <LanguageContext.Provider
      value={{
        locale: initialLocale,
        dictionary: initialDictionary ?? en,
        language,
        setLanguage,
        romanization,
        setRomanization: setRomanizationPersist,
      }}
    >
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  const ctx = useContext(LanguageContext)
  if (!ctx) throw new Error('useLanguage must be used within LanguageProvider')
  return ctx
}

export { LANGUAGES }
