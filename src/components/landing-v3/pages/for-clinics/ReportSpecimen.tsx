'use client'

/* THE SPECIMEN REPORT (DESIGN.md §7.6).

   A life-size, clearly-sample intake summary — the exact artifact a clinician
   receives — set as a real clinical document: registration-marked artifact
   paper, a chart header under a carbon-copy edge, mono field labels over ruled
   rows, and a set of named regions that a claim beside it can highlight. The
   content is a fixed demonstration case (chest pain on exertion), never real
   patient data.

   `active` names the region currently being pointed at; that region takes a
   wash sweep. Passing null (or on reduced motion / no JS) leaves the document
   fully legible and un-highlighted — the sync is an enhancement, not a
   dependency. */

import type { ReactNode } from 'react'

export type ReportRegion = 'complaint' | 'history' | 'associated' | 'meds' | 'flags' | 'language'

function Field({
  label,
  region,
  active,
  children,
}: {
  label: string
  region: ReportRegion
  active: ReportRegion | null
  children: ReactNode
}) {
  const on = active === region
  return (
    <div
      data-region={region}
      className="grid grid-cols-[7.5rem_1fr] items-baseline gap-4 border-b border-[var(--lx-hairline)] py-3 last:border-0"
    >
      <dt className="lx-label text-[0.6rem] text-[var(--lx-muted)]">{label}</dt>
      <dd className="min-w-0">
        <span
          className="lx-wash-sweep inline text-[0.95rem] leading-[1.6] text-[var(--lx-ink)]"
          data-swept={on ? 'true' : 'false'}
        >
          {children}
        </span>
      </dd>
    </div>
  )
}

export function ReportSpecimen({ active = null }: { active?: ReportRegion | null }) {
  return (
    <div className="lx-regmark">
      <div className="lx-artifact overflow-hidden">
        {/* Chart header */}
        <div className="lx-artifact-chrome lx-cc-edge px-6 pb-3 pt-5">
          <div className="flex items-baseline justify-between gap-3">
            <p className="lx-label text-[0.7rem] text-[var(--lx-ink)]">Intake summary</p>
            <span className="lx-label text-[0.6rem] text-[var(--lx-muted)]">English</span>
          </div>
          <div className="mt-2 flex flex-wrap items-baseline gap-x-6 gap-y-1">
            <span className="lx-mono text-xs text-[var(--lx-muted)]">
              PT · sample case
            </span>
            <span className="lx-mono text-xs text-[var(--lx-muted)]">
              Taken by Kai · before visit
            </span>
          </div>
        </div>

        <dl className="px-6 pt-3">
          <Field label="Chief complaint" region="complaint" active={active}>
            Chest pain on exertion, three days.
          </Field>
          <Field label="History" region="history" active={active}>
            Comes on when climbing stairs; eases with a few minutes&apos; rest. No pain at rest.
          </Field>
          <Field label="Associated" region="associated" active={active}>
            No shortness of breath reported. No radiation to the arm or jaw described.
          </Field>
          <Field label="Medications" region="meds" active={active}>
            States none taken for it. No known drug allergies reported.
          </Field>
          <Field label="Flags" region="flags" active={active}>
            <span className="text-[var(--lx-signal-ink)]">Exertional chest pain</span> — noted for
            clinician attention. Kai makes no assessment of severity.
          </Field>
          <Field label="Patient spoke" region="language" active={active}>
            <span className="text-[var(--lx-green-ink)]">Spanish (es-ES)</span>
          </Field>
        </dl>

        <p className="mx-6 mb-5 mt-3 rounded-[4px] bg-[var(--lx-wash)] px-3 py-2.5 text-sm leading-[1.6] text-[var(--lx-body)]">
          No diagnosis. No triage score. Just what the patient said, in a form a clinician can read.
        </p>
      </div>
    </div>
  )
}
