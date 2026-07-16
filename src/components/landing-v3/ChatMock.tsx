'use client'

/* Product visuals, drawn in HTML/CSS.

   We have no photography and one small mascot SVG, and stock photos of smiling
   doctors would cheapen the whole thing. So the visuals *are* the product: a
   real Kai exchange, a real report, a real waveform.

   The chat mocks follow the REAL product surface, which renders Kai without a
   speech bubble: Kai's words sit plainly on the paper beside a small mark, and
   only the patient gets a filled ink bubble. Two speakers, two materials —
   the software speaks on the page, the person speaks in their own space. A
   bubble stack where both sides get the same pill is what every template ships.

   The patient bubble's tail corner uses a LOGICAL corner (rounded-ee) so it
   genuinely flips under dir="rtl" — the same discipline the product claims. */

import type { ReactNode } from 'react'
import { IconMic, KaiMark } from './icons'

/* Kai's avatar chip — the mark on a mint disc with a hairline, so it reads as
   a fixed piece of interface rather than a floating sticker. */
export function KaiDot({ size = 26 }: { size?: number }) {
  return (
    <span
      className="grid shrink-0 place-items-center rounded-full border border-[var(--lx-line)] bg-[var(--lx-mint)]"
      style={{ width: size, height: size }}
      aria-hidden="true"
    >
      <KaiMark size={Math.round(size * 0.72)} />
    </span>
  )
}

/* One Kai turn: mark + plain text. No bubble, matching the product. */
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
      className="lx-native ms-auto w-fit max-w-[85%] rounded-[14px] rounded-ee-[4px] bg-[var(--lx-ink)] px-4 py-2.5 leading-[1.6] text-white"
    >
      {children}
    </p>
  )
}

/* ── The conversation ────────────────────────────────────────────────────── */

export function ChatMock() {
  return (
    <div className="lx-demo-frame rounded-[16px] border border-[var(--band-line)] bg-[var(--lx-paper)] p-4 sm:p-5">
      <div className="flex items-center justify-between gap-2 border-b border-[var(--lx-line)] pb-3">
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

      <p className="mt-4 border-t border-[var(--lx-line)] pt-3 text-sm leading-relaxed text-[var(--lx-muted)]">
        Kai asks a follow-up. A translation app would have translated the sentence and stopped.
      </p>
    </div>
  )
}

/* ── What the doctor receives — set like a clinical document ─────────────────
   Letterhead in the serif, field names in the chart mono, values in the sans,
   one heavier rule under the title. The register a clinician already trusts. */

export function ReportMock() {
  const rows = [
    { k: 'Presenting complaint', v: 'Chest pain on exertion' },
    { k: 'Onset', v: '3 days ago' },
    { k: 'Trigger', v: 'Climbing stairs' },
    { k: 'Relieved by', v: 'Rest' },
    { k: 'Language', v: 'Spanish (es-ES)' },
  ]

  return (
    <div className="lx-demo-frame rounded-[16px] border border-[var(--band-line)] bg-[var(--lx-paper)] p-5">
      <div className="flex items-baseline justify-between gap-3 border-b-[1.5px] border-[var(--lx-ink)] pb-3">
        <h4 className="lx-heading text-[1.15rem] text-[var(--lx-ink)]">Intake summary</h4>
        <span className="lx-label text-[0.625rem] text-[var(--lx-muted)]">English</span>
      </div>

      <dl className="pt-1.5">
        {rows.map((row) => (
          <div
            key={row.k}
            className="grid grid-cols-[auto_1fr] items-baseline gap-3 border-b border-[var(--lx-line)] py-2.5 last:border-0"
          >
            <dt className="lx-label text-[0.6rem] text-[var(--lx-muted)]">{row.k}</dt>
            <dd
              className={`text-right font-semibold tabular-nums ${
                row.k === 'Language' ? 'text-[var(--lx-green-ink)]' : 'text-[var(--lx-ink)]'
              }`}
            >
              {row.v}
            </dd>
          </div>
        ))}
      </dl>

      <p className="mt-3 rounded-[12px] bg-[var(--lx-mint)] px-3 py-2 text-sm leading-relaxed text-[var(--lx-body)]">
        No diagnosis. No triage score. Just what the patient said, in a form a clinician can read.
      </p>
    </div>
  )
}

/* ── Voice input ─────────────────────────────────────────────────────────── */

export function VoiceMock() {
  // Fixed heights — deterministic so server and client render identically.
  const bars = [30, 55, 80, 45, 95, 60, 35, 70, 50, 85, 40, 65, 30, 75, 45]

  return (
    <div className="lx-demo-frame rounded-[16px] border border-[var(--band-line)] bg-[var(--lx-paper)] p-5">
      <div className="flex items-center gap-4">
        <span
          className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-[var(--lx-ink)] text-white"
          aria-hidden="true"
        >
          <IconMic size={20} />
        </span>
        <div className="flex h-12 flex-1 items-center gap-1" aria-hidden="true">
          {bars.map((h, i) => (
            <span
              key={i}
              className="w-full rounded-full bg-[var(--lx-sage)]"
              style={{ height: `${h}%` }}
            />
          ))}
        </div>
      </div>
      <p className="mt-4 leading-[1.7] text-[var(--lx-muted)]">
        Or just talk. Typing on a cracked screen, in a script your keyboard barely supports, is a
        barrier we badly underestimate.
      </p>
    </div>
  )
}

/* ── Small payloads for the numbered-step slots ──────────────────────────── */

export function ChipRow({ items }: { items: string[] }) {
  return (
    <ul className="flex flex-wrap gap-2">
      {items.map((item) => (
        <li
          key={item}
          className="lx-native rounded-full border border-[var(--band-line)] bg-[var(--band-bg)] px-3 py-1.5 text-sm text-[var(--band-body)]"
        >
          {item}
        </li>
      ))}
    </ul>
  )
}

export function SpecList({ rows }: { rows: { k: string; v: string }[] }) {
  return (
    <dl className="rounded-[16px] border border-[var(--band-line)] bg-[var(--band-card)] p-4">
      {rows.map((row) => (
        <div
          key={row.k}
          className="flex items-baseline justify-between gap-3 border-b border-[var(--band-line)] py-2 last:border-0"
        >
          <dt className="text-sm text-[var(--band-muted)]">{row.k}</dt>
          <dd className="text-right text-sm font-semibold text-[var(--band-ink)]">{row.v}</dd>
        </div>
      ))}
    </dl>
  )
}
