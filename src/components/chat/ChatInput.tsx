'use client'

import { useState, useRef, useEffect } from 'react'
import { Mic, MicOff, ArrowUp, Loader2 } from 'lucide-react'
import { motion } from 'framer-motion'
import { AIVoiceInput } from '@/components/ui/ai-voice-input'
import { stopSpeech } from '@/lib/speech'

const DRAFT_KEY = 'keiro_chat_draft'

const STOP_RECORDING_LABEL_BY_PREFIX: Record<string, string> = {
  am: 'መቅረጽ አቁም',
  ar: 'إيقاف التسجيل',
  de: 'Aufnahme stoppen',
  en: 'Stop recording',
  es: 'Detener grabación',
  fa: 'توقف ضبط',
  fr: 'Arrêter l\u2019enregistrement',
  gu: 'રેકોર્ડિંગ બંધ કરો',
  hi: 'रिकॉर्डिंग रोकें',
  id: 'Hentikan rekaman',
  it: 'Interrompi registrazione',
  ja: '録音を停止',
  ko: '녹음 중지',
  ml: 'റെക്കോർഡിംഗ് നിർത്തുക',
  nl: 'Opname stoppen',
  no: 'Stopp opptak',
  pa: 'ਰਿਕਾਰਡਿੰਗ ਰੋਕੋ',
  pl: 'Zatrzymaj nagrywanie',
  pt: 'Parar gravação',
  ro: 'Opriți înregistrarea',
  ru: 'Остановить запись',
  sk: 'Zastaviť nahrávanie',
  sl: 'Ustavi snemanje',
  so: 'Jooji duubista',
  sv: 'Stoppa inspelning',
  sw: 'Simamisha kurekodi',
  ta: 'பதிவை நிறுத்துங்கள்',
  te: 'రికార్డింగ్ ఆపండి',
  tl: 'Ihinto ang recording',
  tr: 'Kaydı durdur',
  uk: 'Зупинити запис',
  ur: 'ریکارڈنگ روکیں',
  vi: 'Dừng ghi âm',
  zh: '停止录音',
  'zh-TW': '停止錄音',
  bn: 'রেকর্ডিং বন্ধ করুন',
  el: 'Διακοπή εγγραφής',
  cs: 'Zastavit nahrávání',
  da: 'Stop optagelse',
  fi: 'Lopeta tallennus',
  hu: 'Felvétel leállítása',
  bg: 'Спиране на записа',
  et: 'Peata salvestamine',
  lv: 'Apturēt ierakstu',
  lt: 'Stabdyti įrašymą',
}

function getStopRecordingLabel(langCode: string): string {
  return (
    STOP_RECORDING_LABEL_BY_PREFIX[langCode] ??
    STOP_RECORDING_LABEL_BY_PREFIX[langCode.split('-')[0]] ??
    STOP_RECORDING_LABEL_BY_PREFIX.en
  )
}

function getSpeechErrorMessage(error: string): string | null {
  switch (error) {
    case 'aborted':
      return null
    case 'audio-capture':
      return 'No microphone was found. Please check your microphone and try again.'
    case 'language-not-supported':
      return 'Voice input is not available for this language in your browser. Please type your message instead.'
    case 'network':
      return 'Voice input needs an internet connection. Please type your message instead.'
    case 'no-speech':
      return null
    case 'not-allowed':
    case 'service-not-allowed':
      return 'Microphone access is blocked. Please allow microphone access in your browser settings and try again.'
    default:
      return 'Voice input failed in this browser. Please type your message instead.'
  }
}

interface ChatInputProps {
  onSend: (text: string) => Promise<boolean>
  disabled: boolean
  placeholder: string
  langCode: string
}

