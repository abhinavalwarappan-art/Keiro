'use client'

/* The language moment, shared by the hero and /languages.

   Every one of the 45 languages the app supports is here — the list is derived
   from LANGUAGES, never hand-maintained, so it cannot drift. 45 chips is a lot
   to scan, so there's a filter; it matches on the endonym, the English name and
   the romanisation, because someone looking for "Tiếng Việt" might type
   "vietnamese", "tieng" or "viet". */

import { useMemo, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Kai } from '@/components/kai/Kai'
import { LANGUAGES, type Language } from '@/lib/languages'
import { KAI_GREETINGS } from './greetings'

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
  const [active, setActive] = useState<Language>(LANGUAGES[0])
  const [query, setQuery] = useState('')

  const shown = useMemo(() => LANGUAGES.filter((l) => matches(l, query)), [query])
  const greeting = KAI_GREETINGS[active.code] ?? KAI_GREETINGS['en-US']

  return (
    <div className="rounded-[28px] border border-[var(--lx-line)] bg-white/70 p-4 shadow-[0_24px_60px_-34px_rgba(26,61,43,0.4)] backdrop-blur sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <label htmlFor="lang-search" className="font-semibold text-[var(--lx-ink)]">
          Which language do you speak?
        </label>
        <span className="text-sm text-[var(--lx-muted)]">{LANGUAGES.length} languages</span>
      </div>

      <input
        id="lang-search"
        type="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search: Tagalog, தமிழ், Polski"
        className="lx-focus mt-3 block min-h-11 w-full rounded-full border border-[var(--lx-line)] bg-white px-4 text-base text-[var(--lx-body)] placeholder:text-[var(--lx-muted)]/70"
      />

      <div
        role="radiogroup"
        aria-label="Choose the language Kai speaks to you in"
        data-lenis-prevent
        className={[
          'mt-3 flex flex-wrap gap-2 overflow-y-auto pr-1',
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
                'lx-focus flex min-h-11 items-center gap-2 rounded-full border px-3.5 text-sm font-medium transition-colors duration-200',
                isActive
                  ? 'border-[var(--lx-ink)] bg-[var(--lx-ink)] text-white'
                  : 'border-[var(--lx-line)] bg-white text-[var(--lx-body)] hover:border-[var(--lx-sage)]',
              ].join(' ')}
            >
              <span aria-hidden="true">{language.flag}</span>
              <span className="lx-native">{language.native}</span>
            </button>
          )
        })}

        {shown.length === 0 && (
          <p className="py-3 text-[var(--lx-muted)]">
            No match. Kai may still be able to help. Tell us which language to add.
          </p>
        )}
      </div>

      {/* Kai's actual opening line, live. aria-live so a screen-reader user hears
          the change rather than silently missing the entire point. */}
      <div className="mt-5 flex items-start gap-3">
        <span className="mt-1 shrink-0">
          <Kai size="xs" animated={false} />
        </span>
        <div
          className="min-h-[7.5rem] flex-1 rounded-[20px] rounded-tl-md border border-[var(--lx-line)] bg-[var(--lx-mint)] p-4 sm:min-h-[6.5rem]"
          aria-live="polite"
        >
          <AnimatePresence mode="wait">
            <motion.p
              key={active.code}
              lang={active.googleCode}
              dir={active.rtl ? 'rtl' : 'ltr'}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
              className={[
                'lx-native text-[1.02rem] leading-[1.75] text-[var(--lx-body)]',
                active.rtl ? 'text-right' : 'text-left',
              ].join(' ')}
            >
              {greeting}
            </motion.p>
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}
