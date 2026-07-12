import type { Metadata } from 'next'
import { LANGUAGES } from '@/lib/languages'
import { SiteShell } from '@/components/landing-v3/SiteShell'
import { PageHero, CtaBand, A } from '@/components/landing-v3/PageBits'
import {
  Band,
  BandHeading,
  Accent,
  LanguageMarquee,
  GlassCards,
  Prose,
  Para,
  Faq,
} from '@/components/landing-v3/Sections'
import { LanguagePicker } from '@/components/landing-v3/LanguagePicker'
import { LanguageDirectory } from '@/components/landing-v3/LanguageExplorer'
import { Reveal } from '@/components/landing-v3/Reveal'

const COUNT = LANGUAGES.length

export const metadata: Metadata = {
  title: 'Languages',
  description: `Kai speaks ${COUNT} languages. A real conversation in the language you grew up speaking, not a translated menu.`,
  openGraph: {
    title: 'We speak your language',
    description: `Kai holds a real conversation in ${COUNT} languages, not a translated menu.`,
  },
}

/* Spine: hero -> picker(all 45) -> marquee -> glass/"what it means"(DEEP)
          -> directory(cream) -> faq(mint) */
export default function LanguagesPage() {
  return (
    <SiteShell>
      <PageHero
        variant="centered"
        eyebrow="Languages"
        title="We speak your language."
        lede={`Every one of the ${COUNT} languages below holds the whole conversation. Kai asks its follow-up questions in your language too, not just translating a form back at you.`}
      />

      <Band palette="cream">
        <BandHeading lede="This is the first thing Kai actually says. Find your language and watch it change. All 45 are here.">
          Hear it <Accent>for yourself.</Accent>
        </BandHeading>
        <Reveal className="mt-10">
          <LanguagePicker />
        </Reveal>
      </Band>

      <div className="lx-band lx-band-mint border-y border-[var(--band-line)] py-8">
        <LanguageMarquee />
      </div>

      <Band palette="deep">
        <BandHeading lede="A lot of software claims to support your language when what it really means is that the buttons are translated. You still have to answer in English.">
          What <Accent>“speaking your language”</Accent> actually means.
        </BandHeading>
        <div className="mt-10">
          <GlassCards
            items={[
              {
                label: 'The conversation, not the menu',
                body: 'You describe the pain in your language. Kai asks its follow-up questions in your language. Only the summary, the part your doctor reads, comes out in English.',
              },
              {
                label: 'Right-to-left, properly',
                body: 'Arabic, Urdu and Farsi are laid out right-to-left, the way they are meant to be read. Not a Latin layout with the words swapped.',
              },
              {
                label: 'Scripts that actually render',
                body: 'Devanagari, Bengali, Tamil, Telugu, Gujarati, Malayalam, Amharic, Chinese, Japanese and Korean are drawn with fonts that contain those characters, not a fallback face.',
              },
            ]}
          />
        </div>
      </Band>

      <Band palette="cream">
        <BandHeading lede="Generated from the same list the app itself uses, so it cannot drift out of date. If a language is here, Kai speaks it.">
          All {COUNT}, <Accent>in their own script.</Accent>
        </BandHeading>
        <LanguageDirectory />
      </Band>

      <Band palette="mint">
        <BandHeading>
          Questions about <Accent>language.</Accent>
        </BandHeading>
        <div className="mt-8">
          <Faq
            items={[
              {
                q: 'Do not see yours?',
                a: 'Then we want to know. Tell us which language and we will work on it. The whole point of this project falls apart if the person who needs it most is the one we left out.',
              },
              {
                q: 'What if I speak a language but cannot read its script?',
                a: 'Romanised text is available, so you can read the sounds in Latin letters. You are not the only person in that position, and it is not something to apologise for.',
              },
              {
                q: 'Can I switch language halfway through?',
                a: 'Yes. Nothing you have already said is lost when you do.',
              },
              {
                q: 'Is the translation good enough for medicine?',
                a: 'Kai does not translate word-for-word. It understands what you meant and writes that down in clinical English. But it is not perfect, which is exactly why you read the summary before your doctor does, and why Kai asks when it is unsure rather than guessing.',
              },
            ]}
          />
        </div>

        <Prose>
          <Para>
            <A href="/contact">Tell us which language to add.</A> Nobody should have to borrow
            someone else&apos;s words to describe their own pain.
          </Para>
        </Prose>
      </Band>

      <CtaBand
        palette="cream"
        title="Say it in your own words."
        body="Free, no account, and Kai will wait as long as you need."
      />
    </SiteShell>
  )
}
