'use client'

/* Shared page primitives so eight content pages don't each reinvent a header,
   a section, a pull-quote and a closing CTA. */

import Link from 'next/link'
import type { ReactNode } from 'react'
import { Kai } from '@/components/kai/Kai'
import { Reveal } from './Reveal'
import { MotionLink } from './MotionLink'

/* ── Page header ─────────────────────────────────────────────────────────── */

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
    <header className="px-5 pb-4 pt-12 sm:px-8 sm:pt-16 md:pt-20 lg:px-16">
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

/* ── Section ─────────────────────────────────────────────────────────────── */

export function Section({
  title,
  children,
  tinted = false,
  id,
}: {
  title?: string
  children: ReactNode
  tinted?: boolean
  id?: string
}) {
  return (
    <section
      id={id}
      className={[
        'px-5 py-14 sm:px-8 md:py-20 lg:px-16',
        tinted ? 'border-y border-[var(--lx-line)] bg-[var(--lx-mint)]' : '',
        id ? 'scroll-mt-24' : '',
      ].join(' ')}
    >
      <div className="mx-auto max-w-4xl">
        {title && (
          <Reveal>
            <h2 className="lx-display text-balance text-[clamp(1.6rem,3.6vw,2.3rem)] font-semibold leading-[1.2] tracking-[-0.02em] text-[var(--lx-ink)]">
              {title}
            </h2>
          </Reveal>
        )}
        <div className={title ? 'mt-8' : ''}>{children}</div>
      </div>
    </section>
  )
}

/* Body copy. Long-form measure capped so a line never runs past ~70 characters.

   Spacing lives on the Reveal wrapper, not the <p>. Each P renders its own
   wrapper div, so a `first:mt-0` on the <p> would match every paragraph (each is
   the first child of its own wrapper) and collapse all the gaps. */
export function P({ children }: { children: ReactNode }) {
  return (
    <Reveal className="mt-6 first:mt-0">
      <p className="max-w-2xl text-pretty text-lg leading-[1.85] text-[var(--lx-body)]">
        {children}
      </p>
    </Reveal>
  )
}

/* ── Pull quote ──────────────────────────────────────────────────────────── */

export function PullQuote({ children }: { children: ReactNode }) {
  return (
    <Reveal className="my-10">
      <p className="lx-display border-l-4 border-[var(--lx-green)] pl-5 text-balance text-[clamp(1.25rem,2.6vw,1.65rem)] font-medium leading-[1.5] text-[var(--lx-ink)] sm:pl-7">
        {children}
      </p>
    </Reveal>
  )
}

/* ── Fact list ───────────────────────────────────────────────────────────────
   Deliberately not a "stat card grid". These are plain, checkable statements —
   we have no accuracy metrics or certifications, and inventing numbers to fill
   a 4-up grid is exactly the corporate tell this site avoids. */

export function Facts({ items }: { items: { label: string; body: string }[] }) {
  return (
    <ul className="mt-8 grid gap-5 sm:grid-cols-2">
      {items.map((item, i) => (
        <Reveal key={item.label} delay={i * 0.06}>
          <li className="h-full rounded-[20px] border border-[var(--lx-line)] bg-white p-5">
            <h3 className="lx-display font-semibold text-[var(--lx-ink)]">{item.label}</h3>
            <p className="mt-2 leading-[1.75] text-[var(--lx-muted)]">{item.body}</p>
          </li>
        </Reveal>
      ))}
    </ul>
  )
}

/* ── Q&A ─────────────────────────────────────────────────────────────────────
   The skeptic's own question, asked out loud. Native <details> so it works
   without JS and is keyboard-operable for free. */

export function QA({ items }: { items: { q: string; a: string }[] }) {
  return (
    <div className="mt-8 divide-y divide-[var(--lx-line)] border-y border-[var(--lx-line)]">
      {items.map((item) => (
        <details key={item.q} className="group py-4">
          <summary className="lx-focus flex min-h-11 cursor-pointer list-none items-center justify-between gap-4 font-semibold text-[var(--lx-ink)] [&::-webkit-details-marker]:hidden">
            {item.q}
            <span
              aria-hidden="true"
              className="shrink-0 text-xl leading-none text-[var(--lx-green)] transition-transform duration-200 group-open:rotate-45"
            >
              +
            </span>
          </summary>
          <p className="mt-3 max-w-2xl leading-[1.85] text-[var(--lx-muted)]">{item.a}</p>
        </details>
      ))}
    </div>
  )
}

/* ── Closing CTA — appears on every page ─────────────────────────────────── */

export function CtaBand({
  title = 'Whenever you’re ready. There’s no rush.',
  body = 'Free, and there is nothing to fill in before you start.',
}: {
  title?: string
  body?: string
}) {
  return (
    <section className="border-t border-[var(--lx-line)] bg-[var(--lx-mint)] px-5 py-16 sm:px-8 md:py-20 lg:px-16">
      <Reveal className="mx-auto flex max-w-3xl flex-col items-center gap-5 text-center">
        <Kai size="sm" state="waving" />
        <h2 className="lx-display text-balance text-[clamp(1.5rem,3.6vw,2.2rem)] font-semibold leading-[1.2] text-[var(--lx-ink)]">
          {title}
        </h2>
        <p className="text-lg leading-[1.8] text-[var(--lx-muted)]">{body}</p>
        <MotionLink href="/onboarding?fresh=1">Start talking to Kai</MotionLink>
      </Reveal>
    </section>
  )
}

/* ── Inline link, matched to the prose ───────────────────────────────────── */

export function A({ href, children }: { href: string; children: ReactNode }) {
  return (
    <Link
      href={href}
      className="lx-focus font-semibold text-[var(--lx-ink)] underline underline-offset-4"
    >
      {children}
    </Link>
  )
}
