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
}: {
  eyebrow: string
  title: ReactNode
  lede: ReactNode
  variant?: HeroVariant
  media?: ReactNode
}) {
  const shell = 'px-5 pt-12 sm:px-8 sm:pt-16 md:pt-20 lg:px-16'

  if (variant === 'document') {
    /* Sans, not serif. A trust page should read like a document you can rely on,
       not a magazine feature, and the typeface is the fastest way to say that. */
    return (
      <header className={`${shell} pb-4`}>
        <Reveal className="mx-auto max-w-2xl">
          <div className="flex items-center gap-3">
            <span className="h-px flex-1 bg-[var(--lx-line)]" aria-hidden="true" />
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--lx-muted)]">
              {eyebrow}
            </p>
            <span className="h-px flex-1 bg-[var(--lx-line)]" aria-hidden="true" />
          </div>
          <h1 className="mt-7 text-balance font-sans text-[clamp(1.6rem,3.4vw,2.3rem)] font-semibold leading-[1.25] tracking-[-0.01em] text-[var(--lx-ink)]">
            {title}
          </h1>
          <p className="mt-5 text-pretty leading-[1.9] text-[var(--lx-muted)]">{lede}</p>
        </Reveal>
      </header>
    )
  }

  if (variant === 'centered') {
    return (
      <header className={`${shell} pb-6 text-center`}>
        <Reveal className="mx-auto max-w-4xl">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--lx-green)]">
            {eyebrow}
          </p>
          <h1 className="lx-display mt-5 text-balance text-[clamp(2.4rem,7vw,4.5rem)] font-semibold leading-[1.05] tracking-[-0.03em] text-[var(--lx-ink)]">
            {title}
          </h1>
          <span
            className="mx-auto mt-7 block h-px w-16 bg-[var(--lx-green)]"
            aria-hidden="true"
          />
          <p className="mx-auto mt-7 max-w-2xl text-pretty text-lg leading-[1.8] text-[var(--lx-muted)] sm:text-xl">
            {lede}
          </p>
        </Reveal>
      </header>
    )
  }

  if (variant === 'split') {
    return (
      <header className={`${shell} pb-6`}>
        <div className="mx-auto grid max-w-6xl items-center gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:gap-16">
          <Reveal>
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[var(--lx-ink)]">
              {eyebrow}
            </p>
            <h1 className="lx-display mt-4 text-balance text-[clamp(2rem,4.6vw,3rem)] font-semibold leading-[1.12] tracking-[-0.02em] text-[var(--lx-ink)]">
              {title}
            </h1>
            <p className="mt-6 text-pretty text-lg leading-[1.8] text-[var(--lx-muted)]">{lede}</p>
          </Reveal>
          <Reveal delay={0.1}>{media}</Reveal>
        </div>
      </header>
    )
  }

  /* editorial */
  return (
    <header className={`${shell} pb-6`}>
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
