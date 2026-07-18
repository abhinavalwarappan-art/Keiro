'use client'

/* THE SPLIT LEDGER — the homepage below the hero (DESIGN.md §7.1).

   The page is a clinical ledger: a specimen band proving the scripts, then the
   method as folio-headed rows docking to a 1px spine (each an asymmetric
   copy/artifact pair with a FIG. caption), Kai introduced as a split, the
   uncomfortable promises spent on the one deep plate, and a single ruled row
   handing off to clinics. No archetype repeats back to back. */

import type { ReactNode } from 'react'
import {
  Band,
  BandHeading,
  Accent,
  RunHead,
  Thesis,
  PromiseLedger,
  LanguageMarquee,
  Split,
  ArrowLink,
} from './Sections'
import { ChatMock, ReportMock, VoiceMock } from './ChatMock'
import { Reveal } from './Reveal'
import { Kai } from '@/components/kai/Kai'

/* ── The specimen band — the scripts ARE the proof ──────────────────────────
   Where a SaaS site puts a client-logo strip, Keiro sets a wall of greetings
   in their own scripts. Static (the marquee is retired), ruled, annotated. */
export function SpecimenBand() {
  return (
    <Band palette="cream">
      <RunHead folio="01 · The proof" meta="45 languages, in their own script" />
      <p className="mt-6 max-w-2xl text-pretty text-lg leading-[1.75] text-[var(--band-muted)]">
        Not a translated menu. Kai holds the whole conversation — including its follow-up
        questions — in the language you think in.
      </p>
      <div className="mt-8">
        <LanguageMarquee />
      </div>
    </Band>
  )
}

/* ── Why this exists — the 67M line, as a statement rather than a stat card ── */
export function WhyBand() {
  return (
    <Band palette="mint">
      <RunHead folio="02 · Why Keiro" />
      <div className="mt-12">
        <Thesis
          statement={
            <>
              About 67 million people in this country speak a language other than English at home.
              Many of them sit in a waiting room rehearsing how to say where it hurts, and{' '}
              <Accent>still walk out unsure they were understood.</Accent>
            </>
          }
          body="That is the whole reason Keiro exists. Not to replace your doctor — to make sure the person in front of them actually gets heard."
        />
      </div>
    </Band>
  )
}

/* ── The method — three rows docking to a spine ─────────────────────────────
   Each row: a folio (01 SPEAK / 02 ASK / 03 HAND OFF), copy, and a real
   product fragment staged in a registration-marked frame with a FIG. caption.
   The rows alternate sides, so the spine reads as a document being filled in
   rather than a stack of feature blocks. */

function MethodRow({
  folio,
  fig,
  title,
  children,
  artifact,
  flip = false,
}: {
  folio: string
  fig: string
  title: ReactNode
  children: ReactNode
  artifact: ReactNode
  flip?: boolean
}) {
  return (
    <Reveal
      as="li"
      className="grid items-center gap-8 border-b border-[var(--band-line)] py-10 last:border-b-0 lg:grid-cols-2 lg:gap-16 lg:py-14"
    >
      <div className={flip ? 'lg:order-2' : ''}>
        <RunHead folio={folio} />
        <h3 className="lx-heading mt-6 text-[clamp(1.4rem,2.6vw,1.9rem)] text-[var(--band-ink)]">
          {title}
        </h3>
        <p className="mt-4 max-w-prose text-lg leading-[1.8] text-[var(--band-muted)]">{children}</p>
      </div>
      <figure className={`min-w-0 ${flip ? 'lg:order-1' : ''}`}>
        <div className="lx-regmark">{artifact}</div>
        <figcaption className="lx-label mt-5 text-[0.625rem] text-[var(--band-muted)]">
          {fig}
        </figcaption>
      </figure>
    </Reveal>
  )
}