export default function ChatInput({ onSend, disabled, placeholder, langCode }: ChatInputProps) {
  const [text, setText] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem(DRAFT_KEY) ?? ''
    }
    return ''
  })
  const [recording, setRecording] = useState(false)
  const [sending, setSending] = useState(false)
  const [sendError, setSendError] = useState(false)
  const [voiceError, setVoiceError] = useState<string | null>(null)
  const recognitionRef = useRef<SpeechRecognition | null>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const latestTranscriptRef = useRef('')
  const userStoppedRecordingRef = useRef(false)
  const safariAccumulatedRef = useRef('')

  // Persist draft on every keystroke
  useEffect(() => {
    if (typeof window !== 'undefined') {
      if (text) {
        localStorage.setItem(DRAFT_KEY, text)
      } else {
        localStorage.removeItem(DRAFT_KEY)
      }
    }
  }, [text])

  useEffect(() => {
    return () => {
      userStoppedRecordingRef.current = true
      recognitionRef.current?.abort()
    }
  }, [])

  // Stop voice capture if Kai starts speaking or the input is otherwise locked.
  useEffect(() => {
    if (!disabled || !recording) return
    userStoppedRecordingRef.current = true
    recognitionRef.current?.stop()
  }, [disabled, recording])

  const handleSend = async () => {
    const trimmed = text.trim()
    if (!trimmed || disabled || sending || recording) return

    setSending(true)
    setSendError(false)

    const success = await onSend(trimmed)

    if (success) {
      setText('')
      localStorage.removeItem(DRAFT_KEY)
      setSendError(false)
    } else {
      setSendError(true)
      // Focus back so patient can retry immediately
      setTimeout(() => inputRef.current?.focus(), 50)
    }

    setSending(false)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const handleMicToggle = () => {
    if (disabled || sending) return

    if (recording) {
      userStoppedRecordingRef.current = true
      recognitionRef.current?.stop()
      return
    }

    const SpeechRecognitionCtor = window.SpeechRecognition || window.webkitSpeechRecognition

    if (!SpeechRecognitionCtor) {
      setVoiceError('Voice input is not supported in this browser. Please use Chrome.')
      return
    }

    stopSpeech()
    setVoiceError(null)
    latestTranscriptRef.current = ''
    safariAccumulatedRef.current = ''
    userStoppedRecordingRef.current = false

    // Safari doesn't support continuous mode — it fires onend after each utterance pause.
    // We detect it and restart manually, accumulating transcripts across sessions.
    const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent)

    const startRecognition = () => {
      const recognition = new SpeechRecognitionCtor()
      recognition.lang = langCode
      recognition.continuous = !isSafari
      recognition.interimResults = !isSafari

      recognition.onstart = () => setRecording(true)

      recognition.onresult = (e: SpeechRecognitionEvent) => {
        const parts: string[] = []
        for (let i = 0; i < e.results.length; i++) {
          parts.push(e.results[i][0].transcript)
        }
        const sessionText = parts.join('').trim()
        const fullText =
          isSafari && safariAccumulatedRef.current
            ? `${safariAccumulatedRef.current} ${sessionText}`
            : sessionText
        latestTranscriptRef.current = fullText
        setText(fullText)
      }

      recognition.onend = () => {
        if (isSafari && !userStoppedRecordingRef.current) {
          safariAccumulatedRef.current = latestTranscriptRef.current
          try {
            startRecognition()
          } catch {
            setRecording(false)
            recognitionRef.current = null
            userStoppedRecordingRef.current = false
          }
          return
        }
        setRecording(false)
        recognitionRef.current = null
        if (userStoppedRecordingRef.current && latestTranscriptRef.current.trim()) {
          setTimeout(() => inputRef.current?.focus(), 50)
        }
        userStoppedRecordingRef.current = false
      }

      recognition.onerror = (e: SpeechRecognitionErrorEvent) => {
        userStoppedRecordingRef.current = false
        setRecording(false)
        const message = getSpeechErrorMessage(e.error)
        if (message) setVoiceError(message)
      }

      recognitionRef.current = recognition
      try {
        recognition.start()
      } catch {
        userStoppedRecordingRef.current = false
        recognitionRef.current = null
        setRecording(false)
        setVoiceError('Voice input could not start. Please wait a moment and try again.')
      }
    }

    startRecognition()
  }

  const isPending = disabled || sending
  const canSend = text.trim() && !isPending && !recording
  const stopRecordingLabel = getStopRecordingLabel(langCode)

  return (
    <div className="flex flex-col px-4 pb-4 pt-2">
      {/* Inline send error */}
      {sendError && (
        <p className="mb-1.5 px-1 text-xs font-medium text-error-text" role="alert">
          Message failed to send. Please try again.
        </p>
      )}

      {/* Inline voice error */}
      {voiceError && (
        <p className="mb-1.5 px-1 text-xs font-medium text-error-text" role="alert">
          {voiceError}
        </p>
      )}

      <div className="flex min-h-[72px] items-end gap-2">
        {/* Text input / waveform */}
        <div className="relative min-h-[72px] flex-1">
          <textarea
            id="chat-input"
            ref={inputRef}
            value={text}
            onChange={e => {
              setText(e.target.value)
              setSendError(false)
            }}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            disabled={isPending}
            rows={2}
            className={`min-h-[72px] w-full resize-none rounded-lg border bg-sunken px-4 py-3 text-base leading-relaxed text-text-primary transition-[border-color,box-shadow] duration-150 placeholder:text-text-placeholder focus:border-border-default focus:shadow-xs focus:outline-none disabled:opacity-60 ${
              sendError ? 'border-error' : 'border-border-subtle'
            } ${recording ? 'pointer-events-none opacity-0' : ''}`}
            aria-label="Message input"
          />
          {recording && (
            <div className="absolute inset-0 flex items-center overflow-hidden rounded-lg border border-brand bg-brand-subtle">
              <AIVoiceInput
                isRecording={true}
                visualizerBars={36}
                className="py-0 flex-1"
              />
            </div>
          )}
        </div>

        {/* Mic button */}
        <div className="relative flex size-12 shrink-0 items-center justify-center">
          {recording && (
            <div
              className="absolute bottom-full left-1/2 mb-2 w-max max-w-40 -translate-x-1/2 rounded-full bg-black px-3 py-1.5 text-center text-xs font-semibold leading-tight text-white shadow-md"
              role="status"
              dir="auto"
            >
              {stopRecordingLabel}
              <span className="absolute left-1/2 top-full size-2 -translate-x-1/2 -translate-y-1/2 rotate-45 bg-black" />
            </div>
          )}
          <motion.button
            onClick={handleMicToggle}
            disabled={disabled || sending}
            className={`flex size-12 min-h-[48px] min-w-[48px] shrink-0 items-center justify-center rounded-lg border transition-colors duration-150 disabled:opacity-50 ${
              recording
                ? 'border-error bg-error text-white'
                : 'border-border-subtle bg-surface text-brand-ink hover:border-border-default hover:bg-sunken'
            }`}
            whileTap={{ scale: 0.95 }}
            animate={recording ? { scale: [1, 1.04, 1] } : {}}
            transition={recording ? { duration: 1.2, repeat: Infinity, ease: 'easeInOut' } : {}}
            aria-label={recording ? stopRecordingLabel : 'Start voice input'}
            aria-pressed={recording}
          >
            {recording ? <MicOff size={18} aria-hidden /> : <Mic size={18} aria-hidden />}
          </motion.button>
        </div>

        {/* Send button */}
        <motion.button
          onClick={handleSend}
          disabled={!canSend}
          className={`flex size-12 min-h-[48px] min-w-[48px] shrink-0 items-center justify-center rounded-lg transition-colors duration-150 ${
            canSend
              ? 'bg-brand-ink text-white hover:bg-brand-ink-hover'
              : 'cursor-not-allowed bg-sunken text-text-placeholder'
          }`}
          whileTap={canSend ? { scale: 0.95 } : {}}
          aria-label="Send message"
          aria-disabled={!canSend}
        >
          {sending ? (
            <Loader2 size={17} className="animate-spin" aria-hidden />
          ) : (
            <ArrowUp size={17} aria-hidden />
          )}
        </motion.button>
      </div>
    </div>
  )
}