'use client'

import Link from 'next/link'
import { LANGUAGES } from '@/lib/languages'
import { HomeButton } from './HomeButton'
import { TranslationStage } from './TranslationStage'

const SECTION = 'px-5 sm:px-8 lg:px-16'
const INNER = 'mx-auto max-w-[68rem]'

export function HomeHero() {
  return (
    <section id="hero" className={`${SECTION} pb-20 pt-14 sm:pt-20 md:pb-28`}>
      <div className="mx-auto max-w-[70rem] text-center">
        <h1 data-testid="hero-headline" className="hm-h1">
          Tell it in <span className="hm-serif">your language.</span>
          <br className="hidden md:block" /> Your doctor reads it in <span className="hm-serif">English.</span>
        </h1>
        <p className="hm-lede mx-auto mt-7 max-w-[36rem]">
          Keiro is a free assistant that listens in {LANGUAGES.length}{' '}
          languages and writes what you say
          as a clear summary for your healthcare provider. It doesn&apos;t diagnose or give medical advice.
        </p>
        <div className="mt-10 flex flex-col items-center justify-center gap-2 sm:flex-row sm:gap-8">
          <HomeButton href="/onboarding?fresh=1">Start talking to Kai</HomeButton>
          <Link href="/how-it-works" className="lx-focus hm-link">
            How it works
          </Link>
        </div>
      </div>

      <div className="mt-14 md:mt-16">
        <TranslationStage />
      </div>
    </section>
  )
}

const STEPS = [
  { word: 'Tap', text: 'Choose your language, then tap the microphone.' },
  { word: 'Speak', text: 'Say what’s wrong in your own words. You can type instead.' },
  { word: 'Wait', text: 'Kai asks a few simple follow-up questions, in your language.' },
  { word: 'Show', text: 'Hand your provider a clear English summary.' },
]

export function Steps() {
  return (
    <section className={`${SECTION} border-t border-[var(--hm-line)] py-24 md:py-32`}>
      <div className={INNER}>
        <h2 className="hm-h2 max-w-[44rem]">Four steps. Nothing to learn.</h2>
        <ol className="mt-14 grid gap-x-10 gap-y-10 sm:grid-cols-2 lg:mt-20 lg:grid-cols-4">
          {STEPS.map((step, i) => (
            <li key={step.word} className="border-t border-[var(--hm-ink)] pt-5">
              <span className="text-[0.9375rem] font-medium tabular-nums text-[var(--hm-faint)]">0{i + 1}</span>
              <h3 className="hm-h3 mt-3">{step.word}</h3>
              <p className="hm-body mt-2">{step.text}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}

export function LanguageWall() {
  return (
    <section className={`${SECTION} bg-[var(--hm-warm)] py-24 md:py-32`}>
      <div className={INNER}>
        <h2 className="hm-h2 max-w-[44rem]">
          {LANGUAGES.length} languages. <span className="hm-serif">Yours is one of them.</span>
        </h2>
        <p className="hm-lede mt-5 max-w-[34rem]">Tap a name to start in that language.</p>
        <ul className="mt-12 flex flex-wrap gap-x-5 gap-y-1 md:gap-x-7">
          {LANGUAGES.map((lang) => (
            <li key={lang.code}>
              <Link
                href={`/onboarding?lang=${encodeURIComponent(lang.code)}`}
                lang={lang.googleCode}
                dir={lang.rtl ? 'rtl' : 'ltr'}
                className="lx-focus lx-native hm-lang"
              >
                {lang.native}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}

const PROMISES = [
  {
    title: 'Not a doctor.',
    text: 'Kai never diagnoses or suggests treatment. It carries your words to the person who can help.',
  },
  { title: 'Free, with no account.', text: 'Start right away. There is nothing to sign up for.' },
  { title: 'Yours to stop.', text: 'End a conversation whenever you want.' },
]

export function Trust() {
  return (
    <section className={`${SECTION} py-24 md:py-32`}>
      <div className={`${INNER} grid gap-12 lg:grid-cols-[1fr_1.1fr] lg:gap-20`}>
        <div>
          <h2 className="hm-h2">
            Built to help you be understood. <span className="hm-serif">Not to diagnose.</span>
          </h2>
        </div>
        <div>
          <ul className="divide-y divide-[var(--hm-line)] border-y border-[var(--hm-line)]">
            {PROMISES.map((p) => (
              <li key={p.title} className="py-6">
                <h3 className="hm-h3">{p.title}</h3>
                <p className="hm-body mt-1.5">{p.text}</p>
              </li>
            ))}
          </ul>
          <p className="hm-body mt-8">
            In an emergency, call your local emergency number.{' '}
            <Link href="/emergency" className="lx-focus font-medium text-[var(--hm-pine)] underline underline-offset-4">
              Get emergency help
            </Link>
            .
          </p>
          <Link href="/privacy-safety" className="lx-focus hm-link mt-2">
            How we handle your information
          </Link>
        </div>
      </div>
    </section>
  )
}

export function FinalCta() {
  return (
    <section className={`${SECTION} border-t border-[var(--hm-line)] py-28 text-center md:py-36`}>
      <h2 className="hm-h2 mx-auto max-w-[40rem]">Ready when you are.</h2>
      <div className="mt-10 flex flex-col items-center justify-center gap-2 sm:flex-row sm:gap-8">
        <HomeButton href="/onboarding?fresh=1">Start talking to Kai</HomeButton>
        <Link href="/for-clinics" className="lx-focus hm-link">
          Running a clinic?
        </Link>
      </div>
    </section>
  )
}
