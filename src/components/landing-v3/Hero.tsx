'use client'

/* ============================== HERO =======================================
   Kai speaks first, in first person (the Ada Health pattern: name → what I do →
   what I am not). The live language switcher is the primary interaction on the
   page, not a fact stated in copy: tap your language and Kai's actual opening
   line re-renders in it, in-script and right-to-left where that applies.

   No scroll-linked motion. The only entrance animation is a one-shot fade.
   ========================================================================== */

import { useState } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { Kai } from '@/components/kai/Kai'
import { LANGUAGES } from '@/lib/languages'
import { FlagEmoji } from './FlagEmoji'
import { MotionLink } from './MotionLink'
import { heroGreetings } from './landingData'

export function Hero() {
  const [active, setActive] = useState(heroGreetings[0])

  return (
    <section
      id="hero"
      className="relative scroll-mt-28 px-5 pb-16 pt-12 sm:px-8 sm:pt-20 md:pt-28 lg:px-16"
    >
      {/* Grid placement (rather than source order) puts the language card ahead of
          the CTAs on a phone — otherwise the one interaction that proves the whole
          product sits below the fold at 375px. On lg the card spans both rows. */}
      <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-[1fr_0.85fr] lg:items-center lg:gap-16">
        {/* ── Kai's voice ── */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="lg:col-start-1 lg:row-start-1"
        >
          <p className="inline-flex items-center gap-2 rounded-full border border-[var(--lx-line)] bg-[var(--lx-mint)] px-3 py-1.5 text-sm font-medium text-[var(--lx-ink)]">
            Free · No account · No forms
          </p>

          <h1 className="lx-display mt-6 text-balance text-[clamp(2rem,5.2vw,3.4rem)] font-semibold leading-[1.12] tracking-[-0.02em] text-[var(--lx-ink)]">
            I&apos;m Kai. Tell me what hurts — in the language you think in.
          </h1>

          <p className="mt-6 max-w-xl text-pretty text-[1.05rem] leading-[1.75] text-[var(--lx-muted)] sm:text-lg">
            Then I&apos;ll explain it to your doctor, in clear English. I&apos;m not a doctor and I
            won&apos;t diagnose you. I&apos;ll just make sure you&apos;re understood.
          </p>
        </motion.div>

        {/* ── The live language moment ── */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.12, ease: [0.16, 1, 0.3, 1] }}
          className="relative lg:col-start-2 lg:row-span-2 lg:row-start-1 lg:self-center"
        >
          <div className="rounded-[28px] border border-[var(--lx-line)] bg-[var(--lx-mint)] p-5 shadow-[0_24px_60px_-30px_rgba(26,61,43,0.35)] sm:p-7">
            <label
              htmlFor="hero-lang"
              className="block text-sm font-semibold text-[var(--lx-ink)]"
            >
              Which language do you speak?
            </label>

            {/* Chips are a radiogroup, not a listbox — one visible choice, no popup
                to trap a screen reader or a shaky finger. */}
            <div
              id="hero-lang"
              role="radiogroup"
              aria-label="Choose the language Kai speaks to you in"
              className="mt-3 flex flex-wrap gap-2"
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
                      'lx-focus flex min-h-11 items-center gap-2 rounded-full border px-3.5 text-sm font-medium transition-colors duration-200',
                      isActive
                        ? 'border-[var(--lx-ink)] bg-[var(--lx-ink)] text-white'
                        : 'border-[var(--lx-line)] bg-white text-[var(--lx-body)] hover:border-[var(--lx-sage)]',
                    ].join(' ')}
                  >
                    <FlagEmoji region={g.region} />
                    <span className="lx-native">{g.label}</span>
                  </button>
                )
              })}
            </div>

            {/* Kai's actual opening line, live. aria-live so a screen-reader user
                hears the change instead of silently missing the whole point. */}
            <div className="mt-6 flex items-start gap-3">
              <span className="mt-1 shrink-0">
                <Kai size="xs" animated={false} />
              </span>

              <div
                className="min-h-[8.5rem] flex-1 rounded-[20px] rounded-tl-md border border-[var(--lx-line)] bg-white p-4 sm:min-h-[7.5rem]"
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
                      'lx-native text-[1.02rem] leading-[1.75] text-[var(--lx-body)]',
                      active.rtl ? 'text-right' : 'text-left',
                    ].join(' ')}
                  >
                    {active.text}
                  </motion.p>
                </AnimatePresence>
              </div>
            </div>

            {/* Counts are derived, never typed by hand — this line previously
                claimed 41 while the app already supported 45. */}
            <p className="mt-4 text-sm leading-relaxed text-[var(--lx-muted)]">
              Kai speaks {heroGreetings.length} languages here, and{' '}
              <Link
                href="/languages"
                className="lx-focus font-semibold text-[var(--lx-ink)] underline underline-offset-4"
              >
                {LANGUAGES.length} in the app
              </Link>
              .
            </p>
          </div>
        </motion.div>

        {/* ── CTAs — last in the DOM so the card outranks them on a phone; grid
             placement lifts them back under the copy on desktop. ── */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.18, ease: [0.16, 1, 0.3, 1] }}
          className="flex flex-col gap-3 sm:flex-row sm:items-center lg:col-start-1 lg:row-start-2"
        >
          <MotionLink href="/onboarding?fresh=1">Start talking to Kai</MotionLink>
          <MotionLink href="#how-it-works" variant="ghost">
            See what happens first
          </MotionLink>
        </motion.div>
      </div>
    </section>
  )
}
