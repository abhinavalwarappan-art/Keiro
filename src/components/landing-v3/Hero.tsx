'use client'

/* ============================== HERO =======================================
   Kai speaks first, in first person. The live language switcher is the primary
   interaction on the page, not a claim made in copy: pick your language and
   Kai's actual opening line re-renders in it — all 45, in-script, RTL-aware.

   No scroll-linked motion. One staggered entrance, then it sits still.
   ========================================================================== */

import Link from 'next/link'
import { motion } from 'framer-motion'
import { LANGUAGES } from '@/lib/languages'
import { LanguagePicker } from './LanguagePicker'
import { MotionLink } from './MotionLink'
import { Accent } from './Sections'

const ENTRANCE = { duration: 0.6, ease: [0.16, 1, 0.3, 1] as const }

export function Hero() {
  return (
    <section id="hero" className="relative scroll-mt-28 px-5 pb-14 pt-12 sm:px-8 sm:pt-16 lg:px-16">
      <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-[1fr_0.9fr] lg:items-center lg:gap-16">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={ENTRANCE}
          className="lg:col-start-1 lg:row-start-1"
        >
          <h1 className="lx-display text-balance text-[clamp(2.1rem,5.4vw,3.5rem)] font-semibold leading-[1.12] tracking-[-0.02em] text-[var(--lx-ink)]">
            I&apos;m Kai. Tell me what hurts, <Accent>in the language you think in.</Accent>
          </h1>

          <p className="mt-6 max-w-xl text-pretty text-lg leading-[1.8] text-[var(--lx-muted)] sm:text-xl">
            Then I&apos;ll write it down for your doctor, in clear English. I&apos;m not a doctor and
            I won&apos;t diagnose you. I&apos;ll just make sure you&apos;re understood.
          </p>

          {/* The three objections a scared patient actually has, answered before
              they're asked. Replaces the eyebrow pill, which said the same thing
              in a decorative box nobody reads. */}
          <ul className="mt-7 space-y-2.5">
            {[
              'Free, and it always will be.',
              'No account needed to start.',
              'You can stop at any point.',
            ].map((item) => (
              <li key={item} className="flex items-center gap-3 text-[var(--lx-body)]">
                <span
                  className="grid h-5 w-5 shrink-0 place-items-center rounded-full bg-[var(--lx-green)] text-[0.65rem] font-bold text-white"
                  aria-hidden="true"
                >
                  ✓
                </span>
                {item}
              </li>
            ))}
          </ul>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...ENTRANCE, delay: 0.18 }}
          className="flex flex-col gap-3 sm:flex-row sm:items-center lg:col-start-1 lg:row-start-2"
        >
          <MotionLink href="/onboarding?fresh=1">Start talking to Kai</MotionLink>
          <MotionLink href="/how-it-works" variant="ghost">
            See what happens first
          </MotionLink>
        </motion.div>

        {/* Grid placement (not source order) keeps the picker above the CTAs on a
            phone — otherwise the one interaction that proves the product sits
            below the fold at 375px. */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...ENTRANCE, delay: 0.1 }}
          className="lg:col-start-2 lg:row-span-2 lg:row-start-1 lg:self-center"
        >
          <LanguagePicker compact />
          <p className="mt-4 text-center text-sm text-[var(--lx-muted)]">
            All{' '}
            <Link
              href="/languages"
              className="lx-focus font-semibold text-[var(--lx-ink)] underline underline-offset-4"
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
