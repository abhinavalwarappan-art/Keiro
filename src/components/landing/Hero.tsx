'use client'

import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'
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

const DEFAULT_LANGUAGE = LANGUAGES[0]
const DEFAULT_GREETING = GREETINGS[DEFAULT_LANGUAGE?.code] ?? 'What brings you in today?'

const KAI_WAVE_DURATION = 1400

export default function Hero() {
  const [selected, setSelected] = useState<Language>(DEFAULT_LANGUAGE)
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState('')
  const [kaiState, setKaiState] = useState<KaiState>('idle')
  const [greeting, setGreeting] = useState(DEFAULT_GREETING)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const dropdownPanelRef = useRef<HTMLDivElement>(null)
  const listRef = useRef<HTMLDivElement>(null)
  const searchRef = useRef<HTMLInputElement>(null)
  const [dropdownPos, setDropdownPos] = useState<{ top: number; left: number } | null>(null)
  const [mounted, setMounted] = useState(false)
  const kaiWaveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    const close = (e: MouseEvent) => {
      const target = e.target as Node
      if (dropdownRef.current?.contains(target)) return
      if (dropdownPanelRef.current?.contains(target)) return
      setOpen(false)
    }
    document.addEventListener('mousedown', close)
    return () => document.removeEventListener('mousedown', close)
  }, [])

  useEffect(() => {
    if (!open || !dropdownRef.current) {
      setDropdownPos(null)
      return
    }

    const updatePosition = () => {
      if (!dropdownRef.current) return
      const rect = dropdownRef.current.getBoundingClientRect()
      setDropdownPos({ top: rect.bottom + 16, left: rect.left })
    }

    updatePosition()
    window.addEventListener('resize', updatePosition)
    window.addEventListener('scroll', updatePosition, true)
    return () => {
      window.removeEventListener('resize', updatePosition)
      window.removeEventListener('scroll', updatePosition, true)
    }
  }, [open])

  useEffect(() => {
    if (open) {
      const timer = setTimeout(() => searchRef.current?.focus(), 50)
      return () => clearTimeout(timer)
    }
  }, [open])

  // Cleanup kai wave timer on unmount
  useEffect(() => {
    return () => {
      if (kaiWaveTimerRef.current !== null) {
        clearTimeout(kaiWaveTimerRef.current)
      }
    }
  }, [])

  const pickLanguage = (lang: Language) => {
    setSelected(lang)
    setGreeting(GREETINGS[lang.code] ?? `Hello in ${lang.en}`)
    setOpen(false)
    setSearch('')
    setKaiState('waving')

    if (kaiWaveTimerRef.current !== null) {
      clearTimeout(kaiWaveTimerRef.current)
    }
    kaiWaveTimerRef.current = setTimeout(() => {
      setKaiState('idle')
      kaiWaveTimerRef.current = null
    }, KAI_WAVE_DURATION)
  }

  const filtered = LANGUAGES.filter(l =>
    l.en.toLowerCase().includes(search.toLowerCase()) ||
    l.native.toLowerCase().includes(search.toLowerCase()) ||
    l.roman.toLowerCase().includes(search.toLowerCase())
  )

  const startHref = `/onboarding?lang=${encodeURIComponent(selected.code)}`

  const scrollLanguageList = (e: React.WheelEvent) => {
    const el = listRef.current
    if (!el) return
    e.stopPropagation()
    const maxScroll = el.scrollHeight - el.clientHeight
    if (maxScroll <= 0) return
    e.preventDefault()
    el.scrollTop = Math.min(maxScroll, Math.max(0, el.scrollTop + e.deltaY))
  }

  return (
    <section className="relative flex min-h-screen flex-col bg-canvas">
      {/* Quiet atmosphere: stone dot grid + one soft brand wash behind Kai */}
      <div
        className="pointer-events-none absolute inset-0 z-0"
        aria-hidden
        style={{
          backgroundImage: 'radial-gradient(rgb(28 25 23 / 0.05) 1px, transparent 1px)',
          backgroundSize: '28px 28px',
          maskImage: 'radial-gradient(ellipse 80% 80% at 50% 40%, black 30%, transparent 80%)',
          WebkitMaskImage: 'radial-gradient(ellipse 80% 80% at 50% 40%, black 30%, transparent 80%)',
        }}
      />
      <div
        className="pointer-events-none absolute inset-0 z-0"
        aria-hidden
        style={{
          background: 'radial-gradient(ellipse 45% 55% at 75% 45%, rgb(20 184 166 / 0.09) 0%, transparent 70%)',
        }}
      />

      {/* ── Main grid ── */}
      <div className="mx-auto flex w-full max-w-[1200px] flex-1 items-center px-6 pb-16 pt-28 md:px-12">
        <div className="grid w-full items-center gap-12 lg:grid-cols-2 xl:gap-20">

          {/* ── LEFT ── */}
          <div className="relative z-10 order-last lg:order-first">
            {/* Eyebrow */}
            <span className="mb-6 inline-flex items-center gap-1.5 rounded-full border border-brand-muted bg-brand-subtle px-3 py-1 text-xs font-medium text-brand-ink">
              AI healthcare assistant · Free forever
            </span>

            {/* Headline — weight contrast carries the drama, not color */}
            <h1
              className="mb-8 font-display leading-[0.95] tracking-[-0.035em] text-text-primary"
              style={{ fontSize: 'clamp(48px,7vw,84px)' }}
            >
              <span className="font-bold">Speak freely.</span>
              <br />
              <span className="font-light text-text-tertiary">Be understood.</span>
            </h1>

            {/* Subhead */}
            <p className="mb-12 max-w-[460px] text-lg leading-relaxed text-text-secondary">
              No translator needed. Tell Kai your symptoms in your own language — get a clean report your doctor can read in minutes.
            </p>

            {/* ── Language selector ── */}
            <div ref={dropdownRef} className={`relative mb-8 ${open ? 'z-[1]' : ''}`}>
              <div className="flex flex-wrap items-center gap-4">
                {/* Language button — no box, just text */}
                <button
                  type="button"
                  onClick={() => setOpen(o => !o)}
                  className="flex items-center gap-3 rounded-md text-text-primary"
                  aria-expanded={open}
                  aria-label="Select your language"
                >
                  <span className="text-2xl leading-none">{selected.flag}</span>
                  <span className="font-display font-semibold tracking-tight"
                    style={{ fontSize: 'clamp(22px,3vw,30px)' }}>
                    {selected.en}
                  </span>
                  <svg
                    width="14" height="14" viewBox="0 0 14 14" fill="none"
                    className={`shrink-0 text-brand-ink transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
                    aria-hidden
                  >
                    <path d="M2.5 4.5l4.5 5 4.5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>

                {/* Separator */}
                <span className="hidden h-7 w-px bg-border-default sm:block" />

                {/* CTA */}
                <a
                  href={startHref}
                  className="inline-flex h-12 w-full items-center justify-center gap-2.5 rounded-md bg-brand-ink px-7 text-base font-medium text-white shadow-xs transition-[background-color,transform] duration-150 hover:bg-brand-ink-hover active:scale-[0.98] sm:w-auto"
                >
                  Start with Kai
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
                    <path d="M2.5 7h9M7.5 2.5l4.5 4.5-4.5 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </a>
              </div>

            </div>

            {/* Dropdown — portaled so it isn't clipped by hero or covered by sections below */}
            {mounted &&
              createPortal(
                <AnimatePresence>
                  {open && dropdownPos && (
                    <motion.div
                      ref={dropdownPanelRef}
                      onWheel={scrollLanguageList}
                      initial={{ opacity: 0, y: 8, scale: 0.97 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 8, scale: 0.97 }}
                      transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
                      className="fixed z-[200] w-72 overflow-hidden rounded-lg border border-border-subtle bg-surface shadow-md"
                      style={{
                        top: dropdownPos.top,
                        left: dropdownPos.left,
                      }}
                      role="listbox"
                      aria-label="Available languages"
                    >
                      <div className="border-b border-border-subtle p-3">
                        <input
                          ref={searchRef}
                          value={search}
                          onChange={e => setSearch(e.target.value)}
                          placeholder="Search languages…"
                          className="w-full bg-transparent px-3 py-2 text-sm text-text-primary placeholder:text-text-placeholder focus:outline-none"
                          aria-label="Search languages"
                        />
                      </div>
                      <div
                        ref={listRef}
                        className="lang-scroll lang-scroll--light max-h-[min(360px,55vh)] py-2 pr-1"
                      >
                        {filtered.length === 0 ? (
                          <p className="px-4 py-3 text-sm text-text-tertiary">
                            No languages match your search.
                          </p>
                        ) : (
                          filtered.map(lang => (
                            <button
                              key={lang.code}
                              type="button"
                              onClick={() => pickLanguage(lang)}
                              className="flex w-full items-center gap-3 px-4 py-2.5 text-left transition-colors duration-150 hover:bg-sunken"
                            >
                              <span className="text-xl leading-none">{lang.flag}</span>
                              <span className="text-sm font-medium text-text-primary">{lang.en}</span>
                              <span className="ml-auto text-xs text-text-tertiary">{lang.native}</span>
                            </button>
                          ))
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>,
                document.body,
              )}

            {/* Quick picks */}
            <div className="mb-8 flex flex-wrap items-center gap-x-5 gap-y-2">
              <span className="text-[11px] font-medium uppercase tracking-wide text-text-tertiary">
                Try
              </span>
              {QUICK_LANGS.map(code => {
                const lang = LANGUAGES.find(l => l.code === code)
                if (!lang) return null
                return (
                  <button
                    key={code}
                    type="button"
                    onClick={() => pickLanguage(lang)}
                    className="rounded-sm text-sm text-text-secondary transition-colors duration-150 hover:text-brand-ink"
                  >
                    {lang.flag} {lang.en}
                  </button>
                )
              })}
            </div>

            {/* Trust */}
            <div className="flex items-center gap-6">
              {['100% free', 'No account needed', 'Private'].map((t, i) => (
                <span key={t} className="flex items-center gap-2 text-xs text-text-tertiary">
                  {i > 0 && <span className="h-3 w-px bg-border-default" />}
                  {t}
                </span>
              ))}
            </div>
          </div>

          {/* ── RIGHT — Kai (centerpiece) ── */}
          <div className="relative order-first flex min-h-[300px] flex-col items-center justify-center lg:order-last lg:min-h-[600px]">

            {/* Kai + speech bubble — single animated unit */}
            <div className="animate-float relative z-10 flex flex-col items-center">

              {/* Speech bubble — anchored above Kai's head */}
              <div className="relative mb-3 rounded-lg rounded-bl-sm border border-border-subtle bg-surface px-5 py-4 shadow-sm">
                <p className="mb-1 text-xs font-medium text-brand-ink">
                  Kai says
                </p>
                <AnimatePresence mode="wait">
                  <motion.p
                    key={greeting}
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -4 }}
                    transition={{ duration: 0.25 }}
                    className="font-display text-xl font-medium leading-snug text-text-primary"
                  >
                    {greeting}
                  </motion.p>
                </AnimatePresence>
                {/* Tail — points down toward Kai */}
                <div
                  className="absolute left-8 top-full"
                  aria-hidden
                  style={{
                    width: 0,
                    height: 0,
                    borderLeft: '9px solid transparent',
                    borderRight: '9px solid transparent',
                    borderTop: '9px solid var(--color-surface, #fff)',
                    filter: 'drop-shadow(0 1px 0 rgb(28 25 23 / 0.06))',
                  }}
                />
              </div>

              {/* Kai — the centerpiece; reacts to language picks */}
              <Kai size="xl" state={kaiState} interactive />

              {/* Soft contact shadow anchoring Kai to the canvas */}
              <div
                className="pointer-events-none mt-2 h-3 w-28 rounded-full bg-brand-ink/10 blur-md"
                aria-hidden
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}