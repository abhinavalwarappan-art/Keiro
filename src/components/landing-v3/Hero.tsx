'use client'

/* ============================ SECTION 1 — HERO =============================
   Scroll-driven intro:
   - Starts as Kai's small head/logo.
   - As the user scrolls, Kai grows toward the viewer, blurs, and dissolves into
     a darker green circle.
   - The short hero copy resolves out of that blur before the next section.
   No CTA buttons, no scroll hint, no bottom hand-off line.
   ========================================================================== */

import { useRef } from 'react'
import { motion, useScroll, useTransform, type MotionValue } from 'framer-motion'
import { StarrySkyBackground } from '@/components/ui/starry-sky-background'
import { KaiRobot } from './KaiRobot'

/* Headline copy, split into lines → words so words never break mid-air. */
const HEADLINE_LINES = [
  ['Healthcare', 'that', 'speaks'],
  ['your', 'language.'],
] as const

/* The headline resolves letter-by-letter AS YOU SCROLL, across this window of the
   section's scroll progress — Kai gets the opening beat to himself, then the copy
   sweeps in left→right. Each letter resolves over CHAR_SPAN of scroll. */
const REVEAL_START = 0.34
const REVEAL_END = 0.82
const CHAR_SPAN = 0.1

/* White → teal-green vertical fill, fading translucent at the foot of each letter
   so the dark sky shows through. Painted per-letter (not on the h1) because each
   letter is its own animated layer, which breaks an ancestor's background-clip. */
const HEADLINE_GRADIENT =
  'linear-gradient(to bottom, #ffffff 0%, #00c896 74%, rgba(0,200,150,0.32) 100%)'

/* One letter that resolves from faint + blurred to sharp over its own slice of
   the scroll. Keeps the parent h1's clipped gradient — only fades its portion. */
function RevealChar({
  char,
  progress,
  start,
  end,
}: {
  char: string
  progress: MotionValue<number>
  start: number
  end: number
}) {
  const opacity = useTransform(progress, [start, end], [0, 1])
  const blur = useTransform(progress, [start, end], [8, 0])
  const y = useTransform(progress, [start, end], [12, 0])
  const filter = useTransform(blur, (b) => `blur(${b}px)`)

  return (
    <motion.span
      className="inline-block text-transparent"
      style={{
        opacity,
        y,
        filter,
        willChange: 'transform, opacity, filter',
        backgroundImage: HEADLINE_GRADIENT,
        WebkitBackgroundClip: 'text',
        backgroundClip: 'text',
      }}
    >
      {char}
    </motion.span>
  )
}

export function Hero() {
  const sectionRef = useRef<HTMLElement | null>(null)
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start start', 'end end'],
  })

  // Kai owns the opening: centred and sharp the moment you land, then as you
  // scroll he grows toward you, blurs, and dissolves — handing the frame to the
  // headline that resolves in his place.
  const robotScale = useTransform(scrollYProgress, [0, 0.4], [1, 1.5])
  const robotBlur = useTransform(scrollYProgress, [0.1, 0.4], [0, 28])
  const robotOpacity = useTransform(scrollYProgress, [0.08, 0.4], [1, 0])
  const robotFilter = useTransform(robotBlur, (b) => `blur(${b}px)`)

  const glowScale = useTransform(scrollYProgress, [0, 0.44, 0.68], [0.35, 1.35, 1.75])
  const glowOpacity = useTransform(scrollYProgress, [0, 0.26, 0.48, 1], [0, 0.14, 0.34, 0.18])

  const copyY = useTransform(scrollYProgress, [0, 1], [0, -26])

  // Eyebrow resolves first, just ahead of the headline's reveal front.
  const eyebrowOpacity = useTransform(scrollYProgress, [0.24, 0.34], [0, 1])
  const eyebrowBlur = useTransform(scrollYProgress, [0.24, 0.34], [10, 0])
  const eyebrowFilter = useTransform(eyebrowBlur, (b) => `blur(${b}px)`)

  // Per-letter scroll slices: total non-space letters, evenly spread so the
  // front sweeps continuously from the first line into the second.
  const totalChars = HEADLINE_LINES.flat().join('').length
  const step = totalChars > 1 ? (REVEAL_END - REVEAL_START - CHAR_SPAN) / (totalChars - 1) : 0
  let charIndex = 0

  return (
    <section ref={sectionRef} id="hero" className="relative h-[250vh] scroll-mt-32 bg-transparent">
      <div className="sticky top-0 flex h-[100svh] items-center justify-center overflow-hidden bg-transparent px-6">
        <StarrySkyBackground interactive className="z-0" />

        <motion.div
          className="pointer-events-none absolute h-[560px] w-[560px] max-w-[120vw] rounded-full"
          style={{
            scale: glowScale,
            opacity: glowOpacity,
            background: 'radial-gradient(circle, rgba(0,200,150,0.52) 0%, rgba(0,90,68,0.24) 42%, transparent 70%)',
            filter: 'blur(28px)',
          }}
          aria-hidden
        />

        <motion.div
          className="pointer-events-none absolute left-1/2 top-1/2 z-30"
          style={{ x: '-50%', y: '-50%', scale: robotScale, opacity: robotOpacity, filter: robotFilter }}
          aria-hidden
        >
          <KaiRobot size={340} float />
        </motion.div>

        <motion.div
          className="relative z-20 mx-auto max-w-3xl text-center"
          style={{ y: copyY }}
        >
          <motion.p
            className="mb-5 text-xs font-semibold uppercase tracking-[0.3em] text-[var(--kx-accent)]"
            style={{ opacity: eyebrowOpacity, filter: eyebrowFilter }}
          >
            Meet Kai
          </motion.p>
          <h1 className="font-sans text-[clamp(2.6rem,6.4vw,5.5rem)] font-medium leading-[1.05] tracking-[-0.025em]">
            <span className="sr-only">Healthcare that speaks your language.</span>
            <span aria-hidden>
              {HEADLINE_LINES.map((words, lineIndex) => (
                <span key={lineIndex} className="block">
                  {words.map((word, wordIndex) => (
                    <span key={wordIndex} className="inline-block whitespace-nowrap align-top">
                      {wordIndex > 0 && (
                        <span className="inline-block">{' '}</span>
                      )}
                      {word.split('').map((char) => {
                        const i = charIndex++
                        const start = REVEAL_START + i * step
                        return (
                          <RevealChar
                            key={i}
                            char={char}
                            progress={scrollYProgress}
                            start={start}
                            end={Math.min(start + CHAR_SPAN, REVEAL_END)}
                          />
                        )
                      })}
                    </span>
                  ))}
                </span>
              ))}
            </span>
          </h1>
        </motion.div>
      </div>
    </section>
  )
}