'use client'

/* Product visuals, drawn in HTML/CSS.

   We have no photography and one small mascot SVG, and stock photos of smiling
   doctors would cheapen the whole thing. So the visuals *are* the product: a
   real Kai exchange, a real report, a real waveform. Tucuvi's entire demo page
   carries zero images and is the strongest of the three sites we studied.

   Kai appears here as punctuation — a 56px avatar beside a message — never
   scaled up to fill a hero, which is the fastest way to make a small SVG look
   amateur. */

import { Kai } from '@/components/kai/Kai'

/* ── The conversation ────────────────────────────────────────────────────── */

export function ChatMock() {
  return (
    <div className="rounded-[24px] border border-[var(--band-line)] bg-white p-4 shadow-[0_30px_70px_-40px_rgba(26,61,43,0.5)] sm:p-5">
      <div className="flex items-center gap-2 border-b border-[var(--lx-line)] pb-3">
        <span className="h-2.5 w-2.5 rounded-full bg-[var(--lx-green)]" aria-hidden="true" />
        <span className="text-sm font-medium text-[var(--lx-muted)]">
          Kai · speaking Español
        </span>
      </div>

      <div className="space-y-3 pt-4">
        {/* Kai */}
        <div className="flex items-end gap-2">
          <span className="shrink-0">
            <Kai size="xs" animated={false} />
          </span>
          <p
            lang="es"
            className="lx-native max-w-[85%] rounded-[18px] rounded-bl-md bg-[var(--lx-mint)] px-4 py-3 leading-[1.6] text-[var(--lx-body)]"
          >
            Hola, soy Kai. Cuéntame qué te duele, con tus propias palabras.
          </p>
        </div>

        {/* Patient */}
        <p
          lang="es"
          className="lx-native ml-auto max-w-[85%] rounded-[18px] rounded-br-md bg-[var(--lx-ink)] px-4 py-3 leading-[1.6] text-white"
        >
          Me duele el pecho cuando subo las escaleras. Empezó hace tres días.
        </p>

        {/* Kai follow-up — the thing a translation app would never do */}
        <div className="flex items-end gap-2">
          <span className="shrink-0">
            <Kai size="xs" animated={false} />
          </span>
          <p
            lang="es"
            className="lx-native max-w-[85%] rounded-[18px] rounded-bl-md bg-[var(--lx-mint)] px-4 py-3 leading-[1.6] text-[var(--lx-body)]"
          >
            Gracias. ¿El dolor se va cuando descansas?
          </p>
        </div>
      </div>

      <p className="mt-4 border-t border-[var(--lx-line)] pt-3 text-sm leading-relaxed text-[var(--lx-muted)]">
        Kai asks a follow-up. A translation app would have translated the sentence and stopped.
      </p>
    </div>
  )
}

/* ── What the doctor receives ────────────────────────────────────────────── */

export function ReportMock() {
  const rows = [
    { k: 'Presenting complaint', v: 'Chest pain on exertion' },
    { k: 'Onset', v: '3 days ago' },
    { k: 'Trigger', v: 'Climbing stairs' },
    { k: 'Relieved by', v: 'Rest' },
    { k: 'Language', v: 'Spanish (es-ES)' },
  ]

  return (
    <div className="rounded-[24px] border border-[var(--band-line)] bg-white p-5 shadow-[0_30px_70px_-40px_rgba(26,61,43,0.5)]">
      <div className="flex items-baseline justify-between gap-3 border-b border-[var(--lx-line)] pb-3">
        <h4 className="lx-display font-semibold text-[var(--lx-ink)]">Intake summary</h4>
        <span className="text-sm text-[var(--lx-muted)]">English</span>
      </div>

      <dl className="pt-3">
        {rows.map((row) => (
          <div
            key={row.k}
            className="grid grid-cols-[auto_1fr] gap-3 border-b border-[var(--lx-line)] py-2.5 last:border-0"
          >
            <dt className="text-sm font-medium text-[var(--lx-muted)]">{row.k}</dt>
            <dd className="text-right font-medium text-[var(--lx-ink)]">{row.v}</dd>
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
    <div className="rounded-[24px] border border-[var(--band-line)] bg-white p-5 shadow-[0_30px_70px_-40px_rgba(26,61,43,0.5)]">
      <div className="flex items-center gap-4">
        <span
          className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-[var(--lx-ink)] text-lg text-white"
          aria-hidden="true"
        >
          ●
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
    <dl className="rounded-[16px] border border-[var(--band-line)] bg-[var(--band-bg)] p-4">
      {rows.map((row) => (
        <div
          key={row.k}
          className="flex items-baseline justify-between gap-3 border-b border-[var(--band-line)] py-2 last:border-0"
        >
          <dt className="text-sm text-[var(--band-muted)]">{row.k}</dt>
          <dd className="text-right text-sm font-medium text-[var(--band-ink)]">{row.v}</dd>
        </div>
      ))}
    </dl>
  )
}
