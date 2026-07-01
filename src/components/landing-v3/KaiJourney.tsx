'use client'

/* ===================== SECTION — KAI JOURNEY (sticky robot) =================
   - A tall section pins an inner stage (lg+).
   - Kai enters from the LEFT and holds there while you scroll down; the three
     scene copies rise up and cross-fade on the RIGHT, one per scroll band.
   - No weaving, no rail, no flipping — Kai stays put, eyes on. The page scroll
     does the work, like Serve Robotics.
   On small screens it degrades to a simple stacked reveal (no pin).
   ========================================================================== */

import { useRef, useState } from 'react'
import {
  AnimatePresence,
  motion,
  useMotionValueEvent,
  useScroll,
  useSpring,
  useTransform,
  type Variants,
} from 'framer-motion'
import { KaiRobot, Waveform } from './KaiRobot'
import { StarrySkyBackground } from '@/components/ui/starry-sky-background'

type Scene = {
  eyebrow: string
  title: string
  body: string
}

const scenes: Scene[] = [
  {
    eyebrow: 'Built to be understood',
    title: 'We build Kai to help humans.',
    body: 'Kai moves with your words — listening in the language you think in, so nothing gets lost on the way to your doctor.',
  },
  {
    eyebrow: 'Your meaning, kept intact',
    title: 'It never changes what you mean.',
    body: 'Kai keeps your story yours. It simply turns everyday words into the precise clinical context a clinician needs.',
  },
  {
    eyebrow: 'No more language gap',
    title: 'Care that finally understands you.',
    body: "From the first word to the doctor's desk, Keiro removes the part of healthcare where meaning quietly slips away.",
  },
]

// Each scene's copy rises up into place and lifts away as the next takes over.
const sceneVariants: Variants = {
  hidden: { opacity: 0, y: 44 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] } },
  exit: { opacity: 0, y: -32, transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] } },
}

const SCENE_COUNT = scenes.length

export function KaiJourney() {
  const sectionRef = useRef<HTMLElement | null>(null)
  const [active, setActive] = useState(0)

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start start', 'end end'],
  })

  // Smooth the raw scroll so Kai glides instead of tracking the wheel frame-for-
  // frame — this is what makes the movement feel buttery rather than twitchy.
  const p = useSpring(scrollYProgress, { stiffness: 60, damping: 22, mass: 0.6 })

  useMotionValueEvent(p, 'change', (latest) => {
    // Hysteresis: only flip once we're comfortably into a band, so scroll jitter
    // near a boundary can't rapidly toggle scenes.
    const raw = latest * SCENE_COUNT
    setActive((current) => {
      const next = Math.min(SCENE_COUNT - 1, Math.max(0, Math.floor(raw)))
      if (next === current) return current
      const into = raw - Math.floor(raw)
      if (next > current && into < 0.25) return current
      if (next < current && into > 0.75) return current
      return next
    })
  })

  // Kai slides in from the left once, then holds. A small downward drift gives the
  // "scrolling down" feel without any flipping or weaving.
  const kaiX = useTransform(p, [0, 0.13, 1], ['-130%', '0%', '0%'])
  const kaiY = useTransform(p, [0, 1], ['-4%', '8%'])
  const kaiOpacity = useTransform(p, [0, 0.06], [0, 1])

  const activeScene = scenes[active]

  return (
    <section
      ref={sectionRef}
      id="kai"
      className="relative scroll-mt-32 px-6 py-20 md:px-10 lg:h-[360vh] lg:px-16 lg:py-0"
    >
      <StarrySkyBackground className="z-0" />
      <div className="relative z-[1] lg:sticky lg:top-0 lg:h-screen lg:overflow-hidden">
        {/* ── lg: pinned stage — Kai on the left, copy rising on the right ── */}
        <div className="mx-auto hidden h-full max-w-7xl items-center lg:flex">
          <div className="grid h-[560px] w-full grid-cols-2 items-center gap-8">
            {/* Kai — slides in from the left, then holds. Eyes stay on. */}
            <motion.div
              className="pointer-events-none relative flex justify-center"
              style={{ x: kaiX, y: kaiY, opacity: kaiOpacity }}
            >
              <div
                className="pointer-events-none absolute left-1/2 top-1/2 h-[520px] w-[520px] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-20 blur-[70px]"
                style={{ background: 'radial-gradient(circle, #00c896 0%, transparent 70%)' }}
                aria-hidden
              />
              <KaiRobot size={360} float />
            </motion.div>

            {/* copy — rises up + cross-fades, one scene per scroll band. */}
            <div className="relative flex items-center">
              <AnimatePresence mode="wait">
                {activeScene && (
                  <motion.div
                    key={active}
                    className="max-w-md"
                    variants={sceneVariants}
                    initial="hidden"
                    animate="show"
                    exit="exit"
                  >
                    <SceneCopy scene={activeScene} index={active} total={SCENE_COUNT} />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* ── mobile / tablet: simple stacked reveal, Kai on top ── */}
        <div className="lg:hidden">
          <div className="mx-auto mb-12 w-fit">
            <KaiRobot size={240} float />
            <Waveform count={24} className="mx-auto mt-2 w-[200px]" />
          </div>
          <div className="space-y-16">
            {scenes.map((scene, i) => (
              <motion.div
                key={scene.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-15%' }}
                transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              >
                <SceneCopy scene={scene} index={i} total={SCENE_COUNT} />
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

function SceneCopy({ scene, index, total }: { scene: Scene; index: number; total: number }) {
  return (
    <div>
      <div className="mb-5 flex items-center gap-3">
        <span className="text-sm font-bold tabular-nums text-[var(--kx-accent)]">
          {String(index + 1).padStart(2, '0')}
        </span>
        <span className="h-px w-8 bg-[var(--kx-accent)]/40" />
        <span className="text-xs font-semibold uppercase tracking-[0.24em] text-white/45">{scene.eyebrow}</span>
      </div>
      <h2 className="font-display text-[clamp(2.2rem,4vw,3.6rem)] font-semibold leading-[1.05] tracking-[-0.03em] text-white">
        {scene.title}
      </h2>
      <p className="mt-5 max-w-md text-lg leading-[1.7] text-white/55">{scene.body}</p>
      <div className="mt-7 flex gap-2">
        {Array.from({ length: total }, (_, i) => (
          <span
            key={i}
            className="h-1.5 rounded-full transition-all duration-300"
            style={{ width: i === index ? 26 : 8, background: i === index ? 'var(--kx-accent)' : 'rgba(255,255,255,0.18)' }}
          />
        ))}
      </div>
    </div>
  )
}