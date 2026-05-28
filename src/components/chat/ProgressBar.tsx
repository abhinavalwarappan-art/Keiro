'use client'

import { motion } from 'framer-motion'

interface ProgressBarProps {
  step: number
  total: number
}

export default function ProgressBar({ step, total }: ProgressBarProps) {
  const pct = Math.round((step / total) * 100)

  return (
    <div className="px-4 py-2 flex items-center gap-3" style={{ background: '#f8fffe', borderBottom: '1px solid #c5edd8' }}>
      <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: '#c5edd8' }}>
        <motion.div
          className="h-full rounded-full"
          style={{ background: '#2da866' }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
        />
      </div>
      <span className="text-xs font-medium flex-shrink-0" style={{ color: '#3B6D11' }}>
        Step {step} of {total}
      </span>
    </div>
  )
}
