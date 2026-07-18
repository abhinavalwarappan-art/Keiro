'use client'

/* The shared section library for v4 "THE LEDGER" (see DESIGN.md).

   The site is typeset as the document it produces: chart-paper grounds,
   hairline rules, mono running heads and margin annotations, asymmetric
   composition, near-zero shadows. Nothing in this file is a card grid and
   nothing is a stock accordion — every archetype is a *ruled register* of one
   kind or another, so a page composed from these reads as one kept document
   rather than a stack of widgets.

   API compatibility is a hard contract: every export keeps its name and its
   prop signature (call sites in src/app/* compile unchanged). New work may use
   the additions (RunHead, BandHeading's `folio`) but nothing was removed.

   Colour is role-locked (DESIGN.md §3). Green text at body size is
   --lx-green-ink only; green text ≥24px is --lx-green-display (what .lx-accent
   uses); --lx-green-fill is FILLS ONLY (ticks, bars, emphasis rules), never
   text; amber --lx-signal-ink is the mono annotation layer only. On the deep
   plate everything reads through the --band-* remaps, plus the few
   [.lx-band-deep_&] overrides below where a literal green/amber token would
   otherwise fail contrast. */

import { useEffect, useRef, useState, type ReactNode } from 'react'
import { useInView } from 'framer-motion'
import { LANGUAGES } from '@/lib/languages'
import { Reveal } from './Reveal'
import { IconCheck, IconPlus, IconX } from './icons'

/* Entrance stagger is deliberately different per archetype (48–90ms) so the
   site never settles into one metronome. Each component owns its own beat. */

/* ── Band — the primitive every section sits on ──────────────────────────── */

type Palette = 'cream' | 'mint' | 'deep'

export function Band({
  children,
  palette = 'cream',
  flow,
  rails = false,
  id,
  className = '',
}: {
  children: ReactNode
  palette?: Palette
  /* Accepted for source compatibility only. The nine-palette lx-flow gradient
     system is retired (DESIGN.md §3) — this prop renders NOTHING. */
  flow?: 'glow' | 'hero'
  rails?: boolean
  id?: string
  className?: string
}) {
  void flow
  return (
    <section
      id={id}
      className={`lx-band lx-band-${palette} lx-section relative border-y border-[var(--band-line)] px-5 sm:px-8 lg:px-10 ${
        id ? 'scroll-mt-24' : ''
      } ${className}`}
    >
      <div className={`lx-above mx-auto max-w-6xl ${rails ? 'lx-rails px-6 sm:px-10' : ''}`}>
        {children}
      </div>
    </section>
  )
}

/* ── RunHead — the running head every major section opens with ───────────────
   Top hairline + mono folio flush-left ("02 · METHOD") + optional mono meta
   flush-right. Sections are separated by chart structure, not by background
   swaps alone — this is the piece that does it. */

export function RunHead({ folio, meta }: { folio: string; meta?: string }) {
  return (
    <div className="lx-runhead">
      <span className="lx-label text-[0.6875rem] text-[var(--band-ink)]">{folio}</span>
      {meta && <span className="lx-label text-[0.6875rem] text-[var(--band-muted)]">{meta}</span>}
    </div>
  )
}

/* Emphasised phrase inside a heading: the display green + weight, upright.
   Bricolage has no italic — never synthesize an oblique on the display face. */
export function Accent({ children }: { children: ReactNode }) {
  return <span className="lx-accent">{children}</span>
}

/* Retired second register, kept for compatibility: landing.css maps
   .lx-grad-text to exactly the accent look. Do not use in new work. */
export function GradWord({ children }: { children: ReactNode }) {
  return <span className="lx-grad-text">{children}</span>
}

/* ── BandHeading — h2 tight to its lede ──────────────────────────────────────
   Rhythm is contrast: the heading sits tight (12px) to its lede and far from
   whatever came before. Pass `folio` to open the section with a RunHead
   (48px above the heading). */

export function BandHeading({
  children,
  lede,
  folio,
  meta,
}: {
  children: ReactNode
  lede?: ReactNode
  folio?: string
  meta?: string
}) {
  return (
    <Reveal>
      {folio && <RunHead folio={folio} meta={meta} />}
      <h2
        className={`lx-heading max-w-3xl text-balance text-[clamp(1.75rem,3.8vw,2.6rem)] text-[var(--band-ink)] ${
          folio ? 'mt-12' : ''
        }`}
      >
        {children}
      </h2>
      {lede && (
        <p className="mt-3 max-w-2xl text-pretty text-lg leading-[1.75] text-[var(--band-muted)]">
          {lede}
        </p>
      )}
    </Reveal>
  )
}

