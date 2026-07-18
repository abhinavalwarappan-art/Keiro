import type { Metadata } from 'next'
import { LANGUAGES } from '@/lib/languages'
import { SiteShell } from '@/components/landing-v3/SiteShell'
import { PageHero, A } from '@/components/landing-v3/PageBits'
import { Band, BandHeading, RunHead, Accent, Thesis, StatCards, GlassCards, Faq, Prose, Para } from '@/components/landing-v3/Sections'
import { ContactForm } from '@/components/landing-v3/ContactForm'
import { SpecimenSection } from '@/components/landing-v3/pages/for-clinics/SpecimenSection'
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

/* THE SPECIMEN REPORT (DESIGN.md §7.6). The page IS the document a clinician
   receives: it sits sticky beside the pitch, lighting up region by region as
   each claim scrolls past. Then the concrete zeros, the limits stated plainly
   on the deep plate, an honest ask, and a way to reach us. */
export default function ForClinicsPage() {
  return (
    <SiteShell flow="clinics">
      <PageHero
        flow
        eyebrow="For clinics"
        title="Your patient arrives already understood."
        lede="Keiro is free for patients and always will be. This page is for the people on the other side of the desk — here is exactly what your clinicians receive."
      />

      <Band palette="cream" rails>
        <BandHeading
          folio="01 · The document"
          lede="Not a transcript — a structured intake summary in clear English, organised the way a clinician expects to read one. No integration, no procurement, no account for your staff."
        >
          Not a transcript. <Accent>A summary.</Accent>
        </BandHeading>
        <div className="mt-12">
          <SpecimenSection />
        </div>
      </Band>

      {/* The zeros are the pitch — zero setup, zero cost — set as a ruled ledger
          strip so each figure reads as a claim, not a bare numeral. */}
      <Band palette="mint">
        <BandHeading
          folio="02 · What it changes"
          lede="No pilot agreement, no procurement cycle, no line item."
        >
          What it changes, <Accent>concretely.</Accent>
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

      <Band palette="deep">
        <BandHeading
          folio="03 · The limits"
          lede="We would rather you hear the limits from us than discover them in a pilot."
        >
          What Keiro <Accent>is not</Accent>, from your side of the desk.
        </BandHeading>
        <div className="mt-12">
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

        <Reveal className="mt-10">
          <p className="max-w-2xl leading-[1.85] text-[var(--band-muted)]">
            Read{' '}
            <a
              href="/privacy-safety"
              className="lx-focus font-semibold text-[var(--lx-deep-mint)] underline underline-offset-4"
            >
              privacy &amp; safety
            </a>{' '}
            before anything else, particularly the section on what we have not done.
          </p>
        </Reveal>
      </Band>

      <Band palette="mint">
        <Reveal>
          <RunHead folio="04 · One ask" />
        </Reveal>
        <div className="mt-6">
          <Thesis
            statement={
              <>
                If you are a clinician who would be willing to review what Kai is allowed to say,{' '}
                <Accent>that is the most useful thing anyone could offer this project.</Accent>
              </>
            }
            body="Not a pilot, not a purchase order. An hour of a clinician's judgement about where the guardrails should sit."
          />
        </div>
      </Band>

      <Band palette="cream" id="demo">
        <BandHeading
          folio="05 · Talk to us"
          lede="Tell us who you are and we will get back to you. If you want to pilot it, we will set that up with you directly."
        >
          Talk to <Accent>us.</Accent>
        </BandHeading>
        <Reveal className="mt-8">
          <div className="max-w-2xl">
            <ContactForm />
          </div>
        </Reveal>
      </Band>

      <Band palette="mint" rails>
        <BandHeading folio="06 · Questions clinics ask">
          Questions clinics <Accent>ask.</Accent>
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

        <Prose>
          <Para>
            More on the technology in <A href="/how-it-works">how it works</A>.
          </Para>
        </Prose>
      </Band>
    </SiteShell>
  )
}
