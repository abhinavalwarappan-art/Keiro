'use client'

/* Page chrome — the ledger's opening leaves.

   Every variant opens with a RUNNING HEAD: a strong top rule with the page's
   mono folio flush-left, exactly like the running head on a chart page. The
   variants then diverge in structure, not just spacing:

     editorial — running head, display h1 hard-left, lede in a narrower
                 measure beside/below. The default voice. Never centered.
     centered  — the one centered opening on the site (Meet Kai's case file).
     split     — 7/5 asymmetric: voice left, an artifact right.
     document  — the trust pages: symmetric, ruled top and bottom, tighter
                 measure, set in the workhorse sans. A promise should read
                 like something you can rely on, not like a magazine feature.
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
  /* Drops the page's single daylight wash behind the opening. One per page,
     hero only (DESIGN.md §3 — atmosphere is rationed, not distributed). */
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
  const shell = 'relative px-5 pt-10 sm:px-8 sm:pt-14 md:pt-16 lg:px-10'
  const field = flow ? <div className="lx-daylight" aria-hidden="true" /> : null

  if (variant === 'document') {
    /* The one SANS opening on the site. Narrative pages open in the display
       voice; the trust pages (privacy, accessibility) open like the policies
       they are — ruled top and bottom, tighter measure, steady 500. */
    return (
      <header className={`${shell} overflow-hidden pb-10`}>
        {field}
        <Reveal className="lx-above mx-auto max-w-3xl">
          <div className="lx-runhead">
            <p className="lx-label text-xs text-[var(--lx-muted)]">{eyebrow}</p>
            <p className="lx-label text-xs text-[var(--lx-muted)]" aria-hidden="true">
              Keiro
            </p>
          </div>
          <h1 className="mt-9 max-w-2xl text-balance text-[clamp(1.7rem,3.6vw,2.5rem)] font-medium leading-[1.28] tracking-[-0.01em] text-[var(--lx-ink)]">
            {title}
          </h1>
          <p className="mt-6 max-w-xl text-pretty leading-[1.9] text-[var(--lx-muted)]">{lede}</p>
          <span className="mt-9 block h-px w-full bg-[var(--lx-hairline)]" aria-hidden="true" />
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
          <div className="mx-auto flex max-w-md items-center gap-3">
            <span className="h-px flex-1 bg-[var(--band-line-strong,var(--lx-rule-strong))]" aria-hidden="true" />
            <p className="lx-label text-xs text-[var(--lx-green-ink)]">{eyebrow}</p>
            <span className="h-px flex-1 bg-[var(--band-line-strong,var(--lx-rule-strong))]" aria-hidden="true" />
          </div>
          <h1 className="lx-display mt-8 text-balance text-[clamp(2.3rem,6.5vw,4.2rem)] text-[var(--lx-ink)]">
            {title}
          </h1>
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
        <div className="lx-above mx-auto grid max-w-6xl items-center gap-10 lg:grid-cols-[1.15fr_0.85fr] lg:gap-16">
          <Reveal>
            <div className="lx-runhead max-w-xl">
              <p className="lx-label text-xs text-[var(--lx-ink)]">{eyebrow}</p>
            </div>
            <h1 className="lx-display mt-7 text-balance text-[clamp(2.1rem,4.8vw,3.2rem)] text-[var(--lx-ink)]">
              {title}
            </h1>
            <p className="mt-6 max-w-xl text-pretty text-lg leading-[1.8] text-[var(--lx-muted)]">
              {lede}
            </p>
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
      <Reveal className="lx-above mx-auto max-w-6xl">
        <div className="lx-runhead">
          <p className="lx-label text-xs text-[var(--lx-ink)]">{eyebrow}</p>
          <p className="lx-label hidden text-xs text-[var(--lx-muted)] sm:block" aria-hidden="true">
            Keiro · intake, in your language
          </p>
        </div>
        <div className="mt-8 grid gap-6 lg:grid-cols-[1.5fr_1fr] lg:gap-16">
          <h1 className="lx-display max-w-3xl text-balance text-[clamp(2.1rem,5vw,3.4rem)] text-[var(--lx-ink)]">
            {title}
          </h1>
          <p className="max-w-xl self-end text-pretty text-lg leading-[1.8] text-[var(--lx-muted)] lg:pb-1">
            {lede}
          </p>
        </div>
        {footer && <div className="mt-8">{footer}</div>}
      </Reveal>
    </header>
  )
}

/* The single closing CTA — an appointment slip, not a centered stack.

   Only the patient-facing pages carry one, and only ever ONE. The
   informational pages (mission, trust, clinics, contact) close on their
   content, because the nav's "Start with Kai" is persistent and a second
   identical invitation at the bottom of a policy page reads as a sales page,
   not an honest one. */
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
      className={`lx-band lx-band-${palette} lx-section border-t border-[var(--band-line)] px-5 sm:px-8 lg:px-10`}
    >
      <Reveal className="mx-auto max-w-6xl">
        <div className="lx-regmark border border-[var(--band-line)] bg-[var(--band-card)] px-6 py-8 sm:px-10 sm:py-10">
          <div className="flex flex-col gap-8 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-6">
              <span className="hidden sm:block" aria-hidden="true">
                <Kai size="sm" state="waving" />
              </span>
              <div>
                <p className="lx-label text-[0.65rem] text-[var(--lx-green-ink)]">
                  No appointment needed
                </p>
                <h2 className="lx-heading mt-3 text-balance text-[clamp(1.4rem,3.2vw,2rem)] text-[var(--band-ink)]">
                  {title}
                </h2>
                <p className="mt-3 text-lg leading-[1.8] text-[var(--band-muted)]">{body}</p>
              </div>
            </div>
            <div className="shrink-0">
              <MotionLink href="/onboarding?fresh=1">Start talking to Kai</MotionLink>
            </div>
          </div>
        </div>
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
