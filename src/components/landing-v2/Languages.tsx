'use client'

import { LANGUAGES } from '@/lib/languages'
import { Reveal } from './Reveal'

// English is the doctor-facing baseline; the list below is what patients speak.
const PATIENT_LANGS = LANGUAGES

export function Languages() {
  return (
    <section id="languages" className="relative border-t border-[var(--line)] py-28 md:py-36">
      <div className="mx-auto max-w-[1240px] px-6 md:px-10">
        <div className="mb-14 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div>
            <span className="kx-mono text-[0.72rem] uppercase tracking-[0.22em] text-[var(--amber)]">
              Spoken here
            </span>
            <h2 className="kx-serif mt-5 max-w-[18ch] text-[clamp(2.6rem,1.4rem+4vw,4.2rem)] text-[var(--fg)]">
              The waiting room speaks{' '}
              <span className="kx-serif-italic kx-amber">{PATIENT_LANGS.length} languages.</span>
            </h2>
          </div>
          <p className="max-w-[26rem] text-[1.02rem] leading-relaxed text-[var(--fg-2)]">
            Every one rendered in its own script — not romanised, not flattened. If
            your language is missing, it&apos;s next on the list.
          </p>
        </div>

        {/* Broken bento — one wide statement tile, then dense language cells */}
        <Reveal className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4" stagger={0.03} y={20}>
          <div className="kx-reveal kx-glass kx-glass-amber col-span-2 flex flex-col justify-between rounded-2xl p-6 sm:row-span-2">
            <span className="kx-serif text-[3.4rem] leading-none text-[var(--amber)]">
              {PATIENT_LANGS.length}
            </span>
            <p className="mt-4 text-[0.98rem] leading-relaxed text-[var(--fg-2)]">
              languages in, one clinical language out. Kai keeps the nuance —
              idioms, hedges, the way people actually describe pain.
            </p>
          </div>

          {PATIENT_LANGS.map((lang) => (
            <div
              key={lang.code}
              className="kx-reveal kx-glass group flex items-center gap-3.5 rounded-2xl p-4 transition-colors duration-200 hover:border-[rgba(232,160,69,0.3)]"
            >
              <span className="text-2xl leading-none" aria-hidden="true">
                {lang.flag}
              </span>
              <span className="min-w-0">
                <span
                  className="block truncate text-[1.02rem] text-[var(--fg)]"
                  dir={lang.rtl ? 'rtl' : 'ltr'}
                  lang={lang.googleCode}
                >
                  {lang.native}
                </span>
                <span className="block truncate text-[0.78rem] text-[var(--fg-3)]">{lang.en}</span>
              </span>
            </div>
          ))}
        </Reveal>
      </div>
    </section>
  )
}