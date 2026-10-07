import 'server-only'
import { headers } from 'next/headers'
import { normalizeLocale } from '@/lib/languages'
import { getDictionary } from './dictionaries'
import en from './en.json'

export async function getServerTranslations() {
  const locale = normalizeLocale((await headers()).get('x-keiro-locale')) ?? 'en-US'
  const dict = await getDictionary(locale)
  const t = (key: keyof typeof en) => dict[key] ?? en[key]
  return { locale, t }
}
