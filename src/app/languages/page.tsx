import type { Metadata } from 'next'
import { LANGUAGES } from '@/lib/languages'
import { SiteShell } from '@/components/landing-v3/SiteShell'
import { PageHero, Section, P, PullQuote, CtaBand, A } from '@/components/landing-v3/PageBits'
import { GreetingDemo, LanguageDirectory } from '@/components/landing-v3/LanguageExplorer'
import { Reveal } from '@/components/landing-v3/Reveal'

const COUNT = LANGUAGES.length

export const metadata: Metadata = {
  title: 'Languages',
  description: `Kai speaks ${COUNT} languages — a real conversation in the language you grew up speaking, not a translated menu.`,
  openGraph: {
    title: 'We speak your language',
    description: `Kai holds a real conversation in ${COUNT} languages — not a translated menu.`,
  },
}

export default function LanguagesPage() {
  return (
    <SiteShell>
      <PageHero
        eyebrow="Languages"
        title="We speak your language."
        lede={`Kai holds the whole conversation in ${COUNT} languages — asking its follow-up questions in your language too, not just translating a form.`}
      />

      <Section title="Hear it for yourself">
        <P>
          This is the first thing Kai actually says. Choose a language and watch it change.
        </P>
        <Reveal>
          <div className="mt-8">
            <GreetingDemo />
          </div>
        </Reveal>
      </Section>

      <Section title="What “speaking your language” actually means" tinted>
        <P>
          A lot of software claims to support your language when what it really means is that the
          buttons are translated. You still have to answer in English.
        </P>

        <PullQuote>
          Nobody should have to borrow someone else&apos;s words to describe their own pain.
        </PullQuote>

        <P>
          With Kai, the conversation itself is in your language. You describe the pain in your
          language, Kai asks its follow-up questions in your language, and only the summary — the
          part your doctor reads — comes out in English. The translation happens at the end, where
          it belongs, instead of being your problem at the start.
        </P>
        <P>
          Arabic and Urdu are laid out right-to-left. Devanagari, Bengali, Tamil, Telugu, Gujarati,
          Malayalam, Chinese, Japanese and Korean are rendered with fonts that actually contain
          those characters. And if a script is unfamiliar to you even though the language is not,
          romanised text is available. More on those choices in{' '}
          <A href="/accessibility">accessibility</A>.
        </P>
      </Section>

      <Section title={`All ${COUNT} languages`}>
        <P>
          This list is generated from the same source the app itself uses, so it cannot drift out of
          date. If a language is here, Kai speaks it.
        </P>
        <LanguageDirectory />
      </Section>

      <Section title="Do not see yours?" tinted>
        <P>
          Then we want to know. Tell us which language, and we will work on it — the whole point of
          this project falls apart if the person who needs it most is the one we left out.
        </P>
        <P>
          <A href="/contact">Tell us which language to add.</A>
        </P>
      </Section>

      <CtaBand
        title="Say it in your own words."
        body="Free, no account, and Kai will wait as long as you need."
      />
    </SiteShell>
  )
}
