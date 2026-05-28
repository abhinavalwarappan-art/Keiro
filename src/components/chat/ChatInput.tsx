'use client'

import { useState, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Send, Mic, MicOff } from 'lucide-react'

interface ChatInputProps {
  onSend: (text: string) => void
  onTranscription?: (text: string) => void
  disabled?: boolean
  placeholder?: string
  langCode: string
}

export default function ChatInput({ onSend, onTranscription, disabled, placeholder, langCode }: ChatInputProps) {
  const [text, setText] = useState('')
  const [recording, setRecording] = useState(false)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<Blob[]>([])

  const handleSend = () => {
    const trimmed = text.trim()
    if (!trimmed || disabled) return
    onSend(trimmed)
    setText('')
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const recorder = new MediaRecorder(stream)
      chunksRef.current = []

      recorder.ondataavailable = e => {
        if (e.data.size > 0) chunksRef.current.push(e.data)
      }

      recorder.onstop = async () => {
        stream.getTracks().forEach(t => t.stop())
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' })
        const formData = new FormData()
        formData.append('audio', blob)
        formData.append('langCode', langCode)

        try {
          const res = await fetch('/api/transcribe', { method: 'POST', body: formData })
          const data = await res.json()
          if (data.text) {
            setText(data.text)
            onTranscription?.(data.text)
          }
        } catch {
          // transcription failed silently
        }
      }

      recorder.start()
      mediaRecorderRef.current = recorder
      setRecording(true)
    } catch {
      // mic access denied
    }
  }, [langCode, onTranscription])

  const stopRecording = useCallback(() => {
    mediaRecorderRef.current?.stop()
    mediaRecorderRef.current = null
    setRecording(false)
  }, [])

  return (
    <div className="flex items-end gap-2 p-3 border-t" style={{ borderColor: '#c5edd8', background: 'white' }}>
      <button
        onClick={recording ? stopRecording : startRecording}
        disabled={disabled}
        className="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center transition-all relative"
        style={{ background: recording ? '#2da866' : '#1a3d2b' }}
      >
        {recording ? <MicOff size={16} color="white" /> : <Mic size={16} color="white" />}
        {recording && (
          <motion.div
            className="absolute inset-0 rounded-full"
            style={{ border: '2px solid #5DCAA5' }}
            animate={{ scale: [1, 1.4, 1], opacity: [1, 0, 1] }}
            transition={{ duration: 1.2, repeat: Infinity }}
          />
        )}
      </button>

      <textarea
        value={text}
        onChange={e => setText(e.target.value)}
        onKeyDown={handleKeyDown}
        disabled={disabled}
        placeholder={placeholder || 'Type a message...'}
        rows={1}
        className="flex-1 resize-none rounded-xl px-4 py-2.5 text-sm outline-none transition-all"
        style={{
          background: '#f8fffe',
          border: '1.5px solid #c5edd8',
          color: '#0f2419',
          maxHeight: 120,
          lineHeight: '1.5',
        }}
        onInput={e => {
          const el = e.currentTarget
          el.style.height = 'auto'
          el.style.height = Math.min(el.scrollHeight, 120) + 'px'
        }}
      />

      <motion.button
        onClick={handleSend}
        disabled={!text.trim() || disabled}
        className="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center transition-all"
        style={{
          background: text.trim() && !disabled ? '#1a3d2b' : '#c5edd8',
          cursor: text.trim() && !disabled ? 'pointer' : 'default',
        }}
        whileTap={{ scale: 0.95 }}
      >
        <Send size={16} color={text.trim() && !disabled ? 'white' : '#3B6D11'} />
      </motion.button>
    </div>
  )
}
