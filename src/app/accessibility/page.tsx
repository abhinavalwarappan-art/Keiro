import type { Metadata } from 'next'
import { LANGUAGES } from '@/lib/languages'
import { SiteShell } from '@/components/landing-v3/SiteShell'
import { A } from '@/components/landing-v3/PageBits'
import {
  Band,
  BandHeading,
  Accent,
  Thesis,
  StatRow,
  IndexGrid,
  GlassCards,
  Split,
  Quote,
  Prose,
  Para,
  Faq,
  References,
} from '@/components/landing-v3/Sections'
import { VoiceMock } from '@/components/landing-v3/ChatMock'

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

/* Spine: opens on a QUOTE (the only page that does) -> thesis -> stats
   -> index grid -> split/voice -> glass "still falling short"(DEEP)
   -> faq -> references. */
export default function AccessibilityPage() {
  return (
    <SiteShell>
      <Band palette="cream" className="!border-t-0 pt-16 md:pt-24">
        <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[var(--lx-ink)]">
          Accessibility
        </p>
        <div className="mt-8">
          <Quote asHeading attribution="The person we build for" role="every single time">
            She is 72. Her phone is five years old and cracked in one corner. The clinic wi-fi is
            slow, her eyes are not what they were, and she is already worried about the appointment.{' '}
            <Accent>If it does not work for her, it does not work.</Accent>
          </Quote>
        </div>
      </Band>

      <Band palette="mint">
        <Thesis
          statement={
            <>
              The people most likely to need Keiro are the people least likely to be comfortable
              using it. <Accent>Designing for anyone else would miss the point entirely.</Accent>
            </>
          }
          body="Meeting the legal standard is the floor, not the achievement. We build to WCAG 2.2 AA as a baseline and then keep going, because she does not care what standard we met. She cares whether she can read it."
        />
      </Band>

      <Band palette="cream">
        <BandHeading lede="Not aspirations. These are measurable, and we measure them.">
          What that means <Accent>in numbers.</Accent>
        </BandHeading>
        <div className="mt-10">
          <StatRow
            stats={[
              {
                value: 44,
                suffix: 'px',
                label: 'minimum touch target',
                note: 'every button and link. A hand that shakes should still be able to use this.',
              },
              {
                value: 18,
                suffix: 'px',
                label: 'minimum body text',
                note: 'never grey-on-grey, and pinch-zoom is never disabled.',
              },
              {
                value: LANGUAGES.length,
                label: 'languages',
                note: 'including right-to-left, and romanised text where the script is unfamiliar.',
              },
              {
                value: 0,
                label: 'timers, anywhere',
                note: 'nothing counts down at you. Nothing flashes. Nothing auto-plays.',
              },
            ]}
          />
        </div>
      </Band>

      <Band palette="mint">
        <BandHeading>
          The choices <Accent>behind those numbers.</Accent>
        </BandHeading>
        <div className="mt-10">
          <IndexGrid
            items={[
              {
                n: '01',
                label:
                  'Every colour pairing on this site clears WCAG AA contrast, and the important ones clear AAA.',
              },
              {
                n: '02',
                label:
                  'If your device asks for reduced motion, every animation here turns off. Not softened. Off.',
              },
              {
                n: '03',
                label:
                  'You can reach everything by keyboard, every focused element is clearly outlined, and skip-to-content is the first thing you land on.',
              },
              {
                n: '04',
                label:
                  'Headings are real headings and forms have real labels, so a screen reader reads a document rather than a soup of divs.',
              },
              {
                n: '05',
                label:
                  'When Kai’s greeting changes language, it is announced, not silently swapped behind a screen-reader user’s back.',
              },
              {
                n: '06',
                label:
                  'Scripts render in fonts that actually contain their characters. A gorgeous Latin face that breaks in Hindi is a bug, not a brand.',
              },
            ]}
          />
        </div>
      </Band>

      <Band palette="cream">
        <Split media={<VoiceMock />}>
          <BandHeading lede="Typing is a barrier we badly underestimate. It is hard on a cracked screen, hard with arthritis, hard in a script your keyboard barely supports, and hard when you are frightened.">
            Speaking, <Accent>not typing.</Accent>
          </BandHeading>
          <Prose>
            <Para>
              So you can just talk, and switch mid-sentence without losing what you have already
              said. This is not a power-user feature. For a lot of our users it is the only way in.
            </Para>
            <Para>
              Browser speech recognition is good at English and noticeably worse at exactly the
              languages our users speak. So when your browser is likely to do a poor job, Keiro
              quietly routes your voice to a stronger transcription model instead. You do not have to
              know that, or choose it. It just works better.
            </Para>
          </Prose>
        </Split>
      </Band>

      <Band palette="deep">
        <BandHeading lede="It would be easy to end this page on the good part. Here is the honest state of it instead.">
          Where we are <Accent>still falling short.</Accent>
        </BandHeading>
        <div className="mt-10">
          <GlassCards
            items={[
              {
                label: 'No formal audit',
                body: 'Keiro has not been independently audited for accessibility. Our confidence comes from building carefully to a standard, not from a certificate.',
              },
              {
                label: 'Not tested with the people it is for',
                body: 'We have not sat with a panel of screen-reader users or older users and watched them use it. That is the single biggest gap, and we know which one it is.',
              },
              {
                label: 'It still assumes you can read',
                body: `Not every one of the ${LANGUAGES.length} languages has been checked by a native speaker yet, and the conversation still leaves out people who cannot read at all.`,
              },
            ]}
          />
        </div>

        <p className="mt-8 max-w-2xl leading-[1.85] text-[var(--band-muted)]">
          If you use a screen reader, or you help older or disabled patients, and something here is
          broken or patronising,{' '}
          <a
            href="/contact"
            className="lx-focus font-semibold text-[var(--lx-sage)] underline underline-offset-4"
          >
            please tell us
          </a>
          . That kind of message is worth more to us than any audit.
        </p>
      </Band>

      <Band palette="mint">
        <BandHeading>
          Designing for fear, <Accent>not just for eyesight.</Accent>
        </BandHeading>
        <div className="mt-8">
          <Faq
            items={[
              {
                q: 'Does it work on an old phone?',
                a: 'That is the target, not the edge case. The site stays light and avoids heavy graphics, and it is tested at small screen sizes. If it is slow or broken on your device, we would genuinely like to know which device.',
              },
              {
                q: 'Do I need to be good with technology?',
                a: 'No. If you can open a web page and talk, you can use Keiro. Nothing to install, no account to make, no settings you have to get right first.',
              },
              {
                q: 'Will it rush me?',
                a: 'No. Kai has no timer and no progress bar shaming you for taking your time. It does not sigh, it does not repeat itself impatiently, and it never implies you should have known better. You can start a sentence over as many times as you need.',
              },
              {
                q: 'Can someone help me use it?',
                a: 'Yes, and a lot of people do it that way, an adult child holding the phone while a parent talks. Nothing about Keiro assumes the patient is the one tapping the screen.',
              },
              {
                q: 'Is it accessible if I cannot see the screen?',
                a: 'It is built to be: real headings, real labels, keyboard navigation, and announcements when content changes. But we have not yet tested it with a panel of blind users, so we will not claim more than that.',
              },
            ]}
          />
        </div>

        <Prose>
          <Para>
            More about what Kai will and will not do in <A href="/meet-kai">meet Kai</A>, and what
            happens to your words in <A href="/privacy-safety">privacy &amp; safety</A>.
          </Para>
        </Prose>
      </Band>

      <Band palette="cream">
        <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[var(--band-muted)]">
          Standards we build to
        </p>
        <div className="mt-6">
          <References
            items={[
              {
                id: '1',
                text: 'WCAG 2.2 Level AA. Web Content Accessibility Guidelines, W3C Recommendation.',
                href: 'https://www.w3.org/TR/WCAG22/',
              },
              {
                id: '2',
                text: 'WCAG 2.5.8 Target Size (Minimum). The 24×24 floor; we hold ourselves to 44×44.',
                href: 'https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html',
              },
              {
                id: '3',
                text: 'National CLAS Standards. Culturally and Linguistically Appropriate Services in health care.',
                href: 'https://thinkculturalhealth.hhs.gov/clas',
              },
            ]}
          />
        </div>
      </Band>

    </SiteShell>
  )
}
