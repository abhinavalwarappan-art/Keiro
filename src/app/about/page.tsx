import type { Metadata } from 'next'
import { LANGUAGES } from '@/lib/languages'
import { SiteShell } from '@/components/landing-v3/SiteShell'

import {
  Band,
  BandHeading,
  Accent,
  Thesis,
  StatRow,
  IndexGrid,
  Split,
  Quote,
  Prose,
  Para,
} from '@/components/landing-v3/Sections'
import { ChatMock } from '@/components/landing-v3/ChatMock'

export const metadata: Metadata = {
  title: 'Our mission',
  description:
    'About 67 million people in the United States speak a language other than English at home. Keiro exists so that none of them has to walk into a doctor’s office and hope they are understood.',
  openGraph: {
    title: 'Why Keiro exists',
    description:
      '67 million people in the US speak a language other than English at home. Keiro exists so none of them has to hope they are understood.',
  },
}

/* Spine: opens on a THESIS with no page hero at all — deliberately the only page
   that does — then stats -> quote(deep, glowing) -> split -> index grid.

   Register: this page uses <Accent> (italic serif, green) and never <GradWord>.
   /accessibility does the opposite. Holding one emphasis register per page is
   what stops every heading on the site reading as the same heading. */
export default function AboutPage() {
  return (
    <SiteShell flow="mission">
      <Band palette="cream" flow="hero" className="!border-t-0 pt-16 md:pt-24">
        {/* Same measure as the Thesis below, so eyebrow and headline share a left edge. */}
        <p className="lx-label mx-auto max-w-4xl text-xs text-[var(--lx-ink)]">
          Our mission
        </p>
        <div className="mt-6">
          <Thesis
            serif
            as="h1"
            statement={
              <>
                Medicine asks you to describe a feeling you do not have words for in your first
                language. Then it asks you to do it again, precisely, under fluorescent light,{' '}
                <Accent>while you are frightened.</Accent>
              </>
            }
            body="Keiro exists so that being understood does not depend on which language you happen to speak."
          />
        </div>
      </Band>

      <Band palette="mint" rails>
        <BandHeading lede="These are not marketing numbers. They are the reason the project exists.">
          The gap, <Accent>in figures.</Accent>
        </BandHeading>
        <div className="mt-10">
          <StatRow
            stats={[
              {
                value: 67,
                suffix: 'M',
                label: 'people in the US',
                note: 'speak a language other than English at home. Roughly one in five.',
              },
              {
                value: LANGUAGES.length,
                label: 'languages Kai speaks',
                note: 'a real conversation in each, not a translated menu.',
              },
              {
                value: 0,
                suffix: '',
                label: 'dollars, for patients',
                note: 'free permanently. The moment you need a card, we have rebuilt the barrier.',
              },
              {
                value: 0,
                suffix: '',
                label: 'accounts required',
                note: 'no email, no password, no confirmation link before you can speak.',
              },
            ]}
          />
        </div>
      </Band>

      {/* The one dark, colour-flooded section on the page, at the emotional peak.
          Stripe's whole homepage is near-white with exactly one of these, and that
          restraint is the entire effect — the green is saved up and spent once. */}
      <Band palette="deep" flow="glow">
        <Quote attribution="The whole thesis" role="in one sentence">
          The gap is not between languages. It is between what a person can feel and{' '}
          <Accent>what they are able to say to the one person who could help.</Accent>
        </Quote>
      </Band>

      <Band palette="cream">
        <Split media={<ChatMock />}>
          <BandHeading lede="Keiro is not trying to replace your doctor, and it is not trying to be a hospital system’s software.">
            What we are <Accent>actually building.</Accent>
          </BandHeading>
          <Prose>
            <Para>
              It is a companion for the twenty minutes before the visit, the part where you sit in a
              waiting room and rehearse.
            </Para>
            <Para>
              You talk to Kai in the language you think in. Kai listens, asks the follow-up questions
              a good nurse would ask, and writes it down in clear English for the person about to
              treat you. That is the whole product, and we have been deliberate about not adding
              more.
            </Para>
          </Prose>
        </Split>
      </Band>

      <Band palette="deep">
        <BandHeading lede="Some of these cost us things. We are keeping them anyway.">
          The rules we gave <Accent>ourselves.</Accent>
        </BandHeading>
        <div className="mt-10">
          <IndexGrid
            items={[
              {
                n: '01',
                label:
                  'Free for patients, permanently. The moment a person reaches for a card to explain their symptoms, we have rebuilt the barrier we set out to remove.',
              },
              {
                n: '02',
                label:
                  'No account before you can speak. Asking someone to register before they may say where it hurts is a small cruelty dressed up as onboarding.',
              },
              {
                n: '03',
                label:
                  'Kai never diagnoses. Not once, not carefully, not with a disclaimer. Kai helps you say what you feel; your doctor decides what it means.',
              },
              {
                n: '04',
                label:
                  'Nothing you say gets sold. Not to advertisers, not to data brokers, not to insurers. See privacy & safety.',
              },
              {
                n: '05',
                label:
                  'We build for the person least comfortable using it: older, on a cheap phone, nervous. If it does not work for her, it does not work.',
              },
              {
                n: '06',
                label:
                  'We say what we have not done. No clinical review, no validation study, no certification, all stated plainly rather than discovered in diligence.',
              },
            ]}
          />
        </div>

        <p className="mt-8 max-w-2xl leading-[1.85] text-[var(--band-muted)]">
          More on the last two in{' '}
          <a
            href="/accessibility"
            className="lx-focus font-semibold text-[var(--lx-sage)] underline underline-offset-4"
          >
            accessibility
          </a>{' '}
          and{' '}
          <a
            href="/privacy-safety"
            className="lx-focus font-semibold text-[var(--lx-sage)] underline underline-offset-4"
          >
            privacy &amp; safety
          </a>
          .
        </p>
      </Band>

    </SiteShell>
  )
}
