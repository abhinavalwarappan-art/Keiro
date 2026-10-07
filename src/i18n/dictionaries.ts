import 'server-only'
import type { SupportedLocale } from '@/lib/languages'
import en from './en.json'

export type Dictionary = Partial<Record<keyof typeof en, string>>

export async function getDictionary(locale: SupportedLocale): Promise<Dictionary> {
  if (locale === 'en-US') return en
  try {
    return (await import(`./locales/${locale}.json`)).default as Dictionary
  } catch {
    return en
  }
}
