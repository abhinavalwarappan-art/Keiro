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
      className={`grid grid-cols-4 gap-2 pb-1 ${disabled ? 'pointer-events-none opacity-50' : ''}`}
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
            className={`flex min-h-[72px] min-w-0 flex-col items-center justify-center rounded-[1.25rem] border px-1.5 py-3 transition-colors duration-150 ${opt.classes}`}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            whileTap={{ scale: 0.97 }}
          >
            <span className="text-xl font-semibold leading-tight tabular-nums">{opt.range}</span>
            <span dir="auto" className="mt-0.5 max-w-full break-words text-center text-sm font-medium leading-tight">{word}</span>
          </motion.button>
        )
      })}
    </div>
  )
}

/* Yes and No carry equal visual weight on purpose. A filled "Yes" next to an
   outlined "No" nudges an answer, and these are clinical answers. */
const YES_NO_CLASSES =
  'min-h-14 flex-1 rounded-full border border-border-default bg-surface px-5 text-lg font-semibold text-text-primary transition-colors duration-150 hover:border-brand-ink hover:bg-brand-subtle'

export function YesNoPicker({ onSelect, disabled = false, langCode }: SeverityPickerProps) {
  const t = useTranslations(langCode)

  return (
    <div
      className={`flex gap-2 pb-1 ${disabled ? 'pointer-events-none opacity-50' : ''}`}
      role="group"
      aria-label={t('picker.yesNoGroup')}
    >
      <motion.button
        onClick={() => onSelect(t('picker.yes'))}
        disabled={disabled}
        aria-disabled={disabled}
        type="button"
        className={YES_NO_CLASSES}
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
        className={YES_NO_CLASSES}
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