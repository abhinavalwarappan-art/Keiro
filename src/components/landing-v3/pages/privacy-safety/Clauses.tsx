/* THE CLAUSES (DESIGN.md §7.8).

   The trust page typeset as a legal document done honestly: two-level clause
   numerals hanging in a wide left gutter, formal clause text in the reading
   column, and a plain-language restatement in a wash block beside the ones
   that matter. Zero green display accents — the most sober page on the site,
   by construction; the only colour is the wash behind the plain-words blocks
   and the amber annotation on the one clause that must not be missed.

   Server-safe (no hooks) — composed straight into the page. */

import type { ReactNode } from 'react'
import { Reveal } from '../../Reveal'

/* A top-level clause: mono numeral in the gutter, h2 title, body column. */
export function Clause({
  n,
  title,
  flag,
  children,
}: {
  n: string
  title: string
  flag?: string
  children: ReactNode
}) {
  return (
    <Reveal
      as="li"
      className="grid gap-x-8 gap-y-4 border-t border-[var(--band-line-strong)] py-10 sm:grid-cols-[4rem_1fr] lg:grid-cols-[6rem_1fr] lg:gap-x-14 lg:py-14"
    >
      <div className="lx-mono text-lg text-[var(--band-muted)]" aria-hidden="true">
        {n}
      </div>
      <div className="min-w-0">
        {flag && <p className="lx-label mb-3 text-[0.65rem] text-[var(--lx-signal-ink)]">{flag}</p>}
        <h2 className="lx-heading text-[clamp(1.5rem,3vw,2.1rem)] text-[var(--band-ink)]">{title}</h2>
        <div className="mt-6 space-y-6">{children}</div>
      </div>
    </Reveal>
  )
}

/* A sub-clause within a clause's body: mono numeral + h3. */
export function SubClause({ n, title, children }: { n: string; title: string; children: ReactNode }) {
  return (
    <div className="grid gap-x-6 border-t border-[var(--band-line)] pt-5 sm:grid-cols-[3rem_1fr]">
      <div className="lx-mono text-sm text-[var(--band-muted)]" aria-hidden="true">
        {n}
      </div>
      <div className="min-w-0">
        <h3 className="lx-title text-lg text-[var(--band-ink)]">{title}</h3>
        <div className="mt-3 space-y-4 leading-[1.85] text-[var(--band-muted)]">{children}</div>
      </div>
    </div>
  )
}

/* The plain-language restatement, in a wash block. */
export function PlainWords({ children }: { children: ReactNode }) {
  return (
    <div className="rounded-[4px] border-s-2 border-[var(--lx-green-fill)] bg-[var(--lx-wash)] px-5 py-4">
      <p className="lx-label text-[0.6rem] text-[var(--lx-green-ink)]">In plain words</p>
      <p className="mt-2 leading-[1.8] text-[var(--lx-body)]">{children}</p>
    </div>
  )
}

/* Body paragraph for a clause. */
export function ClauseText({ children }: { children: ReactNode }) {
  return <p className="max-w-2xl leading-[1.85] text-[var(--band-muted)]">{children}</p>
}
