'use client'

/* A library of *distinct* section archetypes.

   The old site had one block type (heading + paragraphs) repeated down every
   page, which is why every page looked like the same file with the words
   swapped. These are the alternatives. The rule when composing a page: never use
   the same archetype twice in a row, and no two pages share a spine.

   Every section is wrapped in a <Band>, which remaps its own colour scheme — so
   rhythm comes from the *ground* changing, not just the layout. */

import { useEffect, useRef, useState, type ReactNode } from 'react'
import { motion, useInView } from 'framer-motion'
import { LANGUAGES } from '@/lib/languages'
import { Reveal } from './Reveal'

/* ── Band — the primitive every section sits on ──────────────────────────── */

type Palette = 'cream' | 'mint' | 'deep'

/* `flow` drops the page's gradient light-field behind the section — a huge radial
   that resolves into this band's own ground, so it has no visible seam.

     'glow' — anchored below the bottom edge; light rises INTO the section. This
              is the one to spend on the page's dark peak.
     'hero' — anchored above the top edge; light falls from behind the nav and has
              dissolved into the ground by the seam. Any section that opens a page.

   Use it sparingly. The whole point of the technique is that the colour is
   rationed and spent at the peak, not spread evenly down the page — stripe.com
   ships exactly one chromatic section on its entire homepage, and that restraint
   is what makes it land.

   `rails` draws the 1px vertical guide lines on the content column. */
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
  flow?: 'glow' | 'hero'
  rails?: boolean
  id?: string
  className?: string
}) {
  return (
    <section
      id={id}
      className={`lx-band lx-band-${palette} relative overflow-hidden border-y border-[var(--band-line)] px-5 py-16 sm:px-8 md:py-24 lg:px-16 ${
        id ? 'scroll-mt-24' : ''
      } ${className}`}
    >
      {flow && (
        <div
          className={`lx-flow lx-flow-drift ${flow === 'hero' ? 'lx-flow-hero' : ''}`}
          aria-hidden="true"
        />
      )}
      <div className={`lx-above mx-auto max-w-6xl ${rails ? 'lx-rails px-6 sm:px-10' : ''}`}>
        {children}
      </div>
    </section>
  )
}

/* Emphasised phrase — italic serif in the accent colour. Used on the trailing
   clause of a heading so no heading is a flat slab of one weight. */
export function Accent({ children }: { children: ReactNode }) {
  return <span className="lx-accent">{children}</span>
}

/* The SECOND emphasis register.

   `Accent` was the only one we had, so every heading on every page was built
   identically — plain words, then a green italic phrase. Eight pages of that is
   a template, however different the words are. `GradWord` fills the emphasised
   word with the brand gradient instead of colouring it, and stays upright rather
   than italic. Pages pick one register and hold it, so a heading tells you which
   page you are on. */
export function GradWord({ children }: { children: ReactNode }) {
  return <span className="lx-grad-text">{children}</span>
}

export function BandHeading({ children, lede }: { children: ReactNode; lede?: ReactNode }) {
  return (
    <Reveal className="max-w-3xl">
      <h2 className="lx-heading text-balance text-[clamp(1.7rem,3.8vw,2.5rem)] text-[var(--band-ink)]">
        {children}
      </h2>
      {lede && (
        <p className="mt-5 text-pretty text-lg leading-[1.8] text-[var(--band-muted)]">{lede}</p>
      )}
    </Reveal>
  )
}

/* ── 1. Thesis — oversized statement, one paragraph, no visual ───────────────
   Kyndryl's palate cleanser. Deploy between two dense sections; it buys rhythm
   for almost nothing. */

