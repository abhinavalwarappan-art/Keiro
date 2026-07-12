import type { Metadata } from 'next'
import { SiteShell } from '@/components/landing-v3/SiteShell'
import { PageHero, Section, P, PullQuote, Facts, CtaBand, A } from '@/components/landing-v3/PageBits'
import { steps } from '@/components/landing-v3/landingData'
import { Reveal } from '@/components/landing-v3/Reveal'

export const metadata: Metadata = {
  title: 'How it works',
  description:
    'What actually happens when you talk to Kai: you speak in your language, Kai writes it down in clear clinical English, and your doctor reads it before you sit down.',
  openGraph: {
    title: 'How Keiro works',
    description:
      'You speak in your language. Kai writes it down. Your doctor reads it before you sit down.',
  },
}

export default function HowItWorksPage() {
  return (
    <SiteShell>
      <PageHero
        eyebrow="How it works"
        title="You should not have to find the English word for your own pain."
        lede="Keiro sits in the twenty minutes before your appointment — the part where you are rehearsing, in a language you are still learning, how to explain what is wrong."
      />

      <Section title="What happens today, and why it hurts">
        <P>
          When a patient and a doctor do not share a language, things go wrong in ways that are
          quiet and serious. Symptoms get described in the wrong words, or not at all. Medication
          instructions get half-understood. A person nods because nodding is easier than asking
          the nurse to slow down for the fourth time.
        </P>
        <P>
          And often the worst outcome is the one nobody records: the person who does not come in
          at all. Who waits, and hopes it passes, because the appointment itself feels harder than
          the symptom.
        </P>

        <PullQuote>
          Nobody should have to borrow someone else&apos;s words to describe their own pain.
        </PullQuote>
      </Section>

      <Section title="The help that exists — and where it runs out" tinted>
        <P>
          None of this is because clinics do not care. It is because the tools are thin.
        </P>

        <Facts
          items={[
            {
              label: 'Professional interpreters',
              body: 'The right answer, when you can get one. They are expensive, they are booked, and they are rarely standing in the room at the moment you actually need to say something.',
            },
            {
              label: 'The phone line',
              body: 'You are handed a receiver and put on hold. By the time someone picks up, the doctor has moved on, and you are explaining your body to a stranger you cannot see.',
            },
            {
              label: 'A family member',
              body: 'Often a child. A ten-year-old should not be the one asked to say the word for “bleeding”, or to hear their mother’s diagnosis first and pass it on.',
            },
            {
              label: 'A translation app',
              body: 'It converts words. It does not know that “my chest is heavy” is worth asking three more questions about, and it does not hand your doctor anything they can read.',
            },
          ]}
        />
      </Section>

      <Section title="What Kai does instead">
        <P>
          Kai is not a translator with a medical dictionary bolted on. It is built for one specific
          twenty minutes: the intake conversation, before the visit.
        </P>

        <Facts
          items={[
            {
              label: 'It is there the moment you need it',
              body: 'No booking, no hold music. You open it in the waiting room, on the bus, or at your kitchen table the night before.',
            },
            {
              label: 'It asks follow-up questions',
              body: 'When you say something matters, Kai asks about it — the way a good nurse would. A translation app would just translate it and move on.',
            },
            {
              label: 'It produces something your doctor can read',
              body: 'Not a transcript. A clear, organised summary in English, so the person treating you starts the visit already knowing why you came.',
            },
            {
              label: 'It is free, and it always will be',
              body: 'No account. No card. No forms before you are allowed to start talking. If money were the barrier, we would just be another closed door.',
            },
          ]}
        />
      </Section>

      <Section title="Step by step" tinted>
        <ol className="space-y-8">
          {steps.map((step, i) => (
            <Reveal key={step.id} delay={i * 0.08}>
              <li className="grid gap-4 border-t border-[var(--lx-line)] pt-6 sm:grid-cols-[auto_1fr] sm:gap-7">
                <span
                  className="lx-display flex h-12 w-12 items-center justify-center rounded-full bg-white text-[var(--lx-ink)] ring-1 ring-[var(--lx-line)]"
                  aria-hidden="true"
                >
                  {step.id}
                </span>
                <div>
                  <h3 className="lx-display text-xl font-semibold text-[var(--lx-ink)]">
                    {step.title}
                  </h3>
                  <p className="mt-2 max-w-2xl leading-[1.85] text-[var(--lx-muted)]">
                    {step.body}
                  </p>
                </div>
              </li>
            </Reveal>
          ))}
        </ol>
      </Section>

      <Section title="The technology, in plain words">
        <P>
          You do not need to understand any of this to use Keiro. But you are entitled to know what
          is happening to your words, so here it is without the jargon.
        </P>
        <P>
          When you speak, your voice is turned into text — the same way the dictation button on
          your phone works. That text goes to a language model: a program that has read an enormous
          amount of writing and is good at understanding what people mean, not just what they said.
          It replies to you in your language, and it decides what to ask next based on what you have
          already told it.
        </P>
        <P>
          When you are done, that whole conversation is condensed into a structured summary in
          English — the sections a clinician expects, in the order they expect them. That summary is
          what your doctor sees.
        </P>
        <P>
          That is the entire trick. There is no diagnosis engine, no scoring, no algorithm deciding
          anything about your care. Kai is a very good listener with very good handwriting. Your
          doctor is still the doctor. We wrote more about the limits we put on Kai in{' '}
          <A href="/privacy-safety">privacy &amp; safety</A>.
        </P>
      </Section>

      <Section title="What happens after you talk to Kai" tinted>
        <P>
          The part people worry about is the part nobody explains, so: you finish the conversation,
          and you get a summary. You can read it. You can decide not to send it. Nothing goes
          anywhere until you say so.
        </P>
        <P>
          If you do send it, you bring it — or it goes ahead of you — to your appointment, and the
          visit starts somewhere further along than it would have. That is all. You can stop at any
          point in the conversation, and closing the tab is a complete and acceptable way to stop.
        </P>
      </Section>

      <CtaBand />
    </SiteShell>
  )
}
