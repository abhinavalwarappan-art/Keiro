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

export function Band({
  children,
  palette = 'cream',
  id,
  className = '',
}: {
  children: ReactNode
  palette?: Palette
  id?: string
  className?: string
}) {
  return (
    <section
      id={id}
      className={`lx-band lx-band-${palette} border-y border-[var(--band-line)] px-5 py-16 sm:px-8 md:py-24 lg:px-16 ${
        id ? 'scroll-mt-24' : ''
      } ${className}`}
    >
      <div className="mx-auto max-w-6xl">{children}</div>
    </section>
  )
}

/* Emphasised phrase — italic serif in the accent colour. Used on the trailing
   clause of a heading so no heading is a flat slab of one weight. */
export function Accent({ children }: { children: ReactNode }) {
  return <span className="lx-accent">{children}</span>
}

export function BandHeading({ children, lede }: { children: ReactNode; lede?: ReactNode }) {
  return (
    <Reveal className="max-w-3xl">
      <h2 className="lx-display text-balance text-[clamp(1.7rem,3.8vw,2.5rem)] font-semibold leading-[1.2] tracking-[-0.02em] text-[var(--band-ink)]">
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
}: {
  statement: ReactNode
  body?: ReactNode
  as?: 'p' | 'h1'
}) {
  const Tag = as
  return (
    <Reveal className="mx-auto max-w-4xl">
      <Tag className="lx-display text-balance text-[clamp(1.6rem,4vw,2.75rem)] font-medium leading-[1.35] tracking-[-0.02em] text-[var(--band-ink)]">
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

export type Stat = { value: number; suffix?: string; label: string; note: string }

export function StatRow({ stats }: { stats: Stat[] }) {
  return (
    <dl className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat, i) => (
        <Reveal key={stat.label} delay={i * 0.08}>
          <div className="border-t-2 border-[var(--lx-green)] pt-5 sm:border-l-2 sm:border-t-0 sm:pl-6 sm:pt-0">
            <dt className="lx-display text-[clamp(2.4rem,5vw,3.4rem)] font-semibold leading-none tracking-[-0.03em] text-[var(--band-ink)]">
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
          <li className="grid gap-6 rounded-[22px] border border-[var(--band-line)] bg-[var(--band-card)] p-6 sm:p-8 lg:grid-cols-[3.5rem_1fr_1fr] lg:gap-8">
            <span
              className="lx-display text-[2.6rem] font-semibold italic leading-none text-[var(--lx-green)] opacity-50"
              aria-hidden="true"
            >
              {step.n}
            </span>
            <div>
              <h3 className="lx-display text-xl font-semibold text-[var(--band-ink)] sm:text-2xl">
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
              className={`overflow-hidden rounded-[20px] border bg-[var(--band-card)] transition-colors duration-300 ${
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
                    className="lx-display shrink-0 text-2xl font-semibold italic leading-none text-[var(--lx-green)] opacity-60"
                    aria-hidden="true"
                  >
                    {item.n}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="lx-display block text-lg font-semibold text-[var(--band-ink)] sm:text-xl">
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
          <li className="flex h-full items-baseline gap-4 rounded-[14px] border border-[var(--band-line)] bg-[var(--band-card)] p-4">
            <span
              className="lx-display shrink-0 text-lg font-semibold italic text-[var(--lx-green)] opacity-60"
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

/* ── 6. Glass cards — only over .lx-band-deep ────────────────────────────────
   The deep field plus blur *is* the depth treatment, which is how we get a
   photographic-feeling band with no photograph. */

export function GlassCards({ items }: { items: { label: string; body: string }[] }) {
  return (
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {items.map((item, i) => (
        <Reveal key={item.label} delay={i * 0.07}>
          <div className="lx-glass h-full rounded-[20px] p-6">
            <div className="mb-4 h-px w-12 bg-[var(--lx-sage)]" aria-hidden="true" />
            <h3 className="lx-display text-lg font-semibold text-[var(--band-ink)]">
              {item.label}
            </h3>
            <p className="mt-2 leading-[1.75] text-[var(--band-muted)]">{item.body}</p>
          </div>
        </Reveal>
      ))}
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
}: {
  children: ReactNode
  attribution: string
  role: string
  asHeading?: boolean
}) {
  const Inner = asHeading ? 'h1' : 'div'
  return (
    <Reveal className="mx-auto max-w-3xl">
      <figure>
        <blockquote className="lx-display text-balance text-[clamp(1.35rem,3vw,2rem)] font-medium leading-[1.45] text-[var(--band-ink)]">
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

/* ── 11. Disclosure list (FAQ) — native <details>, zero JS ──────────────────── */

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

/* Motion helper for a hovering arrow link. */
export function ArrowLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <motion.a
      href={href}
      whileHover="hover"
      className="lx-focus group inline-flex min-h-11 items-center gap-2 font-semibold text-[var(--band-ink)]"
    >
      <span className="underline underline-offset-4">{children}</span>
      <motion.span aria-hidden="true" variants={{ hover: { x: 4 } }}>
        →
      </motion.span>
    </motion.a>
  )
}
