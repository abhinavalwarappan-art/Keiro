'use client'

/* The product, shown doing its one job: a patient speaks in their language,
   Keiro understands, and plain English lands on the provider's page.

   Timeline per language — listening → understanding → written → hold — then it
   moves to the next. Everything is driven by ONE effect keyed on (index, run):
   picking a language bumps `run`, the cleanup cancels every pending timer, and
   the new timeline starts from the top. Nothing has to "finish" before the next
   thing begins, so the demo can always be interrupted.

   It idles when scrolled out of view, and under prefers-reduced-motion it
   never animates: the finished state is simply shown. */

import { useEffect, useRef, useState } from 'react'
import { LayoutGroup, motion, useInView } from 'framer-motion'
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion'
import { ArrowRight } from 'lucide-react'
import { useSiteTranslations } from '@/i18n/useSiteTranslations'

type Sample = { code: string; name: string; native: string; said: string; rtl?: boolean }

const SAMPLES: Sample[] = [
  { code: 'es', name: 'Spanish', native: 'Español', said: 'Tengo dolor de cabeza desde ayer. Empeora con la luz fuerte.' },
  { code: 'ta', name: 'Tamil', native: 'தமிழ்', said: 'நேற்றிலிருந்து எனக்கு தலைவலி இருக்கிறது. பிரகாசமான வெளிச்சத்தில் அது அதிகமாகிறது.' },
  { code: 'zh', name: 'Chinese', native: '中文', said: '我从昨天开始头痛，强光下会更厉害。' },
  { code: 'ar', name: 'Arabic', native: 'العربية', said: 'أعاني من صداع منذ أمس، ويزداد مع الضوء الساطع.', rtl: true },
  { code: 'hi', name: 'Hindi', native: 'हिन्दी', said: 'कल से मुझे सिरदर्द है। तेज़ रोशनी में यह और बढ़ जाता है।' },
  { code: 'vi', name: 'Vietnamese', native: 'Tiếng Việt', said: 'Tôi bị đau đầu từ hôm qua. Ánh sáng mạnh làm đau hơn.' },
]

const ENGLISH = 'Headache since yesterday. Worse in bright light.'
const ENGLISH_WORDS = ENGLISH.split(' ')

type Phase = 'listening' | 'understanding' | 'written'

const HOLD_MS = 3400
const NOTE_WORD_MS = 90
const SPRING = { type: 'spring', stiffness: 420, damping: 34 } as const

/** Grapheme clusters, so Tamil/Devanagari never get cut mid-letter. */
function graphemes(text: string): string[] {
  if (typeof Intl !== 'undefined' && 'Segmenter' in Intl) {
    return Array.from(new Intl.Segmenter(undefined, { granularity: 'grapheme' }).segment(text), (s) => s.segment)
  }
  return Array.from(text)
}

