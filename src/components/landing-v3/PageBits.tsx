'use client'

/* Page chrome shared across the informational pages.

   Deliberately small. The old version also carried Section / P / Facts / QA /
   PullQuote, which is how every page ended up as the same stack of heading +
   paragraphs. Those are gone — the varied section archetypes live in
   Sections.tsx, and pages compose *those* instead. */

import Link from 'next/link'
import type { ReactNode } from 'react'
import { Kai } from '@/components/kai/Kai'
import { Reveal } from './Reveal'
import { MotionLink } from './MotionLink'

/* Page header. Every page that has one uses this; /about and /accessibility
   deliberately open on something else instead. */
export function PageHero({
  eyebrow,
  title,
  lede,
}: {
  eyebrow: string
  title: string
  lede: string
}) {
  return (
    <header className="px-5 pb-6 pt-12 sm:px-8 sm:pt-16 md:pt-20 lg:px-16">
      <Reveal className="mx-auto max-w-4xl">
        <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[var(--lx-ink)]">
          {eyebrow}
        </p>
        <h1 className="lx-display mt-4 text-balance text-[clamp(2rem,5vw,3.3rem)] font-semibold leading-[1.12] tracking-[-0.02em] text-[var(--lx-ink)]">
          {title}
        </h1>
        <p className="mt-6 max-w-2xl text-pretty text-lg leading-[1.8] text-[var(--lx-muted)] sm:text-xl">
          {lede}
        </p>
      </Reveal>
    </header>
  )
}

/* Closing CTA — on every page, so the patient's door is never more than one
   screen away no matter which audience the page was written for. */
export function CtaBand({
  title = 'Whenever you’re ready. There’s no rush.',
  body = 'Free, and there is nothing to fill in before you start.',
  /* Configurable so a page whose last band is already mint doesn't close on two
     identical grounds in a row — the ground has to keep changing or the rhythm
     flattens out, which is the whole failure we're fixing. */
  palette = 'mint',
}: {
  title?: string
  body?: string
  palette?: 'mint' | 'cream' | 'deep'
}) {
  return (
    <section
      className={`lx-band lx-band-${palette} border-t border-[var(--band-line)] px-5 py-16 sm:px-8 md:py-20 lg:px-16`}
    >
      <Reveal className="mx-auto flex max-w-3xl flex-col items-center gap-5 text-center">
        <Kai size="sm" state="waving" />
        <h2 className="lx-display text-balance text-[clamp(1.5rem,3.6vw,2.2rem)] font-semibold leading-[1.2] text-[var(--band-ink)]">
          {title}
        </h2>
        <p className="text-lg leading-[1.8] text-[var(--band-muted)]">{body}</p>
        <MotionLink href="/onboarding?fresh=1">Start talking to Kai</MotionLink>
      </Reveal>
    </section>
  )
}

/* Inline link, matched to the surrounding prose. */
export function A({ href, children }: { href: string; children: ReactNode }) {
  return (
    <Link
      href={href}
      className="lx-focus font-semibold text-[var(--band-ink,var(--lx-ink))] underline underline-offset-4"
    >
      {children}
    </Link>
  )
}
