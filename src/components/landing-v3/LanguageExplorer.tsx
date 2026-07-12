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
      <ul className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {LANGUAGES.map((language) => (
          <li key={language.code}>
            <div className="flex min-h-16 items-center gap-3 rounded-[16px] border border-[var(--band-line)] bg-[var(--band-card)] px-4 py-3">
              <span aria-hidden="true" className="shrink-0 text-xl leading-none">
                {language.flag}
              </span>
              <div className="min-w-0">
                <p
                  className="lx-native truncate font-semibold text-[var(--band-ink)]"
                  lang={language.googleCode}
                  dir={language.rtl ? 'rtl' : 'ltr'}
                >
                  {language.native}
                </p>
                <p className="truncate text-sm text-[var(--band-muted)]">{language.en}</p>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </Reveal>
  )
}
