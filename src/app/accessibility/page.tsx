import type { Metadata } from 'next'
import { LANGUAGES } from '@/lib/languages'
import { SiteShell } from '@/components/landing-v3/SiteShell'
import { PageHero, A } from '@/components/landing-v3/PageBits'
import {
  Band,
  BandHeading,
  GradWord,
  Thesis,
  SpecRows,
  CheckList,
  GlassCards,
  Split,
  Quote,
  Prose,
  Para,
  Faq,
  References,
} from '@/components/landing-v3/Sections'
import { VoiceMock } from '@/components/landing-v3/ChatMock'
import { IconCheck } from '@/components/landing-v3/icons'

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

/* Spine: hero -> SPEC SHEET(cream) -> thesis(mint) -> checklist(cream)
   -> split/voice(mint) -> quote + shortcomings(DEEP, glowing) -> faq -> refs.

   This page used to be /about with different words: same eyebrow, same giant
   serif opening with a green italic tail, same four-figure stat row, same
   six-item numbered grid. Everything load-bearing here is now different.

   Register: <GradWord> (upright, gradient-filled) and never <Accent>. /about is
   the mirror image. */
export default function AccessibilityPage() {
  return (
    <SiteShell flow="access">
      <PageHero
        flow
        eyebrow="Accessibility"
        title="Keiro should be easy for anyone to use."
        lede="We design for older adults, people who use assistive technology, and anyone who may feel unsure using a new website. WCAG 2.2 AA is our baseline, not our finish line."
      />

      {/* A spec sheet that proves itself. Every row contains a live instance of the
          thing it claims: the 44px row holds a real 44px target, the 18px row is
          set at 18px. If we ever break the promise, the page breaks visibly —
          which is worth more than a badge. */}
      <Band palette="cream" rails>
        <BandHeading lede="Not aspirations. Each of these is measurable, we measure it, and the demonstration beside it is live — rendered by the same stylesheet as the rest of the page.">
          The numbers, and <GradWord>what they look like</GradWord>.
        </BandHeading>
        <div className="mt-12">
          <SpecRows
            specs={[
              {
                figure: '44px',
                label: 'Minimum touch target',
                note: 'Every button and every link. A hand that shakes should still be able to use this. The WCAG floor is 24px; we hold ourselves to 44.',
                demo: (
                  <div className="flex items-center gap-3">
                    <span
                      className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-[var(--lx-green)] text-white"
                      aria-hidden="true"
                    >
                      <IconCheck size={18} strokeWidth={2} />
                    </span>
                    <span className="text-sm text-[var(--band-muted)]">
                      actual size,
                      <br />
                      44 × 44
                    </span>
                  </div>
                ),
              },
              {
                figure: '18px',
                label: 'Minimum body text',
                note: 'Never grey-on-grey, and pinch-zoom is never disabled. If you need it bigger, your browser is allowed to make it bigger.',
                demo: (
                  <p className="text-[18px] leading-[1.6] text-[var(--band-body)]">
                    This sentence is set at 18px.
                  </p>
                ),
              },
              {
                figure: String(LANGUAGES.length),
                label: 'Languages, in their own script',
                note: 'Including right-to-left, and romanised text where the script is unfamiliar. A font that breaks in Hindi is a bug, not a brand.',
                demo: (
                  <p
                    className="lx-native text-lg leading-[1.7] text-[var(--band-body)]"
                    lang="mul"
                  >
                    नमस्ते · مرحبا · 你好 · Xin chào
                  </p>
                ),
              },
              {
                figure: '0',
                label: 'Timers, anywhere',
                note: 'Nothing counts down at you. Nothing flashes, nothing auto-plays, and nothing expires while you are thinking about how to say it.',
                demo: (
                  <p className="text-sm leading-[1.7] text-[var(--band-muted)]">
                    <span className="line-through">Session expires in 4:59</span>
                    <br />
                    <span className="font-semibold text-[var(--lx-green-ink)]">
                      Take as long as you need.
                    </span>
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
              The people most likely to need Keiro are the people least likely to be comfortable
              using it. <GradWord>Designing for anyone else would miss the point entirely.</GradWord>
            </>
          }
          body="So the target is not the confident user on a new phone. It is the person who has been quietly dreading this appointment for a week."
        />
      </Band>

      <Band palette="cream" rails>
        <BandHeading lede="Six promises. None of them are interesting on their own, and all of them are load-bearing.">
          The choices behind <GradWord>those numbers</GradWord>.
        </BandHeading>
        <div className="mt-10">
          <CheckList
            items={[
              'Every colour pairing on this site clears WCAG AA contrast, and the important ones clear AAA.',
              'If your device asks for reduced motion, every animation here turns off. Not softened. Off.',
              'You can reach everything by keyboard, every focused element is clearly outlined, and skip-to-content is the first thing you land on.',
              'Headings are real headings and forms have real labels, so a screen reader reads a document rather than a soup of divs.',
              'When Kai’s greeting changes language, it is announced, not silently swapped behind a screen-reader user’s back.',
              'Scripts render in fonts that actually contain their characters. A gorgeous Latin face that breaks in Hindi is a bug, not a brand.',
            ]}
          />
        </div>
      </Band>

      <Band palette="mint">
        <Split media={<VoiceMock />} flip>
          <BandHeading lede="Typing is a barrier we badly underestimate. It is hard on a cracked screen, hard with arthritis, hard in a script your keyboard barely supports, and hard when you are frightened.">
            Speaking, not <GradWord>typing</GradWord>.
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

      {/* The page's one dark section, and its emotional peak. The "she is 72" quote
          used to open the page as a giant serif slab — which is exactly how /about
          opens, and why the two felt identical. It is a far better piece of writing
          landing here, in the dark, immediately before we admit what we have not
          done for her yet. */}
      <Band palette="deep" flow="glow">
        <Quote serif attribution="The person we build for" role="every single time">
          She is 72. Her phone is five years old and cracked in one corner. The clinic wi-fi is slow,
          her eyes are not what they were, and she is already worried about the appointment.{' '}
          <GradWord>If it does not work for her, it does not work.</GradWord>
        </Quote>

        <div className="mt-16">
          <BandHeading lede="It would be easy to end this page on the good part. Here is the honest state of it instead.">
            Where we are still <GradWord>falling short</GradWord>.
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
        </div>
      </Band>

      <Band palette="mint">
        <BandHeading>
          Designing for fear, not just for <GradWord>eyesight</GradWord>.
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
        <p className="lx-label text-xs text-[var(--band-muted)]">
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
