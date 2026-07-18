import type { Metadata } from 'next'
import { LANGUAGES } from '@/lib/languages'
import { SiteShell } from '@/components/landing-v3/SiteShell'
import { Accent } from '@/components/landing-v3/Sections'
import { Reveal } from '@/components/landing-v3/Reveal'
import { A } from '@/components/landing-v3/PageBits'
import {
  FootnoteMark,
  LetterPara,
  LetterPassage,
  MarginFigure,
  MarginRules,
} from '@/components/landing-v3/pages/about/Letter'

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

/* THE EDITORIAL LETTER (DESIGN.md §7.5) — one paper plane end to end, zero
   cards, zero band alternation. The mission prose is rewritten as a
   first-person letter in the left ~60% column; the figures that used to sit in
   a stat band (67M · 45 · $0) and the six rules are demoted to footnote-style
   mono annotations in the right margin, tied to their sentences by hairline
   ticks and numbered footnote marks. The page opens on the letter itself —
   the running head + h1 ARE the hero — and closes on a signature line.

   Register: <Accent> only, never <GradWord> (one emphasis register per page). */
export default function AboutPage() {
  return (
    <SiteShell flow="mission">
      <article className="lx-band-cream relative overflow-hidden px-5 pb-24 pt-10 sm:px-8 sm:pt-14 md:pt-16 lg:px-10 lg:pb-32">
        {/* The page's single daylight wash, behind the letter's opening only. */}
        <div className="lx-daylight" aria-hidden="true" />

        <div className="lx-above mx-auto max-w-6xl">
          <Reveal>
            <div className="lx-runhead">
              <p className="lx-label text-xs text-[var(--lx-ink)]">Our mission</p>
              <p className="lx-label hidden text-xs text-[var(--lx-muted)] sm:block" aria-hidden="true">
                A letter, not a pitch
              </p>
            </div>
            <h1 className="lx-display mt-10 max-w-4xl text-balance text-[clamp(2rem,4.6vw,3.1rem)] text-[var(--lx-ink)]">
              We started Keiro for everyone who has rehearsed <Accent>being sick</Accent> in a
              second language.
            </h1>
          </Reveal>

          <div className="mt-16 flex flex-col gap-14 md:mt-20 md:gap-16">
            <LetterPassage>
              <LetterPara initial>
                Medicine asks a lot of the people it serves. It asks you to describe a feeling you
                do not quite have words for in your first language — and then to do it again,
                precisely, under fluorescent light, while you are frightened. If English is not the
                language you think in, that room gets harder still, and nobody hands you extra
                time.
              </LetterPara>
            </LetterPassage>

            <LetterPassage
              margin={
                <MarginFigure
                  index="1"
                  label="The gap"
                  figure="67M"
                  note="people in the US speak a language other than English at home. Roughly one in five."
                />
              }
            >
              <LetterPara>
                About 67 million people in the United States speak a language other than English at
                home.
                <FootnoteMark n="1" /> Roughly one in five. That is not an edge case and it is not
                a niche — it is a fifth of every waiting room in the country, quietly hoping the
                words come out right.
              </LetterPara>
            </LetterPassage>

            <LetterPassage
              margin={
                <MarginFigure
                  index="2"
                  label="The languages"
                  figure={LANGUAGES.length}
                  note="languages Kai speaks. A real conversation in each, not a translated menu."
                />
              }
            >
              <LetterPara>
                So we built a companion for the twenty minutes before the visit — the part where
                you sit in a waiting room and rehearse. You talk to Kai in the language you think
                in.
                <FootnoteMark n="2" /> Kai listens, asks the follow-up questions a good nurse would
                ask, and writes it down in clear English for the person about to treat you. That is
                the whole product, and we have been deliberate about not adding more.
              </LetterPara>
              <LetterPara>
                Keiro is not trying to replace your doctor, and it is not trying to be a hospital
                system&rsquo;s software. The gap we care about is smaller and older than either:
                the space between what a person can feel and what they are able to say to the one
                person who could help.
              </LetterPara>
            </LetterPassage>

            <LetterPassage
              margin={
                <MarginFigure
                  index="3"
                  label="The price"
                  figure="$0"
                  note="for patients, permanently — and zero accounts: no email, no password, no confirmation link before you can speak."
                />
              }
            >
              <LetterPara>
                None of it costs anything, and none of it ever will.
                <FootnoteMark n="3" /> No card, no account, no email, no password, no confirmation
                link before you may say where it hurts. The moment we ask for any of those first,
                we have rebuilt the exact barrier we set out to remove.
              </LetterPara>
            </LetterPassage>

            <LetterPassage
              margin={
                <MarginRules
                  heading={
                    <>
                      <span className="text-[var(--lx-green-ink)]">Note 4</span> · The rules we
                      gave ourselves
                    </>
                  }
                  items={[
                    {
                      n: '01',
                      lead: 'Free for patients, permanently.',
                      body: 'The moment a person reaches for a card to explain their symptoms, we have rebuilt the barrier we set out to remove.',
                    },
                    {
                      n: '02',
                      lead: 'No account before you can speak.',
                      body: 'Asking someone to register before they may say where it hurts is a small cruelty dressed up as onboarding.',
                    },
                    {
                      n: '03',
                      lead: 'Kai never diagnoses.',
                      body: 'Not once, not carefully, not with a disclaimer. Kai helps you say what you feel; your doctor decides what it means.',
                    },
                    {
                      n: '04',
                      lead: 'Nothing you say gets sold.',
                      body: (
                        <>
                          Not to advertisers, not to data brokers, not to insurers. See{' '}
                          <A href="/privacy-safety">privacy &amp; safety</A>.
                        </>
                      ),
                    },
                    {
                      n: '05',
                      lead: 'We build for the person least comfortable using it:',
                      body: 'older, on a cheap phone, nervous. If it does not work for her, it does not work.',
                    },
                    {
                      n: '06',
                      lead: 'We say what we have not done.',
                      body: 'No clinical review, no validation study, no certification, all stated plainly rather than discovered in diligence.',
                    },
                  ]}
                />
              }
            >
              <LetterPara>
                Early on, we wrote ourselves some rules
                <FootnoteMark n="4" /> — the kind you write down while you still mean them, so they
                hold later, when they start to cost something. They are printed in the margin of
                this letter, numbered, where we cannot quietly edit them away. Some of them have
                already cost us things. We are keeping them anyway.
              </LetterPara>
              <LetterPara>
                The last two live in public. What we have measured is on the{' '}
                <A href="/accessibility">accessibility</A> page; what we have not yet done is
                stated plainly in <A href="/privacy-safety">privacy &amp; safety</A>. If you read
                one more page of this site, make it one of those.
              </LetterPara>
            </LetterPassage>
          </div>

          <Reveal className="mt-20 max-w-[42rem]">
            <span aria-hidden="true" className="block h-[2px] w-12 bg-[var(--lx-green-fill)]" />
            <p className="lx-serif mt-9 text-pretty text-[clamp(1.35rem,2.4vw,1.7rem)] text-[var(--lx-ink)]">
              If someone you love has ever rehearsed a sentence outside an exam room, send them
              here. That is who this was built for.
            </p>
            <p className="mt-8 text-lg leading-[1.9] text-[var(--lx-body)]">
              — the people building Keiro
            </p>
          </Reveal>

          <div className="lx-runhead mt-20">
            <p className="lx-label text-[0.6875rem] text-[var(--lx-muted)]">Our mission · end</p>
            <p
              className="lx-label hidden text-[0.6875rem] text-[var(--lx-muted)] sm:block"
              aria-hidden="true"
            >
              Keiro · intake, in your language
            </p>
          </div>
        </div>
      </article>
    </SiteShell>
  )
}