export function TranslationStage() {
  const { locale, t } = useSiteTranslations()
  const reduceMotion = usePrefersReducedMotion()
  const rootRef = useRef<HTMLDivElement>(null)
  const inView = useInView(rootRef, { amount: 0.35 })

  const [index, setIndex] = useState(() => {
    const selected = SAMPLES.findIndex(sample => locale.startsWith(`${sample.code}-`))
    return selected < 0 ? 0 : selected
  })
  const [run, setRun] = useState(0)
  const [phase, setPhase] = useState<Phase>('written')
  const [shownUnits, setShownUnits] = useState(Infinity)
  const [shownWords, setShownWords] = useState(ENGLISH_WORDS.length)

  const sample = SAMPLES[index]
  const units = graphemes(sample.said)
  const spoken = Number.isFinite(shownUnits) ? units.slice(0, shownUnits).join('') : sample.said

  useEffect(() => {
    if (reduceMotion || !inView) return

    let cancelled = false
    const timers: number[] = []
    const intervals: number[] = []
    const after = (ms: number, fn: () => void) => {
      timers.push(window.setTimeout(() => !cancelled && fn(), ms))
    }
    const total = graphemes(SAMPLES[index].said).length

    setPhase('listening')
    setShownUnits(0)
    setShownWords(0)

    const perUnit = Math.max(24, Math.min(58, 1900 / total))
    let u = 0
    const typing = window.setInterval(() => {
      u += 1
      setShownUnits(u)
      if (u < total) return
      window.clearInterval(typing)
      after(320, () => {
        setPhase('understanding')
        after(620, () => {
          setPhase('written')
          let w = 0
          const writing = window.setInterval(() => {
            w += 1
            setShownWords(w)
            if (w >= ENGLISH_WORDS.length) {
              window.clearInterval(writing)
              after(HOLD_MS, () => setIndex((i) => (i + 1) % SAMPLES.length))
            }
          }, NOTE_WORD_MS)
          intervals.push(writing)
        })
      })
    }, perUnit)
    intervals.push(typing)

    return () => {
      cancelled = true
      timers.forEach(window.clearTimeout)
      intervals.forEach(window.clearInterval)
    }
  }, [index, run, inView, reduceMotion])

  const choose = (i: number) => {
    setIndex(i)
    setRun((r) => r + 1) // restart even when re-picking the current language
    if (reduceMotion) {
      setPhase('written')
      setShownUnits(Infinity)
      setShownWords(ENGLISH_WORDS.length)
    }
  }

  const understood = phase !== 'listening'

  return (
    <div ref={rootRef}>
      <motion.div
        initial={reduceMotion ? false : { opacity: 0, scale: 0.985 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: 'spring', stiffness: 160, damping: 26, delay: 0.1 }}
        className="mx-auto grid max-w-[68rem] overflow-hidden rounded-[2rem] bg-[var(--hm-warm)] p-2.5 lg:grid-cols-[1fr_auto_1fr] lg:gap-3 lg:p-3"
      >
        {/* You say it */}
        <div className="flex min-h-[11.5rem] flex-col justify-between gap-8 p-6 sm:p-8 lg:min-h-[21rem] lg:p-10">
          <div className="flex items-center gap-3 text-[0.9375rem] font-medium text-[var(--hm-faint)]">
            <span
              className={`relative grid size-8 place-items-center rounded-full transition-colors duration-300 ${
                phase === 'listening' ? 'bg-[var(--hm-pine)]' : 'bg-[var(--hm-line)]'
              }`}
              aria-hidden
            >
              <span className="flex h-3.5 items-center gap-[2px]">
                {[0, 120, 60].map((d) => (
                  <span
                    key={d}
                    className={`h-full w-[2px] rounded-full ${phase === 'listening' ? 'mic-bar bg-white' : 'bg-[var(--hm-faint)]'}`}
                    style={{ animationDelay: `${d}ms` }}
                  />
                ))}
              </span>
            </span>
            <span>{phase === 'listening' ? t('site.demo.listening') : t('site.demo.understood')} · {sample.native}</span>
          </div>

          <p
            lang={sample.code}
            dir={sample.rtl ? 'rtl' : 'ltr'}
            aria-hidden
            className="lx-native grid text-[clamp(1.5rem,1.05rem+1.7vw,2.25rem)] font-medium leading-[1.3] tracking-[-0.01em] text-[var(--hm-ink)]"
          >
            <span className="invisible col-start-1 row-start-1">{sample.said}</span>
            <span className="col-start-1 row-start-1">
              {spoken}
              {phase === 'listening' && !reduceMotion && (
                <span className="ms-0.5 inline-block h-[1em] w-[2px] translate-y-[0.15em] animate-pulse bg-[var(--hm-pine)]" />
              )}
            </span>
          </p>
        </div>

        {/* Understanding — a single node carries the idea of "translated" */}
        <div className="flex items-center justify-center py-1 lg:px-1 lg:py-0" aria-hidden>
          <motion.span
            animate={{
              scale: understood ? 1 : 0.86,
              backgroundColor: understood ? '#1a3d2b' : '#e6e8e3',
              color: understood ? '#ffffff' : '#636a60',
            }}
            transition={SPRING}
            className="grid size-11 place-items-center rounded-full"
          >
            <ArrowRight size={18} className="rotate-90 rtl:-rotate-90 lg:rotate-0 lg:rtl:rotate-180" />
          </motion.span>
        </div>

        {/* Your provider reads it */}
        <div className="flex min-h-[11.5rem] flex-col justify-between gap-8 rounded-[1.5rem] bg-white p-6 shadow-[0_1px_0_rgba(12,34,23,0.04),0_18px_44px_-20px_rgba(12,34,23,0.22)] sm:p-8 lg:min-h-[21rem] lg:p-10">
          <div className="flex items-center gap-2.5 text-[0.9375rem] font-medium text-[var(--hm-faint)]">
            <span
              className={`size-2 rounded-full transition-colors duration-300 ${
                phase === 'written' ? 'bg-[var(--hm-leaf)]' : 'bg-[var(--hm-line)]'
              }`}
              aria-hidden
            />
            {t('site.demo.provider')}
          </div>

          {/* The provider's copy is the written record — the one place Literata speaks. */}
          <p className="hm-record text-[clamp(1.625rem,1.1rem+1.9vw,2.5rem)] leading-[1.25] text-[var(--hm-ink)]" aria-hidden>
            {ENGLISH_WORDS.map((word, i) => {
              const shown = i < shownWords
              return (
                <motion.span
                  key={i}
                  className="inline-block"
                  initial={false}
                  animate={{ opacity: shown ? 1 : 0, y: shown ? 0 : 6, filter: shown ? 'blur(0px)' : 'blur(5px)' }}
                  transition={shown ? SPRING : { duration: 0 }}
                >
                  {word}
                  {i < ENGLISH_WORDS.length - 1 ? ' ' : ''}
                </motion.span>
              )
            })}
          </p>
        </div>

        <p className="sr-only">
          {t('site.demo.example', { language: sample.native, message: sample.said })}{' '}
          {t('site.demo.summary', { summary: ENGLISH })}
        </p>
      </motion.div>

      {/* Language choice — plain text with a sliding underline, not pills */}
      <LayoutGroup id="stage-lang">
        <div
          role="group"
          aria-label={t('site.demo.preview')}
          className="hm-scroll-x mx-auto mt-7 flex max-w-[68rem] justify-start gap-1 overflow-x-auto px-5 md:justify-center md:gap-3"
        >
          {SAMPLES.map((s, i) => {
            const active = i === index
            return (
              <button
                key={s.code}
                type="button"
                lang={s.code}
                aria-pressed={active}
                onClick={() => choose(i)}
                className="lx-focus lx-native relative shrink-0 px-3.5 py-3 text-[1.0625rem] font-medium transition-colors duration-150 active:scale-[0.97]"
                style={{ color: active ? 'var(--hm-ink)' : 'var(--hm-faint)' }}
              >
                {s.native}
                {active && (
                  <motion.span
                    layoutId="lang-underline"
                    transition={SPRING}
                    className="absolute inset-x-3.5 bottom-1.5 h-[2px] rounded-full bg-[var(--hm-pine)]"
                  />
                )}
              </button>
            )
          })}
        </div>
      </LayoutGroup>
    </div>
  )
}
