'use client'

/* The specimen report, annotated (DESIGN.md §7.6).

   The clinician's document sits sticky in the right column of a two-up grid
   while the claims scroll past on the left; each claim carries a mono anchor
   label (SEVERITY, MEDS, FLAGS…), and as it enters the viewport it lights the
   matching region of the report with a wash sweep. The sync is class-toggle
   driven by IntersectionObserver — never scroll-position-linked animation — and
   degrades to a plain, fully-legible document when JS or motion is off. */

import { useEffect, useRef, useState } from 'react'
import { Reveal } from '../../Reveal'
import { ReportSpecimen, type ReportRegion } from './ReportSpecimen'

type Claim = {
  anchor: string
  region: ReportRegion
  title: string
  body: string
}

const CLAIMS: Claim[] = [
  {
    anchor: 'Complaint',
    region: 'complaint',
    title: 'The history is already taken.',
    body: 'What lands with your team is a structured summary in clear English, organised the way a clinician expects to read one. The visit starts further along than it otherwise would.',
  },
  {
    anchor: 'History',
    region: 'history',
    title: 'In the patient’s own words, translated.',
    body: 'Kai asks the follow-up questions a good nurse would ask — onset, triggers, what relieves it — and writes down what the patient meant, not a word-for-word transliteration.',
  },
  {
    anchor: 'Associated',
    region: 'associated',
    title: 'What was asked, and what was not there.',
    body: 'A clean negative is worth as much as a positive. When the patient says there is no shortness of breath, that is recorded as an answer, not an absence.',
  },
  {
    anchor: 'Meds',
    region: 'meds',
    title: 'Medications and allergies, up front.',
    body: 'The things you would ask in the first thirty seconds are already on the page, so the thirty seconds go to something else.',
  },
  {
    anchor: 'Flags',
    region: 'flags',
    title: 'Noted for your attention — never assessed.',
    body: 'Kai flags what a clinician should see and stops there. It does not diagnose, triage, score or risk-stratify. The judgement stays entirely yours.',
  },
  {
    anchor: 'Language',
    region: 'language',
    title: 'And which language it came in.',
    body: 'The summary is English; the conversation was not. Your clinician knows the intake was taken in the patient’s own language, so nothing was lost to a missing interpreter.',
  },
]

export function SpecimenSection() {
  const [active, setActive] = useState<ReportRegion | null>('complaint')
  const refs = useRef<Map<ReportRegion, HTMLElement>>(new Map())

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActive(entry.target.getAttribute('data-region') as ReportRegion)
          }
        }
      },
      { rootMargin: '-45% 0px -45% 0px', threshold: 0 }
    )
    refs.current.forEach((el) => observer.observe(el))
    return () => observer.disconnect()
  }, [])

  return (
    <div className="grid gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,26rem)] lg:gap-16">
      {/* Claims — scroll past on the left. */}
      <ol className="border-t border-[var(--band-line-strong)]">
        {CLAIMS.map((claim, i) => (
          <li
            key={claim.region}
            data-region={claim.region}
            ref={(el) => {
              if (el) refs.current.set(claim.region, el)
            }}
            className="border-b border-[var(--band-line)] py-10 lg:py-14"
          >
            <Reveal>
              <span className="lx-label text-[0.6rem] text-[var(--lx-green-ink)]">
                {String(i + 1).padStart(2, '0')} · {claim.anchor}
              </span>
              <h3 className="lx-heading mt-4 text-[clamp(1.35rem,2.4vw,1.8rem)] text-[var(--band-ink)]">
                {claim.title}
              </h3>
              <p className="mt-4 max-w-prose text-lg leading-[1.8] text-[var(--band-muted)]">
                {claim.body}
              </p>
            </Reveal>
          </li>
        ))}
      </ol>

      {/* The document — sticky beside the claims on desktop; a normal block that
          leads the section on mobile. */}
      <div className="order-first lg:order-none">
        <div className="lg:sticky lg:top-24">
          <ReportSpecimen active={active} />
          <p className="lx-label mt-5 text-[0.6rem] text-[var(--band-muted)]">
            FIG. — WHAT YOUR CLINICIAN RECEIVES · SAMPLE
          </p>
        </div>
      </div>
    </div>
  )
}
