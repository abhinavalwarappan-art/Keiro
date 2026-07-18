'use client'

/* ============================== HERO =======================================
   THE SPLIT LEDGER (DESIGN.md §7.1). A 7/5 asymmetric opening: the display
   headline and the patient's three real objections hard-left, the Bilingual
   Ledger artifact right. Kai speaks first, in first person, and the live
   language demonstration IS the primary interaction — not a claim in copy.

   No scroll-linked motion. One staggered entrance, then it sits still. The
   ledger below the fold on a phone would waste the one thing that proves the
   product, so grid placement (not source order) lifts it above the CTAs at
   375px.
   ========================================================================== */

import Link from 'next/link'
import { motion } from 'framer-motion'
import { LANGUAGES } from '@/lib/languages'
import { KaiDemo } from './KaiDemo'
import { MotionLink } from './MotionLink'
import { Accent, RunHead } from './Sections'
import { IconCheck } from './icons'

const ENTRANCE = { duration: 0.55, ease: [0.22, 1, 0.36, 1] as const }

export function Hero() {
  return (
    <section
      id="hero"
      className="relative scroll-mt-28 overflow-hidden px-5 pb-14 pt-10 sm:px-8 sm:pt-14 lg:px-10"
    >
      {/* The page's one daylight wash — a whisper of brand light falling from
          behind the nav, resolved into the paper before the first rule. */}
      <div className="lx-daylight" aria-hidden="true" />

      <div className="lx-above mx-auto grid max-w-6xl gap-10 lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)] lg:items-center lg:gap-14">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={ENTRANCE}
          className="lg:col-start-1 lg:row-start-1"
        >
          <RunHead folio="Keiro · patient intake" meta="Free · no account" />

          <h1
            data-testid="hero-headline"
            className="lx-display mt-8 text-balance text-[clamp(2.2rem,5.4vw,3.75rem)] text-[var(--lx-ink)]"
          >
            I&apos;m Kai. Tell me what hurts, <Accent>in the language you think in.</Accent>
          </h1>

          <p className="mt-6 max-w-xl text-pretty text-lg leading-[1.8] text-[var(--lx-muted)] sm:text-xl">
            Then I&apos;ll write it down for your doctor, in clear English. I&apos;m not a doctor and
            I won&apos;t diagnose you. I&apos;ll just make sure you&apos;re understood.
          </p>

          {/* The three objections a scared patient actually has, answered
              before they are asked — set as a small ruled register, not a
              row of pills. */}
          <ul className="mt-8 max-w-md border-t border-[var(--lx-hairline)]">
            {[
              'Free, and it always will be.',
              'No account needed to start.',
              'You can stop at any point.',
            ].map((item) => (
              <li
                key={item}
                className="flex items-center gap-3.5 border-b border-[var(--lx-hairline)] py-3 text-[var(--lx-body)]"
              >
                <span className="shrink-0 text-[var(--lx-green-fill)]" aria-hidden="true">
                  <IconCheck size={14} strokeWidth={2.25} />
                </span>
                {item}
              </li>
            ))}
          </ul>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...ENTRANCE, delay: 0.18 }}
          className="flex flex-col gap-3 sm:flex-row sm:items-center lg:col-start-1 lg:row-start-2"
        >
          <MotionLink href="/onboarding?fresh=1">Start talking to Kai</MotionLink>
          <MotionLink href="/how-it-works" variant="ghost">
            See what happens first
          </MotionLink>
        </motion.div>

        {/* The hero artifact — the whole product performed in fifteen seconds,
            driveable: pick a language and the exchange re-runs in it, right to
            left where that is correct. See KaiDemo.tsx. Grid placement keeps it
            above the CTAs on a phone. */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...ENTRANCE, delay: 0.1 }}
          className="lg:col-start-2 lg:row-span-2 lg:row-start-1 lg:self-center"
        >
          <KaiDemo />
          <p className="mt-4 text-center text-sm leading-[1.7] text-[var(--lx-muted)]">
            Pick a language and watch it run — the follow-up is in their language too. All{' '}
            <Link
              href="/languages"
              className="lx-focus font-medium text-[var(--lx-ink)] underline underline-offset-4"
            >
              {LANGUAGES.length} languages
            </Link>{' '}
            hold a real conversation, not a translated menu.
          </p>
        </motion.div>
      </div>
    </section>
  )
}
