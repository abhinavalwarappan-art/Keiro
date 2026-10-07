'use client'

import { useMemo, useRef, useState } from 'react'
import { LANGUAGES } from '@/lib/languages'
import { useSiteTranslations } from '@/i18n/useSiteTranslations'
import { trackHomepageLanguageSelected } from '@/lib/analytics'

const FEATURED = ['en-US', 'es-ES', 'zh-CN', 'hi-IN', 'ar-SA'] as const

export function HeroLanguagePicker() {
  const { locale, t } = useSiteTranslations()
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const searchRef = useRef<HTMLInputElement>(null)
  const featured = FEATURED.map(code => LANGUAGES.find(lang => lang.code === code)!)
  const filtered = useMemo(() => {
    const value = query.trim().toLocaleLowerCase()
    return LANGUAGES.filter(lang => !value || [lang.native, lang.en, lang.roman].some(label => label.toLocaleLowerCase().includes(value)))
  }, [query])

  return (
    <div className="mx-auto mt-9 max-w-[38rem]" aria-label={t('site.hero.choose')}>
      <p className="mb-3 text-sm font-semibold text-[var(--hm-ink)]">{t('site.hero.choose')}</p>
      <div className="flex flex-wrap items-center justify-center gap-2">
        {featured.map(lang => (
          <a
            key={lang.code}
            href={`/?lang=${encodeURIComponent(lang.code)}`}
            hrefLang={lang.code}
            lang={lang.code}
            dir={lang.rtl ? 'rtl' : 'ltr'}
            aria-current={locale === lang.code ? 'true' : undefined}
            data-testid={`hero-language-${lang.code}`}
            onClick={() => trackHomepageLanguageSelected(lang.code)}
            className={`lx-focus lx-native inline-flex min-h-11 items-center rounded-full border px-4 py-2 text-base font-medium transition-colors ${locale === lang.code ? 'border-[var(--hm-pine)] bg-[var(--hm-pine)] text-white' : 'border-[var(--hm-line)] bg-white text-[var(--hm-ink)] hover:border-[var(--hm-pine)]'}`}
          >
            {lang.native}
          </a>
        ))}
        <button
          type="button"
          aria-expanded={open}
          aria-controls="hero-all-languages"
          onClick={() => { setOpen(value => !value); window.setTimeout(() => searchRef.current?.focus(), 0) }}
          className="lx-focus inline-flex min-h-11 items-center rounded-full border border-[var(--hm-line)] bg-white px-4 py-2 text-base font-medium text-[var(--hm-ink)] hover:border-[var(--hm-pine)]"
        >
          {t('site.hero.all')}
        </button>
      </div>
      {open && (
        <div id="hero-all-languages" className="mt-3 rounded-2xl border border-[var(--hm-line)] bg-white p-3 text-start shadow-[0_18px_50px_-30px_rgba(12,34,23,0.4)]">
          <input
            ref={searchRef}
            type="search"
            value={query}
            onChange={event => setQuery(event.target.value)}
            placeholder={t('site.hero.search')}
            aria-label={t('site.hero.search')}
            className="lx-focus min-h-12 w-full rounded-xl border border-[var(--hm-line)] px-4 text-base text-[var(--hm-ink)]"
          />
          <ul className="mt-2 grid max-h-64 grid-cols-1 gap-1 overflow-y-auto overscroll-contain sm:grid-cols-2">
            {filtered.map(lang => (
              <li key={lang.code}>
                <a href={`/?lang=${encodeURIComponent(lang.code)}`} hrefLang={lang.code} lang={lang.code} dir={lang.rtl ? 'rtl' : 'ltr'} onClick={() => trackHomepageLanguageSelected(lang.code)} className="lx-focus lx-native flex min-h-11 items-center rounded-lg px-3 text-base text-[var(--hm-ink)] hover:bg-[var(--hm-warm)]">
                  {lang.native}
                </a>
              </li>
            ))}
          </ul>
          {filtered.length === 0 && <p className="px-3 py-4 text-[var(--hm-sub)]">{t('site.hero.noMatch')}</p>}
        </div>
      )}
    </div>
  )
}