/* ── 1. Thesis — the oversized statement, set hard-left ──────────────────────
   Display voice, asymmetric (never centered), with a hanging hairline tick in
   the left margin at lg — the chart's way of saying "this line is indexed".
   `serif` switches to the aside voice (Plex Sans italic): the human beat, used
   only where the page stops explaining and says something personal. */

export function Thesis({
  statement,
  body,
  /* Pages that open on a Thesis instead of a PageHero (/about) must render it
     as the h1 — otherwise the page ships without one, which breaks both the
     document outline and the SEO title signal. */
  as = 'p',
  serif = false,
}: {
  statement: ReactNode
  body?: ReactNode
  as?: 'p' | 'h1'
  serif?: boolean
}) {
  const Tag = as
  return (
    <Reveal className="relative max-w-4xl">
      <span
        aria-hidden="true"
        className="absolute -left-10 top-[0.55em] hidden h-px w-6 bg-[var(--band-line-strong)] lg:block"
      />
      <Tag
        className={`${
          serif ? 'lx-serif' : 'lx-display'
        } text-balance text-[clamp(1.75rem,4.2vw,3rem)] text-[var(--band-ink)]`}
      >
        {statement}
      </Tag>
      {body && (
        <p className="mt-7 max-w-2xl text-lg leading-[1.75] text-[var(--band-muted)]">{body}</p>
      )}
    </Reveal>
  )
}

/* ── 2. StatRow — one ruled tabular strip ────────────────────────────────────
   Mono column heads carrying the carbon-copy edge, ink figures beneath in the
   display face (lining tabular nums come with it), hairline column rules at
   lg. A chart row, not a row of stat cards. */

function CountUp({ value, suffix = '' }: { value: number; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null)
  const inView = useInView(ref, { once: true, margin: '-15%' })
  const [shown, setShown] = useState(0)

  useEffect(() => {
    if (!inView) return
    /* Reduced motion: no count-up — the final figure commits on the first
       frame. Routed through the same rAF path so no setState runs
       synchronously in the effect body (react-hooks/set-state-in-effect). */
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const duration = 1100
    const start = performance.now()
    let frame = 0
    const tick = (now: number) => {
      const p = reduced ? 1 : Math.min((now - start) / duration, 1)
      // easeOutCubic — fast out of the gate, settles gently
      setShown(Math.round(value * (1 - Math.pow(1 - p, 3))))
      if (p < 1) frame = requestAnimationFrame(tick)
    }
    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
  }, [inView, value])

  return (
    <span ref={ref}>
      {shown}
      {suffix}
    </span>
  )
}

export type Stat = {
  value: number
  prefix?: string
  suffix?: string
  label: string
  note: string
}

export function StatRow({ stats }: { stats: Stat[] }) {
  return (
    <dl className="grid gap-x-10 border-t border-[var(--band-line-strong)] sm:grid-cols-2 lg:grid-cols-4 lg:gap-x-0">
      {/* The Reveal IS the dl's group wrapper: <dl> allows one level of <div>
          around each dt/dd pair, but a second nested div breaks the semantics
          (axe: definition-list/dlitem). Same rule applies to every dl below. */}
      {stats.map((stat, i) => (
        <Reveal
          key={stat.label}
          delay={i * 0.09}
          className="border-b border-[var(--band-line)] py-6 lg:border-b-0 lg:border-e lg:px-7 lg:first:ps-0 lg:last:border-e-0 lg:last:pe-0"
        >
          <dt className="lx-label lx-cc-edge block pb-2 text-[0.6875rem] text-[var(--band-muted)]">
            {stat.label}
          </dt>
          <dd className="mt-5">
            <span className="lx-display block text-[clamp(2.5rem,5vw,3.5rem)] text-[var(--band-ink)]">
              {stat.prefix}
              <CountUp value={stat.value} suffix={stat.suffix} />
            </span>
            <span className="mt-3 block max-w-[28ch] text-[0.95rem] leading-[1.7] text-[var(--band-muted)]">
              {stat.note}
            </span>
          </dd>
        </Reveal>
      ))}
    </dl>
  )
}

/* ── 2b. StatCards — the same signature, as ledger cells with uneven weight ──
   No boxes: hairline-divided cells on the band's own ground. The figures take
   the display green (they are all ≥24px) and the FIRST figure is set a full
   size class larger — a ledger has a lead entry, a template does not. */

