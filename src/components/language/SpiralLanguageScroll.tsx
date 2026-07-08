'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  motion,
  useMotionValueEvent,
  useScroll,
  useSpring,
  useTransform,
  type MotionValue,
} from 'framer-motion'
import { ChevronDown, Search } from 'lucide-react'
import { useRouter } from 'next/navigation'
import Kai from '@/components/kai/Kai'
import { StarrySkyBackground } from '@/components/ui/starry-sky-background'
import { LANGUAGES, type Language } from '@/lib/languages'
import { trackLanguageSelected } from '@/lib/analytics'

const TOTAL = LANGUAGES.length
const SEGMENTS = Math.max(TOTAL - 1, 1)

const CARD_SIZE_CLASS = 'h-[min(30vw,192px)] w-[min(30vw,192px)] sm:h-[min(26vw,200px)] sm:w-[min(26vw,200px)]'

const RING_STEP = 0.56

/** Cylindrical carousel — scroll rotates panels around Kai (Active Theory style). */
function orbitTransform(index: number, progress: number, radius: number) {
  const t = index - progress * SEGMENTS
  const angle = t * RING_STEP

  const x = Math.sin(angle) * radius
  const z = Math.cos(angle) * radius
  const y = Math.sin(angle * 1.4) * 42 + Math.cos(angle * 0.65) * 16

  const rotateY = (-angle * 180) / Math.PI
  const rotateX = Math.cos(angle) * -7

  const depthNorm = z / radius
  const frontFactor = Math.max(0, Math.min(1, (depthNorm + 0.1) / 1.1))

  const dist = Math.abs(t)
  const proximity = Math.max(0, 1 - dist * 0.34)

  const scale = (0.7 + proximity * 0.32) * (0.52 + frontFactor * 0.48)
  // Smooth fade — no opacity floor, so side panels don't cluster
  const opacity =
    depthNorm < -0.06 ? 0 : frontFactor * proximity * Math.max(0, 1 - dist * 0.55)
  const blur = Math.min(dist * 0.42, 1.8) * (1 - frontFactor * 0.88)

  const round = (n: number) => Math.round(n * 1000) / 1000

  return {
    x: round(x),
    y: round(y),
    z: round(z),
    scale: round(scale),
    opacity: round(opacity),
    blur: round(blur),
    rotateY: round(rotateY),
    rotateX: round(rotateX),
    t,
  }
}

interface SpiralCardProps {
  lang: Language
  index: number
  radius: number
  smoothProgress: MotionValue<number>
  onPick: (lang: Language) => void
}

function SpiralLanguageCard({ lang, index, radius, smoothProgress, onPick }: SpiralCardProps) {
  // Compute the full orbit position ONCE per frame, then derive each animated
  // channel from that. Previously every channel ran its own useTransform that
  // re-called the trig-heavy orbitTransform — ~9× the work per card, per frame,
  // across every language card. Deriving from a single source keeps the exact
  // same output for a fraction of the per-frame cost.
  const orbit = useTransform(smoothProgress, (v) => orbitTransform(index, v, radius))
  const x = useTransform(orbit, (o) => o.x)
  const y = useTransform(orbit, (o) => o.y)
  const z = useTransform(orbit, (o) => o.z)
  const scale = useTransform(orbit, (o) => o.scale)
  const opacity = useTransform(orbit, (o) => o.opacity)
  const rotateY = useTransform(orbit, (o) => o.rotateY)
  const rotateX = useTransform(orbit, (o) => o.rotateX)
  const pointerEvents = useTransform(orbit, (o) => (o.opacity > 0.15 ? 'auto' : 'none'))

  const hue = (index * 47) % 360

  return (
    <motion.button
      type="button"
      onClick={() => onPick(lang)}
      className={`spiral-lang-card absolute left-1/2 top-1/2 ${CARD_SIZE_CLASS} -translate-x-1/2 -translate-y-1/2 cursor-pointer [transform-style:preserve-3d]`}
      style={{
        x,
        y,
        z,
        scale,
        opacity,
        rotateY,
        rotateX,
        pointerEvents,
      }}
      whileTap={{ scale: 0.97 }}
      transition={{ type: 'spring', stiffness: 380, damping: 30 }}
      aria-label={`Choose ${lang.en}`}
    >
      <div className="spiral-lang-card__inner flex h-full flex-col items-center justify-center gap-1 overflow-hidden rounded-2xl border border-white/18 bg-[#0a0e1a]/85 px-3 py-2.5 text-center shadow-[0_20px_50px_rgba(0,0,0,0.55)] sm:gap-1.5 sm:px-3.5 sm:py-3">
        <div
          className="pointer-events-none absolute inset-0 opacity-90"
          style={{
            background: `linear-gradient(145deg, hsla(${hue}, 72%, 42%, 0.22) 0%, rgba(0,0,0,0.55) 42%, hsla(${(hue + 80) % 360}, 65%, 38%, 0.18) 100%)`,
          }}
          aria-hidden
        />
        <div
          className="pointer-events-none absolute inset-0 bg-gradient-to-br from-teal-400/10 via-transparent to-violet-500/10"
          aria-hidden
        />
        <span className="relative text-xl leading-none sm:text-2xl">{lang.flag}</span>
        <div className="relative max-w-full truncate text-[13px] font-semibold leading-tight text-white sm:text-sm">
          {lang.en}
        </div>
        <div
          className="relative max-w-full truncate text-[13px] font-medium leading-tight text-white/90 sm:text-sm"
          style={{ direction: lang.rtl ? 'rtl' : 'ltr' }}
        >
          {lang.native}
        </div>
        <div className="relative max-w-full truncate text-[10px] leading-snug text-white/50 sm:text-[11px]">
          {lang.roman}
        </div>
      </div>
    </motion.button>
  )
}