export function Thesis({
  statement,
  body,
  /* Pages that open on a Thesis instead of a PageHero (/about) must render it as
     the h1 — otherwise the page ships with no h1 at all, which breaks both the
     document outline for screen readers and the SEO title signal. */
  as = 'p',
  /* THE SERIF. Off by default.

     Fraunces used to set every heading on the site, which is exactly why the site
     read as a magazine rather than as software. It survives in this one prop, and
     it is switched on in precisely two places: the mission statement on /about and
     the "she is 72" quote on /accessibility.

     The rule is: use it where a deliberate break in voice IS the point — where the
     page stops explaining a product and says something human. Anywhere else it is
     just decoration, and decoration is what we spent this pass removing. */
  serif = false,
}: {
  statement: ReactNode
  body?: ReactNode
  as?: 'p' | 'h1'
  serif?: boolean
}) {
  const Tag = as
  return (
    <Reveal className="mx-auto max-w-4xl">
      <Tag
        className={`${
          serif ? 'lx-serif' : 'lx-heading'
        } text-balance text-[clamp(1.6rem,4vw,2.75rem)] text-[var(--band-ink)]`}
      >
        {statement}
      </Tag>
      {body && (
        <p className="mt-7 max-w-2xl text-lg leading-[1.85] text-[var(--band-muted)]">{body}</p>
      )}
    </Reveal>
  )
}

/* ── 2. StatRow — hairline-separated figures that count up ───────────────────
   Boxes make numbers feel like a pitch deck; vertical hairlines don't. Numbers
   land in sequence (Tucuvi stagger the *duration*, not the start). */

function CountUp({ value, suffix = '' }: { value: number; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null)
  const inView = useInView(ref, { once: true, margin: '-15%' })
  const [shown, setShown] = useState(0)

  useEffect(() => {
    if (!inView) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setShown(value)
      return
    }
    const duration = 1100
    const start = performance.now()
    let frame = 0
    const tick = (now: number) => {
      const p = Math.min((now - start) / duration, 1)
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
    <dl className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat, i) => (
        <Reveal key={stat.label} delay={i * 0.08}>
          <div className="border-t-2 border-[var(--lx-green)] pt-5 sm:border-l-2 sm:border-t-0 sm:pl-6 sm:pt-0">
            <dt className="lx-display text-[clamp(2.4rem,5vw,3.4rem)] leading-none text-[var(--band-ink)]">
              {stat.prefix}
              <CountUp value={stat.value} suffix={stat.suffix} />
            </dt>
            <dd className="mt-3">
              <span className="block font-semibold text-[var(--band-ink)]">{stat.label}</span>
              <span className="mt-1 block leading-[1.7] text-[var(--band-muted)]">{stat.note}</span>
            </dd>
          </div>
        </Reveal>
      ))}
    </dl>
  )
}

/* ── 2b. StatCards — the same figures, as objects rather than as a ruled row ──

   The hairline StatRow works when the numbers are all different. On /for-clinics
   three of the four figures are literally zero, and four huge numerals separated
   by rules just read as "0 0 0 5" — a row of nothing, which is the opposite of
   the point (the zeros ARE the pitch: zero setup, zero cost).

   So: give each figure its own card, and let the label carry the meaning while
   the numeral supports it. `prefix` exists so a zero can be a *price* ($0) and
   stop looking like a missing value. */

export function StatCards({ stats }: { stats: Stat[] }) {
  return (
    <dl className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat, i) => (
        <Reveal key={stat.label} delay={i * 0.07} className="h-full">
          <div className="lx-card group flex h-full flex-col p-6">
            <dt className="lx-display flex items-baseline text-[clamp(2.6rem,4.6vw,3.5rem)] leading-none">
              <span className="lx-grad-text">
                {stat.prefix}
                <CountUp value={stat.value} suffix={stat.suffix} />
              </span>
            </dt>
            <dd className="mt-5 flex flex-1 flex-col">
              <span className="text-base font-semibold text-[var(--band-ink)]">{stat.label}</span>
              <span className="mt-2 text-[0.95rem] leading-[1.7] text-[var(--band-muted)]">
                {stat.note}
              </span>
            </dd>
            <span
              className="mt-6 h-[3px] w-10 rounded-full bg-[var(--lx-green)] opacity-40 transition-all duration-500 group-hover:w-full group-hover:opacity-100"
              aria-hidden="true"
            />
          </div>
        </Reveal>
      ))}
    </dl>
  )
}

