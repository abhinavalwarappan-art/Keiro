'use client'

import { useEffect, useRef, useState } from 'react'
import { ChevronDown } from 'lucide-react'
import Kai, { KaiState } from '@/components/kai/Kai'
import { LANGUAGES, Language } from '@/lib/languages'

const GREETINGS: Record<string, string> = {
  'es-ES': '¿Qué te trae hoy?',
  'zh-CN': '今天有什么不舒服？',
  'hi-IN': 'आज आपको क्या परेशान कर रहा है?',
  'ar-SA': 'ما الذي أتى بك اليوم؟',
  'vi-VN': 'Hôm nay bạn cảm thấy thế nào?',
  'en-US': 'What brings you in today?',
}

const QUICK_LANGS = ['es-ES', 'hi-IN', 'zh-CN', 'ar-SA', 'vi-VN']

export default function Hero() {
  const [selected, setSelected] = useState<Language>(LANGUAGES[0])
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState('')
  const [kaiState, setKaiState] = useState<KaiState>('idle')
  const [greeting, setGreeting] = useState(GREETINGS['es-ES'])
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const close = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', close)
    return () => document.removeEventListener('mousedown', close)
  }, [])

  const pickLanguage = (lang: Language) => {
    setSelected(lang)
    setGreeting(GREETINGS[lang.code] || `Hello in ${lang.en}`)
    setOpen(false)
    setKaiState('waving')
    setTimeout(() => setKaiState('idle'), 1200)
  }

  const filtered = LANGUAGES.filter(
    (l) =>
      l.en.toLowerCase().includes(search.toLowerCase()) ||
      l.native.toLowerCase().includes(search.toLowerCase())
  ).slice(0, 10)

  const startHref = `/onboarding?lang=${encodeURIComponent(selected.code)}`

  return (
    <section className="relative min-h-screen pt-24 pb-16 px-4 md:px-8 overflow-hidden bg-gradient-to-b from-white to-off-white">
      <div className="max-w-[1400px] mx-auto grid lg:grid-cols-[55%_45%] gap-12 items-center min-h-[calc(100vh-6rem)]">
        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 bg-white border border-keiro-border rounded-full px-4 py-2 mb-8 text-[11px] uppercase tracking-widest text-keiro-muted font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-keiro-mid animate-pulse" />
            Medical intake · 25+ languages · Always free
          </div>

          <h1 className="font-display text-[clamp(48px,8vw,88px)] leading-[0.88] tracking-[-0.05em] text-[#0a1f12]">
            Speak<br />
            <span className="italic text-keiro-mid font-normal">freely.</span>
            <br />
            Be understood.
          </h1>

          <p className="mt-8 text-[17px] text-keiro-muted leading-relaxed max-w-[440px]">
            No translator needed. Tell Kai your symptoms in your own language — get a clean report your doctor can read in minutes.
          </p>

          <div ref={dropdownRef} className="mt-10 relative max-w-lg">
            <div className="flex flex-col sm:flex-row gap-2 bg-white border border-keiro-border rounded-2xl p-1.5 shadow-[var(--shadow-md)]">
              <button
                type="button"
                onClick={() => setOpen(!open)}
                className="flex-1 flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-keiro-surface/50 transition text-left"
              >
                <div>
                  <div className="text-[10px] uppercase tracking-wider text-keiro-muted mb-1">Select your language</div>
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{selected.flag}</span>
                    <span className="font-medium text-keiro-text">{selected.en}</span>
                    <span className="text-keiro-muted text-sm">· {selected.native}</span>
                  </div>
                </div>
                <ChevronDown size={18} className="ml-auto text-keiro-muted" />
              </button>
              <a
                href={startHref}
                className="flex items-center justify-center gap-2 bg-keiro-dark text-white rounded-xl px-6 py-3 text-[13px] font-medium hover:bg-[#0a1f12] transition whitespace-nowrap"
              >
                Start with Kai →
              </a>
            </div>

            {open && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-keiro-border rounded-2xl shadow-[var(--shadow-lg)] z-50 overflow-hidden">
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search languages..."
                  className="w-full px-4 py-3 border-b border-keiro-border text-sm outline-none focus:ring-2 focus:ring-keiro-mid/10"
                />
                <div className="max-h-64 overflow-y-auto">
                  {filtered.map((lang) => (
                    <button
                      key={lang.code}
                      type="button"
                      onClick={() => pickLanguage(lang)}
                      className="w-full flex items-center gap-3 px-4 py-3 hover:bg-keiro-surface text-left transition"
                    >
                      <span className="text-xl">{lang.flag}</span>
                      <span className="font-medium">{lang.en}</span>
                      <span className="text-keiro-muted text-sm">{lang.native}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="mt-4 flex flex-wrap gap-2 text-[13px] text-keiro-muted">
            <span className="mr-1">Try:</span>
            {QUICK_LANGS.map((code) => {
              const lang = LANGUAGES.find((l) => l.code === code)
              if (!lang) return null
              return (
                <button
                  key={code}
                  type="button"
                  onClick={() => pickLanguage(lang)}
                  className="hover:text-keiro-mid transition hover:scale-105"
                >
                  {lang.flag} {lang.en}
                </button>
              )
            })}
            <span>· + 20 more →</span>
          </div>

          <div className="mt-10 flex flex-wrap gap-6 text-[12px] text-keiro-muted">
            {['100% Free forever', 'No account for emergencies', 'Private by design'].map((t) => (
              <span key={t} className="flex items-center gap-2">
                <span className="w-1 h-1 rounded-full bg-keiro-mid" />
                {t}
              </span>
            ))}
          </div>
        </div>

        <div className="relative flex items-center justify-center min-h-[480px]">
          <div
            className="absolute inset-0 rounded-full opacity-30 blur-3xl"
            style={{ background: 'radial-gradient(circle, rgba(93,202,165,0.15) 0%, transparent 70%)' }}
          />
          <span
            className="absolute font-display text-[clamp(120px,20vw,280px)] leading-none pointer-events-none select-none opacity-[0.07]"
            style={{ WebkitTextStroke: '1px #2da866', color: 'transparent' }}
            aria-hidden
          >
            kai
          </span>
          <div className="relative animate-float">
            <Kai size="xl" state={kaiState} interactive={true} />
          </div>
          <div
            className="absolute bottom-8 left-1/2 -translate-x-1/2 w-32 h-4 rounded-full opacity-40 blur-md animate-pulse"
            style={{ background: 'rgba(45,168,102,0.35)' }}
          />
          <div className="absolute top-8 left-4 md:left-8 bg-keiro-dark rounded-[14px_14px_14px_2px] p-3 shadow-lg animate-bob max-w-[180px]">
            <div className="text-[9px] uppercase tracking-wider text-keiro-light mb-1">Kai</div>
            <div className="text-[13px] text-white">{greeting}</div>
          </div>
          <div className="absolute top-12 right-0 bg-white/90 backdrop-blur border border-keiro-border rounded-xl px-3 py-2 text-[11px] shadow-sm">
            <div className="text-keiro-muted uppercase tracking-wider">Languages</div>
            <div className="font-semibold text-keiro-text">25+ supported</div>
          </div>
          <div className="absolute bottom-24 right-0 bg-white/90 backdrop-blur border border-keiro-border rounded-xl px-3 py-2 text-[11px] shadow-sm">
            <div className="text-keiro-muted uppercase tracking-wider">Cost to patients</div>
            <div className="font-semibold text-keiro-text">$0 forever</div>
          </div>
        </div>
      </div>
    </section>
  )
}
