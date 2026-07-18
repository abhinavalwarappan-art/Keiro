/* Page-local pieces for /about — THE EDITORIAL LETTER (DESIGN.md §7.5).

   One paper plane, zero cards, zero band alternation. The page is a broadsheet
   letter: the left ~60% column carries first-person prose (opened by a giant
   Bricolage initial cap, see letter.css), the right margin carries
   footnote-style mono annotations — StatRow-scale figures and the numbered
   rules ledger — each tied back toward its sentence by a hairline tick that
   reaches across the column gutter.

   No hooks here: these are server-safe compositions around the shared Reveal
   (the only client boundary), so the page ships no JS of its own. */

import type { ReactNode } from 'react'
import { Reveal } from '../../Reveal'
import './letter.css'

/* ── A letter paragraph — the reading voice, 18px floor, long leading ──────── */

export function LetterPara({
  children,
  initial = false,
}: {
  children: ReactNode
  /* First paragraph of the letter only: takes the ::first-letter drop cap. */
  initial?: boolean
}) {
  return (
    <p
      className={`${
        initial ? 'about-letter-initial ' : ''
      }text-pretty text-lg leading-[1.9] text-[var(--lx-body)]`}
    >
      {children}
    </p>
  )
}

/* ── A passage — one grid row of the broadsheet ──────────────────────────────
   Letter column ~60% (a 42rem measure inside the 72rem page), margin column
   takes the rest. On mobile the annotation follows its paragraph and reads as
   a footnote. */

export function LetterPassage({
  children,
  margin,
}: {
  children: ReactNode
  margin?: ReactNode
}) {
  return (
    <div className="grid gap-y-9 lg:grid-cols-[minmax(0,42rem)_minmax(0,1fr)] lg:gap-x-24">
      <Reveal className="space-y-7">{children}</Reveal>
      {margin && (
        <Reveal delay={0.12} className="lg:pt-2">
          {margin}
        </Reveal>
      )}
    </div>
  )
}

/* ── The footnote marker in the letter text ──────────────────────────────────
   A mono superscript numeral matching its margin note ("Note 1"). Green-ink —
   7.4:1, safe at any size — and never the only tie: the note repeats the
   numeral in its own head. */

export function FootnoteMark({ n }: { n: string }) {
  return <sup className="lx-mono ms-0.5 text-[0.7em] text-[var(--lx-green-ink)]">{n}</sup>
}

/* ── The margin-note shell — top rule + the tick across the gutter ─────────── */

function MarginNoteShell({ children }: { children: ReactNode }) {
  return (
    <div className="relative border-t border-[var(--lx-rule-strong)] pt-3">
      {/* The hairline tick tying the note back toward its sentence. The column
          gap is 6rem; the tick reaches 4rem into it. Decorative — the numbered
          footnote marks carry the actual mapping. */}
      <span
        aria-hidden="true"
        className="absolute -start-16 top-[-1px] hidden h-px w-16 bg-[var(--lx-hairline)] lg:block"
      />
      {children}
    </div>
  )
}

/* ── A StatRow-scale figure, demoted to the margin ─────────────────────────── */

export function MarginFigure({
  index,
  label,
  figure,
  note,
}: {
  index: string
  label: string
  figure: ReactNode
  note: string
}) {
  return (
    <MarginNoteShell>
      <p className="lx-label text-[0.65rem] text-[var(--lx-muted)]">
        <span className="text-[var(--lx-green-ink)]">Note {index}</span> · {label}
      </p>
      <p className="lx-display mt-4 text-[clamp(2.4rem,3.5vw,3rem)] text-[var(--lx-ink)]">
        {figure}
      </p>
      <p className="mt-2 max-w-[32ch] text-[0.9rem] leading-[1.7] text-[var(--lx-muted)]">{note}</p>
    </MarginNoteShell>
  )
}

/* ── The numbered margin ledger — "the rules we gave ourselves" ──────────────
   Set in the amber annotation register (--lx-signal-ink is the mono margin
   layer, DESIGN.md §3): the self-imposed limits are the most visually
   distinct copy on the page. An <ol> so the numbering is semantic; the
   printed numerals are aria-hidden ornaments on top of it. */

export function MarginRules({
  heading,
  items,
}: {
  heading: ReactNode
  items: { n: string; lead: string; body: ReactNode }[]
}) {
  return (
    <MarginNoteShell>
      <h2 className="lx-label text-[0.65rem] text-[var(--lx-signal-ink)]">{heading}</h2>
      <ol className="mt-4">
        {items.map((item, i) => (
          <Reveal
            as="li"
            key={item.n}
            delay={Math.min(i, 5) * 0.05}
            className="grid grid-cols-[1.75rem_1fr] gap-3 border-b border-[var(--lx-hairline)] py-4 last:border-b-0"
          >
            <span className="lx-mono pt-px text-xs text-[var(--lx-signal-ink)]" aria-hidden="true">
              {item.n}
            </span>
            <span className="text-[0.875rem] leading-[1.75]">
              <span className="font-semibold text-[var(--lx-ink)]">{item.lead}</span>{' '}
              <span className="text-[var(--lx-muted)]">{item.body}</span>
            </span>
          </Reveal>
        ))}
      </ol>
    </MarginNoteShell>
  )
}
