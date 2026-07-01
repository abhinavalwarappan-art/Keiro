'use client'

import { Mic, ScanLine, FileHeart } from 'lucide-react'
import { Reveal } from './Reveal'

const STEPS = [
  {
    n: '01',
    Icon: Mic,
    title: 'You speak. In your own words.',
    body: 'Describe what hurts the way you would to family — by voice or text, in any of 25 languages. Or photograph a lab result, a prescription, a discharge note. Kai listens without rushing you.',
  },
  {
    n: '02',
    Icon: ScanLine,
    title: 'Kai interprets, then double-checks.',
    body: 'It restructures what you said into precise clinical language, flags anything urgent, and asks the follow-up questions a good triage nurse would — so nothing important slips through.',
  },
  {
    n: '03',
    Icon: FileHeart,
    title: 'Your doctor reads it in theirs.',
    body: 'A clean, professional intake report lands in your provider\'s language before you even sit down. The conversation starts at minute one, not minute fifteen.',
  },
]

export function HowItWorks() {
  return (
    <section id="how" className="relative border-t border-[var(--line)] py-28 md:py-36">
      <div className="mx-auto grid max-w-[1240px] grid-cols-1 gap-14 px-6 md:px-10 lg:grid-cols-[0.4fr_0.6fr]">
        {/* Left — sticky section heading (40%) */}
        <div className="lg:sticky lg:top-28 lg:self-start">
          <span className="kx-mono text-[0.72rem] uppercase tracking-[0.22em] text-[var(--amber)]">
            The flow
          </span>
          <h2 className="kx-serif mt-5 text-[clamp(2.6rem,1.4rem+4vw,4.2rem)] text-[var(--fg)]">
            Three steps.
            <br />
            <span className="kx-serif-italic text-[var(--fg-2)]">No forms.</span>
          </h2>
          <p className="mt-6 max-w-[24rem] text-[1.02rem] leading-relaxed text-[var(--fg-2)]">
            From the first word to the doctor&apos;s desk, Keiro removes the part of
            healthcare where meaning gets lost.
          </p>
        </div>

        {/* Right — the steps as editorial rows (60%) */}
        <Reveal className="flex flex-col" stagger={0.12}>
          {STEPS.map(({ n, Icon, title, body }, i) => (
            <div
              key={n}
              className={`kx-reveal grid grid-cols-[auto_1fr] gap-6 py-9 md:gap-9 ${
                i !== 0 ? 'border-t border-[var(--line)]' : ''
              }`}
            >
              <div className="flex flex-col items-center gap-4">
                <span className="kx-mono text-[0.8rem] tracking-[0.1em] text-[var(--amber)]">{n}</span>
                <span
                  aria-hidden
                  className="flex h-12 w-12 items-center justify-center rounded-full border border-[var(--line-strong)] bg-white/[0.02] text-[var(--amber-soft)]"
                >
                  <Icon className="h-5 w-5" strokeWidth={1.6} />
                </span>
                {i !== STEPS.length - 1 && (
                  <span className="h-full w-px flex-1 bg-gradient-to-b from-[var(--line-strong)] to-transparent" />
                )}
              </div>

              <div className="pt-0.5">
                <h3 className="kx-serif text-[clamp(1.7rem,1.2rem+1.4vw,2.4rem)] text-[var(--fg)]">
                  {title}
                </h3>
                <p className="mt-3 max-w-[34rem] text-[1.02rem] leading-relaxed text-[var(--fg-2)]">
                  {body}
                </p>
              </div>
            </div>
          ))}
        </Reveal>
      </div>
    </section>
  )
}