/* ── 2c. SpecRows — figures that demonstrate themselves ──────────────────────

   /accessibility used the same StatRow as /about, which was the single clearest
   reason the two pages felt like one file with the words swapped. But it was also
   just wrong: /about's numbers are an *argument* (67 million people), while
   /accessibility's are a *specification* (44px, 18px). A specification should be
   set like one.

   And a spec sheet on an accessibility page can do something no other page can:
   prove itself. The 44px row contains a real 44px target. The 18px row is set at
   18px. If we ever break the promise, the page breaks visibly — which is a much
   better guarantee than a badge. */

export type Spec = { figure: string; label: string; note: string; demo: ReactNode }

export function SpecRows({ specs }: { specs: Spec[] }) {
  return (
    <dl className="border-t border-[var(--band-line)]">
      {specs.map((spec, i) => (
        <Reveal key={spec.label} delay={i * 0.06}>
          <div className="grid items-center gap-4 border-b border-[var(--band-line)] py-7 sm:grid-cols-[7rem_1fr] sm:gap-8 lg:grid-cols-[8rem_1.4fr_1fr]">
            {/* Display-size text, so it takes the AA-Large green, not the fill. */}
            <dt className="lx-display text-[clamp(1.9rem,3.4vw,2.6rem)] leading-none text-[var(--lx-green-accent)]">
              {spec.figure}
            </dt>
            <dd className="min-w-0">
              <span className="block font-semibold text-[var(--band-ink)]">{spec.label}</span>
              <span className="mt-1.5 block leading-[1.7] text-[var(--band-muted)]">
                {spec.note}
              </span>
            </dd>
            <dd className="min-w-0 lg:justify-self-end">{spec.demo}</dd>
          </div>
        </Reveal>
      ))}
    </dl>
  )
}

/* ── 3. NumberedSteps — number | copy | bespoke payload ──────────────────────
   The payload is a slot, and each step passes a *different* one. That is the
   whole point: three cards with three identical layouts is the thing we are
   trying to get away from. */

export type Step = { n: string; title: ReactNode; body: string; payload: ReactNode }

export function NumberedSteps({ steps }: { steps: Step[] }) {
  return (
    <ol className="space-y-5">
      {steps.map((step, i) => (
        <Reveal key={step.n} delay={i * 0.07}>
          <li className="grid gap-6 rounded-[16px] border border-[var(--band-line)] bg-[var(--band-card)] p-6 sm:p-8 lg:grid-cols-[3.5rem_1fr_1fr] lg:gap-8">
            <span
              className="lx-mono text-[2rem] leading-none text-[var(--lx-green)] opacity-50"
              aria-hidden="true"
            >
              {step.n}
            </span>
            <div>
              <h3 className="lx-title text-xl text-[var(--band-ink)] sm:text-2xl">
                {step.title}
              </h3>
              <p className="mt-3 leading-[1.8] text-[var(--band-muted)]">{step.body}</p>
            </div>
            <div className="min-w-0">{step.payload}</div>
          </li>
        </Reveal>
      ))}
    </ol>
  )
}

/* ── 4. ExpandableSteps — click to open, one at a time ───────────────────────
   First item opens by default so the section is never a row of closed doors.
   Animates grid-template-rows (0fr -> 1fr), not max-height. */

export type Expandable = { n: string; title: string; summary: string; detail: ReactNode }

