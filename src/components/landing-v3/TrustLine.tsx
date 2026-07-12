'use client'

/* Why this exists. One quiet human sentence — deliberately not a stat card.
   The 67M number is load-bearing but it is a clause, not a headline. */

import { Reveal } from './Reveal'

export function TrustLine() {
  return (
    <section className="relative px-5 py-20 sm:px-8 md:py-28 lg:px-16">
      <Reveal className="mx-auto max-w-3xl text-center">
        <p className="lx-display text-[clamp(1.35rem,3vw,1.85rem)] font-medium leading-[1.6] text-[var(--lx-ink)]">
          About 67 million people in this country speak a language other than English at home.
          Many of them sit in a waiting room rehearsing how to say where it hurts — and still
          walk out unsure they were understood.
        </p>
        <p className="mt-6 text-lg leading-[1.8] text-[var(--lx-muted)]">
          That is the whole reason Keiro exists. Not to replace your doctor. To make sure the
          person in front of them actually gets heard.
        </p>
      </Reveal>
    </section>
  )
}
