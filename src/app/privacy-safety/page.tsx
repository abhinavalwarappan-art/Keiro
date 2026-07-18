import type { Metadata } from 'next'
import { SiteShell } from '@/components/landing-v3/SiteShell'
import { PageHero, A } from '@/components/landing-v3/PageBits'
import { Band, BandHeading, RunHead, Faq, References, Prose, Para } from '@/components/landing-v3/Sections'
import { Reveal } from '@/components/landing-v3/Reveal'
import {
  Clause,
  SubClause,
  PlainWords,
  ClauseText,
} from '@/components/landing-v3/pages/privacy-safety/Clauses'

export const metadata: Metadata = {
  title: 'Privacy & safety',
  description:
    'What happens to what you tell Kai, in plain language: your conversation is never stored on our servers, Kai never diagnoses, and nothing you say is ever sold.',
  openGraph: {
    title: 'Privacy & safety at Keiro',
    description:
      'Your conversation is never stored on our servers. Kai never diagnoses. Nothing you say is ever sold.',
  },
}

/* THE CLAUSES (DESIGN.md §7.8). A legal document done honestly: numbered
   clauses hanging in a mono gutter, a plain-language restatement beside the
   ones that matter, the Google disclosure marked so it cannot be missed, and
   the things we have not done stated on the one deep plate. The sober page. */
