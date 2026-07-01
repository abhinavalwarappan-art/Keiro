'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { motion, AnimatePresence, useInView } from 'framer-motion'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { KaiChatPreview } from '@/components/ui/ai-chat'
import { easeOutExpo } from '@/lib/motion'
import { RetroGrid } from '@/components/ui/retro-grid'

const AUTO_PLAY_MS = 5000

const STEPS = [
  {
    id: '01',
    title: 'Choose your language',
    description:
      'Tap your flag. Everything switches instantly — Kai greets you in your language, asks questions in your language, and never requires a word of English.',
    visual: 'language',
    accent: '#2DD4BF',
  },
  {
    id: '02',
    title: 'Talk with Kai',
    description:
      'Speak naturally about your symptoms. Kai listens with patience, asks the right follow-up questions, and adapts its pace to yours. No clinical jargon, ever.',
    visual: 'chat',
    accent: '#14B8A6',
  },
  {
    id: '03',
    title: 'Hand your doctor the report',
    description:
      'Kai builds a clean, structured English summary from your conversation. Download as PDF, share a link, or simply show the screen — ready in under two minutes.',
    visual: 'report',
    accent: '#34D399',
  },
]

const FLAGS = [
  { flag: '🇮🇳', en: 'Hindi',      native: 'हिंदी',       greeting: 'नमस्ते! Kai यहाँ है।' },
  { flag: '🇪🇸', en: 'Spanish',    native: 'Español',     greeting: '¡Hola! Soy Kai.' },
  { flag: '🇸🇦', en: 'Arabic',     native: 'العربية',     greeting: 'مرحباً! أنا Kai.' },
  { flag: '🇨🇳', en: 'Mandarin',   native: '中文',         greeting: '你好！我是Kai。' },
  { flag: '🇻🇳', en: 'Vietnamese', native: 'Tiếng Việt',  greeting: 'Xin chào! Tôi là Kai.' },
  { flag: '🇰🇷', en: 'Korean',     native: '한국어',       greeting: '안녕하세요! Kai입니다.' },
]

/* ─── Language-picker visual ─────────────────────────────────────────────── */
function LanguageVisual() {
  const [active, setActive] = useState(0)

  useEffect(() => {
    const t = setInterval(() => setActive(a => (a + 1) % FLAGS.length), 1600)
    return () => clearInterval(t)
  }, [])

  return (
    <div className="w-full h-full flex flex-col items-center justify-center gap-4 p-8">
      <p className="text-[11px] uppercase tracking-widest font-semibold mb-2" style={{ color: 'rgba(45,212,191,0.6)' }}>
        Select your language
      </p>
      <div className="grid grid-cols-2 gap-3 w-full max-w-xs">
        {FLAGS.map((l, i) => (
          <motion.button
            key={l.en}
            onClick={() => setActive(i)}
            className="flex items-center gap-3 px-4 py-3 rounded-2xl text-left transition"
            animate={{
              background: active === i ? 'rgba(20,184,166,0.22)' : 'rgba(255,255,255,0.04)',
              borderColor: active === i ? 'rgba(45,212,191,0.5)' : 'rgba(255,255,255,0.06)',
            }}
            style={{ border: '1px solid' }}
            whileHover={{ background: 'rgba(20,184,166,0.14)' }}
          >
            <span className="text-[22px]">{l.flag}</span>
            <div className="min-w-0">
              <p className="text-[13px] font-bold text-white truncate">{l.en}</p>
              <p className="text-[11px] truncate" style={{ color: 'rgba(255,255,255,0.4)' }}>{l.native}</p>
            </div>
          </motion.button>
        ))}
      </div>
      <AnimatePresence mode="wait">
        <motion.p
          key={active}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          className="text-[15px] font-medium text-center mt-2"
          style={{ color: '#2DD4BF' }}
        >
          {FLAGS[active].greeting}
        </motion.p>
      </AnimatePresence>
    </div>
  )
}