export function StatCards({ stats }: { stats: Stat[] }) {
  return (
    <dl className="grid gap-x-10 border-t border-[var(--band-line-strong)] sm:grid-cols-2 lg:grid-cols-4 lg:gap-x-0">
      {stats.map((stat, i) => (
        <Reveal
          key={stat.label}
          delay={i * 0.075}
          className="border-b border-[var(--band-line)] py-7 lg:border-b-0 lg:border-e lg:px-7 lg:first:ps-0 lg:last:border-e-0 lg:last:pe-0"
        >
          <dt
            className={`lx-display text-[var(--lx-green-display)] [.lx-band-deep_&]:text-[var(--lx-deep-mint)] ${
              i === 0
                ? 'text-[clamp(3.2rem,6.5vw,4.5rem)]'
                : 'text-[clamp(2.2rem,4.2vw,3rem)]'
            }`}
          >
            {stat.prefix}
            <CountUp value={stat.value} suffix={stat.suffix} />
            <span aria-hidden="true" className="mt-3 block h-[2px] w-8 bg-[var(--lx-green-fill)]" />
          </dt>
          <dd className="mt-4">
            <span className="lx-label block text-[0.6875rem] text-[var(--band-ink)]">
              {stat.label}
            </span>
            <span className="mt-2 block text-[0.95rem] leading-[1.7] text-[var(--band-muted)]">
              {stat.note}
            </span>
          </dd>
        </Reveal>
      ))}
    </dl>
  )
}

/* ── 2c. SpecRows — the audit sheet: figures that demonstrate themselves ─────
   A mono header row under a carbon-copy edge, then ruled rows: measured value
   in the chart mono, the commitment beside it, and a LIVE demo in the third
   column. If we ever break the promise, the page breaks visibly. */

export type Spec = { figure: string; label: string; note: string; demo: ReactNode }

export function SpecRows({ specs }: { specs: Spec[] }) {
  return (
    <div>
      <div className="lx-cc-edge hidden gap-8 pb-2 sm:grid sm:grid-cols-[8rem_1fr] lg:grid-cols-[8rem_1.4fr_1fr]">
        <p className="lx-label text-[0.6875rem] text-[var(--band-muted)]">Measured</p>
        <p className="lx-label text-[0.6875rem] text-[var(--band-muted)]">Commitment</p>
        <p className="lx-label hidden text-[0.6875rem] text-[var(--band-muted)] lg:block">
          Live on this page
        </p>
      </div>
      <dl>
        {specs.map((spec, i) => (
          <Reveal
            key={spec.label}
            delay={i * 0.055}
            className="grid items-center gap-4 border-b border-[var(--band-line)] py-6 sm:grid-cols-[8rem_1fr] sm:gap-8 lg:grid-cols-[8rem_1.4fr_1fr]"
          >
            {/* Body-size green, so it takes green-ink (7.4:1), never the fill. */}
            <dt className="lx-mono text-[1.45rem] text-[var(--lx-green-ink)] [.lx-band-deep_&]:text-[var(--lx-deep-mint)]">
              {spec.figure}
            </dt>
            <dd className="min-w-0">
              <span className="lx-title block text-[1.05rem] text-[var(--band-ink)]">
                {spec.label}
              </span>
              <span className="mt-1.5 block text-[0.95rem] leading-[1.7] text-[var(--band-muted)]">
                {spec.note}
              </span>
            </dd>
            <dd className="min-w-0 lg:justify-self-end">{spec.demo}</dd>
          </Reveal>
        ))}
      </dl>
    </div>
  )
}

/* ── 3. NumberedSteps — oversized display digits in the margin ───────────────
   Ruled rows on a strong top rule. The numeral is set at chart-watermark scale
   in the rule tone (decorative, aria-hidden), with a mono "of 03" annotation
   beneath — the protocol knows how long it is. Each step's payload slot stays
   bespoke. */

export type Step = { n: string; title: ReactNode; body: string; payload: ReactNode }

export function NumberedSteps({ steps }: { steps: Step[] }) {
  const total = String(steps.length).padStart(2, '0')
  return (
    <ol className="border-t border-[var(--band-line-strong)]">
      {steps.map((step, i) => (
        <Reveal
          as="li"
          key={step.n}
          delay={i * 0.08}
          className="grid gap-6 border-b border-[var(--band-line)] py-8 sm:py-10 lg:grid-cols-[6rem_1.05fr_1fr] lg:gap-10"
        >
          <div aria-hidden="true">
            <span className="lx-display block text-[2rem] text-[var(--band-line-strong)] lg:text-[clamp(3.25rem,5vw,4.5rem)]">
              {step.n}
            </span>
            <span className="lx-mono mt-1 hidden text-xs text-[var(--band-muted)] lg:block">
              / {total}
            </span>
          </div>
          <div>
            <h3 className="lx-title text-xl text-[var(--band-ink)] sm:text-2xl">{step.title}</h3>
            <p className="mt-3 max-w-prose leading-[1.75] text-[var(--band-muted)]">{step.body}</p>
          </div>
          <div className="min-w-0">{step.payload}</div>
        </Reveal>
      ))}
    </ol>
  )
}

