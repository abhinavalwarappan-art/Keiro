'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { ArrowLeft, Mic, MicOff, Send, Stethoscope } from 'lucide-react'
import type { ConsultMessage, PatientProfile, Report } from '@/types'
import { stopSpeech } from '@/lib/speech'

interface LiveConsultModeProps {
  report: Report
  patientProfile: PatientProfile
  langCode: string
  langName: string
  roman: boolean
  onEnd: (transcript: ConsultMessage[], physicianNotes: string) => void
  onBack: () => void
}

function ConsultBubble({
  side,
  original,
  translation,
}: {
  side: 'doctor' | 'patient'
  original: string
  translation: string
}) {
  const isDoctor = side === 'doctor'
  return (
    <div className={`mb-4 flex flex-col ${isDoctor ? 'items-start' : 'items-end'}`}>
      <div
        className={`max-w-[90%] rounded-lg px-4 py-3 ${
          isDoctor
            ? 'rounded-bl-sm bg-surface border border-border-subtle'
            : 'rounded-br-sm bg-brand-subtle border border-brand-border'
        }`}
      >
        <p className="text-sm leading-relaxed text-text-primary">{original}</p>
        <p className="mt-2 border-t border-border-subtle/60 pt-2 text-xs leading-relaxed text-text-tertiary italic">
          {translation}
        </p>
      </div>
    </div>
  )
}

function ConsultPanel({
  side,
  label,
  placeholder,
  langCode,
  messages,
  onSend,
  disabled,
}: {
  side: 'doctor' | 'patient'
  label: string
  placeholder: string
  langCode: string
  messages: ConsultMessage[]
  onSend: (text: string) => Promise<void>
  disabled: boolean
}) {
  const [text, setText] = useState('')
  const [recording, setRecording] = useState(false)
  const [sending, setSending] = useState(false)
  const recognitionRef = useRef<SpeechRecognition | null>(null)
  const latestTranscriptRef = useRef('')
  const userStoppedRecordingRef = useRef(false)

  useEffect(() => {
    return () => {
      userStoppedRecordingRef.current = false
      recognitionRef.current?.abort()
    }
  }, [])

  const startRecording = () => {
    if (disabled || sending || recording) return

    const SpeechRecognitionCtor = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SpeechRecognitionCtor) {
      alert('Voice input is not supported in this browser. Please use Chrome.')
      return
    }

    stopSpeech()
    latestTranscriptRef.current = ''
    userStoppedRecordingRef.current = false

    const recognition = new SpeechRecognitionCtor()
    recognition.lang = langCode
    recognition.continuous = true
    recognition.interimResults = true

    recognition.onstart = () => setRecording(true)
    recognition.onresult = (e: SpeechRecognitionEvent) => {
      const parts: string[] = []
      for (let i = 0; i < e.results.length; i++) {
        parts.push(e.results[i][0].transcript)
      }
      const transcript = parts.join('').trim()
      latestTranscriptRef.current = transcript
      setText(transcript)
    }
    recognition.onend = () => {
      setRecording(false)
      recognitionRef.current = null
    }
    recognition.onerror = () => {
      setRecording(false)
      recognitionRef.current = null
    }

    recognitionRef.current = recognition
    recognition.start()
  }

  const stopRecording = () => {
    userStoppedRecordingRef.current = true
    recognitionRef.current?.stop()
  }

  const handleSend = async () => {
    const trimmed = text.trim()
    if (!trimmed || sending || disabled) return
    setSending(true)
    setText('')
    try {
      await onSend(trimmed)
    } finally {
      setSending(false)
    }
  }

  const panelMessages = messages.filter(m => m.side === side)

  return (
    <div className="flex min-h-0 flex-1 flex-col border-border-subtle md:border-r last:md:border-r-0">
      <div className="border-b border-border-subtle bg-sunken/50 px-4 py-3">
        <h3 className="text-sm font-semibold text-text-primary">{label}</h3>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4">
        {panelMessages.length === 0 ? (
          <p className="text-center text-sm text-text-tertiary py-8">
            {side === 'doctor' ? 'Type or speak in English' : 'Patient speaks in their language'}
          </p>
        ) : (
          panelMessages.map(m => (
            <ConsultBubble
              key={m.id}
              side={m.side}
              original={m.original}
              translation={m.translation}
            />
          ))
        )}
      </div>

      <div className="border-t border-border-subtle bg-surface p-3">
        <div className="flex items-end gap-2">
          <textarea
            value={text}
            onChange={e => setText(e.target.value)}
            placeholder={placeholder}
            rows={2}
            disabled={disabled || sending}
            onKeyDown={e => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault()
                void handleSend()
              }
            }}
            className="min-h-[44px] flex-1 resize-none rounded-md border border-border-subtle bg-canvas px-3 py-2 text-sm text-text-primary placeholder:text-text-placeholder focus:border-brand-strong focus:outline-none focus:ring-2 focus:ring-brand-strong/25 disabled:opacity-50"
          />
          <button
            type="button"
            onClick={() => (recording ? stopRecording() : startRecording())}
            disabled={disabled || sending}
            className={`flex size-12 shrink-0 items-center justify-center rounded-md border transition-colors active:scale-95 ${
              recording
                ? 'border-error bg-error-subtle text-error-text'
                : 'border-border-subtle bg-surface text-text-secondary hover:bg-sunken'
            }`}
            aria-label={recording ? 'Stop recording' : 'Start voice input'}
          >
            {recording ? <MicOff size={18} /> : <Mic size={18} />}
          </button>
          <button
            type="button"
            onClick={() => void handleSend()}
            disabled={disabled || sending || !text.trim()}
            className="flex size-12 shrink-0 items-center justify-center rounded-md bg-brand-ink text-white transition-colors hover:bg-brand-ink-hover active:scale-95 disabled:opacity-50"
            aria-label="Send message"
          >
            <Send size={18} />
          </button>
        </div>
      </div>
    </div>
  )
}

