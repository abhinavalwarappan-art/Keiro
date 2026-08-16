'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Volume2 } from 'lucide-react'
import { speakText, stopSpeech } from '@/lib/speech'
import { useTranslations } from '@/i18n/useTranslations'
import type { MessageKey } from '@/i18n/useTranslations'
import type { VoiceType } from '@/types'

/**
 * Pick which Keiro voice Kai speaks in — the same two choices the patient made
 * at intake, so they can change their mind later. Both voices are multilingual,
 * so this list is the same in every language.
 */
const VOICES: { value: VoiceType; labelKey: MessageKey }[] = [
  { value: 'female', labelKey: 'intake.voiceFemale' },
  { value: 'male', labelKey: 'intake.voiceMale' },
]

interface VoicePickerProps {
  langCode: string
  selected?: VoiceType
  onSelect: (voice: VoiceType) => void
}

export default function VoicePicker({ langCode, selected, onSelect }: VoicePickerProps) {
  const t = useTranslations(langCode)
  const [previewing, setPreviewing] = useState<VoiceType | null>(null)

  // Never leave a preview talking after the sheet closes.
  useEffect(() => () => stopSpeech(), [])

  const preview = (voice: VoiceType) => {
    stopSpeech()
    speakText(t('auth.kaiIntro'), langCode, {
      voiceType: voice,
      onStart: () => setPreviewing(voice),
      onEnd: () => setPreviewing(null),
      onError: () => setPreviewing(null),
    })
  }

  return (
    <div className="flex flex-col gap-1">
      {VOICES.map(voice => {
        const isSelected = selected === voice.value
        return (
          <motion.button
            key={voice.value}
            type="button"
            aria-pressed={isSelected}
            onClick={() => { onSelect(voice.value); preview(voice.value) }}
            className={`flex items-center justify-between rounded-md border px-4 py-3 text-left transition-colors duration-150 ${
              isSelected
                ? 'border-brand-border bg-brand-subtle'
                : 'border-border-subtle bg-surface hover:border-border-default hover:bg-sunken'
            }`}
            whileTap={{ scale: 0.99 }}
          >
            <div className="text-sm font-medium text-text-primary">{t(voice.labelKey)}</div>
            <motion.div
              animate={previewing === voice.value ? { opacity: [1, 0.3, 1] } : { opacity: 1 }}
              transition={{ duration: 0.5, repeat: previewing === voice.value ? Infinity : 0 }}
            >
              <Volume2 size={16} className={isSelected ? 'text-brand-ink' : 'text-text-tertiary'} aria-hidden />
            </motion.div>
          </motion.button>
        )
      })}
    </div>
  )
}
