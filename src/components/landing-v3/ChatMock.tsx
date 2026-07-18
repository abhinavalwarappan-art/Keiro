'use client'

/* Product fragments, drawn in HTML/CSS — v4 "THE LEDGER".

   We have no photography and one small mascot SVG, and stock photos of smiling
   doctors would cheapen the whole thing. So the visuals *are* the product: a
   real Kai exchange, a real report, a real waveform — each set in the chart
   register (mono status headers, carbon-copy edges, ruled rows) so a page
   agent can stage them inside FIG.-captioned frames without re-dressing them.

   The chat mock follows the REAL product surface, which renders Kai without a
   speech bubble: Kai's words sit plainly on the paper beside a small mark, and
   only the patient gets a filled ink bubble. Two speakers, two materials —
   the software speaks on the page, the person speaks in their own space.

   The patient bubble's tail corner uses a LOGICAL corner (rounded-ee) so it
   genuinely flips under dir="rtl" — the same discipline the product claims.

   Colour discipline: ChatMock / ReportMock / VoiceMock always sit on light
   grounds, so they use the literal --lx-* tokens (never --band-*). Green-fill
   for bars and meter marks only; signal-ink for the one mono margin note;
   green-ink for the one green value. ChipRow / SpecList travel with whatever
   band hosts them, so they stay on --band-*. */

import type { ReactNode } from 'react'
import { IconMic, KaiMark } from './icons'

/* Kai's avatar chip — the mark on a wash disc with a hairline, so it reads as
   a fixed piece of interface rather than a floating sticker. (Round is fine:
   status dots are one of the two permitted circles.) */
export function KaiDot({ size = 26 }: { size?: number }) {
  return (
    <span
      className="grid shrink-0 place-items-center rounded-full border border-[var(--lx-hairline)] bg-[var(--lx-wash)]"
      style={{ width: size, height: size }}
      aria-hidden="true"
    >
      <KaiMark size={Math.round(size * 0.72)} />
    </span>
  )
}

/* One Kai turn: mark + plain words. No bubble, matching the product. */
export function KaiTurn({ children, lang }: { children: ReactNode; lang?: string }) {
  return (
    <div className="flex items-start gap-2.5">
      <KaiDot size={24} />
      <p lang={lang} className="lx-native max-w-[85%] pt-0.5 leading-[1.6] text-[var(--lx-body)]">
        {children}
      </p>
    </div>
  )
}

/* One patient turn: the filled ink bubble, end-corner tucked (flips with dir). */
export function PatientTurn({ children, lang }: { children: ReactNode; lang?: string }) {
  return (
    <p
      lang={lang}
      className="lx-native ms-auto w-fit max-w-[85%] rounded-[14px] rounded-ee-[4px] bg-[var(--lx-ink)] px-4 py-2.5 leading-[1.6] text-[var(--lx-paper)]"
    >
      {children}
    </p>
  )
}

/* ── The conversation ──────────────────────────────────────────────────────
   Chrome is a mono status register under a carbon-copy edge: who is speaking,
   in which language, with the listening meter live. The closing line is a
   margin note in the amber annotation ink — the one thing on the fragment
   that talks ABOUT the product rather than being it. */

export function ChatMock() {
  return (
    <div className="rounded-[8px] border border-[var(--lx-hairline)] bg-[var(--lx-card)] p-4 sm:p-5">
      <div className="lx-cc-edge flex items-center justify-between gap-2 pb-2.5">
        <span className="flex items-center gap-2">
          <KaiDot size={22} />
          <span className="lx-label text-[0.625rem] text-[var(--lx-muted)]">
            Kai · speaking Español
          </span>
        </span>
        <span className="lx-listen" aria-hidden="true">
          <span />
          <span />
          <span />
        </span>
      </div>

      <div className="space-y-3.5 pt-4">
        <KaiTurn lang="es">
          Hola, soy Kai. Cuéntame qué te duele, con tus propias palabras.
        </KaiTurn>

        <PatientTurn lang="es">
          Me duele el pecho cuando subo las escaleras. Empezó hace tres días.
        </PatientTurn>

        {/* Kai follow-up — the thing a translation app would never do */}
        <KaiTurn lang="es">Gracias. ¿El dolor se va cuando descansas?</KaiTurn>
      </div>

      <p className="lx-mono mt-4 border-t border-[var(--lx-hairline)] pt-3 text-xs leading-[1.6] text-[var(--lx-signal-ink)]">
        Kai asks a follow-up. A translation app would have translated the sentence and stopped.
      </p>
    </div>
  )
}

/* ── What the doctor receives — a REAL clinical document fragment ────────────
   Registration-marked artifact paper (this is genuine product output, so it
   earns the site's one ambient shadow), mono field labels over ruled rows,
   the title strip under a carbon-copy edge. The title stays a <p>: it names a
   decorative UI specimen, not a document section — as a heading it would skip
   a level (h2 → h4) in the page outline screen-reader users navigate by. */

