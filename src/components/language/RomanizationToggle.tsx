'use client'

import { motion } from 'framer-motion'
import { Type } from 'lucide-react'

interface RomanizationToggleProps {
  enabled: boolean
  onToggle: () => void
}

export default function RomanizationToggle({ enabled, onToggle }: RomanizationToggleProps) {
  return (
    <button
      onClick={onToggle}
      className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-medium transition-all"
      style={{
        background: enabled ? '#d4f5e5' : '#f8fffe',
        border: `1.5px solid ${enabled ? '#2da866' : '#c5edd8'}`,
        color: enabled ? '#2da866' : '#3B6D11',
      }}
    >
      <Type size={12} />
      <span>Romanized</span>
      <div
        className="w-7 h-4 rounded-full relative transition-colors"
        style={{ background: enabled ? '#2da866' : '#c5edd8' }}
      >
        <motion.div
          className="absolute top-0.5 w-3 h-3 rounded-full bg-white shadow-sm"
          animate={{ left: enabled ? '14px' : '2px' }}
          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
        />
      </div>
    </button>
  )
}
