'use client'

import { useState } from 'react'
import Link from 'next/link'
import { LANGUAGES, type Language } from '@/lib/languages'
import { KAI_GREETINGS } from './greetings'

// Demonstration text only. New Urdu/Persian samples still need native-speaker review.
const SAMPLE_SYMPTOMS: Record<string, string> = {
  en: 'My chest hurts when I climb the stairs.',
  ur: 'جب میں سیڑھیاں چڑھتا ہوں تو میرے سینے میں درد ہوتا ہے۔',
  fa: 'وقتی از پله‌ها بالا می‌روم، سینه‌ام درد می‌گیرد.',
  es: 'Me duele el pecho cuando subo las escaleras.',
  ar: 'أشعر بألم في صدري عندما أصعد الدرج.',
  hi: 'सीढ़ियाँ चढ़ते समय मेरे सीने में दर्द होता है।',
  zh: '我上楼梯的时候胸口会痛。',
  vi: 'Tôi bị đau ngực khi leo cầu thang.',
}

export function KaiDemo() {
  const [active, setActive] = useState<Language>(LANGUAGES[1])
  const [query, setQuery] = useState('')
  const [expanded, setExpanded] = useState(false)
  const [changed, setChanged] = useState(false)
  const normalize = (value: string) => value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()
  const common = ['en-US', 'es-ES', 'zh-CN', 'ar-SA', 'ur-PK', 'fa-IR']
  const shown = LANGUAGES.filter(l => expanded
    ? normalize(`${l.native} ${l.en} ${l.roman}`).includes(normalize(query.trim()))
    : common.includes(l.code))
  const symptom = SAMPLE_SYMPTOMS[active.googleCode]
  function pick(language: Language) {
    if (language.code !== active.code) setChanged(true)
    setActive(language)
  }
  return (
    <div className="keiro-demo">
      <section aria-labelledby="choose-language">
        <h2 id="choose-language">Choose your language</h2>
        <p className="keiro-support">See how Kai helps you prepare for your visit.</p>
        <button type="button" className="keiro-text-link" aria-expanded={expanded} aria-controls="language-search"
          onClick={() => { setExpanded(!expanded); setQuery('') }}>
          {expanded ? 'Show common languages' : `Search all ${LANGUAGES.length} languages`}
        </button>
        <div id="language-search" hidden={!expanded}>
          <label htmlFor="demo-language-search">Find your language</label>
          <input id="demo-language-search" type="search" value={query} onChange={e => setQuery(e.target.value)}
            placeholder="Name in your language or English" />
          <p role="status" className="keiro-support">{shown.length === 0 ? 'No matching languages. Try another spelling.' : `${shown.length} languages found.`}</p>
        </div>
        <div className="keiro-languages" role="group" aria-labelledby="choose-language">
          {shown.map(language => (
            <button key={language.code} type="button" aria-pressed={active.code === language.code}
              onClick={() => pick(language)} className="keiro-language">
              <span lang={language.code} dir={language.rtl ? 'rtl' : 'ltr'}>{language.native}</span>
              {language.native !== language.en && <span className="keiro-language-english">{language.en}</span>}
            </button>
          ))}
        </div>
      </section>
      <p role="status" aria-live="polite" aria-atomic="true" className="sr-only">
        {changed ? `Example now in ${active.en}. The doctor's note is in English.` : ''}
      </p>
      <section aria-labelledby="example-title" className="keiro-example">
        <h3 id="example-title">An example conversation</h3>
        <p className="keiro-support">Hello, I’m Kai.</p>
        <div key={active.code} className={changed ? 'keiro-language-change' : ''}>
          <div lang={active.code} dir={active.rtl ? 'rtl' : 'ltr'} className="keiro-exchange">
            <p className="keiro-kai lx-native">{KAI_GREETINGS[active.code]}</p>
            {symptom && <p className="keiro-patient lx-native">{symptom}</p>}
          </div>
          {!symptom && <p className="keiro-support">This is Kai’s greeting in your language. The sample note below shows how symptoms are written down in English.</p>}
        </div>
      </section>
      <section className="keiro-note" aria-labelledby="doctor-note" lang="en" dir="ltr">
        <h3 id="doctor-note">What your doctor reads</h3>
        <p className="keiro-support">Example note in English</p>
        <p>“My chest hurts when I climb the stairs.”</p>
        <p className="keiro-note-caption">Your own words, written clearly for your doctor. No diagnosis.</p>
      </section>
      <div className="keiro-start">
        <Link className="keiro-primary" href={`/onboarding?fresh=1&lang=${active.code}`}>Start talking to Kai</Link>
        <p className="keiro-reassurance">Keiro is free and always will be. You don’t need an account. You can stop whenever you want.</p>
        <Link className="keiro-text-link" href="/how-it-works">See how it works</Link>
      </div>
    </div>
  )
}
