/* Page-local pieces for /meet-kai — THE CASE FILE (DESIGN.md §7.4).

   The site's one centered layout: a vertical dossier. A registration-marked
   portrait frame up top (the file's photograph — drawn, not taken), then
   ruled dossier rows with mono field labels in the left gutter and Kai's
   first-person answers on the right. The WILL NOT rows are set in the amber
   signal mono — the safety limits are the most visually distinct copy on the
   page, by construction. The FAQ reads as a magazine interview: mono
   questions, display-voice answers.

   No hooks here: server-safe compositions around the shared Reveal (the only
   client boundary), so the page ships no JS of its own beyond the mascot. */

import type { ReactNode } from 'react'
import { Kai } from '@/components/kai/Kai'
import { Reveal } from '../../Reveal'

/* ── The portrait — a mounted photograph that is honestly a drawing ──────────
   Registration-marked matte, a graph-paper inner sheet (grids live only
   inside artifact surfaces), the mascot on its staged pool of light, and a
   figure caption that tells the truth. */

export function Portrait() {
  return (
    <div className="flex justify-center">
      <figure className="lx-regmark border border-[var(--lx-hairline)] bg-[var(--lx-card)] p-3">
        <div className="lx-sheet-grid border border-[var(--lx-hairline)] px-8 pb-4 pt-6 sm:px-14">
          <div className="lx-kai-stage p-4">
            <div className="lx-breathe">
              <Kai size="lg" state="waving" interactive />
            </div>
          </div>
        </div>
        <figcaption className="lx-label mt-3 pb-1 text-center text-[0.625rem] text-[var(--lx-muted)]">
          Fig. 1 — Kai. Drawn, not photographed.
        </figcaption>
      </figure>
    </div>
  )
}

/* ── The dossier — ruled rows under a strong top rule ────────────────────────
   A <dl>: mono field label as the <dt> in the left gutter, the answer as the
   <dd>. The Reveal is the single allowed <div> wrapper around each dt/dd
   group (a second nested div breaks definition-list semantics — axe
   definition-list/dlitem). */

type RowTone = 'default' | 'will' | 'signal'

const ROW_TONE: Record<RowTone, string> = {
  default: 'text-[var(--band-muted)]',
  will: 'text-[var(--lx-green-ink)]',
  signal: 'text-[var(--lx-signal-ink)]',
}

export function Dossier({ children }: { children: ReactNode }) {
  return <dl className="border-t border-[var(--band-line-strong)]">{children}</dl>
}

export function DossierRow({
  label,
  tone = 'default',
  delay = 0,
  children,
}: {
  label: string
  tone?: RowTone
  delay?: number
  children: ReactNode
}) {
  return (
    <Reveal
      delay={delay}
      className="grid gap-y-3 border-b border-[var(--band-line)] py-7 sm:grid-cols-[8.5rem_minmax(0,1fr)] sm:gap-x-10"
    >
      <dt className={`lx-label pt-1.5 text-[0.6875rem] ${ROW_TONE[tone]}`}>{label}</dt>
      <dd className="min-w-0">{children}</dd>
    </Reveal>
  )
}

/* A short row's answer: one display-voice lead line, then a body clause. */
export function DossierAnswer({ lead, children }: { lead: string; children?: ReactNode }) {
  return (
    <>
      <p className="lx-heading text-[clamp(1.2rem,2.3vw,1.5rem)] text-[var(--band-ink)]">{lead}</p>
      {children && (
        <p className="mt-2 max-w-[56ch] text-lg leading-[1.75] text-[var(--band-muted)]">
          {children}
        </p>
      )}
    </>
  )
}

/* The WILL entries — promises, ruled apart inside their row. The row itself
   reveals as one unit, so the entries are plain <li>s. */
export function WillList({ items }: { items: { t: string; b: string }[] }) {
  return (
    <ul>
      {items.map((item) => (
        <li
          key={item.t}
          className="border-b border-[var(--band-line)] py-4 first:pt-0 last:border-b-0 last:pb-0"
        >
          <span className="lx-title block text-[1.05rem] text-[var(--band-ink)]">{item.t}</span>
          <span className="mt-1 block max-w-[56ch] text-lg leading-[1.7] text-[var(--band-muted)]">
            {item.b}
          </span>
        </li>
      ))}
    </ul>
  )
}

/* The WILL NOT entries — the safety limits, set entirely in the amber signal
   mono (DESIGN.md §3: --lx-signal-ink exists for exactly these clauses,
   6.4:1 on paper). The most visually distinct copy on the page. */
export function RefusalList({ items }: { items: { t: string; b: string }[] }) {
  return (
    <ul>
      {items.map((item) => (
        <li
          key={item.t}
          className="border-b border-[var(--band-line)] py-4 first:pt-0 last:border-b-0 last:pb-0"
        >
          <span className="lx-label block text-[0.8125rem] text-[var(--lx-signal-ink)]">
            {item.t}
          </span>
          <span className="lx-mono mt-2 block max-w-[58ch] text-lg leading-[1.75] text-[var(--lx-signal-ink)]">
            {item.b}
          </span>
        </li>
      ))}
    </ul>
  )
}

/* ── The interview — mono questions, display-voice first-person answers ──────
   A magazine Q&A as a <dl>: the question (uppercase mono, indexed by a green
   Q-numeral) is the <dt>; the answer — a display pull-line plus a plain
   explanation — is the <dd>. Open on the page, deliberately not a <details>
   accordion (that register belongs to the trust pages). */

export type InterviewItem = { q: string; lead: string; body: string }

export function Interview({ items }: { items: InterviewItem[] }) {
  return (
    <dl className="border-t border-[var(--band-line-strong)]">
      {items.map((item, i) => (
        <Reveal
          key={item.q}
          delay={Math.min(i, 4) * 0.05}
          className="border-b border-[var(--band-line)] py-8"
        >
          <dt className="flex items-baseline gap-4">
            <span className="lx-mono w-9 shrink-0 text-sm text-[var(--lx-green-ink)]" aria-hidden="true">
              Q{String(i + 1).padStart(2, '0')}
            </span>
            <span className="lx-label min-w-0 text-[0.8125rem] text-[var(--band-muted)]">
              {item.q}
            </span>
          </dt>
          <dd className="mt-4 sm:ps-[3.25rem]">
            <p className="lx-heading max-w-2xl text-[clamp(1.25rem,2.4vw,1.6rem)] text-[var(--band-ink)]">
              {item.lead}
            </p>
            <p className="mt-3 max-w-2xl text-lg leading-[1.75] text-[var(--band-muted)]">
              {item.body}
            </p>
          </dd>
        </Reveal>
      ))}
    </dl>
  )
}
