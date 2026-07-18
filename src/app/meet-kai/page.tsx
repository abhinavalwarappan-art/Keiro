import type { Metadata } from 'next'
import { LANGUAGES } from '@/lib/languages'
import { SiteShell } from '@/components/landing-v3/SiteShell'
import { PageHero, CtaBand, A } from '@/components/landing-v3/PageBits'
import {
  Band,
  BandHeading,
  Accent,
  Thesis,
  RunHead,
  ArrowLink,
} from '@/components/landing-v3/Sections'
import {
  Portrait,
  Dossier,
  DossierRow,
  DossierAnswer,
  WillList,
  RefusalList,
  Interview,
} from '@/components/landing-v3/pages/meet-kai/CaseFile'

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

/* THE CASE FILE (DESIGN.md §7.4) — the site's one centered layout.
   Spine: centered hero + portrait frame → the dossier (cream, rails):
   NAME / ROLE / SPEAKS / WILL / WILL NOT / IN AN EMERGENCY as ruled rows
   → the fence (the page's one deep plate) → the interview (mint) → CtaBand.
   The WILL NOT rows carry the amber signal mono: the limits are the most
   visually distinct copy on the page, never the footnotes. */
export default function MeetKaiPage() {
  return (
    <SiteShell flow="kai">
      <PageHero
        flow
        variant="centered"
        eyebrow="Meet Kai"
        title="Kai will wait as long as you need."
        lede="Kai is the one who sits with you before the doctor comes in. Not a form. Not a phone tree. Someone who speaks the way you do."
        footer={<Portrait />}
      />

      <Band palette="cream" rails>
        <div className="mx-auto max-w-3xl">
          <BandHeading
            folio="01 · THE FILE"
            meta="IN KAI'S OWN WORDS"
            lede="We wrote Kai to behave like the best nurse you have ever met: unhurried, unbothered, and impossible to embarrass. Here is the file, row by row."
          >
            Personality first. <Accent>Capability second.</Accent>
          </BandHeading>

          <div className="mt-12">
            <Dossier>
              <DossierRow label="Name">
                <DossierAnswer lead="Kai. Just Kai.">
                  No surname, no title. Titles belong to people who can treat you, and I am not one
                  of them.
                </DossierAnswer>
              </DossierRow>

              <DossierRow label="Role" delay={0.06}>
                <DossierAnswer lead="I sit with you before the doctor comes in.">
                  I listen, I ask until I understand, and I write down what you said so your doctor
                  can read it. That is the whole job.
                </DossierAnswer>
              </DossierRow>

              <DossierRow label="Speaks" delay={0.12}>
                <DossierAnswer lead={`${LANGUAGES.length} languages.`}>
                  Whichever one you think in. Speak out loud or type it — you never have to
                  translate yourself for me.
                </DossierAnswer>
              </DossierRow>

              <DossierRow label="Will" tone="will">
                <WillList
                  items={[
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
                />
              </DossierRow>

              <DossierRow label="Will not" tone="signal">
                <RefusalList
                  items={[
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
              </DossierRow>

              <DossierRow label="In an emergency" tone="signal">
                <p className="max-w-[58ch] text-lg leading-[1.75] text-[var(--band-body)]">
                  If you are in danger right now, I am the wrong tool and I will say so.{' '}
                  <A href="/emergency">Get emergency help</A> or call your local emergency number.
                </p>
              </DossierRow>
            </Dossier>
          </div>
        </div>
      </Band>

      {/* The page's one deep plate: why the file above can be trusted. */}
      <Band palette="deep">
        <div className="mx-auto max-w-3xl">
          <RunHead folio="02 · THE FENCE" meta="WHY THE PROMISES HOLD" />
          <div className="mt-12">
            <Thesis
              statement={
                <>
                  Kai is built on a large language model. What makes it different is not the model.{' '}
                  <Accent>it is the fence we build around it.</Accent>
                </>
              }
              body="A narrow job (collect an intake history), a narrow set of things it may say, and an explicit list of things it must never say. It stays inside that fence for the whole conversation."
            />
            <div className="mt-9">
              <ArrowLink href="/how-it-works">See the whole pipeline, without jargon</ArrowLink>
            </div>
          </div>
        </div>
      </Band>

      <Band palette="mint">
        <div className="mx-auto max-w-3xl">
          <BandHeading
            folio="03 · THE INTERVIEW"
            meta="FIVE QUESTIONS"
            lede="Put to Kai directly, answered in the first person."
          >
            Questions people <Accent>actually ask.</Accent>
          </BandHeading>
          <div className="mt-12">
            <Interview
              items={[
                {
                  q: 'Are you a real person?',
                  lead: 'No.',
                  body: 'I am a computer program, and I will tell you so if you ask. I am designed never to pretend otherwise.',
                },
                {
                  q: 'Will you tell me what is wrong with me?',
                  lead: 'No — and it is on purpose.',
                  body: 'I have no ability to diagnose. I collect what you say and hand it to your doctor, who is the one qualified to work out what it means.',
                },
                {
                  q: 'What if you misunderstand me?',
                  lead: 'You get the final say.',
                  body: 'You read the summary before anyone else does. If it is wrong, you can correct it or simply not send it. I ask follow-up questions rather than guessing, but I am not perfect — which is exactly why the last word is yours.',
                },
                {
                  q: 'Can I use you for my mother or father?',
                  lead: 'Yes — many people do.',
                  body: 'You can sit with them and help while they talk. Nothing about Keiro assumes the patient is the one holding the phone.',
                },
                {
                  q: 'Does my doctor have to use Keiro too?',
                  lead: 'No. Nothing changes for them.',
                  body: 'The summary is just clear written English. No account, no app, no setup on their side.',
                },
              ]}
            />
          </div>
        </div>
      </Band>

      {/* Mint, not deep: the fence plate above is this page's one dark section,
          and a second one would spend the contrast twice. */}
      <CtaBand
        palette="mint"
        title="Kai is ready when you are."
        body="Free, no account, and you can stop at any point."
      />
    </SiteShell>
  )
}
