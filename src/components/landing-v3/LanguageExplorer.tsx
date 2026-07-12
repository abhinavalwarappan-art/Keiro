'use client'

/* The greeting demo + the full directory.

   Two separate lists on purpose:
   - `heroGreetings` (14) are the languages we have an actual written greeting
     for, so those can be demonstrated live.
   - `LANGUAGES` (45) is the canonical list from src/lib/languages.ts — the same
     one the app itself uses. It is the single source of truth for what Kai
     actually supports, so this page can never drift from reality.

   We do NOT show a machine-generated greeting for the other 31. A wrong sentence
   in someone's mother tongue is worse than no sentence. */

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Kai } from '@/components/kai/Kai'
import { LANGUAGES } from '@/lib/languages'
import { heroGreetings } from './landingData'
import { Reveal } from './Reveal'

export function GreetingDemo() {
  const [active, setActive] = useState(heroGreetings[0])

  return (
    <div className="rounded-[28px] border border-[var(--lx-line)] bg-white p-5 sm:p-7">
      <div
        role="radiogroup"
        aria-label="Hear how Kai greets you in your language"
        className="flex flex-wrap gap-2"
      >
        {heroGreetings.map((g) => {
          const isActive = g.code === active.code
          return (
            <button
              key={g.code}
              type="button"
              role="radio"
              aria-checked={isActive}
              onClick={() => setActive(g)}
              className={[
                'lx-focus flex min-h-11 items-center rounded-full border px-3.5 text-sm font-medium transition-colors duration-200',
                isActive
                  ? 'border-[var(--lx-ink)] bg-[var(--lx-ink)] text-white'
                  : 'border-[var(--lx-line)] bg-white text-[var(--lx-body)] hover:border-[var(--lx-sage)]',
              ].join(' ')}
            >
              <span className="lx-native">{g.label}</span>
            </button>
          )
        })}
      </div>

      <div className="mt-6 flex items-start gap-3">
        <span className="mt-1 shrink-0">
          <Kai size="xs" animated={false} />
        </span>
        <div
          className="min-h-[8rem] flex-1 rounded-[20px] rounded-tl-md border border-[var(--lx-line)] bg-[var(--lx-mint)] p-4 sm:min-h-[6.5rem]"
          aria-live="polite"
        >
          <AnimatePresence mode="wait">
            <motion.p
              key={active.code}
              lang={active.code}
              dir={active.rtl ? 'rtl' : 'ltr'}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
              className={[
                'lx-native text-[1.05rem] leading-[1.75] text-[var(--lx-body)]',
                active.rtl ? 'text-right' : 'text-left',
              ].join(' ')}
            >
              {active.text}
            </motion.p>
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}

export function LanguageDirectory() {
  return (
    <Reveal>
      <ul className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {LANGUAGES.map((language) => (
          <li key={language.code}>
            <div className="flex min-h-16 items-center gap-3 rounded-[16px] border border-[var(--lx-line)] bg-white px-4 py-3">
              <span aria-hidden="true" className="shrink-0 text-xl leading-none">
                {language.flag}
              </span>
              <div className="min-w-0">
                <p
                  className="lx-native truncate font-semibold text-[var(--lx-ink)]"
                  lang={language.googleCode}
                  dir={language.rtl ? 'rtl' : 'ltr'}
                >
                  {language.native}
                </p>
                <p className="truncate text-sm text-[var(--lx-muted)]">{language.en}</p>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </Reveal>
  )
}

/** Canonical count, read from the same list the app uses — never hardcoded. */
export const LANGUAGE_COUNT = LANGUAGES.length