export function ReportMock() {
  const rows = [
    { k: 'Presenting complaint', v: 'Chest pain on exertion' },
    { k: 'Onset', v: '3 days ago' },
    { k: 'Trigger', v: 'Climbing stairs' },
    { k: 'Relieved by', v: 'Rest' },
    { k: 'Language', v: 'Spanish (es-ES)' },
  ]

  return (
    <div className="lx-regmark">
      <div className="lx-artifact overflow-hidden">
        <div className="lx-artifact-chrome lx-cc-edge flex items-baseline justify-between gap-3 px-5 pb-2.5 pt-4">
          <p className="lx-label text-[0.6875rem] text-[var(--lx-ink)]">Intake summary</p>
          <span className="lx-label text-[0.625rem] text-[var(--lx-muted)]">English</span>
        </div>

        <dl className="px-5 pt-2">
          {rows.map((row) => (
            <div
              key={row.k}
              className="grid grid-cols-[auto_1fr] items-baseline gap-3 border-b border-[var(--lx-hairline)] py-2.5 last:border-0"
            >
              <dt className="lx-label text-[0.6rem] text-[var(--lx-muted)]">{row.k}</dt>
              <dd
                className={`text-right text-sm font-medium ${
                  row.k === 'Language' ? 'text-[var(--lx-green-ink)]' : 'text-[var(--lx-ink)]'
                }`}
              >
                {row.v}
              </dd>
            </div>
          ))}
        </dl>

        <p className="mx-5 mb-4 mt-2 rounded-[4px] bg-[var(--lx-wash)] px-3 py-2 text-sm leading-[1.6] text-[var(--lx-body)]">
          No diagnosis. No triage score. Just what the patient said, in a form a clinician can read.
        </p>
      </div>
    </div>
  )
}

/* ── Voice input — the meter, in the status register ─────────────────────── */

export function VoiceMock() {
  // Fixed heights — deterministic so server and client render identically.
  const bars = [30, 55, 80, 45, 95, 60, 35, 70, 50, 85, 40, 65, 30, 75, 45]

  return (
    <div className="rounded-[8px] border border-[var(--lx-hairline)] bg-[var(--lx-card)] p-4 sm:p-5">
      <div className="lx-cc-edge flex items-center justify-between gap-2 pb-2.5">
        <span className="lx-label text-[0.625rem] text-[var(--lx-muted)]">
          Voice input · listening
        </span>
        <span className="lx-listen" aria-hidden="true">
          <span />
          <span />
          <span />
        </span>
      </div>

      <div className="flex items-center gap-4 pt-4">
        <span
          className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-[var(--lx-ink)] text-[var(--lx-paper)]"
          aria-hidden="true"
        >
          <IconMic size={18} />
        </span>
        <div className="flex h-11 flex-1 items-center gap-[3px]" aria-hidden="true">
          {bars.map((h, i) => (
            <span
              key={i}
              className="w-full rounded-[1px] bg-[var(--lx-green-fill)]"
              style={{ height: `${h}%` }}
            />
          ))}
        </div>
      </div>

      <p className="mt-4 text-sm leading-[1.7] text-[var(--lx-muted)]">
        Or just talk. Typing on a cracked screen, in a script your keyboard barely supports, is a
        barrier we badly underestimate.
      </p>
    </div>
  )
}

/* ── Small payloads for the numbered-step slots ──────────────────────────── */

/* Annotation chips: 4px radius (the annotation tier), hairline, no pills. */
export function ChipRow({ items }: { items: string[] }) {
  return (
    <ul className="flex flex-wrap gap-2">
      {items.map((item) => (
        <li
          key={item}
          className="lx-native rounded-[4px] border border-[var(--band-line)] bg-[var(--band-card)] px-2.5 py-1.5 text-sm text-[var(--band-body)]"
        >
          {item}
        </li>
      ))}
    </ul>
  )
}

/* A small ruled spec table: mono keys, measured values. */
export function SpecList({ rows }: { rows: { k: string; v: string }[] }) {
  return (
    <dl className="rounded-[8px] border border-[var(--band-line)] bg-[var(--band-card)] px-4 py-1">
      {rows.map((row) => (
        <div
          key={row.k}
          className="flex items-baseline justify-between gap-3 border-b border-[var(--band-line)] py-2.5 last:border-0"
        >
          <dt className="lx-label text-[0.625rem] text-[var(--band-muted)]">{row.k}</dt>
          <dd className="lx-mono text-right text-sm text-[var(--band-ink)]">{row.v}</dd>
        </div>
      ))}
    </dl>
  )
}
