'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Volume2 } from 'lucide-react'

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
  }, [langCode])

  const preview = (voice: SpeechSynthesisVoice) => {
    speechSynthesis.cancel()
    const utterance = new SpeechSynthesisUtterance('Hello, I am Kai.')
    utterance.voice = voice
    utterance.rate = 0.9
    utterance.onstart = () => setPreviewing(voice.name)
    utterance.onend = () => setPreviewing(null)
    speechSynthesis.speak(utterance)
  }

  if (voices.length === 0) {
    return (
      <p className="text-sm py-4 text-center" style={{ color: '#3B6D11' }}>
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
          className="flex items-center justify-between px-4 py-3 rounded-xl text-left transition-all"
          style={{
            background: selected === voice.name ? '#d4f5e5' : '#f8fffe',
            border: `1.5px solid ${selected === voice.name ? '#2da866' : '#c5edd8'}`,
          }}
          whileTap={{ scale: 0.98 }}
        >
          <div>
            <div className="text-sm font-medium" style={{ color: '#0f2419' }}>{voice.name}</div>
            <div className="text-xs" style={{ color: '#3B6D11' }}>{voice.lang} · {voice.localService ? 'Local' : 'Network'}</div>
          </div>
          <motion.div
            animate={previewing === voice.name ? { opacity: [1, 0.3, 1] } : { opacity: 1 }}
            transition={{ duration: 0.5, repeat: previewing === voice.name ? Infinity : 0 }}
          >
            <Volume2 size={16} style={{ color: selected === voice.name ? '#2da866' : '#3B6D11' }} />
          </motion.div>
        </motion.button>
      ))}
    </div>
  )
}
