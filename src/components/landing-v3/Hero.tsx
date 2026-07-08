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
import { motion, useScroll, useTransform } from 'framer-motion'
import { StarrySkyBackground } from '@/components/ui/starry-sky-background'
import { KaiRobot } from './KaiRobot'

/* Headline copy, split into lines → words so words never break mid-air. */
const HEADLINE_LINES = [
  ['Healthcare', 'that', 'speaks'],
  ['your', 'language.'],
] as const

/* White → teal-green vertical fill, fading translucent at the foot of each letter
   so the dark sky shows through. Painted per-letter (not on the h1) because
   background-clip:text does not clip through descendant boxes on the h1 itself. */
const HEADLINE_GRADIENT =
  'linear-gradient(to bottom, #ffffff 0%, #00c896 74%, rgba(0,200,150,0.32) 100%)'

/* One letter, statically painted with the clipped gradient. The whole headline
   fades in and out as a single unit — no per-letter timing. */
function GradientChar({ char }: { char: string }) {
  return (
    <span
      className="inline-block text-transparent"
      style={{
        backgroundImage: HEADLINE_GRADIENT,
        WebkitBackgroundClip: 'text',
        backgroundClip: 'text',
      }}
    >
      {char}
    </span>
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
  // Animating a big blur radius on scroll is GPU-costly; cap it lower — the
  // opacity fade to 0 does most of the "dissolve", so a smaller blur still reads.
  const robotBlur = useTransform(scrollYProgress, [0.1, 0.4], [0, 14])
  const robotOpacity = useTransform(scrollYProgress, [0.08, 0.4], [1, 0])
  const robotFilter = useTransform(robotBlur, (b) => `blur(${b}px)`)

  const glowScale = useTransform(scrollYProgress, [0, 0.44, 0.68], [0.35, 1.35, 1.75])
  const glowOpacity = useTransform(scrollYProgress, [0, 0.26, 0.48, 1], [0, 0.14, 0.34, 0.18])

  const copyY = useTransform(scrollYProgress, [0, 1], [0, -26])

  // Eyebrow + headline resolve TOGETHER as one block once Kai has dissolved,
  // hold, then fade out together as you keep scrolling down.
  const copyOpacity = useTransform(scrollYProgress, [0.4, 0.52, 0.8, 0.96], [0, 1, 1, 0])
  const copyBlur = useTransform(scrollYProgress, [0.4, 0.52, 0.8, 0.96], [8, 0, 0, 8])
  const copyFilter = useTransform(copyBlur, (b) => `blur(${b}px)`)

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
          style={{ y: copyY, opacity: copyOpacity, filter: copyFilter }}
        >
          <p className="mb-5 text-xs font-semibold uppercase tracking-[0.3em] text-[var(--kx-accent)]">
            Meet Kai
          </p>
          <h1 className="font-sans text-[clamp(2.6rem,6.4vw,5.5rem)] font-medium leading-[1.05] tracking-[-0.025em]">
            <span className="sr-only">Healthcare that speaks your language.</span>
            <span aria-hidden>
              {HEADLINE_LINES.map((words, lineIndex) => (
                <span key={lineIndex} className="block">
                  {words.map((word, wordIndex) => (
                    <span key={wordIndex} className="inline-block whitespace-nowrap align-top">
                      {wordIndex > 0 && <span className="inline-block" aria-hidden>{'\u00A0'}</span>}
                      {word.split('').map((char, charIndex) => (
                        <GradientChar key={charIndex} char={char} />
                      ))}
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