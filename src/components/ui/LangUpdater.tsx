'use client'

import { useEffect } from 'react'
import { useLanguage } from '@/context/LanguageContext'

/**
 * Keeps the <html lang> attribute in sync with the user's selected language.
 * This satisfies WCAG 3.1.1 (Language of Page) for multilingual users.
 */
export function LangUpdater() {
  const { language } = useLanguage()

  useEffect(() => {
    if (language?.code) {
      document.documentElement.lang = language.code
    }
  }, [language?.code])

  return null
}