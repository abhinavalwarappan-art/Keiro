'use client'

import { motion } from 'framer-motion'

interface RomanizationToggleProps {
  enabled: boolean
  onToggle: () => void
}

/**
 * Show Kai's messages in English letters instead of the native script.
 *
 * The label is deliberately in Latin letters: the person this exists for is the
 * one who speaks the language but can't read its script, so a label written in
 * that script would be unreadable to exactly them. No hover tooltip — phones
 * have no hover — the label itself says what it does.
 */
export default function RomanizationToggle({ enabled, onToggle }: RomanizationToggleProps) {
  return (
    <motion.button
      type="button"
      onClick={onToggle}
      whileTap={{ scale: 0.97 }}
      transition={{ type: 'spring', stiffness: 700, damping: 45 }}
      dir="ltr"
      className={`flex min-h-12 items-center gap-3 rounded-full px-4 text-base font-medium transition-colors duration-150 ${
        enabled ? 'bg-brand-subtle text-brand-ink' : 'bg-sunken text-text-secondary hover:text-text-primary'
      }`}
      aria-pressed={enabled}
      aria-label="Toggle romanized script"
      aria-describedby="romanization-description"
    >
      <span>English letters (ABC)</span>
      <span
        className={`relative h-6 w-10 shrink-0 rounded-full transition-colors duration-150 ${
          enabled ? 'bg-brand-ink' : 'bg-border-default'
        }`}
        aria-hidden
      >
        <motion.span
          className="absolute left-0.5 top-0.5 size-5 rounded-full bg-white shadow-xs"
          animate={{ x: enabled ? 16 : 0 }}
          transition={{ type: 'spring', stiffness: 500, damping: 34 }}
        />
      </span>
      <span id="romanization-description" className="sr-only">
        Shows Kai’s messages using English letters instead of the native script.
      </span>
    </motion.button>
  )
}