export default function PrivacySafetyPage() {
  return (
    <SiteShell flow="privacy">
      <PageHero
        flow
        variant="document"
        eyebrow="Privacy & safety"
        title="You are about to tell a computer something private. Here is exactly what happens to it."
        lede="This is the plain-language version, written to be read rather than agreed to. The formal document is the privacy policy, and nothing here contradicts it."
      />

      <Band palette="cream" rails>
        <RunHead folio="The clauses" meta="Plain language" />
        <ol className="mt-8">
          <Clause n="1." title="The four that matter most">
            <ClauseText>If you read nothing else on this page, read these.</ClauseText>
            <SubClause n="1.1" title="Not stored">
              <p>
                What you say to Kai is not saved to our servers. Use Keiro as a guest, which is the
                default, and we store nothing about you at all.
              </p>
            </SubClause>
            <SubClause n="1.2" title="Never diagnoses">
              <p>
                Not carefully, not with a disclaimer. Kai has no ability to tell you what is wrong,
                or how serious it is.
              </p>
            </SubClause>
            <SubClause n="1.3" title="Never sold">
              <p>
                Not to advertisers, not to data brokers, not to insurers. No business model here
                needs to know about your health.
              </p>
            </SubClause>
            <SubClause n="1.4" title="No account">
              <p>
                Use the whole thing without telling us your name, email or phone number. The less we
                know, the less there is to protect.
              </p>
            </SubClause>
            <PlainWords>
              We store nothing about you, you never have to tell us who you are, Kai never diagnoses,
              and none of it is ever sold.
            </PlainWords>
          </Clause>

          <Clause n="2." title="Where your words go" flag="Read this before you start — not after">
            <div className="rounded-[4px] border-s-2 border-[var(--lx-signal-fill)] bg-[var(--lx-wash)] px-5 py-4">
              <p className="leading-[1.85] text-[var(--lx-body)]">
                If you would not be comfortable with what is below, please do not tell Kai anything
                you would not want kept. We would rather lose your visit than mislead you into it.
              </p>
            </div>
            <ClauseText>
              Kai is not magic and it does not run on our laptop. To understand you and answer you,
              your messages are sent to <strong className="text-[var(--band-ink)]">Google</strong>,
              whose Gemini model does the actual language work.
            </ClauseText>
            <ClauseText>
              Keiro uses Google&apos;s free API tier. On that tier, Google&apos;s own terms say it
              uses what you submit to improve its products, that human reviewers may read it, and
              that you should not send sensitive personal information through it at all
              <sup>
                <a href="#ref-1" className="lx-focus underline underline-offset-2">
                  1
                </a>
              </sup>
              . Your symptoms, your name and your date of birth go through it anyway, because that
              is what Kai needs to work. Paying Google for the API would stop the training and the
              human review. We have not done that yet, and you deserve to know it before you type.
            </ClauseText>
            <ClauseText>
              This is the single most important thing on this page, which is why it is not in the
              footnotes. The full list of every company that touches your data is in the{' '}
              <A href="/privacy">privacy policy</A>.
            </ClauseText>
            <PlainWords>
              Another company — Google — sees what you tell Kai, and on the free tier its terms let
              it use that and have people read it. We are telling you before you type, not after.
            </PlainWords>
          </Clause>

          <Clause n="3." title="The fence around Kai">
            <ClauseText>
              Safety here does not mean a warning banner. It means Kai is built without the ability
              to do the dangerous thing. Three layers, independent, so no single mistake gets
              through.
            </ClauseText>
            <SubClause n="3.1" title="A narrow job">
              <p>
                Kai is instructed to collect an intake history and nothing else. It is explicitly
                forbidden from diagnosing, giving a prognosis, recommending treatment, or claiming to
                be human. It is not a general-purpose chatbot that we pointed at medicine.
              </p>
            </SubClause>
            <SubClause n="3.2" title="An emergency exit">
              <p>
                If what you describe sounds like it cannot wait, Kai stops being an intake tool and
                tells you to seek emergency help immediately, rather than continuing to gather a tidy
                history while something serious is happening.
              </p>
            </SubClause>
            <SubClause n="3.3" title="You have the last word">
              <p>
                You read the summary before your doctor does. If Kai got you wrong, it goes no
                further. And every path through Keiro ends at a clinician. Kai is never the last
                thing between you and a decision about your body.
              </p>
            </SubClause>
          </Clause>
        </ol>
      </Band>

      {/* The one deep plate: what we have not done. */}
      <Band palette="deep">
        <ol>
          <Clause n="4." title="What we have not done">
            <ClauseText>
              Keiro has not been reviewed or certified by a medical professional. No clinical
              validation study, no FDA clearance, no safety certification.
            </ClauseText>
            <ClauseText>
              It is a young project, and we are not going to dress it up as something it is not.
              Because Keiro does not store health information on its servers, it is also not a
              HIPAA-covered service. That is a statement about our architecture, not a claim of
              accreditation.
            </ClauseText>
            <ClauseText>
              Getting genuine clinical review is the next thing we want to do. If you are a clinician
              who would help with that, it is the most useful thing anyone could offer this project.{' '}
              <A href="/contact">Please get in touch.</A>
            </ClauseText>
            <ClauseText>
              And if Kai says something it should not have, or behaves in a way that frightens you,
              tell us bluntly. A real person reads those.
            </ClauseText>
          </Clause>
        </ol>
      </Band>

      <Band palette="cream">
        <BandHeading folio="Questions a sceptic would ask">
          The questions a sceptic would ask.
        </BandHeading>
        <div className="mt-8">
          <Faq
            items={[
              {
                q: 'Is this HIPAA compliant?',
                a: 'Keiro is not a HIPAA-covered entity, because it does not store health information on its servers. Your conversation is never saved. That is an architectural answer, not a certification. If you are a clinic evaluating Keiro, read the section above before anything else.',
              },
              {
                q: 'So another company sees what I tell Kai?',
                a: 'Yes. Google does. Kai runs on Google’s Gemini model, and Keiro is on Google’s free API tier, where Google’s terms say it may use what you send to improve its products and that human reviewers may read it. Those same terms say not to send sensitive personal information on that tier, which is exactly what a symptom is. We put this in the middle of the page rather than the footnotes because you should decide with it in hand.',
              },
              {
                q: 'Can Kai be tricked into diagnosing me?',
                a: 'Kai is instructed never to, and it declines when asked. But it is a language model, and we will not claim it is impossible to push it off script. That is precisely why nothing Kai says is ever the final word, and why every path ends with a human clinician.',
              },
              {
                q: 'Will you sell my data if you run out of money?',
                a: 'No. There is no version of this where health conversations become a product. If Keiro cannot survive without doing that, Keiro should not survive.',
              },
              {
                q: 'What if I want everything deleted?',
                a: 'If you used Keiro as a guest, there is nothing to delete. We never had it. If you signed in, Settings → Delete all my data removes everything immediately, including your reports.',
              },
            ]}
          />
        </div>
      </Band>

      <Band palette="mint">
        <Reveal>
          <p className="lx-label text-xs text-[var(--band-muted)]">References</p>
        </Reveal>
        <div className="mt-6">
          <References
            items={[
              {
                id: '1',
                text: 'Google. Gemini API Additional Terms of Service. States that for the unpaid tier Google uses submitted content to improve its products, that human reviewers may read API input and output, and that sensitive, confidential or personal information should not be submitted.',
                href: 'https://ai.google.dev/gemini-api/terms',
              },
              {
                id: '2',
                text: 'HHS. Summary of the HIPAA Privacy Rule. Keiro is not a covered entity; it stores no health information on its servers.',
                href: 'https://www.hhs.gov/hipaa/for-professionals/privacy/laws-regulations/index.html',
              },
              {
                id: '3',
                text: 'Section 1557 of the Affordable Care Act. Language-access obligations for covered health programmes.',
                href: 'https://www.hhs.gov/civil-rights/for-individuals/section-1557/index.html',
              },
            ]}
          />
        </div>
        <Prose>
          <Para>
            The formal document is the <A href="/privacy">privacy policy</A>.
          </Para>
        </Prose>
      </Band>
    </SiteShell>
  )
}