export function ExpandableSteps({ items }: { items: Expandable[] }) {
  const [open, setOpen] = useState(0)

  return (
    <ol className="space-y-3">
      {items.map((item, i) => {
        const isOpen = open === i
        return (
          <Reveal key={item.n} delay={i * 0.06}>
            <li
              className={`overflow-hidden rounded-[16px] border bg-[var(--band-card)] transition-colors duration-300 ${
                isOpen ? 'border-[var(--lx-green)]' : 'border-[var(--band-line)]'
              }`}
            >
              <h3>
                <button
                  type="button"
                  aria-expanded={isOpen}
                  aria-controls={`step-panel-${i}`}
                  onClick={() => setOpen(isOpen ? -1 : i)}
                  className="lx-focus flex w-full items-center gap-4 p-5 text-left sm:gap-6 sm:p-6"
                >
                  <span
                    className="lx-mono shrink-0 text-lg leading-none text-[var(--lx-green)] opacity-60"
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
                    className={`shrink-0 text-2xl leading-none text-[var(--lx-green)] transition-transform duration-300 ${
                      isOpen ? 'rotate-45' : ''
                    }`}
                  >
                    +
                  </span>
                </button>
              </h3>

              <div className="lx-reveal-grid" data-open={isOpen} id={`step-panel-${i}`}>
                <div>
                  <div className="border-t border-[var(--band-line)] p-5 sm:p-6">{item.detail}</div>
                </div>
              </div>
            </li>
          </Reveal>
        )
      })}
    </ol>
  )
}

/* ── 5. IndexGrid — dense, image-free proof of breadth ───────────────────────
   Numbers are the visual. Cheaper and better than any icon set we'd ship. */

export function IndexGrid({ items }: { items: { n: string; label: string }[] }) {
  return (
    <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {items.map((item, i) => (
        <Reveal key={item.n} delay={Math.min(i, 8) * 0.04}>
          <li className="flex h-full items-baseline gap-4 rounded-[12px] border border-[var(--band-line)] bg-[var(--band-card)] p-4">
            <span
              className="lx-mono shrink-0 text-sm text-[var(--lx-green)] opacity-60"
              aria-hidden="true"
            >
              {item.n}
            </span>
            <span className="leading-[1.6] text-[var(--band-body)]">{item.label}</span>
          </li>
        </Reveal>
      ))}
    </ul>
  )
}

/* ── 5b. NumberCards — a numbered set that is allowed to be four-across ───────

   IndexGrid tops out at three columns, so a set of four items renders as a row
   of three and one orphan sitting alone under it. That is what "the four things
   that matter most" looked like on /privacy-safety, and it read as a mistake.

   The fix is not only the column count. Four columns of a single 40-word
   paragraph would be four narrow grey slabs. Each item needs a short title
   carrying the claim, with the paragraph *supporting* it — so the row scans as
   four statements at a glance and rewards reading second. */

export type NumberCard = { n: string; title: string; body: string }

export function NumberCards({ items }: { items: NumberCard[] }) {
  return (
    <ol className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {items.map((item, i) => (
        <Reveal key={item.n} delay={i * 0.07} className="h-full">
          <li className="lx-card group flex h-full flex-col p-6">
            <div className="flex items-center gap-3">
              <span
                className="lx-mono text-sm leading-none text-[var(--lx-green)]"
                aria-hidden="true"
              >
                {item.n}
              </span>
              <span
                className="h-px flex-1 bg-[var(--band-line)] transition-colors duration-500 group-hover:bg-[var(--lx-green)]"
                aria-hidden="true"
              />
            </div>
            <h3 className="lx-title mt-5 text-xl leading-[1.25] text-[var(--band-ink)]">
              {item.title}
            </h3>
            <p className="mt-3 text-[0.95rem] leading-[1.75] text-[var(--band-muted)]">
              {item.body}
            </p>
          </li>
        </Reveal>
      ))}
    </ol>
  )
}

/* ── 5c. CheckList — commitments, not cards ──────────────────────────────────

   /about and /accessibility both had a six-item numbered grid, which is a large
   part of why they read as the same page. They are not the same kind of list:
   /about's six are *rules we chose* (numbered, ordered, a manifesto), and
   /accessibility's six are *promises kept* (unordered, checkable). So one stays
   an IndexGrid and the other becomes this: no boxes at all, just a tick and a
   line, in two columns. Fewer containers, which is also the right call on the one
   page that should feel effortless to read. */

