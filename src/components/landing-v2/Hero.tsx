'use client'

import { motion } from 'framer-motion'
import { ArrowUpRight, Play } from 'lucide-react'
import { KaiOrb } from './KaiOrb'
import { SpringButton } from './SpringButton'

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1, delayChildren: 0.15 } },
}
const item = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] as const } },
}

export function Hero() {
  return (
    <section
      id="top"
      className="relative flex min-h-[100svh] items-center overflow-hidden pt-16"
    >
      {/* Backdrop glow + faint clinical grid */}
      <div className="kx-vignette pointer-events-none absolute inset-0" />
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage:
            'linear-gradient(var(--line) 1px, transparent 1px), linear-gradient(90deg, var(--line) 1px, transparent 1px)',
          backgroundSize: '64px 64px',
          maskImage: 'radial-gradient(120% 90% at 70% 40%, #000 30%, transparent 75%)',
        }}
      />

      <div className="relative mx-auto grid w-full max-w-[1240px] grid-cols-1 items-center gap-12 px-6 md:px-10 lg:grid-cols-[1.05fr_0.95fr]">
        {/* Copy — left, intentionally not centered */}
        <motion.div variants={container} initial="hidden" animate="show" className="relative z-10 max-w-[34rem]">
          <motion.div variants={item} className="mb-7 inline-flex items-center gap-2.5">
            <span className="h-1.5 w-1.5 rounded-full bg-[var(--amber)] shadow-[0_0_10px_var(--amber-glow)]" />
            <span className="kx-mono text-[0.72rem] uppercase tracking-[0.22em] text-[var(--fg-2)]">
              Precision health intelligence
            </span>
          </motion.div>

          <motion.h1
            variants={item}
            className="kx-serif text-[clamp(3.4rem,2rem+7vw,6.6rem)] text-[var(--fg)]"
          >
            Understand your
            <br />
            health in the
            <br />
            language you
            <br />
            <span className="kx-serif-italic kx-amber">think&nbsp;in.</span>
          </motion.h1>

          <motion.p
            variants={item}
            className="mt-8 max-w-[30rem] text-[1.075rem] leading-relaxed text-[var(--fg-2)]"
          >
            Kai reads your symptoms, lab results, and clinical notes in your native
            language — then hands your doctor a precise report in theirs.
          </motion.p>

          <motion.div variants={item} className="mt-10 flex flex-wrap items-center gap-4">
            <SpringButton href="#waitlist" variant="primary">
              Get early access
              <ArrowUpRight className="h-4 w-4" strokeWidth={2.2} />
            </SpringButton>
            <SpringButton href="#how" variant="ghost">
              <Play className="h-3.5 w-3.5 fill-current" strokeWidth={0} />
              See how it works
            </SpringButton>
          </motion.div>

          <motion.div variants={item} className="mt-12 flex items-center gap-6">
            <p className="kx-mono text-[0.72rem] uppercase tracking-[0.16em] text-[var(--fg-3)]">
              25 languages · HIPAA-aware · free for patients
            </p>
          </motion.div>
        </motion.div>

        {/* Kai — alive, overlapping the right edge */}
        <motion.div
          initial={{ opacity: 0, scale: 0.92 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1] }}
          className="relative flex items-center justify-center lg:-mr-10"
        >
          <KaiOrb size={520} className="max-w-[88vw]" />
        </motion.div>
      </div>

      {/* Scroll cue */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.4, duration: 0.8 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
        aria-hidden="true"
      >
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          className="kx-mono text-[0.68rem] uppercase tracking-[0.2em] text-[var(--fg-3)]"
        >
          Scroll
        </motion.div>
      </motion.div>
    </section>
  )
}