/* ── 4. ExpandableSteps — a disclosure register, not an accordion of cards ───
   Ruled rows; the open row is marked by a 2px green-fill rule arriving at the
   start edge (a fill-as-emphasis, never the only signal — the plus rotates and
   the panel is visible). First item opens by default so the section is never a
   row of closed doors. Animates grid-template-rows, never max-height. */

export type Expandable = { n: string; title: string; summary: string; detail: ReactNode }

export function ExpandableSteps({ items }: { items: Expandable[] }) {
  const [open, setOpen] = useState(0)

  return (
    <ol className="border-t border-[var(--band-line-strong)]">
      {items.map((item, i) => {
        const isOpen = open === i
        return (
          <Reveal
            as="li"
            key={item.n}
            delay={i * 0.06}
            className="relative border-b border-[var(--band-line)]"
          >
            <span
              aria-hidden="true"
              className={`absolute inset-y-0 -start-4 w-[2px] bg-[var(--lx-green-fill)] motion-safe:transition-opacity motion-safe:duration-300 sm:-start-5 ${
                isOpen ? 'opacity-100' : 'opacity-0'
              }`}
            />
            <h3>
              <button
                type="button"
                aria-expanded={isOpen}
                aria-controls={`step-panel-${i}`}
                onClick={() => setOpen(isOpen ? -1 : i)}
                className="lx-focus flex min-h-11 w-full items-baseline gap-4 py-5 text-left sm:gap-6"
              >
                <span
                  className="lx-display w-12 shrink-0 text-[1.6rem] text-[var(--band-ink)]"
                  aria-hidden="true"
                >
                  {item.n}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="lx-title block text-lg text-[var(--band-ink)] sm:text-xl">
                    {item.title}
                  </span>
                  <span className="mt-1 block text-[var(--band-muted)]">{item.summary}</span>
                </span>
                <span
                  aria-hidden="true"
                  className={`grid h-6 w-6 shrink-0 place-items-center self-center text-[var(--lx-green-ink)] motion-safe:transition-transform motion-safe:duration-300 ${
                    isOpen ? 'rotate-45' : ''
                  }`}
                >
                  <IconPlus size={16} />
                </span>
              </button>
            </h3>

            <div className="lx-reveal-grid" data-open={isOpen} id={`step-panel-${i}`}>
              <div>
                <div className="pb-6 sm:ps-[4.5rem]">{item.detail}</div>
              </div>
            </div>
          </Reveal>
        )
      })}
    </ol>
  )
}

/* ── 5. IndexGrid — ruled index rows: number · rule · label ──────────────────
   No boxes. A short hairline tick between the mono numeral and the entry, the
   way a chart keys its figures. Works on the deep plate through --band-*. */

export function IndexGrid({ items }: { items: { n: string; label: string }[] }) {
  return (
    <ul className="grid border-t border-[var(--band-line-strong)] sm:grid-cols-2 sm:gap-x-14">
      {items.map((item, i) => (
        <Reveal
          as="li"
          key={item.n}
          delay={Math.min(i, 8) * 0.048}
          className="flex items-baseline gap-4 border-b border-[var(--band-line)] py-4"
        >
          <span className="lx-mono shrink-0 text-sm text-[var(--band-muted)]" aria-hidden="true">
            {item.n}
          </span>
          <span
            aria-hidden="true"
            className="h-px w-5 shrink-0 self-center bg-[var(--band-line)]"
          />
          <span className="leading-[1.6] text-[var(--band-body)]">{item.label}</span>
        </Reveal>
      ))}
    </ul>
  )
}

/* ── 5b. NumberCards — four claims as one ruled broadsheet row ───────────────
   The signature (numbered title + body, four-across at lg) survives; the boxes
   do not. Hairline column rules, mono numeral over a carbon-copy edge, title
   carrying the claim. */

export type NumberCard = { n: string; title: string; body: string }

export function NumberCards({ items }: { items: NumberCard[] }) {
  return (
    <ol className="grid gap-x-10 border-t border-[var(--band-line-strong)] sm:grid-cols-2 lg:grid-cols-4 lg:gap-x-0">
      {items.map((item, i) => (
        <Reveal
          as="li"
          key={item.n}
          delay={i * 0.068}
          className="border-b border-[var(--band-line)] py-6 lg:border-b-0 lg:border-e lg:px-6 lg:first:ps-0 lg:last:border-e-0 lg:last:pe-0"
        >
          <span
            className="lx-label lx-cc-edge block pb-2 text-[0.6875rem] text-[var(--band-muted)]"
            aria-hidden="true"
          >
            {item.n}
          </span>
          <h3 className="lx-title mt-4 text-lg text-[var(--band-ink)]">{item.title}</h3>
          <p className="mt-2 text-[0.95rem] leading-[1.7] text-[var(--band-muted)]">{item.body}</p>
        </Reveal>
      ))}
    </ol>
  )
}

