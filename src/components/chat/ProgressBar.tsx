'use client'

import { motion } from 'framer-motion'

interface ProgressBarProps {
  step: number
  total: number
}

export default function ProgressBar({ step, total }: ProgressBarProps) {
  const safTotal = total > 0 ? total : 1
  const pct = Math.min(100, Math.max(0, Math.round((step / safTotal) * 100)))

  return (
    <div className="flex items-center gap-3 border-b border-border-subtle bg-canvas px-4 py-2">
      <div
        className="h-1 flex-1 overflow-hidden rounded-full bg-border-subtle"
        role="progressbar"
        aria-valuenow={pct}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={`Step ${step} of ${total}`}
      >
        <motion.div
          className="h-full w-full origin-left rounded-full bg-brand"
          animate={{ scaleX: pct / 100 }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
        />
      </div>
      <span className="shrink-0 text-xs font-medium tabular-nums text-text-tertiary">
        Step {step} of {total}
      </span>
    </div>
  )
}