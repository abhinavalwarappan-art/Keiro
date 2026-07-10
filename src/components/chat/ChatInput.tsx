'use client'

import { useState, useRef, useEffect } from 'react'
import { Mic, MicOff, ArrowUp, Loader2 } from 'lucide-react'
import { motion } from 'framer-motion'
import { AIVoiceInput } from '@/components/ui/ai-voice-input'
import { useVoiceInput } from '@/hooks/useVoiceInput'

const DRAFT_KEY = 'keiro_chat_draft'

/** Grow the input up to ~3 lines (leading-relaxed text-base + py-3), then scroll. */
const MAX_INPUT_HEIGHT_PX = 104

const STOP_RECORDING_LABEL_BY_PREFIX: Record<string, string> = {
  am: 'መቅረጽ አቁም',
  ar: 'إيقاف التسجيل',
  de: 'Aufnahme stoppen',
  en: 'Stop recording',
  es: 'Detener grabación',
  fa: 'توقف ضبط',
  fr: 'Arrêter l’enregistrement',
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

interface ChatInputProps {
  onSend: (text: string) => Promise<boolean>
  disabled: boolean
  /** Kai's TTS is playing. Typing/sending stay locked, but the mic can interrupt it. */
  speaking?: boolean
  placeholder: string
  langCode: string
}

export default function ChatInput({ onSend, disabled, speaking = false, placeholder, langCode }: ChatInputProps) {
  const [text, setText] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem(DRAFT_KEY) ?? ''
    }
    return ''
  })
  const [sending, setSending] = useState(false)
  const [sendError, setSendError] = useState(false)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  const { recording, transcribing, error: voiceError, toggle, stop } = useVoiceInput({
    langCode,
    onTranscript: setText,
    // After transcription: size the box to the transcript and scroll to the newest
    // words so the patient can verify the end of what they said, then focus.
    onFinal: () =>
      setTimeout(() => {
        const ta = inputRef.current
        if (!ta) return
        ta.style.height = 'auto'
        ta.style.height = `${Math.min(ta.scrollHeight, MAX_INPUT_HEIGHT_PX)}px`
        ta.scrollTop = ta.scrollHeight
        ta.focus()
      }, 50),
  })

  const capturing = recording || transcribing

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

  // Auto-grow the textarea up to 3 lines as text fills. Skip while capturing so the
  // hidden textarea (opacity-0 but still driving container height) can't inflate the
  // waveform overlay during recording.
  useEffect(() => {
    const ta = inputRef.current
    if (!ta || capturing) return
    ta.style.height = 'auto'
    ta.style.height = `${Math.min(ta.scrollHeight, MAX_INPUT_HEIGHT_PX)}px`
  }, [text, capturing])

  // Stop voice capture only when the input HARD-locks (Kai generating a reply, a
  // report being prepared, profile intake). Kai's TTS alone must NOT stop capture
  // — tapping the mic interrupts Kai (useVoiceInput.toggle calls stopSpeech) and
  // takes over, so an in-flight recording always wins over playback.
  useEffect(() => {
    if (disabled && !speaking && recording) stop()
  }, [disabled, speaking, recording, stop])

  const handleSend = async () => {
    const trimmed = text.trim()
    if (!trimmed || disabled || sending || capturing) return

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

  const isPending = disabled || sending
  const canSend = text.trim() && !isPending && !capturing
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
            className={`min-h-[72px] w-full resize-none overflow-y-auto rounded-lg border bg-sunken px-4 py-3 text-base leading-relaxed text-text-primary transition-[border-color,box-shadow] duration-150 placeholder:text-text-placeholder focus:border-border-default focus:shadow-xs focus:outline-none disabled:opacity-60 ${
              sendError ? 'border-error' : 'border-border-subtle'
            } ${capturing ? 'pointer-events-none opacity-0' : ''}`}
            aria-label="Message input"
          />
          {capturing && (
            <div className="absolute inset-0 flex items-center justify-center overflow-hidden rounded-lg border border-brand bg-brand-subtle">
              {recording ? (
                <AIVoiceInput
                  isRecording={true}
                  visualizerBars={36}
                  className="py-0 flex-1"
                />
              ) : (
                <span
                  className="flex items-center gap-1.5 text-brand-ink"
                  role="status"
                  aria-live="polite"
                  aria-label="Transcribing"
                >
                  <Loader2 size={18} className="animate-spin" aria-hidden />
                  <span className="flex gap-1" aria-hidden>
                    <span className="size-1.5 animate-pulse rounded-full bg-brand-ink [animation-delay:0ms]" />
                    <span className="size-1.5 animate-pulse rounded-full bg-brand-ink [animation-delay:150ms]" />
                    <span className="size-1.5 animate-pulse rounded-full bg-brand-ink [animation-delay:300ms]" />
                  </span>
                </span>
              )}
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
            onClick={toggle}
            disabled={(disabled && !speaking) || sending || transcribing}
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
            {transcribing ? (
              <Loader2 size={18} className="animate-spin" aria-hidden />
            ) : recording ? (
              <MicOff size={18} aria-hidden />
            ) : (
              <Mic size={18} aria-hidden />
            )}
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
