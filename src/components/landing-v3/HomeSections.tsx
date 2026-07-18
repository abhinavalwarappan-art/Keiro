'use client'

/* The homepage below the hero.

   Spine: marquee -> thesis -> expandable steps -> split(chat mock) -> deep glass
   band -> split(report mock) -> clinics strip. No archetype repeats back to back,
   and the ground changes under almost every one. */

import Link from 'next/link'
import {
  Band,
  BandHeading,
  Accent,
  Thesis,
  ExpandableSteps,
  PromiseLedger,
  LanguageMarquee,
  Split,
  ArrowLink,
} from './Sections'
import { ChatMock, ReportMock, VoiceMock, ChipRow } from './ChatMock'
import { Reveal } from './Reveal'
import { MotionLink } from './MotionLink'
import { Kai } from '@/components/kai/Kai'

/* Marquee — the "logo strip" slot, filled with scripts instead of hospitals. */
export function LanguageStrip() {
  return (
    <div className="lx-band lx-band-cream border-y border-[var(--band-line)] py-6">
      <p className="lx-label mb-4 text-center text-xs text-[var(--lx-muted)]">
        Kai holds the conversation in
      </p>
      <LanguageMarquee />
    </div>
  )
}

/* Why this exists — the 67M line, as a statement rather than a stat card. */
export function WhyBand() {
  return (
    <Band palette="mint">
      <Thesis
        statement={
          <>
            About 67 million people in this country speak a language other than English at home. Many
            of them sit in a waiting room rehearsing how to say where it hurts, and{' '}
            <Accent>still walk out unsure they were understood.</Accent>
          </>
        }
        body="That is the whole reason Keiro exists. Not to replace your doctor. To make sure the person in front of them actually gets heard."
      />
    </Band>
  )
}

/* The three steps, click-to-expand. First one opens by default so it never reads
   as a row of closed doors. */
export function StepsBand() {
  return (
    <Band palette="cream" id="how-it-works">
      <BandHeading lede="Open a step to see exactly what happens in it. You can stop at any point, and nothing is sent anywhere until you say so.">
        Here is exactly what will happen. <Accent>No surprises.</Accent>
      </BandHeading>

      <div className="mt-10">
        <ExpandableSteps
          items={[
            {
              n: '01',
              title: 'You talk. Kai listens.',
              summary: 'In your language. Out loud, or typed. About five minutes.',
              detail: (
                <div className="grid gap-5 lg:grid-cols-2 lg:items-center">
                  <div>
                    <p className="leading-[1.85] text-[var(--band-muted)]">
                      Pick the language you use at home, then say what hurts. There is no form to
                      fill in and no question you have to answer in a particular order. If it is
                      easier to speak than to type, speak.
                    </p>
                    <div className="mt-4">
                      <ChipRow
                        items={[
                          'Chest pain',
                          'Fever',
                          'A fall',
                          'Medication',
                          'Something else',
                          'I am not sure',
                        ]}
                      />
                    </div>
                  </div>
                  <VoiceMock />
                </div>
              ),
            },
            {
              n: '02',
              title: 'Kai writes it down.',
              summary: 'Turned into clear clinical notes, without changing what you meant.',
              detail: (
                <div className="grid gap-5 lg:grid-cols-2 lg:items-center">
                  <div>
                    <p className="leading-[1.85] text-[var(--band-muted)]">
                      Kai asks the follow-up questions a good nurse would ask. When something is
                      unclear it asks you about it rather than writing down a confident guess. That
                      is the difference between an intake companion and a translation app.
                    </p>
                    <p className="mt-4 leading-[1.85] text-[var(--band-muted)]">
                      Kai never diagnoses, never scores you, and never decides anything about your
                      care.
                    </p>
                  </div>
                  <ChatMock />
                </div>
              ),
            },
            {
              n: '03',
              title: 'Your doctor reads it first.',
              summary: 'The visit starts further along than it would have.',
              detail: (
                <div className="grid gap-5 lg:grid-cols-2 lg:items-center">
                  <div>
                    <p className="leading-[1.85] text-[var(--band-muted)]">
                      Before you sit down, your doctor already knows why you came. You do not have to
                      start the story over in a language you are still finding.
                    </p>
                    <p className="mt-4 leading-[1.85] text-[var(--band-muted)]">
                      You read the summary before anyone else does. If it is wrong, it goes no
                      further.
                    </p>
                  </div>
                  <ReportMock />
                </div>
              ),
            },
          ]}
        />
      </div>
    </Band>
  )
}