/* ─── Report visual ──────────────────────────────────────────────────────── */
function ReportVisual() {
  const REPORT_ROWS = [
    { label: 'Chief Complaint', value: 'Lower abdominal pain, radiating to back' },
    { label: 'Severity',        value: '7 / 10' },
    { label: 'Duration',        value: '3 days' },
    { label: 'Medications',     value: 'Metformin 500mg daily' },
    { label: 'Allergies',       value: 'Penicillin' },
  ]

  return (
    <div className="w-full h-full flex items-center justify-center p-8">
      <div
        className="w-full max-w-sm rounded-2xl overflow-hidden"
        style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
      >
        {/* Header */}
        <div className="px-5 py-3.5" style={{ background: '#0F766E' }}>
          <p className="text-[10px] uppercase tracking-widest text-white/60 font-bold">Keiro Medical Intake Report</p>
          <p className="text-[12px] font-mono text-white/40 mt-0.5">KR-2025-48291</p>
        </div>
        {/* Body */}
        <div className="px-5 py-4 space-y-3">
          {REPORT_ROWS.map(row => (
            <div key={row.label} className="flex gap-3 py-2.5" style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
              <span className="text-[11px] font-semibold w-28 flex-shrink-0" style={{ color: '#2DD4BF' }}>{row.label}</span>
              <span className="text-[12px] text-white">{row.value}</span>
            </div>
          ))}
        </div>
        {/* Footer */}
        <div className="px-5 py-3" style={{ background: 'rgba(52,211,153,0.08)', borderTop: '1px solid rgba(52,211,153,0.15)' }}>
          <p className="text-[10px] font-medium" style={{ color: 'rgba(52,211,153,0.7)' }}>
            ✓ Ready — Generated by Kai · Not a medical diagnosis
          </p>
        </div>
      </div>
    </div>
  )
}

