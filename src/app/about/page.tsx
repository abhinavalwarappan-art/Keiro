import type { Metadata } from 'next'
import { SiteShell } from '@/components/landing-v3/SiteShell'
import { PageHero, Section, P, PullQuote, CtaBand, A } from '@/components/landing-v3/PageBits'

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

export default function AboutPage() {
  return (
    <SiteShell>
      <PageHero
        eyebrow="Our mission"
        title="Being understood should not depend on which language you happen to speak."
        lede="Keiro is a small project with one goal: make sure that the person sitting on the exam table gets to say what is actually wrong, in the words they actually have."
      />

      <Section title="The number that started this">
        <P>
          About 67 million people in the United States speak a language other than English at home.
          That is not a fringe. That is roughly one in five people in the country.
        </P>
        <P>
          Many of them speak enough English to order coffee, to fill in a form, to get through a
          workday. But medicine is not a workday. Medicine asks you to describe a feeling you do not
          have words for in your <em>first</em> language, and then it asks you to do it again,
          precisely, under fluorescent light, while you are frightened.
        </P>

        <PullQuote>
          The gap is not between languages. It is between what a person can feel and what they are
          able to say to the one person who could help.
        </PullQuote>

        <P>
          When that gap opens, the consequences are not abstract. People get the wrong dose. People
          leave with instructions they did not follow because they did not fully hear them. People
          skip the appointment entirely, and come back later, sicker. We wrote about how that
          happens, and what falls short today, in <A href="/how-it-works">how it works</A>.
        </P>
      </Section>

      <Section title="What we are actually building" tinted>
        <P>
          Keiro is not trying to replace your doctor, and it is not trying to be a hospital
          system&apos;s software. It is a companion for the twenty minutes before the visit — the
          part where you sit in a waiting room and rehearse.
        </P>
        <P>
          You talk to Kai in the language you think in. Kai listens, asks the follow-up questions a
          good nurse would ask, and writes it all down in clear English for the person who is about
          to treat you. That is the whole product. We have been deliberate about not adding more.
        </P>
      </Section>

      <Section title="The rules we gave ourselves">
        <P>
          Some of these cost us things. We are keeping them anyway.
        </P>
        <P>
          <strong>Free, for patients, permanently.</strong> The moment a person has to reach for a
          card to explain their symptoms, we have rebuilt the barrier we set out to remove. There is
          no paid tier for patients and there will not be one.
        </P>
        <P>
          <strong>No account before you can speak.</strong> Asking someone to register — email,
          password, confirmation link — before they are allowed to say where it hurts is a small
          cruelty dressed up as onboarding. You open Keiro and you start talking.
        </P>
        <P>
          <strong>Kai never diagnoses.</strong> Not once, not carefully, not with a disclaimer. The
          moment a piece of software starts telling frightened people what is wrong with them, it
          stops being a translator and becomes something that needs a license and a regulator. Kai
          helps you say what you feel. Your doctor decides what it means.
        </P>
        <P>
          <strong>Nothing you say gets sold.</strong> Not to advertisers, not to data brokers, not
          to anyone. We explain exactly what is kept and what is thrown away in{' '}
          <A href="/privacy-safety">privacy &amp; safety</A>.
        </P>
      </Section>

      <Section title="Who this is really for" tinted>
        <P>
          We build for a specific person: someone older, possibly on a cheap phone, on hospital
          wi-fi, who is a little nervous about technology and a lot nervous about the appointment.
          If it does not work for them, it does not work.
        </P>
        <P>
          That is why the text is large, why nothing blinks, why there is no timer counting down,
          and why Kai will happily wait while you start the sentence over for the third time.
          More about those choices in <A href="/accessibility">accessibility</A>.
        </P>
      </Section>

      <CtaBand
        title="If this is for someone you love, you can start it for them."
        body="It is free, there is no account, and you can sit with them while they use it."
      />
    </SiteShell>
  )
}
