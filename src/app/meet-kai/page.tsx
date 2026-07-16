import type { Metadata } from 'next'
import { SiteShell } from '@/components/landing-v3/SiteShell'
import { PageHero, CtaBand } from '@/components/landing-v3/PageBits'
import {
  Band,
  BandHeading,
  Accent,
  Thesis,
  Split,
  PromiseLedger,
  Prose,
  Para,
  QaColumns,
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
      'Kai is the one who sits with you before the doctor comes in, in your language, at your pace.',
  },
}

/* Spine: hero -> split/mascot(mint) -> index grid of promises(cream)
          -> glass "what Kai is NOT"(DEEP) -> thesis(mint) -> faq(cream) */
export default function MeetKaiPage() {
  return (
    <SiteShell flow="kai">
      <PageHero
        flow
        variant="split"
        eyebrow="Meet Kai"
        title="Kai will wait as long as you need."
        lede="Kai is the one who sits with you before the doctor comes in. Not a form. Not a phone tree. Someone who speaks the way you do."
        media={
          <div className="flex justify-center">
            <div className="lx-kai-stage p-8">
              <div className="lx-breathe">
                <Kai size="xl" state="waving" interactive />
              </div>
            </div>
          </div>
        }
      />

      <Band palette="mint">
        <BandHeading lede="We wrote Kai to behave like the best nurse you have ever met: unhurried, unbothered, and impossible to embarrass.">
          Personality first. <Accent>Capability second.</Accent>
        </BandHeading>
        <Prose>
          <Para>
            Everything on this page is a promise about behaviour, not a feature. A mascot that does
            not change how the software talks to you is just a sticker.
          </Para>
          <Para>
            Kai has one job, to help you say what you came to say, and it is built without the
            ability to do anything else.
          </Para>
        </Prose>
      </Band>

      {/* The promises and the limits, in one section and in facing columns.

          They were two: a numbered grid of "I will…" on a cream band, then three
          frosted cards of "Not a doctor / not a triage system" on a dark one —
          both of them archetypes that four other pages were also running. But
          they are two halves of a single bargain, and the promise only means
          anything next to the refusal. Side by side, in Kai's own voice, this is
          the section nobody else on the site can have. */}
      <Band palette="deep" flow="glow">
        <BandHeading lede="This is the whole bargain, and it is the most important thing on the page — which is why it is not in the footnotes.">
          What Kai promises, <Accent>and what Kai refuses.</Accent>
        </BandHeading>

        <div className="mt-12">
          <PromiseLedger
            will={[
              {
                t: 'I will wait.',
                b: 'Take as long as you need. Say it twice, change your mind, start over. I will not rush you and I will not sigh.',
              },
              {
                t: 'I will listen however you like.',
                b: 'Speak out loud, or type if that is easier, and switch whenever you want.',
              },
              {
                t: 'I will ask, not assume.',
                b: 'If something you said is unclear, I will ask about it rather than write down a confident guess.',
              },
              {
                t: 'I will not judge you.',
                b: 'Not about what you drink, what you smoke, how long you waited, or what you are frightened of.',
              },
              {
                t: 'I will not make you repeat yourself.',
                b: 'Tell me once, and your doctor gets it in writing.',
              },
              {
                t: 'I will tell you I am an AI.',
                b: 'Every time you ask. You have an absolute right to know who you are talking to.',
              },
            ]}
            never={[
              {
                t: 'I will never diagnose you.',
                b: 'Not carefully, not with a disclaimer. I will not prescribe anything and I will not decide a single thing about your care. I am built without the ability to.',
              },
              {
                t: 'I will never triage you.',
                b: 'I do not score you, rank you, or decide how urgent you are. Those belong to a clinician who can examine you.',
              },
              {
                t: 'I will never claim to be a person.',
                b: 'I will not say I am a nurse, a doctor, or a human being — and if you ask, I will say so plainly.',
              },
            ]}
          />
        </div>

        <Reveal className="mt-12">
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
                Kai is built on a large language model. What makes it different is not the model.{' '}
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

      <Band palette="cream" rails>
        <BandHeading>
          Questions people <Accent>actually ask.</Accent>
        </BandHeading>
        <div className="mt-10">
          <QaColumns
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
                a: 'You read the summary before anyone else does. If it is wrong, you can correct it or simply not send it. Kai also asks follow-up questions rather than guessing, but it is not perfect, which is exactly why you get the final say.',
              },
              {
                q: 'Can I use it for my mother or father?',
                a: 'Yes, and many people do. You can sit with them and help while they talk. Nothing about Keiro assumes the patient is the one holding the phone.',
              },
              {
                q: 'Does my doctor have to use Keiro too?',
                a: 'No. The summary is just clear written English. No account, no app, no setup on their side.',
              },
            ]}
          />
        </div>
      </Band>

      {/* Mint, not deep. The PromiseLedger band is now this page's one dark
          section, and a second one would spend the contrast twice. */}
      <CtaBand
        palette="mint"
        title="Kai is ready when you are."
        body="Free, no account, and you can stop at any point."
      />
    </SiteShell>
  )
}
