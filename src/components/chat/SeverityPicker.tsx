'use client'

import { motion } from 'framer-motion'

interface SeverityPickerProps {
  onSelect: (value: string) => void
}

const SEVERITY_OPTIONS = [
  { label: '1–3', desc: 'Mild', color: '#5DCAA5' },
  { label: '4–6', desc: 'Moderate', color: '#F4A535' },
  { label: '7–8', desc: 'Severe', color: '#e07c20' },
  { label: '9–10', desc: 'Critical', color: '#A32D2D' },
]

const YES_NO = [
  { label: 'Yes', color: '#2da866' },
  { label: 'No', color: '#1a3d2b' },
]

export function SeverityPicker({ onSelect }: SeverityPickerProps) {
  return (
    <div className="flex gap-2 px-3 pb-2 overflow-x-auto">
      {SEVERITY_OPTIONS.map((opt, i) => (
        <motion.button
          key={opt.label}
          onClick={() => onSelect(opt.label)}
          className="flex-shrink-0 flex flex-col items-center px-3 py-2 rounded-xl text-xs font-medium border"
          style={{ background: `${opt.color}20`, borderColor: opt.color, color: opt.color, minWidth: 64 }}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.06 }}
          whileTap={{ scale: 0.96 }}
        >
          <span className="text-base font-bold">{opt.label}</span>
          <span>{opt.desc}</span>
        </motion.button>
      ))}
    </div>
  )
}

export function YesNoPicker({ onSelect }: SeverityPickerProps) {
  return (
    <div className="flex gap-2 px-3 pb-2">
      {YES_NO.map((opt, i) => (
        <motion.button
          key={opt.label}
          onClick={() => onSelect(opt.label)}
          className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white"
          style={{ background: opt.color }}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.06 }}
          whileTap={{ scale: 0.97 }}
        >
          {opt.label}
        </motion.button>
      ))}
    </div>
  )
}
