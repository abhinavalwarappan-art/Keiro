/* The contrast audit, self-proving (DESIGN.md §7.9).

   Each row prints a text-role colour's measured ratio in the chart mono AND
   renders a live sample in that exact colour on this exact ground — so the
   number is not a claim, it is a caption for something you can read for
   yourself. If a value were ever wrong, the sample beside it would be the
   thing that gave it away. Ratios are this palette's real measured values
   (see DESIGN.md §3). Server-safe. */

import { Reveal } from '../../Reveal'

type Swatch = {
  token: string
  sample: string
  ratio: string
  grade: string
  color: string
}

const SWATCHES: Swatch[] = [
  { token: 'ink', sample: 'Display headings', ratio: '15.7 : 1', grade: 'AAA', color: 'var(--lx-ink)' },
  { token: 'body', sample: 'Running body text', ratio: '12.6 : 1', grade: 'AAA', color: 'var(--lx-body)' },
  { token: 'muted', sample: 'Secondary captions', ratio: '7.2 : 1', grade: 'AAA', color: 'var(--lx-muted)' },
  { token: 'green-ink', sample: 'Links and green text', ratio: '7.4 : 1', grade: 'AAA', color: 'var(--lx-green-ink)' },
  { token: 'green-display', sample: 'Emphasis, 24px and up', ratio: '5.6 : 1', grade: 'AA', color: 'var(--lx-green-display)' },
]

export function AuditSwatches() {
  return (
    <div>
      <div className="lx-cc-edge hidden grid-cols-[1fr_7rem_5rem] gap-6 pb-2 sm:grid">
        <p className="lx-label text-[0.6rem] text-[var(--band-muted)]">Text role · live sample</p>
        <p className="lx-label text-[0.6rem] text-[var(--band-muted)]">On paper</p>
        <p className="lx-label text-[0.6rem] text-[var(--band-muted)]">Verdict</p>
      </div>
      <ul>
        {SWATCHES.map((s, i) => (
          <Reveal
            as="li"
            key={s.token}
            delay={i * 0.05}
            className="grid grid-cols-[1fr_auto] items-center gap-x-6 gap-y-1 border-b border-[var(--band-line)] py-4 sm:grid-cols-[1fr_7rem_5rem]"
          >
            <span className="min-w-0">
              <span className="text-[1.05rem]" style={{ color: s.color }}>
                {s.sample}
              </span>
              <span className="lx-mono ms-3 text-xs text-[var(--band-muted)]">--lx-{s.token}</span>
            </span>
            <span className="lx-mono text-sm text-[var(--band-ink)] sm:text-right">{s.ratio}</span>
            <span className="flex items-center justify-end gap-2 sm:justify-start">
              <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-[var(--lx-green-fill)]" />
              <span className="lx-label text-[0.6rem] text-[var(--band-ink)]">Pass {s.grade}</span>
            </span>
          </Reveal>
        ))}
      </ul>
    </div>
  )
}
