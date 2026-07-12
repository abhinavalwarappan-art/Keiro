'use client'

/* ============================= LANGUAGES ===================================
   Previously this delegated to SpiralLanguageScroll — a scroll-position-linked
   3D orbit that only ever showed one language at a time. It is gone: a patient
   scanning for their own language should be able to *see* it, not scrub a
   carousel until it rotates into view.

   Endonyms are primary (you look for "Tiếng Việt", not "Vietnamese"), rendered
   in a script-complete stack so Devanagari / Arabic / CJK don't fall back.
   ========================================================================== */

import { Reveal } from './Reveal'
import { FlagEmoji } from './FlagEmoji'
import { languages } from './landingData'

export function LanguagesGrid() {
  return (
    <section
      id="languages"
      className="relative scroll-mt-28 border-y border-[var(--lx-line)] bg-[var(--lx-mint)] px-5 py-20 sm:px-8 md:py-28 lg:px-16"
    >
      <div className="mx-auto max-w-6xl">
        <Reveal className="max-w-2xl">
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[var(--lx-ink)]">
            Languages
          </p>
          <h2 className="lx-display mt-4 text-[clamp(1.9rem,4.6vw,3rem)] font-semibold leading-[1.15] tracking-[-0.02em] text-[var(--lx-ink)]">
            We speak your language.
          </h2>
          <p className="mt-5 text-lg leading-[1.8] text-[var(--lx-muted)]">
            Not a translated menu — an actual conversation, in the language you grew up
            speaking. Find yours below.
          </p>
        </Reveal>

        <Reveal delay={0.08}>
          <ul className="mt-12 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {languages.map((language) => (
              <li key={`${language.code}-${language.region}`}>
                <div className="flex min-h-16 items-center gap-3 rounded-[16px] border border-[var(--lx-line)] bg-white px-4 py-3">
                  <FlagEmoji region={language.region} className="shrink-0 text-xl leading-none" />
                  <div className="min-w-0">
                    <p
                      className="lx-native truncate font-semibold text-[var(--lx-ink)]"
                      lang={language.code}
                    >
                      {language.native}
                    </p>
                    <p className="truncate text-sm text-[var(--lx-muted)]">{language.name}</p>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </Reveal>

        <Reveal delay={0.12}>
          <p className="mt-10 text-lg leading-[1.8] text-[var(--lx-muted)]">
            Do not see yours?{' '}
            <a
              href="mailto:hello@keiro.app?subject=Please%20add%20my%20language"
              className="lx-focus font-semibold text-[var(--lx-ink)] underline underline-offset-4"
            >
              Tell us which one
            </a>{' '}
            and we will work on it. Nobody should have to borrow someone else&apos;s words to
            describe their own pain.
          </p>
        </Reveal>
      </div>
    </section>
  )
}