/* ── 5c. CheckList — promises kept, as ruled lines ───────────────────────────
   Green-fill ticks (the one thing --lx-green-fill exists for) on ink
   hairlines. No containers at all: the least-decorated archetype, on purpose,
   for the page that should feel effortless to read. */

export function CheckList({ items }: { items: string[] }) {
  return (
    <ul className="grid gap-x-14 border-t border-[var(--band-line)] sm:grid-cols-2">
      {items.map((item, i) => (
        <Reveal
          as="li"
          key={item}
          delay={Math.min(i, 6) * 0.05}
          className="flex items-start gap-3.5 border-b border-[var(--band-line)] py-4"
        >
          <span aria-hidden="true" className="mt-1.5 shrink-0 text-[var(--lx-green-fill)]">
            <IconCheck size={13} strokeWidth={2.25} />
          </span>
          <span className="leading-[1.7] text-[var(--band-body)]">{item}</span>
        </Reveal>
      ))}
    </ul>
  )
}

/* ── 6. GlassCards — now a numbered clause register ──────────────────────────
   The export name is historical: there is no glassmorphism on this site any
   more. On the deep plate (its only habitat) the items read as numbered
   clauses — mono numeral, title, body — separated by on-deep hairlines. The
   legal register is the point: these are limits, not features. */

export function GlassCards({ items }: { items: { label: string; body: string }[] }) {
  return (
    <ol className="border-t border-[var(--band-line-strong)]">
      {items.map((item, i) => (
        <Reveal
          as="li"
          key={item.label}
          delay={i * 0.085}
          className="grid gap-3 border-b border-[var(--band-line)] py-6 sm:grid-cols-[4rem_1fr] sm:gap-6 lg:grid-cols-[4rem_minmax(0,17rem)_1fr] lg:gap-10"
        >
          <span className="lx-mono text-sm text-[var(--band-muted)]" aria-hidden="true">
            {String(i + 1).padStart(2, '0')}
          </span>
          <h3 className="lx-title text-lg text-[var(--band-ink)]">{item.label}</h3>
          <p className="max-w-prose leading-[1.75] text-[var(--band-muted)]">{item.body}</p>
        </Reveal>
      ))}
    </ol>
  )
}

/* ── 6b. PromiseLedger — a true two-column ledger sheet ──────────────────────
   Facing columns under mono heads with carbon-copy edges, ruled rows, a
   vertical rule between the columns at lg. The "never" head is set in the
   amber annotation ink on light bands (the safety limits are the most
   distinct copy); on the deep plate it takes the on-deep ink instead.
   Pass `will` empty for the stark single-column form. */

function LedgerColumn({
  kind,
  heading,
  items,
  twoUp,
  className = '',
}: {
  kind: 'will' | 'never'
  heading: string
  items: { t: string; b: string }[]
  twoUp: boolean
  className?: string
}) {
  return (
    <div className={className}>
      <p
        className={`lx-label lx-cc-edge pb-2 text-[0.6875rem] ${
          kind === 'never'
            ? 'text-[var(--lx-signal-ink)] [.lx-band-deep_&]:text-[var(--band-ink)]'
            : 'text-[var(--band-muted)]'
        }`}
      >
        {heading}
      </p>
      <ul>
        {items.map((item, i) => (
          <Reveal
            as="li"
            key={item.t}
            delay={Math.min(i, 6) * 0.062}
            className="grid grid-cols-[1.5rem_1fr] gap-4 border-b border-[var(--band-line)] py-5"
          >
            <span
              aria-hidden="true"
              className={`mt-1 ${
                kind === 'will' ? 'text-[var(--lx-green-fill)]' : 'text-[var(--band-muted)]'
              }`}
            >
              {kind === 'will' ? (
                <IconCheck size={14} strokeWidth={2} />
              ) : (
                <IconX size={13} strokeWidth={1.75} />
              )}
            </span>
            <span className="min-w-0">
              <span
                className={`lx-title block text-[var(--band-ink)] ${
                  twoUp ? 'text-[1.05rem]' : 'text-xl sm:text-2xl'
                }`}
              >
                {item.t}
              </span>
              <span
                className={`mt-1.5 block leading-[1.7] text-[var(--band-muted)] ${
                  twoUp ? 'text-[0.95rem]' : 'max-w-2xl'
                }`}
              >
                {item.b}
              </span>
            </span>
          </Reveal>
        ))}
      </ul>
    </div>
  )
}