export function MethodBand() {
  return (
    <Band palette="cream" id="how-it-works" rails>
      <BandHeading
        folio="03 · The method"
        lede="Three steps, about five minutes. You can stop at any point, and nothing is sent anywhere until you say so."
      >
        Here is exactly what will happen. <Accent>No surprises.</Accent>
      </BandHeading>

      <ol className="mt-12 border-t border-[var(--band-line-strong)]">
        <MethodRow
          folio="01 · Speak"
          fig="FIG. 1 — VOICE INPUT, IN YOUR LANGUAGE"
          title="You talk. Kai listens."
          artifact={<VoiceMock />}
        >
          Pick the language you use at home, then say what hurts — out loud, or typed if you prefer.
          Out loud, or typed. About five minutes. There is no form to fill in and no question you
          have to answer in a set order.
        </MethodRow>

        <MethodRow
          folio="02 · Ask"
          fig="FIG. 2 — KAI ASKS THE FOLLOW-UP"
          title="Kai writes it down."
          artifact={<ChatMock />}
          flip
        >
          Kai asks the follow-up questions a good nurse would ask, and checks anything unclear
          instead of writing a confident guess. Kai never diagnoses, never scores you, and never
          decides anything about your care.
        </MethodRow>

        <MethodRow
          folio="03 · Hand off"
          fig="FIG. 3 — WHAT YOUR DOCTOR RECEIVES"
          title="Your doctor reads it first."
          artifact={<ReportMock />}
        >
          Before you sit down, your doctor already knows why you came, in clear English. You read the
          summary before anyone else does. If it is wrong, it goes no further.
        </MethodRow>
      </ol>
    </Band>
  )
}

/* ── Meet Kai — the mascot as punctuation, on a 5/7 split ───────────────────── */
export function MeetKaiBand() {
  return (
    <Band palette="mint" id="meet-kai">
      <RunHead folio="04 · Who is Kai" />
      <div className="mt-12">
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

          <ul className="mt-8 border-t border-[var(--band-line)]">
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
              <Reveal
                as="li"
                key={item.t}
                delay={i * 0.07}
                className="border-b border-[var(--band-line)] py-4"
              >
                <h3 className="lx-title text-[var(--band-ink)]">{item.t}</h3>
                <p className="mt-1 leading-[1.75] text-[var(--band-muted)]">{item.b}</p>
              </Reveal>
            ))}
          </ul>

          <div className="mt-8">
            <ArrowLink href="/meet-kai">More about Kai</ArrowLink>
          </div>
        </Split>
      </div>
    </Band>
  )
}

/* ── The deep plate — this page's one chromatic surface, its emotional peak ───
   The uncomfortable things, said at scale rather than in a row of small cards.
   Refusals want display type and full-width rules, which is what the
   single-column PromiseLedger gives them. */
export function TrustBand() {
  return (
    <Band palette="deep">
      <BandHeading
        folio="05 · What Kai will never do"
        lede="A tool that asks frightened people to say private things owes them a plain account of what it does with them. So here it is, before you start rather than after."
      >
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

/* ── Clinics — one ruled row, late and quarantined from the patient narrative ── */
export function ClinicsRow() {
  return (
    <Band palette="cream" id="for-clinics">
      <RunHead folio="06 · For clinics" />
      <Reveal className="mt-8 grid gap-6 border-t border-[var(--band-line-strong)] pt-8 lg:grid-cols-[1.4fr_1fr] lg:items-center lg:gap-16">
        <div className="max-w-xl">
          <h2 className="lx-heading text-[clamp(1.5rem,3vw,2.1rem)] text-[var(--lx-ink)]">
            Your patient arrives <Accent>already understood.</Accent>
          </h2>
          <p className="mt-4 text-lg leading-[1.8] text-[var(--lx-muted)]">
            A clear English summary before the visit starts. No interpreter to schedule, nothing to
            install, and Kai never diagnoses or triages.
          </p>
          <div className="mt-6">
            <ArrowLink href="/for-clinics">See what a clinician receives</ArrowLink>
          </div>
        </div>
        <div className="min-w-0">
          <div className="lx-regmark">
            <ReportMock />
          </div>
          <p className="lx-label mt-5 text-[0.625rem] text-[var(--lx-muted)]">
            FIG. — THE INTAKE SUMMARY, ENGLISH
          </p>
        </div>
      </Reveal>
    </Band>
  )
}