export function LiveConsultMode({
  report,
  patientProfile,
  langCode,
  langName,
  roman,
  onEnd,
  onBack,
}: LiveConsultModeProps) {
  const [messages, setMessages] = useState<ConsultMessage[]>(report.consult_transcript_json ?? [])
  const [physicianNotes, setPhysicianNotes] = useState(report.physician_notes ?? '')
  const [translating, setTranslating] = useState(false)
  const [showEndPanel, setShowEndPanel] = useState(false)
  const idRef = useRef(0)

  const translateMessage = useCallback(async (side: 'doctor' | 'patient', text: string) => {
    setTranslating(true)
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mode: 'consult',
          consultSide: side,
          consultText: text,
          language: langName,
          patientLanguageCode: langCode,
          romanization: roman,
        }),
      })

      if (!res.ok) throw new Error('Translation failed')
      const data = await res.json() as { translation?: string }
      const translation = (typeof data.translation === 'string' && data.translation) ? data.translation : text

      const entry: ConsultMessage = {
        id: `${Date.now()}-${++idRef.current}`,
        side,
        original: text,
        translation,
        timestamp: new Date().toISOString(),
      }

      setMessages(prev => [...prev, entry])
    } finally {
      setTranslating(false)
    }
  }, [langCode, langName, roman])

  const handleDoctorSend = useCallback(async (text: string) => {
    await translateMessage('doctor', text)
  }, [translateMessage])

  const handlePatientSend = useCallback(async (text: string) => {
    await translateMessage('patient', text)
  }, [translateMessage])

  const patientSummary = useMemo(() => {
    const parts = [
      patientProfile.fullName,
      patientProfile.age ? `${patientProfile.age}y` : null,
      patientProfile.biologicalSex,
    ].filter(Boolean)
    return parts.join(' · ')
  }, [patientProfile])

  return (
    <div className="flex h-[100dvh] min-h-0 flex-col bg-transparent">
      <div className="flex items-center gap-3 border-b border-border-subtle bg-surface px-4 py-3">
        <button
          type="button"
          onClick={onBack}
          className="flex size-9 min-h-11 min-w-11 items-center justify-center rounded-md text-text-secondary transition-colors hover:bg-sunken active:scale-95"
          aria-label="Go back"
        >
          <ArrowLeft size={17} />
        </button>
        <div className="flex-1">
          <div className="flex items-center gap-2 text-sm font-semibold text-text-primary">
            <Stethoscope size={16} className="text-brand" />
            Live Consult Mode
          </div>
          <p className="text-xs text-text-tertiary">{patientSummary} · Report {report.report_id}</p>
        </div>
        <button
          type="button"
          onClick={() => setShowEndPanel(true)}
          className="min-h-11 rounded-md bg-brand-ink px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-brand-ink-hover active:scale-95"
        >
          End Consult
        </button>
      </div>

      {translating && (
        <div className="bg-brand-subtle px-4 py-2 text-center text-xs font-medium text-brand-ink">
          Translating…
        </div>
      )}

      <div className="flex min-h-0 flex-1 flex-col md:flex-row">
        <ConsultPanel
          side="doctor"
          label="Doctor (English)"
          placeholder="Type in English…"
          langCode="en-US"
          messages={messages}
          onSend={handleDoctorSend}
          disabled={translating}
        />
        <ConsultPanel
          side="patient"
          label={`Patient (${langName})`}
          placeholder={`Type in ${langName}…`}
          langCode={langCode}
          messages={messages}
          onSend={handlePatientSend}
          disabled={translating}
        />
      </div>

      {showEndPanel && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-4 backdrop-blur-sm sm:items-center"
          role="dialog"
          aria-modal="true"
        >
          <motion.div
            initial={{ y: 24 }}
            animate={{ y: 0 }}
            className="flex w-full max-w-lg flex-col gap-4 rounded-lg bg-surface p-6 shadow-md"
          >
            <h2 className="text-lg font-semibold text-text-primary">End consult</h2>
            <p className="text-sm text-text-secondary">
              Add physician notes and save the full translated transcript to the report.
            </p>
            <div>
              <label htmlFor="physician-notes" className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-text-secondary">
                Physician&apos;s Notes
              </label>
              <textarea
                id="physician-notes"
                value={physicianNotes}
                onChange={e => setPhysicianNotes(e.target.value)}
                rows={5}
                placeholder="Clinical impressions, plan, follow-up…"
                className="w-full rounded-md border border-border-subtle bg-canvas px-3 py-2 text-sm text-text-primary focus:border-brand-strong focus:outline-none focus:ring-2 focus:ring-brand-strong/25"
              />
            </div>
            <div className="flex flex-col gap-2">
              <button
                type="button"
                onClick={() => onEnd(messages, physicianNotes)}
                className="min-h-[48px] rounded-md bg-brand-ink py-3 text-base font-medium text-white hover:bg-brand-ink-hover"
              >
                Save & finish
              </button>
              <button
                type="button"
                onClick={() => setShowEndPanel(false)}
                className="min-h-[44px] rounded-md py-2.5 text-sm font-medium text-text-secondary hover:bg-sunken"
              >
                Continue consult
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  )
}