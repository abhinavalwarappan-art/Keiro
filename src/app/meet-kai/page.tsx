import type { Metadata } from 'next'
import { SiteShell } from '@/components/landing-v3/SiteShell'
import { PageHero, CtaBand } from '@/components/landing-v3/PageBits'
import {
  Band,
  BandHeading,
  Accent,
  Thesis,
  Split,
  IndexGrid,
  GlassCards,
  Prose,
  Para,
  Faq,
  ArrowLink,
} from '@/components/landing-v3/Sections'
import { ChatMock } from '@/components/landing-v3/ChatMock'
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

/* Spine: hero -> split/mascot(mint) -> index grid of promises(cream)
          -> glass "what Kai is NOT"(DEEP) -> thesis(mint) -> faq(cream) */
export default function MeetKaiPage() {
  return (
    <SiteShell>
      <PageHero
        eyebrow="Meet Kai"
        title="Kai will wait as long as you need."
        lede="Kai is the one who sits with you before the doctor comes in. Not a form. Not a phone tree. Someone who speaks the way you do."
      />

      <Band palette="mint">
        <Split
          media={
            <div className="flex justify-center">
              <div className="lx-breathe">
                <Kai size="xl" state="waving" interactive />
              </div>
            </div>
          }
          flip
        >
          <BandHeading lede="We wrote Kai to behave like the best nurse you have ever met: unhurried, unbothered, and impossible to embarrass.">
            Personality first. <Accent>Capability second.</Accent>
          </BandHeading>
          <Prose>
            <Para>
              Everything on this page is a promise about behaviour, not a feature. A mascot that does
              not change how the software talks to you is just a sticker.
            </Para>
            <Para>
              Kai has one job — to help you say what you came to say — and it is built without the
              ability to do anything else.
            </Para>
          </Prose>
        </Split>
      </Band>

      <Band palette="cream">
        <BandHeading>
          What Kai <Accent>promises you.</Accent>
        </BandHeading>
        <div className="mt-10">
          <IndexGrid
            items={[
              {
                n: '01',
                label:
                  'I will wait. Take as long as you need. Say it twice, change your mind, start over. I will not rush you and I will not sigh.',
              },
              {
                n: '02',
                label:
                  'I will listen however you like. Speak out loud, or type if that is easier — and switch whenever you want.',
              },
              {
                n: '03',
                label:
                  'I will ask, not assume. If something you said is unclear, I will ask about it rather than write down a confident guess.',
              },
              {
                n: '04',
                label:
                  'I will not judge you. Not about what you drink, what you smoke, how long you waited, or what you are frightened of.',
              },
              {
                n: '05',
                label:
                  'I will not make you repeat yourself. Tell me once, and your doctor gets it in writing.',
              },
              {
                n: '06',
                label:
                  'I will tell you I am an AI. Every time you ask. You have an absolute right to know who you are talking to.',
              },
            ]}
          />
        </div>
      </Band>

      <Band palette="deep">
        <BandHeading lede="This is the most important section on the page, which is why it is not in the footnotes.">
          And here is <Accent>what Kai is not.</Accent>
        </BandHeading>
        <div className="mt-10">
          <GlassCards
            items={[
              {
                label: 'Not a doctor',
                body: 'Kai will not diagnose you, will not prescribe anything, and will not decide a single thing about your care. It is built without the ability to.',
              },
              {
                label: 'Not a triage system',
                body: 'It does not score you, rank you or decide how urgent you are. Those are decisions that belong to a clinician who can examine you.',
              },
              {
                label: 'Not a person',
                body: 'Kai will always say so plainly if you ask. It will never claim to be a nurse, a doctor, or a human being.',
              },
            ]}
          />
        </div>

        <Reveal className="mt-8">
          <p className="max-w-2xl leading-[1.85] text-[var(--band-muted)]">
            And if you are in danger right now, Kai is the wrong tool and will say so.{' '}
            <a
              href="/emergency"
              className="lx-focus font-semibold text-[var(--lx-sage)] underline underline-offset-4"
            >
              Get emergency help
            </a>{' '}
            or call your local emergency number.
          </p>
        </Reveal>
      </Band>

      <Band palette="mint">
        <Split media={<ChatMock />}>
          <Thesis
            statement={
              <>
                Kai is built on a large language model. What makes it different is not the model —{' '}
                <Accent>it is the fence we build around it.</Accent>
              </>
            }
            body="A narrow job (collect an intake history), a narrow set of things it may say, and an explicit list of things it must never say. It stays inside that fence for the whole conversation."
          />
          <div className="mt-6">
            <ArrowLink href="/how-it-works">See the whole pipeline, without jargon</ArrowLink>
          </div>
        </Split>
      </Band>

      <Band palette="cream">
        <BandHeading>
          Questions people <Accent>actually ask.</Accent>
        </BandHeading>
        <div className="mt-8">
          <Faq
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
                a: 'You read the summary before anyone else does. If it is wrong, you can correct it or simply not send it. Kai also asks follow-up questions rather than guessing — but it is not perfect, which is exactly why you get the final say.',
              },
              {
                q: 'Can I use it for my mother or father?',
                a: 'Yes, and many people do. You can sit with them and help while they talk. Nothing about Keiro assumes the patient is the one holding the phone.',
              },
              {
                q: 'Does my doctor have to use Keiro too?',
                a: 'No. The summary is just clear written English — no account, no app, no setup on their side.',
              },
            ]}
          />
        </div>
      </Band>

      <CtaBand
        palette="deep"
        title="Kai is ready when you are."
        body="Free, no account, and you can stop at any point."
      />
    </SiteShell>
  )
}
