'use client'

/* ===================== SECTION — THREE STEPS (FLOW) =======================
   Serve Robotics "Small team, big vision → Safe / Smart / Fast" mechanic:
   - The section is tall; an inner stage is PINNED (sticky) so the page appears
     to hold still while only this section advances.
   - A green progress bar runs down the left. As you scroll it FILLS, a glowing
     Kai marker travels down it, and the three step nodes light up in turn.
   - The big step copy (left) and the phone mockup (right) cross-fade per step.
   - Clicking a node / dot smooth-scrolls to that step's slice of the section.
   On small screens it degrades to a stacked, tappable list (no pin).
   ========================================================================== */

import { useEffect, useRef, useState } from 'react'
import {
  AnimatePresence,
  motion,
  useMotionValueEvent,
  useScroll,
  useTransform,
} from 'framer-motion'
import { steps } from './landingData'
import { PhoneFrame } from './PhoneMockups'
import { Reveal } from './Reveal'
import { StarrySkyBackground } from '@/components/ui/starry-sky-background'
import { smoothScrollTo } from '@/components/ui/SmoothScroll'

const ACCENT = '#00c896'

export function Flow() {
  const sectionRef = useRef<HTMLElement | null>(null)
  const [active, setActive] = useState(0)

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start start', 'end end'],
  })

  useMotionValueEvent(scrollYProgress, 'change', (latest) => {
    if (!steps.length) return
    const next = Math.min(steps.length - 1, Math.max(0, Math.floor(latest * steps.length)))
    setActive((current) => (current === next ? current : next))
  })

  const railFill = useTransform(scrollYProgress, [0, 1], ['0%', '100%'])
  const markerTop = useTransform(scrollYProgress, [0, 1], ['0%', '100%'])

  // Phone reads as one continuous Serve-Robotics shot: a slow scroll-linked dolly
  // (scale) plus a gentle parallax drift, layered over the per-step flip below.
  // lg-only — a phone this size would overflow a phone-sized viewport.
  const phoneScale = useTransform(scrollYProgress, [0, 1], [1, 1.26])
  const phoneY = useTransform(scrollYProgress, [0, 1], [28, -28])

  const [isDesktop, setIsDesktop] = useState(false)
  useEffect(() => {
    const mq = window.matchMedia('(min-width: 1024px)')
    const update = () => setIsDesktop(mq.matches)
    update()
    mq.addEventListener('change', update)
    return () => mq.removeEventListener('change', update)
  }, [])

  const selectStep = (index: number) => {
    if (index < 0 || index >= steps.length) return
    setActive(index)
    const section = sectionRef.current
    if (!section) return

    const scrollableDistance = section.offsetHeight - window.innerHeight
    if (scrollableDistance <= 0) return

    const sectionTop = section.getBoundingClientRect().top + window.scrollY
    // aim for the centre of the step's slice so it lands cleanly on that step
    const progress = (index + 0.5) / steps.length
    smoothScrollTo(sectionTop + scrollableDistance * progress)
  }

  if (!steps.length) return null

  return (
    <section
      ref={sectionRef}
      id="flow"
      className="relative scroll-mt-36 px-6 py-32 md:px-10 lg:h-[320vh] lg:px-16 lg:pb-0 lg:pt-24"
    >
      <StarrySkyBackground className="z-0" />
      {/* Pin below the floating nav so the heading never sits underneath it */}
      <div className="relative z-[1] lg:sticky lg:top-[5.5rem] lg:flex lg:h-[calc(100dvh-5.5rem)] lg:flex-col lg:justify-start lg:overflow-hidden lg:pb-6 lg:pt-2">
        <div className="mx-auto flex w-full max-w-7xl flex-col lg:min-h-0 lg:flex-1">
          {/* heading — like "Small team, big vision" */}
          <div className="mb-8 shrink-0 text-center lg:mb-10 lg:pt-2">
            <Reveal>
              <p className="mb-3 text-xs font-semibold uppercase tracking-[0.24em] text-[var(--kx-accent)]">Steps</p>
            </Reveal>
            <Reveal delay={0.05}>
              <h2 className="font-display text-[clamp(2.4rem,5vw,4rem)] font-semibold leading-[1.05] tracking-[-0.03em] text-white">
                Three simple steps.
              </h2>
            </Reveal>
          </div>

          <div className="grid min-h-0 flex-1 items-start gap-10 lg:grid-cols-[46fr_54fr] lg:items-center lg:gap-12">
            {/* ── left: green bar + step copy ── */}
            <div className="grid grid-cols-[auto_1fr] gap-6 md:gap-8">
              {/* the bar */}
              <div className="relative w-[3px] rounded-full bg-white/[0.08]">
                {/* fill (lg uses scroll; smaller screens fill to the active step) */}
                <motion.div
                  className="absolute inset-x-0 top-0 hidden rounded-full lg:block"
                  style={{ height: railFill, background: ACCENT, boxShadow: '0 0 14px #00c896aa' }}
                />
                <div
                  className="absolute inset-x-0 top-0 rounded-full lg:hidden"
                  style={{
                    height: `${((active + 1) / steps.length) * 100}%`,
                    background: ACCENT,
                    transition: 'height 0.4s ease',
                  }}
                />

                {/* travelling Kai marker (lg) */}
                <motion.div
                  className="absolute left-1/2 hidden h-3.5 w-3.5 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full lg:flex"
                  style={{ top: markerTop, background: ACCENT, boxShadow: '0 0 18px 4px #00c896aa' }}
                >
                  <span className="h-1.5 w-1.5 rounded-full bg-[#04130d]" />
                </motion.div>

                {/* step nodes */}
                {steps.map((step, i) => {
                  const top = steps.length <= 1 ? 0 : (i / (steps.length - 1)) * 100
                  const reached = active >= i
                  return (
                    <button
                      key={step.id}
                      type="button"
                      onClick={() => selectStep(i)}
                      aria-label={`Go to step ${i + 1}: ${step.title}`}
                      className="absolute left-1/2 h-3 w-3 -translate-x-1/2 -translate-y-1/2 cursor-pointer rounded-full ring-2 transition-colors duration-300"
                      style={{
                        top: `${top}%`,
                        background: reached ? ACCENT : '#0a0a0a',
                        borderColor: 'transparent',
                        boxShadow: reached ? '0 0 0 1px #00c896' : '0 0 0 1px rgba(255,255,255,0.18)',
                      }}
                    >
                      <span
                        className="block h-full w-full rounded-full"
                        style={{ background: reached ? ACCENT : 'transparent' }}
                      />
                    </button>
                  )
                })}
              </div>

              {/* active step copy */}
              <div className="min-h-[220px] lg:min-h-[200px]">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={active}
                    initial={{ opacity: 0, y: 26 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -22 }}
                    transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                  >
                    <span className="font-display text-6xl font-bold tabular-nums text-[var(--kx-accent)]/30">
                      {steps[active]?.id}
                    </span>
                    <h3 className="font-display mt-2 text-4xl font-semibold leading-tight text-white md:text-5xl">
                      {steps[active]?.title}
                    </h3>
                    <p className="mt-5 max-w-md text-lg leading-[1.7] text-white/55">{steps[active]?.body}</p>
                  </motion.div>
                </AnimatePresence>

                {/* dot indicators (mobile-friendly control) */}
                <div className="mt-8 flex gap-2">
                  {steps.map((_, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => selectStep(i)}
                      aria-label={`Go to step ${i + 1}`}
                      className="h-1.5 rounded-full transition-all duration-300"
                      style={{ width: active === i ? 26 : 8, background: active === i ? ACCENT : 'rgba(255,255,255,0.2)' }}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* ── right: phone mockup, flips on step change ── */}
            <motion.div
              className="[perspective:1200px] mx-auto w-full max-w-[340px] lg:-mt-4 lg:mx-0 lg:max-w-none"
              style={isDesktop ? { scale: phoneScale, y: phoneY } : undefined}
            >
              <AnimatePresence mode="wait">
                <motion.div
                  key={active}
                  initial={{ rotateY: -22, scale: 0.9, opacity: 0 }}
                  animate={{ rotateY: 0, scale: 1, opacity: 1 }}
                  exit={{ rotateY: 10, scale: 0.95, opacity: 0 }}
                  transition={{ type: 'spring', stiffness: 140, damping: 20 }}
                  style={{ transformStyle: 'preserve-3d' }}
                >
                  <PhoneFrame step={active} />
                </motion.div>
              </AnimatePresence>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  )
}