export function PromiseLedger({
  will,
  never,
}: {
  will?: { t: string; b: string }[]
  never: { t: string; b: string }[]
}) {
  const twoUp = Boolean(will?.length)

  if (!twoUp) {
    return (
      <LedgerColumn
        kind="never"
        heading="Never, under any circumstances"
        items={never}
        twoUp={false}
      />
    )
  }

  return (
    <div className="grid gap-12 lg:grid-cols-2 lg:gap-0">
      <LedgerColumn
        kind="will"
        heading="What I will do"
        items={will ?? []}
        twoUp
        className="lg:pe-14"
      />
      <LedgerColumn
        kind="never"
        heading="What I will never do"
        items={never}
        twoUp
        className="lg:border-s lg:border-[var(--band-line)] lg:ps-14"
      />
    </div>
  )
}

/* ── 6c. LandscapeRows — the comparison as a ruled three-column table ────────
   Mono column heads under a carbon-copy edge; the failure column keyed by the
   amber signal dot (an ornament, never text). The promise and the failure sit
   side by side, which is the entire argument the section makes. */

export type Landscape = { option: string; gives: string; runsOut: string }

export function LandscapeRows({ rows }: { rows: Landscape[] }) {
  return (
    <div>
      <div className="lx-cc-edge hidden grid-cols-[1fr_1.2fr_1.2fr] gap-8 pb-2 lg:grid">
        {['What you have today', 'What it gives you', 'Where it runs out'].map((h) => (
          <p key={h} className="lx-label text-[0.6875rem] text-[var(--band-muted)]">
            {h}
          </p>
        ))}
      </div>

      <ul>
        {rows.map((row, i) => (
          <Reveal
            as="li"
            key={row.option}
            delay={Math.min(i, 6) * 0.052}
            className="grid gap-2 border-b border-[var(--band-line)] py-6 lg:grid-cols-[1fr_1.2fr_1.2fr] lg:gap-8"
          >
            <h3 className="lx-title text-lg text-[var(--band-ink)]">{row.option}</h3>
            <p className="leading-[1.75] text-[var(--band-body)]">{row.gives}</p>
            <p className="flex gap-2.5 leading-[1.75] text-[var(--band-muted)]">
              <span
                aria-hidden="true"
                className="mt-[0.6em] h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--lx-signal-fill)]"
              />
              {row.runsOut}
            </p>
          </Reveal>
        ))}
      </ul>
    </div>
  )
}

/* ── 6d. ContrastPair — their column and ours, line for line ─────────────────
   Two ruled columns split by a vertical hairline at lg, each under its own
   mono head with a carbon-copy edge. The difference is something you SEE
   rather than something you are asked to take on trust. */

export function ContrastPair({
  theirs,
  ours,
  rows,
}: {
  theirs: string
  ours: string
  rows: { theirs: string; ours: string }[]
}) {
  return (
    <div className="grid border-t border-[var(--band-line-strong)] pt-7 lg:grid-cols-2 lg:gap-0">
      <div className="pb-8 lg:pb-0 lg:pe-12">
        <p className="lx-label lx-cc-edge pb-2 text-[0.6875rem] text-[var(--band-muted)]">
          {theirs}
        </p>
        <ul className="mt-5 space-y-4">
          {rows.map((row, i) => (
            <Reveal
              as="li"
              key={row.theirs}
              delay={i * 0.065}
              className="flex gap-3 leading-[1.7] text-[var(--band-muted)]"
            >
              <span aria-hidden="true" className="mt-1.5 shrink-0 opacity-70">
                <IconX size={11} strokeWidth={1.75} />
              </span>
              {row.theirs}
            </Reveal>
          ))}
        </ul>
      </div>

      <div className="border-t border-[var(--band-line)] pt-8 lg:border-s lg:border-t-0 lg:ps-12 lg:pt-0">
        <p className="lx-label lx-cc-edge pb-2 text-[0.6875rem] text-[var(--lx-green-ink)] [.lx-band-deep_&]:text-[var(--lx-deep-mint)]">
          {ours}
        </p>
        <ul className="mt-5 space-y-4">
          {rows.map((row, i) => (
            <Reveal
              as="li"
              key={row.ours}
              delay={i * 0.065}
              className="flex gap-3 leading-[1.7] text-[var(--band-body)]"
            >
              <span aria-hidden="true" className="mt-1.5 shrink-0 text-[var(--lx-green-fill)]">
                <IconCheck size={11} strokeWidth={2.25} />
              </span>
              {row.ours}
            </Reveal>
          ))}
        </ul>
      </div>
    </div>
  )
}

/* ── 7. LanguageMarquee — now a static specimen strip ────────────────────────
   The autoscroll marquee is dead (banned motion). In its place: a composed,
   set row of greeting fragments at specimen scale — the scripts ARE the art —
   each annotated with its mono ISO code, ruled top and bottom. The export
   name is historical. Greetings are fixed, deterministic strings; the ISO
   annotation and lang attribute come from the app's own language list so the
   codes cannot drift. */

