'use client'

/* =========================== HOW IT WORKS ==================================
   Three steps, kept from the old Flow section — but the visual treatment is a
   calm vertical list rather than a startup feature grid. The goal is anxiety
   reduction through clarity: "here is exactly what will happen to you."

   The old version linked a rail, a travelling marker and a phone parallax to
   scroll position. All of it is gone; each step simply fades in once.
   ========================================================================== */

import { Reveal } from './Reveal'
import { MotionLink } from './MotionLink'
import { steps } from './landingData'

export function HowItWorks() {
  return (
    <section id="how-it-works" className="relative scroll-mt-28 px-5 py-20 sm:px-8 md:py-28 lg:px-16">
      <div className="mx-auto max-w-4xl">
        <Reveal className="max-w-2xl">
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[var(--lx-ink)]">
            What happens
          </p>
          <h2 className="lx-display mt-4 text-[clamp(1.9rem,4.6vw,3rem)] font-semibold leading-[1.15] tracking-[-0.02em] text-[var(--lx-ink)]">
            Here is exactly what will happen. No surprises.
          </h2>
        </Reveal>

        <ol className="mt-14 space-y-10">
          {steps.map((step, i) => (
            <Reveal key={step.id} delay={i * 0.08}>
              <li className="grid gap-5 border-t border-[var(--lx-line)] pt-8 sm:grid-cols-[auto_1fr] sm:gap-8">
                <span
                  className="lx-display flex h-14 w-14 items-center justify-center rounded-full bg-[var(--lx-mint)] text-lg font-semibold text-[var(--lx-ink)] ring-1 ring-[var(--lx-line)]"
                  aria-hidden="true"
                >
                  {step.id}
                </span>
                <div>
                  <h3 className="lx-display text-[1.4rem] font-semibold leading-snug text-[var(--lx-ink)] sm:text-2xl">
                    {step.title}
                  </h3>
                  <p className="mt-3 max-w-2xl text-lg leading-[1.8] text-[var(--lx-muted)]">
                    {step.body}
                  </p>
                </div>
              </li>
            </Reveal>
          ))}
        </ol>

        <Reveal delay={0.1}>
          <div className="mt-12 rounded-[24px] border border-[var(--lx-line)] bg-[var(--lx-mint)] p-6 sm:p-8">
            <p className="text-lg leading-[1.8] text-[var(--lx-body)]">
              You can stop at any point, and nothing is sent to anyone until you say so. If you
              change your mind halfway through, that is completely fine.
            </p>
            <div className="mt-6">
              <MotionLink href="/onboarding?fresh=1">Start talking to Kai</MotionLink>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  )
}
