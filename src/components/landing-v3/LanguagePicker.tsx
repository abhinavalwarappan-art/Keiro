'use client'

/* The language moment, shared by the hero and /languages.

   Every one of the 45 languages the app supports is here — the list is derived
   from LANGUAGES, never hand-maintained, so it cannot drift. 45 chips is a lot
   to scan, so there's a filter; it matches on the endonym, the English name and
   the romanisation, because someone looking for "Tiếng Việt" might type
   "vietnamese", "tieng" or "viet". */

import { useMemo, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { getLanguageByCode, LANGUAGES, type Language } from '@/lib/languages'
import { KAI_GREETINGS } from './greetings'
import { KaiDot } from './ChatMock'
import { useSiteTranslations } from '@/i18n/useSiteTranslations'

function matches(language: Language, query: string) {
  const q = query.trim().toLowerCase()
  if (!q) return true
  return (
    language.native.toLowerCase().includes(q) ||
    language.en.toLowerCase().includes(q) ||
    language.roman.toLowerCase().includes(q)
  )
}

export function LanguagePicker({
  /** Cap the chip area and let it scroll — the hero can't afford 45 chips of height. */
  compact = false,
}: {
  compact?: boolean
}) {
  const { locale, t } = useSiteTranslations()
  const [active, setActive] = useState<Language>(() => getLanguageByCode(locale) ?? LANGUAGES[0])
  const [query, setQuery] = useState('')

  const shown = useMemo(() => LANGUAGES.filter((l) => matches(l, query)), [query])
  const greeting = KAI_GREETINGS[active.code] ?? KAI_GREETINGS['en-US']

  return (
    <div className="rounded-[2rem] bg-[var(--hm-warm)] p-5 sm:p-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <label htmlFor="lang-search" className="font-semibold text-[var(--lx-ink)]">
          {t('site.hero.choose')}
        </label>
        <span className="text-sm text-[var(--lx-muted)]">{t('site.hero.all')}</span>
      </div>

      <input
        id="lang-search"
        type="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder={t('site.hero.search')}
        className="lx-focus mt-4 block min-h-12 w-full rounded-xl border border-[var(--lx-line)] bg-white px-4 text-base text-[var(--lx-body)] placeholder:text-[var(--lx-muted)]/70"
      />

      <div
        role="radiogroup"
        aria-label={t('site.hero.choose')}
        className={[
          'mt-3 flex flex-wrap gap-1 overflow-y-auto pr-1',
          // Only fade when the list is actually clipped — a mask over a short,
          // fully-visible list would just make the last row look broken.
          compact ? 'lx-fade-b max-h-[8.5rem] pb-2 sm:max-h-[10rem]' : 'max-h-[22rem]',
        ].join(' ')}
      >
        {shown.map((language) => {
          const isActive = language.code === active.code
          return (
            <button
              key={language.code}
              type="button"
              role="radio"
              aria-checked={isActive}
              onClick={() => setActive(language)}
              className={[
                'lx-focus flex min-h-11 items-center rounded-xl px-3.5 text-base font-medium transition-colors duration-150 active:scale-[0.97]',
                isActive
                  ? 'bg-[var(--hm-pine)] text-white'
                  : 'text-[var(--lx-body)] hover:bg-white',
              ].join(' ')}
            >
              <span className="lx-native">{language.native}</span>
            </button>
          )
        })}

        {shown.length === 0 && (
          <p className="py-3 text-[var(--lx-muted)]">
            {t('site.hero.noMatch')}
          </p>
        )}
      </div>

      {/* Kai's actual opening line, live — set like a type specimen, because it
          is one: this is the moment the page proves the script renders, the
          direction flips, and Kai genuinely opens in your language. aria-live so
          a screen-reader user hears the change rather than silently missing the
          entire point. */}
      <div
        className="mt-5 rounded-2xl bg-white p-5"
        aria-live="polite"
        dir={active.rtl ? 'rtl' : 'ltr'}
      >
        <div className="flex items-center justify-between gap-3 pb-3">
          <span className="flex items-center gap-2">
            <KaiDot size={22} />
            <span className="lx-native text-xs text-[var(--lx-muted)]">{active.native}</span>
          </span>
          <span className="flex items-center gap-1.5">
            {active.rtl && (
              <span className="lx-label rounded-[4px] border border-[var(--lx-line)] px-1.5 py-0.5 text-[0.55rem] text-[var(--lx-green-ink)]">
                RTL
              </span>
            )}
            <span className="lx-mono text-[0.65rem] text-[var(--lx-muted)]">{active.code}</span>
          </span>
        </div>
        <div className="min-h-[6rem] sm:min-h-[5rem]">
          <AnimatePresence mode="wait">
            <motion.p
              key={active.code}
              lang={active.googleCode}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
              className="lx-native text-[1.15rem] leading-[1.75] text-[var(--lx-body)]"
            >
              {greeting}
            </motion.p>
          </AnimatePresence>
        </div>
      </div>
      <a href={`/onboarding/confirm?lang=${encodeURIComponent(active.code)}`} lang={active.code} className="lx-focus mt-6 inline-flex min-h-12 items-center justify-center rounded-full bg-[var(--lx-ink)] px-7 py-3 text-base font-semibold text-white hover:bg-[var(--lx-ink-deep)]">
        {t('site.languages.select')} · <span className="lx-native ms-1">{active.native}</span>
      </a>
    </div>
  )
}
