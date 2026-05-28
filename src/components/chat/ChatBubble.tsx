'use client'

import { useState, useCallback } from 'react'
import { motion } from 'framer-motion'
import { Volume2, VolumeX } from 'lucide-react'
import KaiMini from '@/components/kai/KaiMini'
import { ChatMessage } from '@/types'

interface ChatBubbleProps {
  message: ChatMessage
  langCode: string
  voiceName?: string
  autoSpeak?: boolean
}

export default function ChatBubble({ message, langCode, voiceName, autoSpeak }: ChatBubbleProps) {
  const [speaking, setSpeaking] = useState(false)
  const isKai = message.role === 'kai'

  const speak = useCallback(() => {
    if (!('speechSynthesis' in window)) return
    if (speaking) {
      window.speechSynthesis.cancel()
      setSpeaking(false)
      return
    }

    window.speechSynthesis.cancel()
    const utterance = new SpeechSynthesisUtterance(message.content)
    utterance.lang = langCode
    utterance.rate = 0.9

    if (voiceName) {
      const voices = speechSynthesis.getVoices()
      const voice = voices.find(v => v.name === voiceName)
      if (voice) utterance.voice = voice
    }

    utterance.onstart = () => setSpeaking(true)
    utterance.onend = () => setSpeaking(false)
    utterance.onerror = () => setSpeaking(false)
    speechSynthesis.speak(utterance)
  }, [speaking, message.content, langCode, voiceName])

  return (
    <motion.div
      className={`flex ${isKai ? 'items-end gap-2 justify-start' : 'justify-end'} mb-3`}
      initial={{ opacity: 0, y: 12, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
    >
      {isKai && <KaiMini speaking={speaking} />}

      <div className="flex flex-col gap-1 max-w-[75%]">
        <div
          className="px-4 py-3 rounded-2xl text-sm leading-relaxed"
          style={isKai
            ? { background: '#1a3d2b', color: '#edfaf4', borderBottomLeftRadius: 4 }
            : { background: '#2da866', color: 'white', borderBottomRightRadius: 4 }
          }
        >
          {message.content}
        </div>

        {isKai && (
          <button
            onClick={speak}
            className="flex items-center gap-1.5 text-xs px-2 py-1 rounded-lg self-start transition-all"
            style={{
              color: speaking ? '#2da866' : '#3B6D11',
              background: speaking ? '#d4f5e5' : 'transparent',
            }}
          >
            {speaking ? (
              <>
                <SoundWave />
                <span>Stop</span>
              </>
            ) : (
              <>
                <Volume2 size={12} />
                <span>Listen to Kai</span>
              </>
            )}
          </button>
        )}
      </div>
    </motion.div>
  )
}

function SoundWave() {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 2, 1].map((h, i) => (
        <motion.div
          key={i}
          className="w-0.5 rounded-full"
          style={{ background: '#2da866', height: h * 4 }}
          animate={{ scaleY: [1, 1.8, 1] }}
          transition={{ duration: 0.5, repeat: Infinity, delay: i * 0.08, ease: 'easeInOut' }}
        />
      ))}
    </div>
  )
}