export function CheckList({ items }: { items: string[] }) {
  return (
    <ul className="grid gap-x-10 gap-y-1 sm:grid-cols-2">
      {items.map((item, i) => (
        <Reveal key={item} delay={Math.min(i, 6) * 0.05}>
          <li className="flex items-start gap-3.5 border-b border-[var(--band-line)] py-4">
            <span
              className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-[var(--lx-green)] text-[0.65rem] font-bold text-white"
              aria-hidden="true"
            >
              ✓
            </span>
            <span className="leading-[1.7] text-[var(--band-body)]">{item}</span>
          </li>
        </Reveal>
      ))}
    </ul>
  )
}

/* ── 6. Glass cards — only over .lx-band-deep ────────────────────────────────
   The deep field plus blur *is* the depth treatment, which is how we get a
   photographic-feeling band with no photograph. */

export function GlassCards({ items }: { items: { label: string; body: string }[] }) {
  return (
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {items.map((item, i) => (
        <Reveal key={item.label} delay={i * 0.07}>
          <div className="lx-glass h-full rounded-[16px] p-6">
            <div className="mb-4 h-px w-12 bg-[var(--lx-sage)]" aria-hidden="true" />
            <h3 className="lx-title text-lg text-[var(--band-ink)]">
              {item.label}
            </h3>
            <p className="mt-2 leading-[1.75] text-[var(--band-muted)]">{item.body}</p>
          </div>
        </Reveal>
      ))}
    </div>
  )
}

/* ── 6b. PromiseLedger — Kai's own voice, as a ledger ────────────────────────

   Kai's promises used to be an IndexGrid ("I will wait", "I will listen"…) and
   Kai's limits a set of GlassCards ("Not a doctor", "Not a triage system") — two
   sections, two archetypes, both of which appear on other pages, and the two
   halves of a single idea split across them.

   They belong together. What Kai will do is only meaningful next to what Kai
   will never do, and putting them in facing columns makes the promise legible as
   a *bargain* rather than as marketing. First person throughout, because it is
   Kai talking.

   Pass `will` empty to get the stark single-column form (the homepage, where the
   "never" list is the entire trust moment and deserves the full width). */

/* Hoisted OUT of PromiseLedger.

   Defined inside it, this was a new component *type* on every render — so React
   could not reconcile it and tore down and remounted the entire subtree each time
   the parent re-rendered. That means every Reveal inside it replays its entrance
   animation, and any state below it is destroyed. It is invisible until it is not,
   and then it is baffling. A component defined during render is never what you
   want. */
