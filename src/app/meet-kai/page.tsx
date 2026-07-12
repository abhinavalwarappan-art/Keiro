import type { Metadata } from 'next'
import { SiteShell } from '@/components/landing-v3/SiteShell'
import { PageHero, Section, P, PullQuote, Facts, QA, CtaBand, A } from '@/components/landing-v3/PageBits'
import { Reveal } from '@/components/landing-v3/Reveal'
import { Kai } from '@/components/kai/Kai'

export const metadata: Metadata = {
  title: 'Meet Kai',
  description:
    'Kai is the one who sits with you before the doctor comes in. Kai listens in your language, never diagnoses, always says it is an AI, and writes down what you said for your doctor.',
  openGraph: {
    title: 'Meet Kai',
    description:
      'Kai is the one who sits with you before the doctor comes in — in your language, at your pace.',
  },
}

export default function MeetKaiPage() {
  return (
    <SiteShell>
      <PageHero
        eyebrow="Meet Kai"
        title="Kai will wait as long as you need."
        lede="Kai is the one who sits with you before the doctor comes in. Not a form. Not a phone tree. Someone who speaks the way you do."
      />

      <Section>
        <Reveal className="flex justify-center pb-4">
          <Kai size="xl" state="waving" interactive />
        </Reveal>
      </Section>

      <Section title="What Kai is like" tinted>
        <P>
          We wrote Kai to behave like the best nurse you have ever met: unhurried, unbothered, and
          impossible to embarrass. Everything below is a promise about behaviour, not a feature.
        </P>

        <Facts
          items={[
            {
              label: 'I will wait.',
              body: 'Take as long as you need. Say it twice, change your mind, start over. I will not rush you and I will not sigh.',
            },
            {
              label: 'I will listen however you like.',
              body: 'Speak out loud, or type it if that is easier. Either way I am listening — and you can switch whenever you want.',
            },
            {
              label: 'I will ask, not assume.',
              body: 'If something you said is unclear, I will ask you about it. I would rather ask a plain question than write down a confident guess.',
            },
            {
              label: 'I will not judge you.',
              body: 'Not about what you drink, what you smoke, how long you waited, or what you are frightened of. None of it changes how I talk to you.',
            },
          ]}
        />
      </Section>

      <Section title="And here is what Kai is not">
        <P>
          This is the most important section on this page, so we have put it in the middle rather
          than the footnotes.
        </P>

        <PullQuote>
          Kai is not a doctor. Kai will not diagnose you, will not prescribe anything, and will not
          decide a single thing about your care.
        </PullQuote>

        <P>
          Kai does not tell you what is wrong with you. It does not tell you how serious it is. It
          does not tell you whether to go to hospital, and it does not score you, rank you or triage
          you. Those are decisions that belong to a clinician who can examine you, and Kai is
          deliberately built without the ability to make them.
        </P>
        <P>
          Kai will also always tell you it is an AI. If you ask, it says so plainly. It will never
          claim to be a person, a nurse or a doctor, because a frightened patient has an absolute
          right to know who they are talking to.
        </P>
        <P>
          And if you are in danger right now, Kai is the wrong tool and will say so.{' '}
          <A href="/emergency">Get emergency help</A> or call your local emergency number.
        </P>
      </Section>

      <Section title="How Kai actually works" tinted>
        <P>
          Kai is built on a large language model — the same broad family of technology behind the AI
          assistants you may have used. What makes Kai different is not the model. It is the
          fence we build around it.
        </P>
        <P>
          Kai is given a narrow job (collect an intake history), a narrow set of things it is
          allowed to say, and an explicit list of things it must never say — no diagnosis, no
          prognosis, no treatment advice, no pretending to be human. It stays inside that fence for
          the whole conversation.
        </P>
        <P>
          For voice, Kai uses your browser&apos;s own speech recognition where that works well, and
          falls back to a server-side transcription model for the languages browsers handle badly —
          which, unsurprisingly, tend to be exactly the languages our users speak. The
          <A href="/how-it-works"> how it works</A> page explains the whole pipeline without jargon.
        </P>
      </Section>

      <Section title="Questions people actually ask">
        <QA
          items={[
            {
              q: 'Is Kai a real person?',
              a: 'No. Kai is a computer program, and it will tell you so if you ask. It is designed never to pretend otherwise.',
            },
            {
              q: 'Will Kai tell me what is wrong with me?',
              a: 'No, and this is on purpose. Kai has no ability to diagnose. It collects what you say and hands it to your doctor, who is the one qualified to work out what it means.',
            },
            {
              q: 'What if Kai misunderstands me?',
              a: 'You get to read the summary before anyone else does. If it is wrong, you can correct it or simply not send it. Kai also asks follow-up questions when something is unclear, rather than guessing — but it is not perfect, which is exactly why you get the final say.',
            },
            {
              q: 'Can I use it for my mother or father?',
              a: 'Yes, and many people do. You can sit with them, and they can talk while you help. Nothing about it assumes the patient is the one holding the phone.',
            },
            {
              q: 'Does my doctor have to use Keiro too?',
              a: 'No. The summary is just clear written English. Your doctor does not need an account, an app, or any setup — they can read it the way they would read any other note.',
            },
          ]}
        />
      </Section>

      <CtaBand
        title="Kai is ready when you are."
        body="Free, no account, and you can stop at any point."
      />
    </SiteShell>
  )
}