interface SpiralLanguageScrollProps {
  hospitalSlug?: string | null
  embedded?: boolean
  sectionId?: string
}

export default function SpiralLanguageScroll({
  hospitalSlug,
  embedded = false,
  sectionId,
}: SpiralLanguageScrollProps) {
  const router = useRouter()
  const sectionRef = useRef<HTMLElement>(null)
  const [activeIndex, setActiveIndex] = useState(0)
  const [query, setQuery] = useState('')
  const [searchOpen, setSearchOpen] = useState(false)
  const [radius, setRadius] = useState(280)
  const [mounted, setMounted] = useState(false)

  // Pre-compute LANGUAGES index map to avoid O(n) indexOf calls in render
  const languageIndexMap = useMemo(
    () => new Map(LANGUAGES.map((lang, i) => [lang.code, i])),
    [],
  )

  useEffect(() => {
    setMounted(true)
    const update = () => {
      const w = window.innerWidth
      setRadius(w < 640 ? Math.min(w * 0.38, 178) : Math.min(w * 0.34, 340))
    }
    update()
    window.addEventListener('resize', update)
    return () => window.removeEventListener('resize', update)
  }, [])

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start start', 'end end'],
  })

  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 70,
    damping: 26,
    mass: 0.38,
  })

  const kaiRotateY = useTransform(smoothProgress, (v) => v * 24 - 12)

  useMotionValueEvent(smoothProgress, 'change', (v) => {
    setActiveIndex(Math.round(Math.min(1, Math.max(0, v)) * SEGMENTS))
  })

  const activeLang = LANGUAGES[activeIndex] ?? LANGUAGES[0]

  const filtered = useMemo(
    () =>
      LANGUAGES.filter(
        (lang) =>
          lang.en.toLowerCase().includes(query.toLowerCase()) ||
          lang.native.toLowerCase().includes(query.toLowerCase()) ||
          lang.roman.toLowerCase().includes(query.toLowerCase()),
      ),
    [query],
  )

  const scrollToIndex = useCallback((index: number) => {
    const el = sectionRef.current
    if (!el) return
    const progress = index / SEGMENTS
    const maxScroll = el.offsetHeight - window.innerHeight
    const top = el.offsetTop + progress * maxScroll
    window.scrollTo({ top, behavior: 'smooth' })
    setSearchOpen(false)
    setQuery('')
  }, [])

  const handlePick = useCallback(
    (lang: Language) => {
      trackLanguageSelected(lang.code)
      try {
        localStorage.setItem('keiro-roman', '0')
      } catch {
        // localStorage may be unavailable (private browsing, storage quota, etc.)
      }
      const params = new URLSearchParams()
      params.set('lang', lang.code)
      if (hospitalSlug) params.set('hospital', hospitalSlug)
      router.push(`/onboarding/confirm?${params.toString()}`)
    },
    [hospitalSlug, router],
  )

  return (
    <section
      ref={sectionRef}
      id={sectionId}
      className={`relative ${embedded ? 'scroll-mt-32 bg-transparent' : 'bg-transparent'}`}
      style={{ height: `${SEGMENTS * 8.5 + 85}vh` }}
      aria-label="Choose your language"
    >
      <div className={`sticky top-0 w-full overflow-hidden ${embedded ? 'h-[100svh]' : 'h-dvh'}`}>
        <StarrySkyBackground interactive className="z-0" />

        <div
          className="absolute inset-0 z-[1] overflow-hidden"
          style={{ perspective: 'min(1500px, 110vw)', perspectiveOrigin: '50% 46%' }}
        >
          {/* Green Kai — large, behind the ring; head above, body extends past language card */}
          <motion.div
            className="pointer-events-none absolute left-1/2 z-0 -translate-x-1/2"
            style={{
              top: '-2%',
              rotateY: kaiRotateY,
              transformStyle: 'preserve-3d',
              z: -120,
            }}
          >
            <div className="origin-top scale-[1.72] sm:scale-[2.05]">
              <Kai size="xl" state="idle" interactive={false} animated={mounted} />
            </div>
          </motion.div>

          {/* Language ring — sits on Kai's torso, in front in 3D */}
          <div
            className="absolute left-1/2 top-[54%] h-0 w-0 -translate-x-1/2 -translate-y-1/2"
            style={{ transformStyle: 'preserve-3d' }}
          >
            {mounted &&
              LANGUAGES.map((lang, i) => (
                <SpiralLanguageCard
                  key={lang.code}
                  lang={lang}
                  index={i}
                  radius={radius}
                  smoothProgress={smoothProgress}
                  onPick={handlePick}
                />
              ))}
          </div>
        </div>

        <header
          className={`pointer-events-none absolute inset-x-0 top-0 z-30 px-5 sm:px-8 ${embedded ? 'pt-24 sm:pt-28' : 'pt-5 sm:pt-6'}`}
        >
          <div className="pointer-events-auto max-w-xl">
            {embedded ? (
              <>
                <h2 className="font-display text-2xl font-semibold leading-tight tracking-tight text-white sm:text-3xl">
                  Find your language
                </h2>
                <p className="mt-2 max-w-md text-sm text-white/45">
                  Scroll down to browse. When you find yours, click on it.
                </p>
              </>
            ) : (
              <>
                <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-teal-300/80">
                  Keiro · Language journey
                </p>
                <h1 className="mt-1 font-display text-xl font-semibold tracking-tight text-white sm:text-2xl">
                  Scroll the ring
                </h1>
                <p className="mt-1 max-w-sm text-sm text-white/45">
                  Panels wrap around Kai. Tap one when it faces you.
                </p>
              </>
            )}
          </div>
        </header>

        <footer className="absolute inset-x-0 bottom-0 z-30 px-5 pb-6 pt-2 sm:px-8">
          <div className="flex items-end justify-between gap-4">
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2 text-xs text-white/45">
                <ChevronDown size={14} className="animate-bounce" aria-hidden />
                <span>
                  {activeLang.flag} {activeLang.en}
                </span>
              </div>
              <div className="h-1 w-32 overflow-hidden rounded-full bg-white/10">
                {mounted ? (
                  <motion.div
                    className="h-full origin-left rounded-full bg-teal-400/80"
                    style={{ scaleX: smoothProgress }}
                  />
                ) : (
                  <div className="h-full w-0 rounded-full bg-teal-400/80" />
                )}
              </div>
            </div>

            <button
              type="button"
              onClick={() => setSearchOpen((o) => !o)}
              className="flex min-h-[44px] items-center gap-2 rounded-full border border-white/15 bg-white/8 px-4 py-2 text-sm font-medium text-white/90 backdrop-blur-md transition-colors hover:bg-white/12"
              aria-expanded={searchOpen}
            >
              <Search size={16} aria-hidden />
              Search
            </button>
          </div>

          {searchOpen && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
              className="mt-3 overflow-hidden rounded-2xl border border-white/15 bg-black/70 backdrop-blur-xl"
            >
              <div className="flex items-center gap-2 border-b border-white/10 px-4 py-3">
                <Search size={16} className="text-white/40" aria-hidden />
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search languages…"
                  className="w-full bg-transparent text-sm text-white placeholder:text-white/35 focus:outline-none"
                  aria-label="Search languages"
                  autoFocus
                />
              </div>
              <div className="max-h-56 overflow-y-auto py-1">
                {filtered.length === 0 ? (
                  <p className="px-4 py-6 text-center text-sm text-white/40">
                    No languages match “{query}”.
                  </p>
                ) : (
                  filtered.map((lang) => (
                    <button
                      key={lang.code}
                      type="button"
                      onClick={() => scrollToIndex(languageIndexMap.get(lang.code) ?? 0)}
                      className="flex min-h-[44px] w-full items-center gap-3 px-4 py-2 text-left transition-colors hover:bg-white/8"
                    >
                      <span className="text-lg leading-none">{lang.flag}</span>
                      <span className="flex-1 truncate text-sm font-medium text-white">
                        {lang.en}
                      </span>
                      <span
                        className="truncate text-sm text-white/50"
                        style={{ direction: lang.rtl ? 'rtl' : 'ltr' }}
                      >
                        {lang.native}
                      </span>
                    </button>
                  ))
                )}
              </div>
            </motion.div>
          )}
        </footer>
      </div>
    </section>
  )
}