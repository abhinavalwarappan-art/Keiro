import type { Metadata } from 'next'
import { SiteShell } from '@/components/landing-v3/SiteShell'
import { PageHero, A } from '@/components/landing-v3/PageBits'
import {
  Band,
  BandHeading,
  GradWord,
  Thesis,
  NumberCards,
  ExpandableSteps,
  Quote,
  Prose,
  Para,
  Faq,
  References,
} from '@/components/landing-v3/Sections'

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

/* Spine: hero -> index grid of facts(cream) -> the uncomfortable part as a
   QUOTE on a deep band -> expandable safeguards(cream) -> what we have NOT done
   (mint) -> faq -> references. */
export default function PrivacySafetyPage() {
  return (
    <SiteShell flow="privacy">
      <PageHero
        flow
        eyebrow="Privacy & safety"
        title="Your privacy and safety matter."
        lede="Before you use Kai, here is what happens to what you share, what Keiro stores, and what Kai can and cannot do."
      />

      <Band palette="cream">
        <BandHeading lede="If you read nothing else on this page, read these.">
          The four things that <GradWord>matter most</GradWord>.
        </BandHeading>
        <div className="mt-10">
          <NumberCards
            items={[
              {
                n: '01',
                title: 'Not stored',
                body: 'What you say to Kai is not saved to our servers. Use Keiro as a guest, which is the default, and we store nothing about you at all.',
              },
              {
                n: '02',
                title: 'Never diagnoses',
                body: 'Not carefully, not with a disclaimer. Kai has no ability to tell you what is wrong, or how serious it is.',
              },
              {
                n: '03',
                title: 'Never sold',
                body: 'Not to advertisers, not to data brokers, not to insurers. No business model here needs to know about your health.',
              },
              {
                n: '04',
                title: 'No account',
                body: 'Use the whole thing without telling us your name, email or phone number. The less we know, the less there is to protect.',
              },
            ]}
          />
        </div>
      </Band>

      <Band palette="deep" flow="glow">
        <Quote attribution="Read this before you start" role="not after">
          If you would not be comfortable with what is below,{' '}
          <GradWord>please do not tell Kai anything you would not want kept.</GradWord> We would rather
          lose your visit than mislead you into it.
        </Quote>

        <div className="mx-auto mt-10 max-w-3xl">
          <Prose>
            <Para>
              Kai is not magic and it does not run on our laptop. To understand you and answer you,
              your messages are sent to <strong>Google</strong>, whose Gemini model does the actual
              language work.
            </Para>
            <Para>
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
            </Para>
            <Para>
              This is the single most important thing on this page, which is why it is not in the
              footnotes. The full list of every company that touches your data is in the{' '}
              <A href="/privacy">privacy policy</A>.
            </Para>
          </Prose>
        </div>
      </Band>

      <Band palette="cream">
        <BandHeading lede="Safety here does not mean a warning banner. It means Kai is built without the ability to do the dangerous thing. Three layers, independent, so no single mistake gets through.">
          The fence <GradWord>around Kai.</GradWord>
        </BandHeading>

        <div className="mt-10">
          <ExpandableSteps
            items={[
              {
                n: '01',
                title: 'A narrow job',
                summary: 'Kai is only allowed to do one thing.',
                detail: (
                  <p className="max-w-2xl leading-[1.85] text-[var(--band-muted)]">
                    Kai is instructed to collect an intake history and nothing else. It is explicitly
                    forbidden from diagnosing, giving a prognosis, recommending treatment, or
                    claiming to be human. It is not a general-purpose chatbot that we pointed at
                    medicine.
                  </p>
                ),
              },
              {
                n: '02',
                title: 'An emergency exit',
                summary: 'If it cannot wait, Kai stops taking notes.',
                detail: (
                  <p className="max-w-2xl leading-[1.85] text-[var(--band-muted)]">
                    If what you describe sounds like it cannot wait, Kai stops being an intake tool
                    and tells you to seek emergency help immediately, rather than continuing to
                    gather a tidy history while something serious is happening.
                  </p>
                ),
              },
              {
                n: '03',
                title: 'You have the last word',
                summary: 'Nothing is sent until you send it.',
                detail: (
                  <p className="max-w-2xl leading-[1.85] text-[var(--band-muted)]">
                    You read the summary before your doctor does. If Kai got you wrong, it goes no
                    further. And every path through Keiro ends at a clinician. Kai is never the last
                    thing between you and a decision about your body.
                  </p>
                ),
              },
            ]}
          />
        </div>
      </Band>

      <Band palette="mint">
        <Thesis
          statement={
            <>
              Keiro has not been reviewed or certified by a medical professional. No clinical
              validation study, no FDA clearance,{' '}
              <GradWord>no safety certification.</GradWord>
            </>
          }
          body="It is a young project, and we are not going to dress it up as something it is not. Because Keiro does not store health information on its servers, it is also not a HIPAA-covered service. That is a statement about our architecture, not a claim of accreditation."
        />

        <div className="mx-auto mt-8 max-w-3xl">
          <Prose>
            <Para>
              Getting genuine clinical review is the next thing we want to do. If you are a clinician
              who would help with that, it is the most useful thing anyone could offer this project.{' '}
              <A href="/contact">Please get in touch.</A>
            </Para>
            <Para>
              And if Kai says something it should not have, or behaves in a way that frightens you,
              tell us bluntly. A real person reads those.
            </Para>
          </Prose>
        </div>
      </Band>

      <Band palette="cream">
        <BandHeading>
          The questions <GradWord>a sceptic would ask.</GradWord>
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
        <p className="lx-label text-xs text-[var(--band-muted)]">
          References
        </p>
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
      </Band>

    </SiteShell>
  )
}