function LedgerColumn({
  kind,
  heading,
  items,
  twoUp,
}: {
  kind: 'will' | 'never'
  heading: string
  items: { t: string; b: string }[]
  twoUp: boolean
}) {
  return (
    <div>
      <p className="lx-label flex items-center gap-3 text-xs text-[var(--band-muted)]">
        {heading}
        <span className="h-px flex-1 bg-[var(--band-line)]" aria-hidden="true" />
      </p>
      <ul className={twoUp ? 'mt-6 space-y-5' : 'mt-8 space-y-0'}>
        {items.map((item, i) => (
          <Reveal key={item.t} delay={Math.min(i, 6) * 0.06}>
            <li
              className={
                twoUp
                  ? 'flex gap-4'
                  : 'flex gap-5 border-b border-[var(--band-line)] py-6 first:border-t'
              }
            >
              <span
                aria-hidden="true"
                className={`mt-1 grid shrink-0 place-items-center rounded-full text-xs font-bold ${
                  twoUp ? 'h-5 w-5' : 'h-7 w-7 text-sm'
                } ${
                  kind === 'will'
                    ? 'bg-[var(--lx-green)] text-white'
                    : 'border border-[var(--band-line)] bg-transparent text-[var(--band-muted)]'
                }`}
              >
                {kind === 'will' ? '✓' : '✕'}
              </span>
              <span className="min-w-0">
                <span
                  className={`lx-title block text-[var(--band-ink)] ${
                    twoUp ? 'text-lg' : 'text-xl sm:text-2xl'
                  }`}
                >
                  {item.t}
                </span>
                <span
                  className={`mt-1.5 block leading-[1.75] text-[var(--band-muted)] ${
                    twoUp ? '' : 'max-w-2xl'
                  }`}
                >
                  {item.b}
                </span>
              </span>
            </li>
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
    <div className="grid gap-10 lg:grid-cols-2 lg:gap-16">
      <LedgerColumn kind="will" heading="What I will do" items={will ?? []} twoUp />
      <LedgerColumn kind="never" heading="What I will never do" items={never} twoUp />
    </div>
  )
}

/* ── 6c. LandscapeRows — the alternatives, and where each one runs out ───────

   /how-it-works listed the six things a patient has today (an interpreter, the
   phone line, a family member, a translation app, a form, hope) as six frosted
   cards — the same component /languages, /meet-kai, /for-clinics, /accessibility
   and the homepage were all also using on a dark band.

   But this content is not a set of cards at all. It is a comparison: each option
   gives you something, and each one runs out somewhere. A card flattens that into
   one grey paragraph. Two columns keep the promise and the failure side by side,
   which is the entire argument the section is making. */

export type Landscape = { option: string; gives: string; runsOut: string }

export function LandscapeRows({ rows }: { rows: Landscape[] }) {
  return (
    <div>
      <div className="hidden grid-cols-[1fr_1.2fr_1.2fr] gap-8 border-b border-[var(--band-line)] pb-3 lg:grid">
        {['What you have today', 'What it gives you', 'Where it runs out'].map((h) => (
          <p
            key={h}
            className="lx-label text-xs text-[var(--band-muted)]"
          >
            {h}
          </p>
        ))}
      </div>

      <ul>
        {rows.map((row, i) => (
          <Reveal key={row.option} delay={Math.min(i, 6) * 0.05}>
            <li className="grid gap-2 border-b border-[var(--band-line)] py-6 lg:grid-cols-[1fr_1.2fr_1.2fr] lg:gap-8">
              <h3 className="lx-title text-lg text-[var(--band-ink)] sm:text-xl">
                {row.option}
              </h3>
              <p className="leading-[1.75] text-[var(--band-body)]">{row.gives}</p>
              <p className="flex gap-2.5 leading-[1.75] text-[var(--band-muted)]">
                <span
                  aria-hidden="true"
                  className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--lx-sage)]"
                />
                {row.runsOut}
              </p>
            </li>
          </Reveal>
        ))}
      </ul>
    </div>
  )
}

/* ── 6d. ContrastPair — what they mean by it, and what we mean by it ─────────

   /languages opened its dark band by saying that "a lot of software claims to
   support your language when what it really means is that the buttons are
   translated" — and then rendered three cards that only described OUR side. The
   sentence sets up a contrast and the section did not deliver one.

   So: deliver it. Their column and ours, line for line, so the difference is
   something you SEE rather than something you are asked to take on trust. */

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
    <div className="grid gap-px overflow-hidden rounded-[16px] border border-[var(--band-line)] bg-[var(--band-line)] lg:grid-cols-2">
      <div className="bg-[var(--band-bg)] p-6 sm:p-8">
        <p className="lx-label text-xs text-[var(--band-muted)]">
          {theirs}
        </p>
        <ul className="mt-6 space-y-5">
          {rows.map((row, i) => (
            <Reveal key={row.theirs} delay={i * 0.06}>
              <li className="leading-[1.75] text-[var(--band-muted)]">{row.theirs}</li>
            </Reveal>
          ))}
        </ul>
      </div>

      <div className="bg-[var(--band-card)] p-6 sm:p-8">
        <p className="lx-label text-xs text-[var(--lx-sage)]">
          {ours}
        </p>
        <ul className="mt-6 space-y-5">
          {rows.map((row, i) => (
            <Reveal key={row.ours} delay={i * 0.06}>
              <li className="flex gap-3 leading-[1.75] text-[var(--band-body)]">
                <span
                  aria-hidden="true"
                  className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--lx-green)]"
                />
                {row.ours}
              </li>
            </Reveal>
          ))}
        </ul>
      </div>
    </div>
  )
}