const SPECIMENS: { code: string; greeting: string }[] = [
  { code: 'es-ES', greeting: 'Hola' },
  { code: 'zh-CN', greeting: '你好' },
  { code: 'hi-IN', greeting: 'नमस्ते' },
  { code: 'ar-SA', greeting: 'مرحبا' },
  { code: 'vi-VN', greeting: 'Xin chào' },
  { code: 'ko-KR', greeting: '안녕하세요' },
  { code: 'ta-IN', greeting: 'வணக்கம்' },
  { code: 'ur-PK', greeting: 'سلام' },
  { code: 'bn-BD', greeting: 'নমস্কার' },
  { code: 'ru-RU', greeting: 'Здравствуйте' },
  { code: 'am-ET', greeting: 'ሰላም' },
  { code: 'el-GR', greeting: 'Γεια σας' },
]

/* Three specimen sizes cycling deterministically — a set wall, not a grid. */
const SPECIMEN_SIZES = [
  'text-[clamp(1.6rem,3vw,2.4rem)]',
  'text-[clamp(1.2rem,2.2vw,1.7rem)]',
  'text-[clamp(1.4rem,2.6vw,2rem)]',
]

export function LanguageMarquee() {
  return (
    <ul className="flex flex-wrap items-baseline gap-x-9 gap-y-5 border-y border-[var(--band-line)] py-7">
      {SPECIMENS.map((specimen, i) => {
        const language = LANGUAGES.find((l) => l.code === specimen.code)
        if (!language) return null
        return (
          <li key={specimen.code} className="flex items-baseline gap-2.5">
            <span
              lang={language.googleCode}
              dir={language.rtl ? 'rtl' : undefined}
              className={`lx-native text-[var(--band-ink)] ${SPECIMEN_SIZES[i % 3]}`}
            >
              {specimen.greeting}
            </span>
            <span className="lx-label text-[0.625rem] text-[var(--band-muted)]" aria-hidden="true">
              {language.googleCode.toUpperCase()}
            </span>
          </li>
        )
      })}
    </ul>
  )
}

/* ── 8. Quote — the aside voice, with a hanging rule ─────────────────────────
   A quote is a human being talking: the one register on the site that is
   allowed to lean (Plex Sans italic — the display face has no italic and is
   never faked). One vertical rule, mono attribution, no figure-quote clichés. */

export function Quote({
  children,
  attribution,
  role,
  /* /accessibility opens on a Quote, so it has to carry the h1 or the page has
     none. The <h1> wraps the <blockquote> content rather than replacing it, so
     the quotation semantics survive. */
  asHeading = false,
  /* Accepted for compatibility: the aside voice is now the ONLY register for
     quotes, so this no longer switches anything. */
  serif = false,
}: {
  children: ReactNode
  attribution: string
  role: string
  asHeading?: boolean
  serif?: boolean
}) {
  void serif
  const Inner = asHeading ? 'h1' : 'div'
  return (
    <Reveal className="max-w-3xl">
      <figure className="border-s border-[var(--band-line-strong)] ps-6 sm:ps-10">
        <blockquote className="lx-serif text-balance text-[clamp(1.5rem,3.2vw,2.25rem)] text-[var(--band-ink)]">
          <Inner className="font-[inherit] text-[inherit] leading-[inherit]">{children}</Inner>
        </blockquote>
        <figcaption className="lx-label mt-6 text-[0.6875rem] text-[var(--band-muted)]">
          {attribution} · {role}
        </figcaption>
      </figure>
    </Reveal>
  )
}

/* ── 9. Split — copy against a payload, on an asymmetric 7/5 measure ─────────
   Nothing on this site splits down the middle. Copy takes the wide column;
   `flip` mirrors the composition without giving up the asymmetry. */

export function Split({
  children,
  media,
  flip = false,
}: {
  children: ReactNode
  media: ReactNode
  flip?: boolean
}) {
  return (
    <div
      className={`grid items-center gap-10 lg:gap-16 ${
        flip
          ? 'lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]'
          : 'lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)]'
      }`}
    >
      <Reveal className={flip ? 'lg:order-2' : ''}>{children}</Reveal>
      <Reveal delay={0.1} className={flip ? 'lg:order-1' : ''}>
        {media}
      </Reveal>
    </div>
  )
}

/* ── 10. Prose — for the places that genuinely are just paragraphs ─────────── */

export function Prose({ children }: { children: ReactNode }) {
  return <div className="max-w-2xl">{children}</div>
}

export function Para({ children }: { children: ReactNode }) {
  return (
    <Reveal className="mt-6 first:mt-0">
      <p className="text-pretty text-lg leading-[1.75] text-[var(--band-body)]">{children}</p>
    </Reveal>
  )
}

