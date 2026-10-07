'use client'

import { Loader2, Mic, Square } from 'lucide-react'
import { motion, useReducedMotion } from 'framer-motion'

export type MicState = 'idle' | 'requesting' | 'recording' | 'transcribing'

interface MicButtonProps {
  state: MicState
  disabled: boolean
  onClick: () => void
  /** Already-localized accessible name for the recording state (the stop label). */
  stopLabel: string
  /** Already-localized accessible names for the other states. */
  labels: { idle: string; requesting: string; transcribing: string }
}

/** Press is a critically damped spring that starts on pointer-down. */
const PRESS_SPRING = { type: 'spring', stiffness: 700, damping: 45 } as const

/**
 * The single most important target in the product: where a patient taps to
 * speak. 64px, filled, and the only filled circle in the composer, so it reads
 * as "start here" without any words — Keiro has 45 languages and button copy
 * is translated for only some of them.
 *
 * State is carried by SHAPE as well as color (mic → square stop glyph →
 * spinner), never by color alone.
 */
export default function MicButton({ state, disabled, onClick, stopLabel, labels }: MicButtonProps) {
  const reduceMotion = useReducedMotion()
  const recording = state === 'recording'
  const busy = state === 'requesting' || state === 'transcribing'

  return (
    <div className="relative flex size-16 shrink-0 items-center justify-center">
      {recording && (
        <span
          aria-hidden
          className="mic-ring pointer-events-none absolute inset-0 rounded-full bg-error"
        />
      )}
      <motion.button
        type="button"
        onClick={onClick}
        disabled={disabled}
        whileTap={reduceMotion || disabled ? undefined : { scale: 0.93 }}
        transition={PRESS_SPRING}
        aria-label={state === 'recording' ? stopLabel : labels[state]}
        aria-pressed={recording}
        className={`relative flex size-16 items-center justify-center rounded-full text-white shadow-md transition-colors duration-150 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand-ink/30 disabled:opacity-60 ${
          recording
            ? 'bg-error'
            : busy
              ? 'bg-brand-ink/85'
              : 'bg-brand-ink hover:bg-brand-ink-hover active:bg-brand-ink-active'
        }`}
      >
        {busy ? (
          <Loader2 size={26} className="animate-spin" aria-hidden />
        ) : recording ? (
          <Square size={22} fill="currentColor" strokeWidth={0} aria-hidden />
        ) : (
          <Mic size={28} aria-hidden />
        )}
      </motion.button>
    </div>
  )
}
