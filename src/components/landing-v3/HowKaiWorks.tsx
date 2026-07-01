'use client'

/* ====================== SECTION 5 — HOW KAI WORKS =========================
   Feature rows slide in from the left as they enter the viewport (staggered).
   Right side: Kai with radial glow + expanding pulse rings + the teal waveform
   whose per-bar delays make it read like a live audio signal, not a loop.
   ========================================================================== */

import { motion, type Variants } from 'framer-motion'
import { StarrySkyBackground } from '@/components/ui/starry-sky-background'
import { KaiRobot, Waveform } from './KaiRobot'
import { MotionLink } from './MotionLink'

const features = [
  {
    icon: '🎙',
    label: 'Speak naturally',
    description: 'No forms, no medical jargon. Say what hurts in your own words.',
  },
  {
    icon: '🔄',
    label: 'Real-time interpretation',
    description: 'Kai converts your words into precise clinical language as you speak.',
  },
  {
    icon: '📋',
    label: 'Instant report',
    description: 'Your doctor gets a structured summary before you sit down.',
  },
]

const rowsContainer: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.16 } },
}

const row: Variants = {
  hidden: { x: -40, opacity: 0 },
  show: { x: 0, opacity: 1, transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] } },
}

const PULSE_RINGS = [
  { delay: 0, opacity: 0.3 },
  { delay: 0.6, opacity: 0.2 },
  { delay: 1.2, opacity: 0.1 },
]

export function HowKaiWorks() {
  return (
    <section id="how-kai-works" className="relative scroll-mt-32 overflow-hidden px-6 py-24 md:px-10 lg:px-16 lg:py-32">
      <StarrySkyBackground interactive className="z-0" />
      <div className="relative z-[1] mx-auto grid max-w-7xl items-center gap-14 lg:grid-cols-[55fr_45fr]">
        <div>
          <motion.p
            className="mb-4 text-xs font-semibold uppercase tracking-[0.24em] text-[var(--kx-accent)]"
            initial={{ opacity: 0, x: -24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-12%' }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          >
            How Kai works
          </motion.p>
          <motion.h2
            className="font-display max-w-2xl text-[2.8rem] font-semibold leading-[1.05] tracking-[-0.04em] text-white"
            initial={{ opacity: 0, x: -24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-12%' }}
            transition={{ duration: 0.7, delay: 0.05, ease: [0.16, 1, 0.3, 1] }}
          >
            Kai listens like a person. Reports like a doctor.
          </motion.h2>

          <motion.div
            className="mt-10 space-y-6"
            variants={rowsContainer}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: '-12%' }}
          >
            {features.map((feature) => (
              <motion.div key={feature.label} className="flex gap-4" variants={row} style={{ willChange: 'transform, opacity' }}>
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[12px] bg-[#00c896]/10 text-xl ring-1 ring-[#00c896]/20">
                  {feature.icon}
                </div>
                <div>
                  <h3 className="font-semibold text-white">{feature.label}</h3>
                  <p className="mt-1 max-w-xl leading-[1.7] text-white/55">{feature.description}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>

          <motion.div
            className="mt-10 flex flex-col items-start gap-4 sm:flex-row sm:items-center"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true, margin: '-12%' }}
            transition={{ duration: 0.5, delay: 0.5 }}
          >
            <a
              href="#flow"
              className="inline-flex cursor-pointer text-sm font-semibold text-[var(--kx-accent)] underline-offset-4 transition-all duration-200 hover:underline"
            >
              See the three steps <span aria-hidden="true">→</span>
            </a>
            <MotionLink href="/onboarding?fresh=1">
              Open app <span aria-hidden="true">→</span>
            </MotionLink>
          </motion.div>
        </div>

        {/* Kai + pulse rings + live waveform */}
        <div className="relative flex flex-col items-center justify-center">
          <div
            className="pointer-events-none absolute h-[520px] w-[520px] rounded-full"
            style={{ background: 'radial-gradient(circle, rgba(0,200,150,0.14) 0%, transparent 70%)' }}
            aria-hidden
          />
          <div className="relative flex h-[340px] w-full items-center justify-center">
            {PULSE_RINGS.map(({ delay, opacity }) => (
              <motion.div
                key={delay}
                className="absolute h-40 w-40 rounded-full border"
                style={{ borderColor: `rgba(0,200,150,${opacity})` }}
                animate={{ scale: [1, 2], opacity: [0.8, 0] }}
                transition={{ duration: 2.4, delay, repeat: Infinity, ease: 'easeOut' }}
                aria-hidden
              />
            ))}
            <KaiRobot size={260} />
          </div>
          <Waveform count={32} className="relative mt-4 w-[280px]" />
        </div>
      </div>
    </section>
  )
}