'use client'

/* THE PROCEDURE COLUMN (DESIGN.md §7.2).

   The method set as a numbered clinical protocol rather than a row of step
   cards: each step is a ruled entry with an oversized display numeral
   half-cropped by the left margin, a mono annotation block (how long it takes,
   what Kai knows by the end of it), a narrow reading column, and a real
   product fragment framed with registration marks and a FIG. caption. Linear,
   top to bottom, the way a procedure is read. */

import type { ReactNode } from 'react'
import { Reveal } from '../../Reveal'

export type Procedure = {
  n: string
  title: ReactNode
  body: string
  duration: string
  knows: string
  fig: string
  artifact: ReactNode
}

export function ProcedureColumn({ steps }: { steps: Procedure[] }) {
  const total = String(steps.length).padStart(2, '0')
  return (
    <ol className="border-t border-[var(--band-line-strong)]">
      {steps.map((step, i) => (
        <Reveal
          as="li"
          key={step.n}
          delay={i * 0.06}
          className="grid gap-8 border-b border-[var(--band-line)] py-12 lg:grid-cols-[7rem_minmax(0,1fr)_minmax(0,20rem)] lg:gap-12 lg:py-16"
        >
          {/* The margin numeral — chart-watermark scale, cropped by the column
              edge, in the rule tone. Decorative; the ol carries the count. */}
          <div aria-hidden="true" className="relative">
            <span className="lx-display block overflow-hidden text-[3rem] leading-none text-[var(--band-line-strong)] lg:text-[clamp(4rem,6vw,6rem)]">
              {step.n}
            </span>
            <span className="lx-mono mt-2 block text-xs text-[var(--band-muted)]">/ {total}</span>
          </div>

          {/* The reading column, with its mono annotation block. */}
          <div className="min-w-0">
            <h3 className="lx-heading text-[clamp(1.4rem,2.6vw,1.85rem)] text-[var(--band-ink)]">
              {step.title}
            </h3>
            <p className="mt-4 max-w-prose text-lg leading-[1.8] text-[var(--band-muted)]">
              {step.body}
            </p>

            <dl className="mt-7 grid max-w-md grid-cols-2 border-t border-[var(--band-line)]">
              <div className="border-e border-[var(--band-line)] py-3 pe-4">
                <dt className="lx-label text-[0.6rem] text-[var(--band-muted)]">Duration</dt>
                <dd className="lx-mono mt-1.5 text-sm text-[var(--band-ink)]">{step.duration}</dd>
              </div>
              <div className="py-3 ps-4">
                <dt className="lx-label text-[0.6rem] text-[var(--band-muted)]">Kai knows</dt>
                <dd className="lx-mono mt-1.5 text-sm text-[var(--band-ink)]">{step.knows}</dd>
              </div>
            </dl>
          </div>

          {/* The artifact, framed and captioned like a figure. */}
          <figure className="min-w-0">
            <div className="lx-regmark">{step.artifact}</div>
            <figcaption className="lx-label mt-5 text-[0.625rem] text-[var(--band-muted)]">
              {step.fig}
            </figcaption>
          </figure>
        </Reveal>
      ))}
    </ol>
  )
}
