'use client'

/* Page chrome.

   PageHero has variants because the previous single treatment (eyebrow -> serif
   H1 -> lede, left-aligned, same size, same measure) meant every page opened
   identically no matter how different its body was. The opening is the first
   thing you see, so if it never changes, the site reads as one page with the
   words swapped.

   Each variant changes alignment, type scale AND typeface, not just spacing:
     editorial — left, big serif. The default voice.
     centered  — centred, biggest serif, with a rule. For a page that is a display.
     split     — serif left, a visual right. For a page introducing a thing.
     document  — narrow, SANS, smaller, ruled. For a page you read like a policy.
*/

import Link from 'next/link'
import type { ReactNode } from 'react'
import { Kai } from '@/components/kai/Kai'
import { Reveal } from './Reveal'
import { MotionLink } from './MotionLink'

type HeroVariant = 'editorial' | 'centered' | 'split' | 'document'

export function PageHero({
  eyebrow,
  title,
  lede,
  variant = 'editorial',
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

  if (variant === 'document') {
    /* The one SANS hero on the site. Every narrative page opens in the serif
       voice; the trust pages (privacy, accessibility, terms) open like the
       policies they are — symmetric, ruled top and bottom, tighter measure,
       set in the workhorse sans at a steady 500. A promise should read like
       something you can rely on, not like a magazine feature.

       (It is also fully centred. It used to be a left-aligned column that was
       itself centred on the page — the worst of both, with the text hanging off
       to one side and a large dead margin beside it.) */
    return (
      <header className={`${shell} overflow-hidden pb-10 text-center`}>
        {field}
        <Reveal className="lx-above mx-auto max-w-3xl">
          <div className="mx-auto flex max-w-md items-center gap-3">
            <span className="h-px flex-1 bg-[var(--lx-line)]" aria-hidden="true" />
            <p className="lx-label text-xs text-[var(--lx-muted)]">{eyebrow}</p>
            <span className="h-px flex-1 bg-[var(--lx-line)]" aria-hidden="true" />
          </div>
          <h1 className="mx-auto mt-8 max-w-3xl text-balance text-[clamp(1.75rem,3.8vw,2.6rem)] font-medium leading-[1.25] tracking-[-0.01em] text-[var(--lx-ink)]">
            {title}
          </h1>
          <p className="mx-auto mt-6 max-w-xl text-pretty leading-[1.9] text-[var(--lx-muted)]">
            {lede}
          </p>
          <span className="mx-auto mt-9 block h-px w-full max-w-md bg-[var(--lx-line)]" aria-hidden="true" />
          {footer && <div className="mt-9">{footer}</div>}
        </Reveal>
      </header>
    )
  }

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

  /* editorial */
  return (
    <header className={`${shell} overflow-hidden pb-6`}>
      {field}
      <Reveal className="lx-above mx-auto max-w-4xl">
        <p className="lx-label text-xs text-[var(--lx-ink)]">
          {eyebrow}
        </p>
        <h1 className="lx-display mt-4 text-balance text-[clamp(2rem,5vw,3.3rem)] text-[var(--lx-ink)]">
          {title}
        </h1>
        <p className="mt-6 max-w-2xl text-pretty text-lg leading-[1.8] text-[var(--lx-muted)] sm:text-xl">
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