/* ── 7. LanguageMarquee — our logo strip ─────────────────────────────────────
   Every other health-AI site runs a wall of hospital logos here. We don't have
   hospitals; we have 45 scripts, which is the more honest proof anyway. Track is
   duplicated so translateX(-50%) loops seamlessly. */

export function LanguageMarquee() {
  const strip = [...LANGUAGES, ...LANGUAGES]

  return (
    <div className="lx-marquee py-2" aria-hidden="true">
      <div className="lx-marquee-track gap-3">
        {strip.map((language, i) => (
          <span
            key={`${language.code}-${i}`}
            className="lx-native flex shrink-0 items-center gap-2 rounded-full border border-[var(--band-line)] bg-[var(--band-card)] px-4 py-2 text-[var(--band-body)]"
          >
            <span>{language.flag}</span>
            {language.native}
          </span>
        ))}
      </div>
    </div>
  )
}

/* ── 8. Quote ────────────────────────────────────────────────────────────────
   No headshot — we don't have one, and a stock face would be worse than none. */

export function Quote({
  children,
  attribution,
  role,
  /* Same reason as Thesis: /accessibility opens on a Quote, so it has to carry
     the h1 or the page has none. The <h1> wraps the <blockquote> content rather
     than replacing it, so the quotation semantics survive. */
  asHeading = false,
  /* The serif's second and last home. A quote is a human being talking, which is
     the one thing on this site that should NOT look like software. */
  serif = false,
}: {
  children: ReactNode
  attribution: string
  role: string
  asHeading?: boolean
  serif?: boolean
}) {
  const Inner = asHeading ? 'h1' : 'div'
  return (
    <Reveal className="mx-auto max-w-3xl">
      <figure>
        <blockquote
          className={`${
            serif ? 'lx-serif' : 'lx-heading'
          } text-balance text-[clamp(1.35rem,3vw,2rem)] text-[var(--band-ink)]`}
        >
          <Inner className="font-[inherit] text-[inherit] leading-[inherit]">{children}</Inner>
        </blockquote>
        <figcaption className="mt-6 flex items-center gap-3 text-[var(--band-muted)]">
          <span className="h-px w-8 bg-[var(--lx-green)]" aria-hidden="true" />
          <span>
            <span className="font-semibold text-[var(--band-ink)]">{attribution}</span> · {role}
          </span>
        </figcaption>
      </figure>
    </Reveal>
  )
}

/* ── 9. Split — copy on one side, an arbitrary payload on the other ─────────── */

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
    <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
      <Reveal className={flip ? 'lg:order-2' : ''}>{children}</Reveal>
      <Reveal delay={0.1} className={flip ? 'lg:order-1' : ''}>
        {media}
      </Reveal>
    </div>
  )
}

/* ── 10. Prose — for the places that genuinely are just paragraphs ─────────── */

export function Prose({ children }: { children: ReactNode }) {
  return (
    <div className="max-w-2xl">
      {children}
    </div>
  )
}

export function Para({ children }: { children: ReactNode }) {
  return (
    <Reveal className="mt-6 first:mt-0">
      <p className="text-pretty text-lg leading-[1.85] text-[var(--band-body)]">{children}</p>
    </Reveal>
  )
}

