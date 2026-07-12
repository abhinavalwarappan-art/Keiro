import type { Metadata } from 'next'
import { SiteShell } from '@/components/landing-v3/SiteShell'
import { PageHero, CtaBand, A } from '@/components/landing-v3/PageBits'
import {
  Band,
  BandHeading,
  Accent,
  Thesis,
  NumberedSteps,
  LandscapeRows,
  Split,
  Prose,
  Para,
  QaColumns,
} from '@/components/landing-v3/Sections'
import { ChatMock, ReportMock, VoiceMock, ChipRow, SpecList } from '@/components/landing-v3/ChatMock'

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

/* Spine: hero -> thesis(mint) -> numbered steps w/ bespoke payloads(cream)
          -> glass "what exists today"(DEEP) -> split/tech(mint) -> faq(cream) */
export default function HowItWorksPage() {
  return (
    <SiteShell flow="how">
      <PageHero
        flow
        eyebrow="How it works"
        title="You should not have to find the English word for your own pain."
        lede="Keiro sits in the twenty minutes before your appointment, the part where you are rehearsing, in a language you are still learning, how to explain what is wrong."
      />

      <Band palette="mint">
        <Thesis
          statement={
            <>
              When a patient and a doctor do not share a language, things go wrong quietly. Symptoms
              described in the wrong words. Instructions half-understood. A person nodding because
              nodding is easier than <Accent>asking the nurse to slow down again.</Accent>
            </>
          }
          body="And the worst outcome is the one nobody records: the person who does not come in at all, because the appointment feels harder than the symptom."
        />
      </Band>

      <Band palette="cream">
        <BandHeading lede="Three steps, and you can stop after any of them.">
          What actually happens, <Accent>start to finish.</Accent>
        </BandHeading>

        <div className="mt-10">
          <NumberedSteps
            steps={[
              {
                n: '01',
                title: 'You talk. Kai listens.',
                body: 'Pick the language you use at home, then say what hurts. Out loud, or typed if you prefer. There is no form. Most people take about five minutes.',
                payload: <VoiceMock />,
              },
              {
                n: '02',
                title: 'Kai asks, rather than assumes.',
                body: 'When something is unclear, Kai asks you about it instead of writing down a confident guess. That single behaviour is the difference between an intake companion and a translation app.',
                payload: <ChatMock />,
              },
              {
                n: '03',
                title: 'Your doctor reads it first.',
                body: 'Before you sit down, your doctor already knows why you came. You read the summary before they do. If it is wrong, it goes no further.',
                payload: <ReportMock />,
              },
            ]}
          />
        </div>
      </Band>

      {/* Not cards. Every one of these options genuinely gives the patient
          something, and every one runs out somewhere — and the whole argument of
          the section is the gap between those two facts. A card collapses them
          into one grey paragraph; facing columns keep them in tension. */}
      <Band palette="deep" flow="glow">
        <BandHeading lede="None of this is because clinics do not care. It is because the tools available to them are thin.">
          The help that exists, <Accent>and where it runs out.</Accent>
        </BandHeading>

        <div className="mt-12">
          <LandscapeRows
            rows={[
              {
                option: 'A professional interpreter',
                gives: 'The right answer, when you can get one. A trained person who carries your meaning, not just your words.',
                runsOut:
                  'Expensive, booked out, and rarely standing in the room at the moment you actually need to say something.',
              },
              {
                option: 'The phone line',
                gives: 'Someone qualified, eventually, without anyone having to travel to you.',
                runsOut:
                  'You are handed a receiver and put on hold. By the time someone picks up, the doctor has moved on.',
              },
              {
                option: 'A family member',
                gives: 'Somebody who is already there, already trusted, and free.',
                runsOut:
                  'Often a child. A ten-year-old should not be asked to say the word for “bleeding”, or to hear a diagnosis first and pass it on.',
              },
              {
                option: 'A translation app',
                gives: 'Instant, free, and in your pocket. It will convert the words you type.',
                runsOut:
                  'It does not know that “my chest is heavy” is worth three more questions, and it hands your doctor nothing they can read.',
              },
              {
                option: 'Filling in a form',
                gives: 'Something written down, in the order a clinic wants to read it.',
                runsOut:
                  'Forms assume you already know the medical word for what you feel. That assumption is the entire problem, restated as a text field.',
              },
              {
                option: 'Hoping for the best',
                gives: 'Nothing. It is what most people fall back on anyway.',
                runsOut:
                  'It ends with people not coming in at all — and that is the outcome nobody records.',
              },
            ]}
          />
        </div>
      </Band>

      <Band palette="mint">
        <Split
          media={
            <SpecList
              rows={[
                { k: 'Your voice', v: 'Transcribed, then discarded' },
                { k: 'Your words', v: 'Read by a language model' },
                { k: 'The questions', v: 'Chosen from what you said' },
                { k: 'The output', v: 'A written English summary' },
                { k: 'The diagnosis', v: 'None. That is your doctor.' },
              ]}
            />
          }
        >
          <BandHeading lede="You do not need to understand any of this to use Keiro. But you are entitled to know what happens to your words, so here it is without the jargon.">
            The technology, <Accent>in plain words.</Accent>
          </BandHeading>

          <Prose>
            <Para>
              When you speak, your voice becomes text, the same way the dictation button on your
              phone works. That text goes to a language model: a program that has read an enormous
              amount of writing and is good at understanding what people mean, not just what they
              said.
            </Para>
            <Para>
              It replies in your language, and it decides what to ask next based on what you have
              already told it. At the end, the conversation is condensed into a structured summary in
              English: the sections a clinician expects, in the order they expect them.
            </Para>
            <Para>
              That is the whole trick. No diagnosis engine, no scoring, no algorithm deciding
              anything about your care. Kai is a very good listener with very good handwriting. The
              limits we put on it are spelled out in{' '}
              <A href="/privacy-safety">privacy &amp; safety</A>.
            </Para>
          </Prose>

          <div className="mt-6">
            <ChipRow items={['Speech → text', 'Language model', 'Follow-up questions', 'Summary']} />
          </div>
        </Split>
      </Band>

      {/* Open, not an accordion. These are not objections a sceptic is scanning
          for — they are the four things nobody bothers to tell you. Hiding them
          behind a chevron on a page whose entire job is explanation would be
          absurd. See QaColumns in Sections.tsx. */}
      <Band palette="cream" rails>
        <BandHeading>
          The part nobody explains: <Accent>what happens after.</Accent>
        </BandHeading>
        <div className="mt-10">
          <QaColumns
            items={[
              {
                q: 'What do I actually walk away with?',
                a: 'A summary you can read. You can bring it with you, or send it ahead. You can also decide not to send it at all. Nothing goes anywhere until you say so.',
              },
              {
                q: 'Does my doctor need an account?',
                a: 'No. The summary is just clear written English. Your doctor reads it the way they would read any other note. Nothing to install, nothing to sign up for.',
              },
              {
                q: 'What if I change my mind halfway through?',
                a: 'Then you stop. Closing the tab is a complete and acceptable way to leave, and there is nothing to cancel.',
              },
              {
                q: 'How long does it take?',
                a: 'Most people take about five minutes. There is no timer, and nothing bad happens if you take twenty.',
              },
            ]}
          />
        </div>
      </Band>

      <CtaBand />
    </SiteShell>
  )
}
