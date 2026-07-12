import type { Metadata } from 'next'
import { LANGUAGES } from '@/lib/languages'
import { SiteShell } from '@/components/landing-v3/SiteShell'
import { PageHero, Section, P, Facts, QA, CtaBand, A } from '@/components/landing-v3/PageBits'
import { ContactForm } from '@/components/landing-v3/ContactForm'
import { Reveal } from '@/components/landing-v3/Reveal'

const COUNT = LANGUAGES.length

export const metadata: Metadata = {
  title: 'For clinics',
  description:
    'Your patient arrives already understood. Keiro hands your clinicians a clear English intake summary before the visit starts — no interpreter scheduling, no lost history.',
  openGraph: {
    title: 'Keiro for clinics',
    description: 'Your patient arrives already understood.',
  },
}

export default function ForClinicsPage() {
  return (
    <SiteShell>
      <PageHero
        eyebrow="For clinics"
        title="Your patient arrives already understood."
        lede="Keiro is free for patients and always will be. This page is for the people on the other side of the desk."
      />

      <Section title="What your clinicians get">
        <P>
          A patient talks to Kai before the appointment — in the waiting room, on the bus, or at
          home the night before. What lands with your team is not a transcript. It is a structured
          intake summary in clear English, organised the way a clinician expects to read one.
        </P>

        <Facts
          items={[
            {
              label: 'The visit starts further along',
              body: 'The history is already taken. Your clinician opens the room knowing why the patient came, instead of spending the first ten minutes finding out.',
            },
            {
              label: 'No interpreter scheduling',
              body: `For ${COUNT} languages, there is nothing to book and nobody to wait for. It does not replace an interpreter for the consultation itself — it means the intake no longer depends on one.`,
            },
            {
              label: 'Nothing to install',
              body: 'No integration, no procurement, no account for your staff. The summary is written English — your clinician reads it the way they read any other note.',
            },
            {
              label: 'The patient stays in control',
              body: 'They read the summary first and choose to share it. Nothing arrives that the patient did not agree to send.',
            },
          ]}
        />
      </Section>

      <Section title="What Keiro is not, from your side of the desk" tinted>
        <P>
          We would rather you hear the limits from us than discover them in a pilot.
        </P>
        <P>
          Kai does not diagnose, triage, score or risk-stratify. It produces no clinical
          recommendation of any kind, and it is not a decision-support tool. It takes a history and
          writes it down.
        </P>
        <P>
          Keiro is also not a HIPAA-covered service — it does not store patient conversations on its
          servers at all. If you are evaluating it seriously, read{' '}
          <A href="/privacy-safety">privacy &amp; safety</A> first, including the section on what we
          have not done. It names the gaps plainly, including the fact that Keiro has not been
          clinically reviewed or validated.
        </P>
        <P>
          If you are a clinician who would be willing to help change that, that is the single most
          useful thing anyone could offer this project right now.
        </P>
      </Section>

      <Section title="Talk to us" id="demo">
        <P>
          Tell us who you are and we will get back to you. If you want to pilot it, we will set that
          up with you directly.
        </P>
        <Reveal>
          <ContactForm />
        </Reveal>
      </Section>

      <Section title="Questions clinics ask" tinted>
        <QA
          items={[
            {
              q: 'What does it cost?',
              a: 'Nothing for patients, permanently. We are not currently charging clinics either — this is an early project and what we need most is real use and honest feedback, not revenue.',
            },
            {
              q: 'Does it integrate with our EHR?',
              a: 'No, and we are not going to pretend a pilot is a procurement. The output is written English that a clinician reads. If integration ever matters, that is a conversation to have after it has proven useful.',
            },
            {
              q: 'Who is liable if Kai gets something wrong?',
              a: 'Kai makes no clinical claims and takes no clinical decisions — it records what the patient said. The patient reviews the summary before it is shared, and your clinician reads it as a patient-reported history, exactly as they would treat anything the patient told them directly.',
            },
            {
              q: 'Has this been validated?',
              a: 'No. There is no clinical validation study and no certification. We say so plainly on the privacy & safety page, and we would rather you know that before a pilot than after one.',
            },
          ]}
        />
      </Section>

      <CtaBand
        title="Want to see what your clinicians would receive?"
        body="Talk to Kai yourself — it takes about five minutes, and you will end up looking at a real summary."
      />
    </SiteShell>
  )
}
