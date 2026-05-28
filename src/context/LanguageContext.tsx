'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { Language, LANGUAGES, getLanguageByCode } from '@/lib/languages'

interface LanguageContextValue {
  language: Language | null
  setLanguage: (lang: Language) => void
  romanization: boolean
  setRomanization: (v: boolean) => void
}

const LanguageContext = createContext<LanguageContextValue | null>(null)

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language | null>(null)
  const [romanization, setRomanization] = useState(false)

  useEffect(() => {
    const code = localStorage.getItem('keiro-lang')
    if (code) {
      const lang = getLanguageByCode(code)
      if (lang) setLanguageState(lang)
    }
    setRomanization(localStorage.getItem('keiro-roman') === '1')
  }, [])

  const setLanguage = (lang: Language) => {
    setLanguageState(lang)
    localStorage.setItem('keiro-lang', lang.code)
  }

  const setRomanizationPersist = (v: boolean) => {
    setRomanization(v)
    localStorage.setItem('keiro-roman', v ? '1' : '0')
  }

  return (
    <LanguageContext.Provider
      value={{
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
