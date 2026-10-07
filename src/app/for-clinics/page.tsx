import type { Metadata } from 'next'
import { LANGUAGES } from '@/lib/languages'
import { SiteShell } from '@/components/landing-v3/SiteShell'
import { PageHero } from '@/components/landing-v3/PageBits'
import {
  Band,
  BandHeading,
  GradWord,
  Thesis,
  StatCards,
  GlassCards,
  Faq,
  Prose,
  Para,
} from '@/components/landing-v3/Sections'
import { ReportMock } from '@/components/landing-v3/ChatMock'
import { ContactForm } from '@/components/landing-v3/ContactForm'
import { Reveal } from '@/components/landing-v3/Reveal'

const COUNT = LANGUAGES.length

export const metadata: Metadata = {
  title: 'For clinics',
  description:
    'Your patient arrives already understood. Keiro hands your clinicians a clear English intake summary before the visit starts. No interpreter scheduling, no lost history.',
  openGraph: {
    title: 'Keiro for clinics',
    description: 'Your patient arrives already understood.',
  },
}

/* Spine: hero -> split/report mock(cream) -> stats(mint) -> glass "what it is
   NOT"(DEEP) -> thesis(mint) -> form(cream) -> faq(mint) */
export default function ForClinicsPage() {
  return (
    <SiteShell flow="clinics">
      <PageHero
        flow
        variant="split"
        eyebrow="For clinics"
        title="Your patient arrives already understood."
        lede="Keiro is free for patients and always will be. This page is for the people on the other side of the desk."
        media={<ReportMock />}
      />

      <Band palette="cream">
        <div className="max-w-3xl">
          <BandHeading lede="A patient talks to Kai before the appointment, in the waiting room, on the bus, or at home the night before.">
            Not a transcript. <GradWord>A summary.</GradWord>
          </BandHeading>
          <Prose>
            <Para>
              What lands with your team is a structured intake summary in clear English, organised
              the way a clinician expects to read one. The history is already taken, so the visit
              starts further along than it otherwise would.
            </Para>
            <Para>
              No integration, no procurement, no account for your staff. Your clinician reads it the
              way they read any other note.
            </Para>
          </Prose>
        </div>
      </Band>

      {/* The zeros are the pitch — zero setup, zero cost — so they have to look
          deliberate. As four huge bare numerals on hairlines they just read as a
          row of nothing, or worse, as a figure that failed to load. On cards, with
          the label carrying the claim and the currency sign making the price
          legible as a price, the same numbers finally say what they mean. */}
      <Band palette="mint" rails>
        <BandHeading lede="No pilot agreement, no procurement cycle, no line item.">
          What it changes, <GradWord>concretely</GradWord>.
        </BandHeading>
        <div className="mt-10">
          <StatCards
            stats={[
              {
                value: COUNT,
                label: 'Languages, no booking',
                note: 'Nothing to schedule and nobody to wait for at intake.',
              },
              {
                value: 5,
                suffix: ' min',
                label: 'Typical intake',
                note: 'Done before the patient sits down, not during your appointment slot.',
              },
              {
                value: 0,
                prefix: '$',
                label: 'Cost, to anyone',
                note: 'Free for patients permanently, and we are not charging clinics either.',
              },
              {
                value: 0,
                label: 'Setup for your staff',
                note: 'No integration, no procurement, no accounts to provision.',
              },
            ]}
          />
        </div>
      </Band>

      <Band palette="deep" flow="glow">
        <BandHeading lede="We would rather you hear the limits from us than discover them in a pilot.">
          What Keiro <GradWord>is not</GradWord>, from your side of the desk.
        </BandHeading>
        <div className="mt-10">
          <GlassCards
            items={[
              {
                label: 'Not decision support',
                body: 'Kai does not diagnose, triage, score or risk-stratify. It produces no clinical recommendation of any kind. It takes a history and writes it down.',
              },
              {
                label: 'Not a HIPAA-covered service',
                body: 'It does not store patient conversations on its servers at all. That is an architectural statement, not an accreditation.',
              },
              {
                label: 'Not clinically validated',
                body: 'No validation study, no certification, no clinician review. We say so plainly here rather than letting you find it in diligence.',
              },
            ]}
          />
        </div>

        <Reveal className="mt-8">
          <p className="max-w-2xl leading-[1.85] text-[var(--band-muted)]">
            Read{' '}
            <a
              href="/privacy-safety"
              className="lx-focus font-semibold text-[var(--lx-sage)] underline underline-offset-4"
            >
              privacy &amp; safety
            </a>{' '}
            before anything else, particularly the section on what we have not done.
          </p>
        </Reveal>
      </Band>

      <Band palette="mint">
        <Thesis
          statement={
            <>
              If you are a clinician who would be willing to review what Kai is allowed to say,{' '}
              <GradWord>that is the most useful thing anyone could offer this project.</GradWord>
            </>
          }
          body="Not a pilot, not a purchase order. An hour of a clinician's judgement about where the guardrails should sit."
        />
      </Band>

      <Band palette="cream" id="demo">
        <BandHeading lede="Tell us who you are and we will get back to you. If you want to pilot it, we will set that up with you directly.">
          Talk to <GradWord>us.</GradWord>
        </BandHeading>
        <Reveal>
          <div className="max-w-2xl">
            <ContactForm />
          </div>
        </Reveal>
      </Band>

      <Band palette="mint">
        <BandHeading>
          Questions clinics <GradWord>ask.</GradWord>
        </BandHeading>
        <div className="mt-8">
          <Faq
            items={[
              {
                q: 'What does it cost?',
                a: 'Nothing for patients, permanently. We are not currently charging clinics either. This is an early project and what we need most is real use and honest feedback, not revenue.',
              },
              {
                q: 'Does it integrate with our EHR?',
                a: 'No, and we are not going to pretend a pilot is a procurement. The output is written English that a clinician reads. If integration ever matters, that is a conversation to have after it has proven useful.',
              },
              {
                q: 'Who is liable if Kai gets something wrong?',
                a: 'Kai makes no clinical claims and takes no clinical decisions. It records what the patient said. The patient reviews the summary before it is shared, and your clinician reads it as a patient-reported history, exactly as they would treat anything the patient told them directly.',
              },
              {
                q: 'Has this been validated?',
                a: 'No. There is no clinical validation study and no certification. We would rather you know that before a pilot than after one.',
              },
              {
                q: 'Does it replace our interpreters?',
                a: 'No. It means the intake no longer depends on one being available at the exact moment a patient needs to speak. The consultation itself is still yours to staff.',
              },
            ]}
          />
        </div>
      </Band>

    </SiteShell>
  )
}
