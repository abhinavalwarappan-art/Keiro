/* ====================== SECTION 2 — LANGUAGE TICKER =======================
   "Built for people who speak:" + an infinite CSS marquee (no JS). The list is
   duplicated once; the track translates -50% for a seamless loop and pauses on
   hover. Each pill gets a teal border + glow on hover. Edge fade via mask.
   ========================================================================== */

import { FlagEmoji } from './FlagEmoji'
import { languages } from './landingData'

export function LanguageTicker() {
  if (!languages || languages.length === 0) {
    return null
  }

  // duplicated for the seamless -50% loop
  const loop = [...languages, ...languages]

  return (
    <section className="relative border-y border-white/[0.06] bg-transparent py-5">
      <div className="flex flex-col gap-4 px-6 md:flex-row md:items-center md:px-10 lg:px-16">
        <p className="shrink-0 text-sm text-white/50">Built for people who speak:</p>

        <div
          className="lx-marquee relative flex-1 overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_7%,black_93%,transparent)]"
          aria-label="Supported languages"
          role="marquee"
        >
          <div className="lx-marquee-track gap-3 pr-3">
            {loop.map((language, index) => (
              <span
                key={`${language.code}-${index}`}
                className="inline-flex shrink-0 items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-4 py-1.5 text-sm text-white/80 transition-[border-color,box-shadow] duration-200 hover:border-[var(--kx-accent)]/60 hover:shadow-[0_0_18px_#00c89640]"
                aria-hidden={index >= languages.length ? 'true' : undefined}
              >
                <FlagEmoji region={language.region} />
                {language.name}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}