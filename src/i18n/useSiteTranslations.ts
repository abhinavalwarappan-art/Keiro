'use client'

import { useLanguage } from '@/context/LanguageContext'
import { useTranslations } from './useTranslations'

export function useSiteTranslations() {
  const { locale } = useLanguage()
  return { locale, t: useTranslations(locale) }
}
