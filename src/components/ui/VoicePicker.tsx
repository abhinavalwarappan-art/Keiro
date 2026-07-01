'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Volume2 } from 'lucide-react'
import { applyClearSpeechSettings } from '@/lib/speech'

interface VoicePickerProps {
  langCode: string
  selected?: string
  onSelect: (voiceName: string) => void
}

export default function VoicePicker({ langCode, selected, onSelect }: VoicePickerProps) {
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([])
  const [previewing, setPreviewing] = useState<string | null>(null)

  useEffect(() => {
    const load = () => {
      const langPrefix = langCode.split('-')[0]
      const available = speechSynthesis.getVoices().filter(v => v.lang.startsWith(langPrefix))
      setVoices(available)
    }
    load()
    speechSynthesis.onvoiceschanged = load

    return () => {
      speechSynthesis.onvoiceschanged = null
      speechSynthesis.cancel()
    }
  }, [langCode])

  const preview = (voice: SpeechSynthesisVoice) => {
    speechSynthesis.cancel()
    const utterance = new SpeechSynthesisUtterance('Hello, I am Kai.')
    applyClearSpeechSettings(utterance, voice, langCode)
    utterance.onstart = () => setPreviewing(voice.name)
    utterance.onend = () => setPreviewing(null)
    utterance.onerror = () => setPreviewing(null)
    speechSynthesis.speak(utterance)
  }

  if (voices.length === 0) {
    return (
      <p className="py-4 text-center text-sm text-text-secondary">
        No voices available for this language on your device.
      </p>
    )
  }

  return (
    <div className="flex flex-col gap-1">
      {voices.map(voice => (
        <motion.button
          key={voice.name}
          onClick={() => { onSelect(voice.name); preview(voice) }}
          className={`flex items-center justify-between rounded-md border px-4 py-3 text-left transition-colors duration-150 ${
            selected === voice.name
              ? 'border-brand-border bg-brand-subtle'
              : 'border-border-subtle bg-surface hover:border-border-default hover:bg-sunken'
          }`}
          whileTap={{ scale: 0.99 }}
        >
          <div>
            <div className="text-sm font-medium text-text-primary">{voice.name}</div>
            <div className="text-xs text-text-tertiary">{voice.lang} · {voice.localService ? 'Local' : 'Network'}</div>
          </div>
          <motion.div
            animate={previewing === voice.name ? { opacity: [1, 0.3, 1] } : { opacity: 1 }}
            transition={{ duration: 0.5, repeat: previewing === voice.name ? Infinity : 0 }}
          >
            <Volume2 size={16} className={selected === voice.name ? 'text-brand-ink' : 'text-text-tertiary'} aria-hidden />
          </motion.div>
        </motion.button>
      ))}
    </div>
  )
}