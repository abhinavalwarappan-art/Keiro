'use client'

import { motion } from 'framer-motion'

interface SeverityPickerProps {
  onSelect: (value: string) => void
  disabled?: boolean
}

/* The 1–10 pain scale keeps four clinically distinct steps; orange (7–8) is a
   deliberate one-off between warning and error so the scale stays readable. */
const SEVERITY_OPTIONS = [
  { label: '1–3', desc: 'Mild', classes: 'bg-brand-subtle border-brand-muted text-brand-ink hover:border-brand' },
  { label: '4–6', desc: 'Moderate', classes: 'bg-warning-subtle border-warning/20 text-warning-text hover:border-warning' },
  { label: '7–8', desc: 'Severe', classes: 'bg-[#FFF7ED] border-[#FED7AA] text-[#9A3412] hover:border-[#EA580C]' },
  { label: '9–10', desc: 'Critical', classes: 'bg-error-subtle border-error/20 text-error-text hover:border-error' },
]

export function SeverityPicker({ onSelect, disabled = false }: SeverityPickerProps) {
  return (
    <div
      className={`flex gap-2 overflow-x-auto px-4 pb-3 ${disabled ? 'pointer-events-none opacity-50' : ''}`}
      role="group"
      aria-label="Select severity level"
    >
      {SEVERITY_OPTIONS.map((opt, i) => (
        <motion.button
          key={opt.label}
          onClick={() => onSelect(opt.label)}
          disabled={disabled}
          aria-disabled={disabled}
          aria-label={`Severity ${opt.label} – ${opt.desc}`}
          type="button"
          className={`flex min-h-[64px] min-w-[72px] shrink-0 flex-col items-center rounded-lg border px-4 py-3 transition-colors duration-150 ${opt.classes}`}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.05 }}
          whileTap={{ scale: 0.97 }}
        >
          <span className="text-lg font-semibold leading-tight tabular-nums">{opt.label}</span>
          <span className="mt-0.5 text-xs font-medium">{opt.desc}</span>
        </motion.button>
      ))}
    </div>
  )
}

export function YesNoPicker({ onSelect, disabled = false }: SeverityPickerProps) {
  return (
    <div
      className={`flex gap-2 px-4 pb-3 ${disabled ? 'pointer-events-none opacity-50' : ''}`}
      role="group"
      aria-label="Yes or No"
    >
      <motion.button
        onClick={() => onSelect('Yes')}
        disabled={disabled}
        aria-disabled={disabled}
        type="button"
        className="min-h-[48px] flex-1 rounded-lg bg-brand-ink py-3 text-base font-medium text-white transition-colors duration-150 hover:bg-brand-ink-hover"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        whileTap={{ scale: 0.98 }}
      >
        Yes
      </motion.button>
      <motion.button
        onClick={() => onSelect('No')}
        disabled={disabled}
        aria-disabled={disabled}
        type="button"
        className="min-h-[48px] flex-1 rounded-lg border border-border-subtle bg-surface py-3 text-base font-medium text-text-primary transition-colors duration-150 hover:border-border-default hover:bg-sunken"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        whileTap={{ scale: 0.98 }}
      >
        No
      </motion.button>
    </div>
  )
}