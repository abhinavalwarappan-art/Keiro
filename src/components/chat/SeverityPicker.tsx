'use client'

import { motion } from 'framer-motion'
import { useTranslations, type MessageKey } from '@/i18n/useTranslations'

interface SeverityPickerProps {
  onSelect: (value: string) => void
  disabled?: boolean
  langCode: string
}

/* The 1–10 pain scale keeps four clinically distinct steps; `caution` (7–9) is the
   token that sits between warning and error so the scale stays readable. Tapping
   a chip sends the word + range (e.g. "Mild (1–3)") so the report LLM gets both.
   The word is sent in the patient's language — Kai reads it natively, and the report
   route translates the whole conversation into clinical English for the doctor. The
   numeric range is never translated, so the clinically load-bearing part survives. */
const SEVERITY_OPTIONS: { key: MessageKey; range: string; classes: string }[] = [
  { key: 'picker.mild', range: '1–3', classes: 'bg-brand-subtle border-brand-muted text-brand-ink hover:border-brand' },
  { key: 'picker.moderate', range: '4–6', classes: 'bg-warning-subtle border-warning/20 text-warning-text hover:border-warning' },
  { key: 'picker.severe', range: '7–9', classes: 'bg-caution-subtle border-caution-border text-caution-text hover:border-caution' },
  { key: 'picker.unbearable', range: '10', classes: 'bg-error-subtle border-error/20 text-error-text hover:border-error' },
]

export function SeverityPicker({ onSelect, disabled = false, langCode }: SeverityPickerProps) {
  const t = useTranslations(langCode)

  return (
    <div
      className={`flex gap-2 overflow-x-auto px-4 pb-3 ${disabled ? 'pointer-events-none opacity-50' : ''}`}
      role="group"
      aria-label={t('picker.severityGroup')}
    >
      {SEVERITY_OPTIONS.map((opt, i) => {
        const word = t(opt.key)
        return (
          <motion.button
            key={opt.key}
            onClick={() => onSelect(`${word} (${opt.range})`)}
            disabled={disabled}
            aria-disabled={disabled}
            aria-label={t('picker.severityOption', { word, range: opt.range })}
            type="button"
            className={`flex min-h-[64px] min-w-[72px] shrink-0 flex-col items-center rounded-lg border px-4 py-3 transition-colors duration-150 ${opt.classes}`}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            whileTap={{ scale: 0.97 }}
          >
            <span className="text-lg font-semibold leading-tight tabular-nums">{opt.range}</span>
            <span className="mt-0.5 text-xs font-medium">{word}</span>
          </motion.button>
        )
      })}
    </div>
  )
}

export function YesNoPicker({ onSelect, disabled = false, langCode }: SeverityPickerProps) {
  const t = useTranslations(langCode)

  return (
    <div
      className={`flex gap-2 px-4 pb-3 ${disabled ? 'pointer-events-none opacity-50' : ''}`}
      role="group"
      aria-label={t('picker.yesNoGroup')}
    >
      <motion.button
        onClick={() => onSelect(t('picker.yes'))}
        disabled={disabled}
        aria-disabled={disabled}
        type="button"
        className="min-h-[48px] flex-1 rounded-lg bg-brand-ink py-3 text-base font-medium text-white transition-colors duration-150 hover:bg-brand-ink-hover"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        whileTap={{ scale: 0.98 }}
      >
        {t('picker.yes')}
      </motion.button>
      <motion.button
        onClick={() => onSelect(t('picker.no'))}
        disabled={disabled}
        aria-disabled={disabled}
        type="button"
        className="min-h-[48px] flex-1 rounded-lg border border-border-subtle bg-surface py-3 text-base font-medium text-text-primary transition-colors duration-150 hover:border-border-default hover:bg-sunken"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        whileTap={{ scale: 0.98 }}
      >
        {t('picker.no')}
      </motion.button>
    </div>
  )
}