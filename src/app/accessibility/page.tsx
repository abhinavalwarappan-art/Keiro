import type { Metadata } from 'next'
import { SiteShell } from '@/components/landing-v3/SiteShell'
import { PageHero, Section, P, PullQuote, Facts, QA, CtaBand, A } from '@/components/landing-v3/PageBits'

export const metadata: Metadata = {
  title: 'Accessibility',
  description:
    'Keiro is built for someone older, on a cheap phone, who is nervous about technology and more nervous about the appointment. If it does not work for them, it does not work.',
  openGraph: {
    title: 'Accessibility at Keiro',
    description:
      'Built for someone older, on a cheap phone, nervous about technology. If it does not work for them, it does not work.',
  },
}

export default function AccessibilityPage() {
  return (
    <SiteShell>
      <PageHero
        eyebrow="Accessibility"
        title="If it does not work for a nervous 70-year-old on a five-year-old Android, it does not work."
        lede="Accessibility is not a compliance checkbox we tick at the end. For a product whose entire purpose is including people who get left out, it is the product."
      />

      <Section title="Who we picture when we build">
        <P>
          Every decision on this site was made with one person in mind. She is 72. She has had this
          phone for five years and the screen is cracked in one corner. She is on the clinic&apos;s
          wi-fi, which is slow. Her eyes are not what they were. She is not sure she trusts this,
          and she is already worried about the appointment.
        </P>

        <PullQuote>
          The people most likely to need Keiro are the people least likely to be comfortable using
          it. Designing for anyone else would be missing the point entirely.
        </PullQuote>

        <P>
          Meeting the legal standard is the floor, not the achievement. We build to WCAG 2.2 AA as a
          baseline and then keep going, because the person above does not care what standard we met.
          She cares whether she can read it.
        </P>
      </Section>

      <Section title="What that means in the actual interface" tinted>
        <Facts
          items={[
            {
              label: 'Text you can actually read',
              body: 'Body text is 18px and up, never grey-on-grey. Every colour pairing on this site clears the WCAG AA contrast bar, and the important ones clear AAA.',
            },
            {
              label: 'Targets you can actually hit',
              body: 'Every button and link is at least 44 by 44 pixels. Nothing important is a tiny icon. A hand that shakes should still be able to use this.',
            },
            {
              label: 'Pinch-zoom is never disabled',
              body: 'A lot of apps quietly block zooming because it makes their layout easier. We do not. If you need to make the text bigger, make it bigger.',
            },
            {
              label: 'Nothing moves that does not have to',
              body: 'If your device asks for reduced motion, every animation on this site turns off. Nothing flashes, nothing auto-plays, nothing counts down at you.',
            },
            {
              label: 'It works with a keyboard',
              body: 'You can reach everything by tabbing, every focused element is clearly outlined, and a skip-to-content link is the first thing you land on.',
            },
            {
              label: 'It works with a screen reader',
              body: 'Headings are real headings, forms have real labels, and when Kai’s greeting changes language it is announced rather than silently swapped.',
            },
          ]}
        />
      </Section>

      <Section title="Speaking, not typing">
        <P>
          Typing is a barrier we underestimate. It is hard on a cracked screen, hard with arthritis,
          hard in a script your keyboard does not really support, and hard when you are frightened.
        </P>
        <P>
          So you can just talk. Kai listens either way, and you can switch mid-sentence without
          losing what you have already said. This is not a power-user feature; for a lot of our
          users it is the only way in.
        </P>
        <P>
          Speech recognition in browsers is good at English and noticeably worse at exactly the
          languages our users speak. So when your browser is likely to do a poor job, Keiro quietly
          routes your voice to a stronger transcription model instead. You do not have to know that,
          or choose it. It just works better.
        </P>
      </Section>

      <Section title="Your language, properly — not as an afterthought" tinted>
        <P>
          There is a version of multilingual support that is really just a translated menu. Kai is
          not that. You have the conversation in your language, and Kai asks its follow-up questions
          in your language too.
        </P>
        <P>
          The details matter here. Text in Arabic and Urdu is laid out right-to-left, the way it is
          meant to be read. Scripts like Devanagari, Bengali, Tamil and Chinese are rendered with
          fonts that actually contain those characters, rather than falling back to a mismatched
          system face — a small thing that instantly tells a reader whether anyone building this
          was thinking about them.
        </P>
        <P>
          For languages whose script is unfamiliar to some of their own speakers, romanised text is
          available. See <A href="/languages">all {'45'} languages</A>.
        </P>
      </Section>

      <Section title="Designing for fear, not just for eyesight">
        <P>
          Most accessibility work stops at the body. But the barrier we hear about most is not
          vision or dexterity — it is the feeling of being rushed, judged, or made to feel stupid.
        </P>
        <P>
          So Kai does not have a timer. It does not have a progress bar shaming you for taking your
          time. It does not sigh, it does not repeat itself impatiently, and it never says anything
          that implies you should have known better. You can start a sentence over as many times as
          you need.
        </P>
        <P>
          And you can stop. At any point, for any reason, without explaining yourself. Closing the
          tab is a complete and acceptable way to leave.
        </P>
      </Section>

      <Section title="Where we are still falling short" tinted>
        <P>
          It would be easy to end this page on the good part. Here is the honest state of it
          instead.
        </P>
        <P>
          Keiro has <strong>not</strong> been formally audited for accessibility, and it has not
          been tested with a panel of screen-reader users or older users — the two groups it most
          needs to be tested with. Our confidence comes from building carefully to a standard, not
          from having watched the person above actually use it. That is a real gap, and we know
          which one it is.
        </P>
        <P>
          Not every one of the 45 languages has been checked by a native speaker yet. And the
          conversation still assumes you can read at all, which leaves out people who cannot.
        </P>
        <P>
          If you use a screen reader, or you help older or disabled patients, and something here is
          broken or patronising — <A href="/contact">please tell us</A>. That kind of message is
          worth more to us than any audit.
        </P>
      </Section>

      <Section title="Questions">
        <QA
          items={[
            {
              q: 'Does it work on an old phone?',
              a: 'That is the target, not the edge case. The site is built to stay light and to avoid heavy graphics, and it is tested at small screen sizes. If it is slow or broken on your device, we would genuinely like to know which device.',
            },
            {
              q: 'Do I need to be good with technology?',
              a: 'No. If you can open a web page and talk, you can use Keiro. There is nothing to install, no account to make, and no settings you have to get right first.',
            },
            {
              q: 'Can someone help me use it?',
              a: 'Yes, and a lot of people do it that way — an adult child holding the phone while a parent talks. Nothing about Keiro assumes the patient is the one tapping the screen.',
            },
            {
              q: 'Is it accessible if I cannot see the screen?',
              a: 'It is built to be: real headings, real labels, keyboard navigation, and announcements when content changes. But we have not yet tested it with a panel of blind users, so we will not claim more than that.',
            },
          ]}
        />
      </Section>

      <CtaBand
        title="Take as long as you need."
        body="Kai will wait. It is free, and there is no account to make first."
      />
    </SiteShell>
  )
}