/* ─── Main component ─────────────────────────────────────────────────────── */
export default function HowItWorks() {
  const [active, setActive] = useState(0)
  const [direction, setDirection] = useState(0)
  const [paused, setPaused] = useState(false)
  const headerRef = useRef(null)
  const headerInView = useInView(headerRef, { once: true, margin: '-60px' })

  const go = useCallback((index: number) => {
    setDirection(index > active ? 1 : -1)
    setActive(index)
    setPaused(false)
  }, [active])

  const next = useCallback(() => go((active + 1) % STEPS.length), [active, go])
  const prev = useCallback(() => go((active - 1 + STEPS.length) % STEPS.length), [active, go])

  useEffect(() => {
    if (paused) return
    const t = setInterval(next, AUTO_PLAY_MS)
    return () => clearInterval(t)
  }, [paused, next])

  const imgVariants = {
    enter:  (d: number) => ({ y: d > 0 ? '100%' : '-100%', opacity: 0 }),
    center: { y: '0%',  opacity: 1 },
    exit:   (d: number) => ({ y: d > 0 ? '-100%' : '100%', opacity: 0 }),
  }

  return (
    <section id="how" className="relative bg-canvas py-28 md:py-36 px-6 md:px-12 overflow-hidden">
      <RetroGrid lineColor="rgba(28,25,23,0.04)" fadeFromColor="#FAFAF9" />
      <div className="relative z-10 max-w-[1200px] mx-auto">

        {/* Label + headline */}
        <div ref={headerRef}>
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={headerInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, ease: easeOutExpo }}
            className="flex items-center gap-4 mb-14"
          >
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 24 }}
            animate={headerInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, ease: easeOutExpo, delay: 0.07 }}
            className="font-display leading-[0.95] tracking-[-0.035em] text-text-primary mb-20"
            style={{ fontSize: 'clamp(40px,5.5vw,72px)' }}
          >
            Three steps.<br />
            <span className="font-light text-text-tertiary">No friction.</span>
          </motion.h2>
        </div>

        {/* ── Interactive tabs ── */}
        <div className="grid lg:grid-cols-12 gap-12 lg:gap-16 items-start">

          {/* Left — tab list */}
          <div className="lg:col-span-5 flex flex-col space-y-0">
            {STEPS.map((step, i) => {
              const isActive = active === i
              return (
                <button
                  key={step.id}
                  onClick={() => { go(i); setPaused(true) }}
                  className="group relative flex items-start gap-5 py-7 text-left transition duration-500 border-t border-border-subtle first:border-0"
                  style={{ cursor: 'pointer' }}
                >
                  {/* Progress rail */}
                  <div className="absolute left-[-2px] top-0 bottom-0 w-[2px]" style={{ background: 'var(--border-subtle)' }}>
                    {isActive && (
                      <motion.div
                        key={`prog-${i}-${paused}`}
                        className="absolute top-0 left-0 w-full origin-top"
                        style={{ background: step.accent }}
                        initial={{ height: '0%' }}
                        animate={paused ? { height: '0%' } : { height: '100%' }}
                        transition={{ duration: AUTO_PLAY_MS / 1000, ease: 'linear' }}
                      />
                    )}
                  </div>

                  {/* Step number */}
                  <span
                    className="text-[10px] font-bold tabular-nums mt-1.5 flex-shrink-0 transition-colors duration-300"
                    style={{ color: isActive ? '#0F766E' : 'var(--text-placeholder)', minWidth: 24 }}
                  >
                    /{step.id}
                  </span>

                  <div className="flex flex-col gap-2 flex-1">
                    <span
                      className="text-[clamp(22px,2.5vw,32px)] font-normal tracking-tight leading-tight transition-colors duration-300"
                      style={{ color: isActive ? 'var(--text-primary)' : 'var(--text-placeholder)' }}
                    >
                      {step.title}
                    </span>

                    <AnimatePresence mode="wait">
                      {isActive && (
                        <motion.p
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.28, ease: [0.23, 1, 0.32, 1] }}
                          className="overflow-hidden text-[15px] leading-[1.75] text-text-secondary max-w-md pb-1"
                        >
                          {step.description}
                        </motion.p>
                      )}
                    </AnimatePresence>
                  </div>
                </button>
              )
            })}
            {/* Border bottom */}
            <div className="border-t border-border-subtle" />

            {/* Prev / Next controls */}
            <div className="flex items-center gap-3 pt-6">
              <button
                onClick={() => { prev(); setPaused(true) }}
                className="w-11 h-11 rounded-full flex items-center justify-center transition"
                style={{ background: 'var(--sunken)', color: 'var(--text-secondary)' }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'var(--border-subtle)' }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'var(--sunken)' }}
                aria-label="Previous step"
              >
                <ChevronLeft size={18} />
              </button>
              <button
                onClick={() => { next(); setPaused(true) }}
                className="w-11 h-11 rounded-full flex items-center justify-center transition"
                style={{ background: 'var(--sunken)', color: 'var(--text-secondary)' }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'var(--border-subtle)' }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'var(--sunken)' }}
                aria-label="Next step"
              >
                <ChevronRight size={18} />
              </button>
              <span className="text-[13px] font-medium tabular-nums ml-1" style={{ color: 'var(--text-tertiary)' }}>
                {active + 1} / {STEPS.length}
              </span>
            </div>
          </div>

          {/* Right — visual panel */}
          <div
            className="lg:col-span-7 relative aspect-[4/3] md:aspect-[16/11] rounded-xl overflow-hidden"
            style={{ background: '#13110F', border: '1px solid rgba(255,255,255,0.08)' }}
          >
            {/* Accent glow */}
            <motion.div
              className="pointer-events-none absolute inset-0"
              animate={{
                background: `radial-gradient(120% 100% at 50% 0%, ${STEPS[active].accent}22 0%, transparent 60%)`,
              }}
              transition={{ duration: 0.6, ease: easeOutExpo }}
            />

            <AnimatePresence mode="popLayout" custom={direction} initial={false}>
              <motion.div
                key={active}
                custom={direction}
                variants={imgVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.55, ease: easeOutExpo }}
                className="absolute inset-0"
              >
                {STEPS[active].visual === 'language' && <LanguageVisual />}
                {STEPS[active].visual === 'chat' && (
                  <div className="w-full h-full flex items-center justify-center p-8">
                    <KaiChatPreview />
                  </div>
                )}
                {STEPS[active].visual === 'report' && <ReportVisual />}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  )
}