/* ── 10b. QaColumns — the same questions, not hidden behind a chevron ────────

   Six of the eight pages ended on the same <details> accordion, which is a large
   part of why they all felt like the same page: whatever happened in the middle,
   you always landed on an identical row of closed grey doors.

   An accordion is the right instrument in exactly one situation — when the reader
   is *scanning for their own objection* and wants the others out of the way. That
   is a person under scrutiny: a clinic doing diligence, a sceptic on the privacy
   page. So <Faq> now lives only on those three pages, and it earns its place there.

   Everywhere else the questions are not objections to be filtered, they are just
   things worth telling you — so they are open, set as editorial prose in two
   columns, and read like the end of an article rather than a support centre.

   It is also strictly better for the reader we claim to build for: nothing to
   discover, nothing to tap, and the answers are simply there. */

export function QaColumns({ items }: { items: { q: string; a: string }[] }) {
  return (
    <dl className="grid gap-x-12 gap-y-8 sm:grid-cols-2">
      {items.map((item, i) => (
        <Reveal key={item.q} delay={Math.min(i, 6) * 0.06}>
          <div className="border-t border-[var(--band-line)] pt-5">
            <dt className="lx-title text-lg leading-[1.35] text-[var(--band-ink)]">
              {item.q}
            </dt>
            <dd className="mt-2.5 leading-[1.8] text-[var(--band-muted)]">{item.a}</dd>
          </div>
        </Reveal>
      ))}
    </dl>
  )
}

/* ── 11. Disclosure list (FAQ) — native <details>, zero JS ────────────────────

   ONLY for the three pages where the reader is scanning for their own objection:
   /accessibility, /privacy-safety, /for-clinics. Everywhere else use <QaColumns>
   — see the note above it. */

export function Faq({ items }: { items: { q: string; a: string }[] }) {
  return (
    <div className="border-t border-[var(--band-line)]">
      {items.map((item) => (
        <details key={item.q} className="group border-b border-[var(--band-line)] py-5">
          <summary className="lx-focus flex min-h-11 cursor-pointer list-none items-center justify-between gap-4 font-semibold text-[var(--band-ink)] [&::-webkit-details-marker]:hidden">
            {item.q}
            <span
              aria-hidden="true"
              className="shrink-0 text-xl leading-none text-[var(--lx-green)] transition-transform duration-200 group-open:rotate-45"
            >
              +
            </span>
          </summary>
          <p className="mt-3 max-w-2xl leading-[1.85] text-[var(--band-muted)]">{item.a}</p>
        </details>
      ))}
    </div>
  )
}

/* ── 12. References — cite your sources ─────────────────────────────────────── */

export function References({ items }: { items: { id: string; text: string; href?: string }[] }) {
  return (
    <Reveal>
      <ol className="space-y-3 border-t border-[var(--band-line)] pt-6 text-sm leading-[1.7] text-[var(--band-muted)]">
        {items.map((item) => (
          <li key={item.id} id={`ref-${item.id}`} className="flex gap-3">
            <span className="shrink-0 font-semibold text-[var(--band-ink)]">{item.id}.</span>
            <span>
              {item.text}{' '}
              {item.href && (
                <a
                  href={item.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="lx-focus underline underline-offset-2 hover:text-[var(--band-ink)]"
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

/* Arrow link.

   The glyph is drawn, not typed. A "→" character just slides sideways on hover;
   a real arrow GROWS — the shaft fades in and the head moves — so the chevron
   resolves into an arrow. Two properties, both driven by the inherited --lx-hover
   boolean set in landing.css, so this markup needs no hover state of its own and
   no JS. A card, a link or a button can all drive it identically.

   Framer Motion is gone from here for the same reason: this is a 3px translate
   and an opacity fade, and shipping a JS animation library to do that is exactly
   the kind of thing that makes a site feel heavier than it looks. */
export function ArrowLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <a
      href={href}
      className="lx-focus inline-flex min-h-11 items-center gap-2 font-medium text-[var(--band-ink)]"
    >
      <span className="underline underline-offset-4">{children}</span>
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
