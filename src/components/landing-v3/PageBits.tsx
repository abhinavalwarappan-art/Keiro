'use client'

/* Page chrome.

   Most informational pages use the same clear, left-aligned product hero as the
   homepage. Only pages with a real visual reason depart from it: Languages uses
   a centered directory introduction, while Meet Kai and For clinics pair copy
   with a product visual.
*/

import Link from 'next/link'
import type { ReactNode } from 'react'
import { Kai } from '@/components/kai/Kai'
import { Reveal } from './Reveal'
import { MotionLink } from './MotionLink'

type HeroVariant = 'standard' | 'centered' | 'split'

export function PageHero({
  eyebrow,
  title,
  lede,
  variant = 'standard',
  media,
  /* Drops the page's gradient light-field behind the opening, ending on Stripe's
     diagonal so the colour reads as passing *behind* the page rather than
     stopping at the first section border. */
  flow = false,
  footer,
}: {
  eyebrow: string
  title: ReactNode
  lede: ReactNode
  variant?: HeroVariant
  media?: ReactNode
  flow?: boolean
  footer?: ReactNode
}) {
  const shell = 'relative px-5 pt-12 sm:px-8 sm:pt-16 md:pt-20 lg:px-16'
  const field = flow ? (
    <div className="lx-flow lx-flow-hero lx-flow-drift" aria-hidden="true" />
  ) : null

  if (variant === 'centered') {
    return (
      <header className={`${shell} overflow-hidden pb-6 text-center`}>
        {field}
        <Reveal className="lx-above mx-auto max-w-4xl">
          {/* Body-size text, so it takes the 4.5:1 token, not the fill green. */}
          <p className="lx-label text-xs text-[var(--lx-green-ink)]">
            {eyebrow}
          </p>
          <h1 className="lx-display mt-5 text-balance text-[clamp(2.4rem,7vw,4.5rem)] text-[var(--lx-ink)]">
            {title}
          </h1>
          <span
            className="mx-auto mt-7 block h-px w-16 bg-[var(--lx-green)]"
            aria-hidden="true"
          />
          <p className="mx-auto mt-7 max-w-2xl text-pretty text-lg leading-[1.8] text-[var(--lx-muted)] sm:text-xl">
            {lede}
          </p>
          {footer && <div className="mt-9">{footer}</div>}
        </Reveal>
      </header>
    )
  }

  if (variant === 'split') {
    return (
      <header className={`${shell} overflow-hidden pb-6`}>
        {field}
        <div className="lx-above mx-auto grid max-w-6xl items-center gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:gap-16">
          <Reveal>
            <p className="lx-label text-xs text-[var(--lx-ink)]">
              {eyebrow}
            </p>
            <h1 className="lx-display mt-4 text-balance text-[clamp(2rem,4.6vw,3rem)] text-[var(--lx-ink)]">
              {title}
            </h1>
            <p className="mt-6 text-pretty text-lg leading-[1.8] text-[var(--lx-muted)]">{lede}</p>
            {footer && <div className="mt-8">{footer}</div>}
          </Reveal>
          <Reveal delay={0.1}>{media}</Reveal>
        </div>
      </header>
    )
  }

  /* Standard inner-page hero: the homepage's clarity, at a slightly smaller scale. */
  return (
    <header className={`${shell} overflow-hidden pb-16 sm:pb-20 md:pb-24`}>
      {field}
      <Reveal className="lx-above mx-auto max-w-[68rem]">
        <p className="lx-label text-sm text-[var(--lx-green-ink)]">
          {eyebrow}
        </p>
        <h1 className="mt-5 max-w-[58rem] text-balance text-[clamp(2.125rem,1.4rem+3.6vw,4.25rem)] font-semibold leading-[1.05] tracking-[-0.045em] text-[var(--lx-ink)]">
          {title}
        </h1>
        <p className="mt-7 max-w-[42rem] text-pretty text-lg leading-[1.65] text-[var(--lx-muted)] sm:text-xl">
          {lede}
        </p>
        {footer && <div className="mt-8">{footer}</div>}
      </Reveal>
    </header>
  )
}

/* The single closing CTA.

   Only the patient-facing pages carry one, and only ever ONE. The informational
   pages (mission, trust, clinics, contact) close on their content, because the
   nav's "Start with Kai" is persistent and a second identical invitation at the
   bottom of a policy page reads as a sales page, not an honest one. */
export function CtaBand({
  title = 'Whenever you’re ready. There’s no rush.',
  body = 'Free, and you can stop at any point.',
  palette = 'mint',
}: {
  title?: string
  body?: string
  palette?: 'mint' | 'cream' | 'deep'
}) {
  return (
    <section
      className={`lx-band lx-band-${palette} lx-section border-t border-[var(--band-line)] px-5 sm:px-8 lg:px-16`}
    >
      <Reveal className="mx-auto flex max-w-3xl flex-col items-center gap-5 text-center">
        <Kai size="sm" state="waving" />
        <h2 className="lx-heading text-balance text-[clamp(1.5rem,3.6vw,2.2rem)] text-[var(--band-ink)]">
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