/* Meet Kai — split, with the mascot as punctuation rather than the picture. */
export function MeetKaiBand() {
  return (
    <Band palette="mint" id="meet-kai">
      <Split
        media={
          <div className="flex justify-center">
            <div className="lx-kai-stage p-8">
              <div className="lx-breathe">
                <Kai size="xl" state="waving" interactive />
              </div>
            </div>
          </div>
        }
        flip
      >
        <BandHeading lede="Kai is the one who sits with you before the doctor comes in. Not a form. Not a phone tree. Someone who speaks the way you do.">
          Kai will wait <Accent>as long as you need.</Accent>
        </BandHeading>

        <ul className="mt-8 space-y-5">
          {[
            {
              t: 'I will wait.',
              b: 'Say it twice, change your mind, start over. I will not rush you and I will not sigh.',
            },
            {
              t: 'I will not judge you.',
              b: 'Nothing you tell me goes anywhere except the summary your doctor reads.',
            },
            {
              t: 'I will not pretend to be a person.',
              b: 'If you ask, I will tell you plainly that I am an AI. You have a right to know who you are talking to.',
            },
          ].map((item, i) => (
            <Reveal as="li" key={item.t} delay={i * 0.07}>
              <h3 className="lx-title text-[var(--band-ink)]">{item.t}</h3>
              <p className="mt-1 leading-[1.75] text-[var(--band-muted)]">{item.b}</p>
            </Reveal>
          ))}
        </ul>

        <div className="mt-8">
          <ArrowLink href="/meet-kai">More about Kai</ArrowLink>
        </div>
      </Split>
    </Band>
  )
}

/* The deep band — this page's one chromatic section, and its emotional peak.

   Its job is to say the uncomfortable things. It used to say them in three small
   frosted cards, which is the same shape five other pages were using, and which
   sized the most load-bearing promises on the site like a feature list.

   They are not features. They are refusals, and refusals want scale: full-width
   ruled rows, display type, and nothing else competing. The single-column form of
   PromiseLedger exists for exactly this. */
export function TrustBand() {
  return (
    <Band palette="deep" flow="glow">
      <BandHeading lede="A tool that asks frightened people to say private things owes them a plain account of what it does with them. So here it is, before you start rather than after.">
        What Kai will <Accent>never</Accent> do.
      </BandHeading>

      <div className="mt-12">
        <PromiseLedger
          never={[
            {
              t: 'Never diagnose you.',
              b: 'Not carefully, not with a disclaimer. Kai has no ability to tell you what is wrong or how serious it is. Your doctor does that.',
            },
            {
              t: 'Never keep your conversation.',
              b: 'What you say to Kai is not saved to our servers. Use it as a guest, which is the default, and we store nothing about you at all.',
            },
            {
              t: 'Never sell anything you said.',
              b: 'Not to advertisers, not to data brokers, not to insurers. There is no business model here that requires knowing about your health.',
            },
          ]}
        />
      </div>

      <Reveal className="mt-10">
        <ArrowLink href="/privacy-safety">
          Read the whole thing, including what we have not done
        </ArrowLink>
      </Reveal>
    </Band>
  )
}

/* Clinics — small, late, and quarantined from the patient narrative. */
export function ClinicsStrip() {
  return (
    <Band palette="cream" id="for-clinics">
      <div className="flex flex-col gap-6 rounded-[16px] border border-[var(--band-line)] bg-[var(--band-card)] p-6 sm:p-8 md:flex-row md:items-center md:justify-between">
        <div className="max-w-xl">
          <p className="lx-label text-xs text-[var(--lx-muted)]">
            For clinics
          </p>
          <h2 className="lx-title mt-3 text-xl text-[var(--lx-ink)] sm:text-2xl">
            Your patient arrives <Accent>already understood.</Accent>
          </h2>
          <p className="mt-3 leading-[1.8] text-[var(--lx-muted)]">
            A clear English summary before the visit starts. No interpreter to schedule, nothing to
            install, and Kai never diagnoses or triages.
          </p>
        </div>
        <Link
          href="/for-clinics"
          className="lx-focus inline-flex min-h-12 shrink-0 items-center justify-center rounded-full border border-[var(--lx-ink)] px-6 font-semibold text-[var(--lx-ink)] transition-colors duration-200 hover:bg-[var(--lx-mint)]"
        >
          Keiro for clinics
        </Link>
      </div>
    </Band>
  )
}

/* Close. */
export function HomeCta() {
  return (
    <Band palette="mint">
      <Reveal className="mx-auto flex max-w-2xl flex-col items-center gap-5 text-center">
        <Kai size="sm" state="waving" />
        <h2 className="lx-heading text-balance text-[clamp(1.6rem,4vw,2.4rem)] text-[var(--lx-ink)]">
          Whenever you&apos;re ready. <Accent>There&apos;s no rush.</Accent>
        </h2>
        <p className="text-lg leading-[1.8] text-[var(--lx-muted)]">
          Free. No account. Nothing to fill in first.
        </p>
        <MotionLink href="/onboarding?fresh=1">Start talking to Kai</MotionLink>
      </Reveal>
    </Band>
  )
}