/* ── 10b. QaColumns — open questions, set as an editorial register ───────────
   Two ruled columns, each answer indexed by a mono numeral. Nothing to
   discover, nothing to tap: the answers are simply there. */

export function QaColumns({ items }: { items: { q: string; a: string }[] }) {
  return (
    <dl className="grid gap-x-14 sm:grid-cols-2">
      {items.map((item, i) => (
        <Reveal
          key={item.q}
          delay={Math.min(i, 6) * 0.058}
          className="border-t border-[var(--band-line)] py-5"
        >
          <dt className="flex items-baseline gap-3">
            <span className="lx-mono w-7 shrink-0 text-xs text-[var(--band-muted)]" aria-hidden="true">
              {String(i + 1).padStart(2, '0')}
            </span>
            <span className="lx-title min-w-0 text-[1.05rem] text-[var(--band-ink)]">{item.q}</span>
          </dt>
          <dd className="mt-2.5 ps-10 leading-[1.75] text-[var(--band-muted)]">{item.a}</dd>
        </Reveal>
      ))}
    </dl>
  )
}

/* ── 11. Faq — native <details>, restyled as a ruled register ────────────────
   ONLY for the pages where the reader is scanning for their own objection
   (/accessibility, /privacy-safety, /for-clinics). Mono index numeral, ruled
   rows, plus-rotate affordance. Zero JS. */

export function Faq({ items }: { items: { q: string; a: string }[] }) {
  return (
    <div className="border-t border-[var(--band-line-strong)]">
      {items.map((item, i) => (
        <details key={item.q} className="group border-b border-[var(--band-line)]">
          <summary className="lx-focus flex min-h-11 cursor-pointer list-none items-baseline gap-4 py-5 [&::-webkit-details-marker]:hidden">
            <span className="lx-mono w-6 shrink-0 text-xs text-[var(--band-muted)]" aria-hidden="true">
              {String(i + 1).padStart(2, '0')}
            </span>
            <span className="lx-title min-w-0 flex-1 text-[1.05rem] text-[var(--band-ink)]">
              {item.q}
            </span>
            <span
              aria-hidden="true"
              className="grid h-5 w-5 shrink-0 place-items-center self-center text-[var(--lx-green-ink)] group-open:rotate-45 motion-safe:transition-transform motion-safe:duration-200 [.lx-band-deep_&]:text-[var(--lx-deep-mint)]"
            >
              <IconPlus size={14} />
            </span>
          </summary>
          <p className="max-w-2xl pb-6 ps-10 leading-[1.75] text-[var(--band-muted)]">{item.a}</p>
        </details>
      ))}
    </div>
  )
}

/* ── 12. References — a mono citation list on a hairline gutter ──────────────
   Hanging [n] numerals in a ruled gutter column; the citation body in the
   chart mono at footnote size. The `ref-{id}` anchors are load-bearing
   (/privacy-safety links to them) — never remove them. */

export function References({ items }: { items: { id: string; text: string; href?: string }[] }) {
  return (
    <Reveal>
      <ol className="border-t border-[var(--band-line-strong)] pt-5">
        {items.map((item) => (
          <li
            key={item.id}
            id={`ref-${item.id}`}
            className="grid scroll-mt-24 grid-cols-[2.75rem_1fr] gap-4 py-2"
          >
            <span className="lx-mono border-e border-[var(--band-line)] text-xs text-[var(--band-muted)]">
              [{item.id}]
            </span>
            <span className="lx-mono text-[0.8125rem] leading-[1.7] text-[var(--band-muted)]">
              {item.text}{' '}
              {item.href && (
                <a
                  href={item.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="lx-focus text-[var(--lx-green-ink)] underline underline-offset-2 [.lx-band-deep_&]:text-[var(--lx-deep-mint)]"
                >
                  Source
                </a>
              )}
            </span>
          </li>
        ))}
      </ol>
    </Reveal>
  )
}

/* ── ArrowLink — underline-draw + the drawn arrow ────────────────────────────
   Links are green-ink, always. The underline draws in from the start edge and
   the chevron resolves into an arrow — both driven by the inherited --lx-hover
   boolean from landing.css, so this markup carries no hover state and no JS. */

export function ArrowLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <a
      href={href}
      className="lx-focus inline-flex min-h-11 items-center gap-2.5 font-medium text-[var(--lx-green-ink)] [.lx-band-deep_&]:text-[var(--lx-deep-mint)]"
    >
      <span className="lx-underline-draw">{children}</span>
      <svg
        className="lx-arrow"
        width="16"
        height="16"
        viewBox="0 0 16 16"
        fill="none"
        aria-hidden="true"
      >
        <path
          className="lx-arrow__shaft"
          d="M2 8h10"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
        <path
          className="lx-arrow__head"
          d="M8.5 4.5L12 8l-3.5 3.5"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </a>
  )
}
