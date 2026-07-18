'use client'

/* The full 45-language directory.

   Derived from LANGUAGES in src/lib/languages.ts — the same source the app uses —
   so this page can never advertise a different number than Kai actually speaks.
   The live greeting demo lives in LanguagePicker.

   Endonyms lead: you scan for "Tiếng Việt", not "Vietnamese". */

import { LANGUAGES } from '@/lib/languages'
import { Reveal } from './Reveal'

export function LanguageDirectory() {
  return (
    <Reveal>
      {/* Each entry is set like a type specimen, because that is the proof this
          page exists to give: the endonym large, in a face that actually
          contains its script, direction-correct, with the locale code in the
          chart mono. An RTL language says so — the differentiator, labelled. */}
      <ul className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {LANGUAGES.map((language) => (
          <li key={language.code}>
            <div
              className="flex h-full min-h-20 flex-col justify-center rounded-[16px] border border-[var(--band-line)] bg-[var(--band-card)] px-4 py-3.5"
              dir={language.rtl ? 'rtl' : 'ltr'}
            >
              <div className="flex items-baseline justify-between gap-3">
                <p
                  className="lx-native min-w-0 truncate text-lg font-semibold leading-snug text-[var(--band-ink)]"
                  lang={language.googleCode}
                >
                  {language.native}
                </p>
                <span aria-hidden="true" className="shrink-0 text-base leading-none">
                  {language.flag}
                </span>
              </div>
              <div className="mt-1.5 flex items-center justify-between gap-3">
                <p className="truncate text-sm text-[var(--band-muted)]">{language.en}</p>
                <p className="lx-mono flex shrink-0 items-center gap-1.5 text-[0.65rem] text-[var(--band-muted)]">
                  {language.rtl && (
                    <span className="rounded-[4px] border border-[var(--band-line)] px-1 py-px text-[0.55rem] text-[var(--lx-green-ink)]">
                      RTL
                    </span>
                  )}
                  {language.code}
                </p>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </Reveal>
  )
}
