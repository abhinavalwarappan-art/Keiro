import type { Metadata } from 'next'
import { SiteShell } from '@/components/landing-v3/SiteShell'
import { PageHero, Section, P, PullQuote, Facts, QA, CtaBand, A } from '@/components/landing-v3/PageBits'

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

export default function PrivacySafetyPage() {
  return (
    <SiteShell>
      <PageHero
        eyebrow="Privacy & safety"
        title="You are about to tell a computer something private. Here is exactly what happens to it."
        lede="This is the plain-language version, written to be read rather than agreed to. The formal document is the privacy policy, and nothing here contradicts it."
      />

      <Section title="The four things that matter most">
        <Facts
          items={[
            {
              label: 'Your conversation is not stored',
              body: 'What you say to Kai is not saved to our servers. When the session ends, it is gone. If you use Keiro as a guest — the default — we store nothing about you at all.',
            },
            {
              label: 'Kai never diagnoses',
              body: 'Not carefully, not with a disclaimer. Kai has no ability to tell you what is wrong, how serious it is, or what to do about it. Those decisions belong to your doctor.',
            },
            {
              label: 'Nothing is sold. Ever.',
              body: 'Not to advertisers, not to data brokers, not to insurers. There is no business model here that requires knowing anything about your health, and there never will be.',
            },
            {
              label: 'No account needed',
              body: 'You can use the whole thing without telling us your name, your email or your phone number. The less we know about you, the less there is to protect.',
            },
          ]}
        />
      </Section>

      <Section title="The uncomfortable part, which we are telling you anyway" tinted>
        <P>
          Kai is not magic and it does not run on our laptop. To understand you and answer you, your
          messages are sent to an AI company called DeepSeek, which does the actual language work.
        </P>
        <P>
          DeepSeek is operated from China and processes your messages on servers there. Under its own
          privacy policy, it may keep what it receives and use it to improve its models. We do not
          control that, and we are not going to pretend otherwise.
        </P>

        <PullQuote>
          If you would not be comfortable with that, please do not tell Kai anything you would not
          want kept. We would rather lose your visit than mislead you into it.
        </PullQuote>

        <P>
          This is the single most important thing on this page, which is why it is not in the
          footnotes. The full list of every company that touches your data — and what each one does
          with it — is in the <A href="/privacy">privacy policy</A>.
        </P>
      </Section>

      <Section title="What we keep, and for how long">
        <P>
          <strong>If you never sign in:</strong> nothing. No account, no record, no conversation. You
          are a stranger who used a free tool, and you stay one.
        </P>
        <P>
          <strong>If you do sign in:</strong> we keep your sign-in details and any reports you chose
          to save — encrypted, visible only to your account, so you can find them again later. You
          can download or delete all of it at any time from Settings, and deletion is immediate.
        </P>
        <P>
          <strong>Your voice:</strong> if you speak instead of typing, the audio clip is transcribed
          and discarded straight away. We do not keep recordings of your voice.
        </P>
        <P>
          <strong>Anti-abuse counters:</strong> we keep a scrambled, one-way fingerprint of your
          network address for a few days, purely so that nobody can flood the service. It cannot be
          turned back into an address, and it is not linked to anything you said.
        </P>
      </Section>

      <Section title="The safety fence around Kai" tinted>
        <P>
          Safety here does not mean a warning banner. It means Kai is built without the ability to do
          the dangerous thing in the first place. There are three layers, and they are independent —
          so no single mistake gets through.
        </P>

        <Facts
          items={[
            {
              label: '01 — A narrow job',
              body: 'Kai is instructed to do one thing: collect an intake history. It is explicitly forbidden from diagnosing, giving a prognosis, recommending treatment, or claiming to be human.',
            },
            {
              label: '02 — An emergency exit',
              body: 'If what you describe sounds like it cannot wait, Kai stops being an intake tool and tells you to seek emergency help immediately, rather than continuing to take notes.',
            },
            {
              label: '03 — You have the last word',
              body: 'You read the summary before your doctor does. Nothing is sent anywhere until you decide to send it. If Kai got you wrong, it goes no further.',
            },
            {
              label: 'And a human at the end',
              body: 'Every path through Keiro ends at a clinician. Kai is never the last thing between you and a decision about your body.',
            },
          ]}
        />
      </Section>

      <Section title="What we have not done">
        <P>
          It matters that this list is short and honest, so here it is. Keiro has{' '}
          <strong>not</strong> been reviewed or certified by a medical professional. It has no
          clinical validation study, no FDA clearance, and no safety certification. It is a young
          project built by one person, and we are not going to dress it up as something it is not.
        </P>
        <P>
          Because Keiro does not store health information on its servers, it is not a HIPAA-covered
          service. That is a statement about our architecture, not a claim of accreditation.
        </P>
        <P>
          What we can tell you is exactly what Kai does and does not do, which is what this page is
          for. Getting genuine clinical review is the next thing we want to do, and if you are a
          clinician who would help with that, we would very much like to hear from you.{' '}
          <A href="/contact">Please get in touch.</A>
        </P>
      </Section>

      <Section title="If something goes wrong" tinted>
        <P>
          If Kai says something it should not have, misunderstands you in a way that matters, or
          behaves in a way that frightens you — we want to know, and we would rather hear it bluntly.
        </P>
        <P>
          <A href="/contact">Tell us what happened.</A> A real person reads these.
        </P>
      </Section>

      <Section title="The questions a sceptic would ask">
        <QA
          items={[
            {
              q: 'Is this HIPAA compliant?',
              a: 'Keiro is not a HIPAA-covered entity, because it does not store health information on its servers — your conversation is never saved. That is an architectural answer, not a certification. If you are a clinic evaluating Keiro, read the “what we have not done” section above before anything else.',
            },
            {
              q: 'So an AI company in China sees what I tell Kai?',
              a: 'Yes. Your messages are processed by DeepSeek, on servers in China, and under their policy they may retain and learn from what they receive. We have put this in the middle of the page rather than the footnotes because you should decide with it in hand.',
            },
            {
              q: 'Can Kai be tricked into diagnosing me?',
              a: 'Kai is instructed never to, and it declines when asked. But it is a language model, and we are not going to claim it is impossible to push it off script. That is precisely why nothing Kai says is ever the final word, and why every path ends with a human clinician.',
            },
            {
              q: 'Will you sell my data if you run out of money?',
              a: 'No. There is no version of this where health conversations become a product. If Keiro cannot survive without doing that, Keiro should not survive.',
            },
            {
              q: 'What if I want everything deleted?',
              a: 'If you used Keiro as a guest, there is nothing to delete — we never had it. If you signed in, Settings → Delete all my data removes everything immediately, including your reports.',
            },
          ]}
        />
      </Section>

      <CtaBand
        title="Now that you know all that — whenever you’re ready."
        body="Free, no account, and you can stop at any point."
      />
    </SiteShell>
  )
}
