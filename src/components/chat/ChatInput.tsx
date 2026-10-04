'use client'

import { useState, useRef, useEffect } from 'react'
import { ArrowUp, Loader2, Info } from 'lucide-react'
import { motion, useReducedMotion } from 'framer-motion'
import MicButton, { type MicState } from '@/components/chat/MicButton'
import CaptureStrip from '@/components/chat/CaptureStrip'
import { useVoiceInput } from '@/hooks/useVoiceInput'
import MicHelpModal from '@/components/chat/MicHelpModal'
import { useTranslations, type MessageKey } from '@/i18n/useTranslations'
import type { MicErrorKind } from '@/lib/micDiagnostics'

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

/** Each mic failure gets its own copy — only `denied` offers the recovery steps. */
const MIC_ERROR_KEY: Record<MicErrorKind, MessageKey> = {
  denied: 'mic.error.denied',
  'no-hardware': 'mic.error.noHardware',
  'in-use': 'mic.error.inUse',
  insecure: 'mic.error.insecure',
  unsupported: 'mic.error.unsupported',
  unknown: 'mic.error.unknown',
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
  const reducedMotion = useReducedMotion()
  const [text, setText] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem(DRAFT_KEY) ?? ''
    }
    return ''
  })
  const [sending, setSending] = useState(false)
  const [sendError, setSendError] = useState(false)
  const [helpOpen, setHelpOpen] = useState(false)
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const t = useTranslations(langCode)

  const {
    requesting,
    recording,
    transcribing,
    error: voiceError,
    errorKind,
    permission,
    inAppBrowser,
    toggle,
    stop,
    cancel,
    recheckPermission,
  } = useVoiceInput({
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

  const capturing = requesting || recording || transcribing
  const micState: MicState = recording
    ? 'recording'
    : transcribing
      ? 'transcribing'
      : requesting
        ? 'requesting'
        : 'idle'

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

  // Recovery steps are offered ONLY for a confirmed denial. A device-busy or
  // no-hardware fault has no fix in the browser's permission settings, and
  // pointing there is what made the old messaging useless.
  const isBlocked = permission === 'denied' || errorKind === 'denied'
  const voiceMessage = errorKind ? t(MIC_ERROR_KEY[errorKind]) : voiceError

  const handleMicClick = () => {
    // Short-circuit a known denial: getUserMedia would reject instantly without
    // showing a prompt, so the patient would just see the button do nothing.
    // Every other state — including 'prompt' and 'unsupported' — falls through
    // to toggle(), which must reach getUserMedia inside this same gesture.
    if (permission === 'denied') {
      setHelpOpen(true)
      return
    }
    toggle()
  }

  return (
    <div className="flex flex-col px-4 pb-4 pt-2">
      {/* Inline send error */}
      {sendError && (
        <p className="mb-2 px-1 text-sm font-medium text-error-text" role="alert">
          Message failed to send. Please try again.
        </p>
      )}

      {/* In-app browser notice. Deliberately a banner, not a modal: these
          webviews block the mic with no user-reachable setting, so there is
          nothing to dismiss and nothing to fix here — typing must stay usable
          without interacting with this at all. */}
      {inAppBrowser && (
        <p
          className="mb-1.5 flex items-start gap-1.5 rounded-md bg-sunken px-2.5 py-2 text-xs leading-relaxed text-text-secondary"
          role="status"
        >
          <Info size={14} className="mt-0.5 shrink-0" aria-hidden />
          <span>{t('mic.inApp.banner', { app: inAppBrowser })}</span>
        </p>
      )}

      {/* Inline voice error, with recovery steps only when truly blocked */}
      {voiceMessage && (
        <p className="mb-2 px-1 text-base font-medium leading-snug text-error-text" role="alert">
          {voiceMessage}
          {isBlocked && (
            <button
              onClick={() => setHelpOpen(true)}
              className="ml-1.5 font-semibold text-brand-ink underline underline-offset-2"
            >
              {t('mic.error.learnMore')}
            </button>
          )}
        </p>
      )}

      <div className="flex min-h-[72px] items-center gap-2.5">
        {/* Text input / waveform */}
        <div className="relative min-h-[72px] flex-1">
          <textarea
            id="chat-input"
            ref={inputRef}
            value={text}
            onChange={e => {
              if (capturing) cancel()
              setText(e.target.value)
              setSendError(false)
            }}
            onKeyDown={handleKeyDown}
            onFocus={() => { if (capturing) cancel() }}
            placeholder={placeholder}
            disabled={isPending}
            rows={2}
            className={`min-h-[72px] w-full resize-none overflow-y-auto rounded-lg border bg-surface px-4 py-3 text-base leading-relaxed text-text-primary transition-[border-color,box-shadow] duration-150 placeholder:text-text-placeholder focus:border-brand-ink focus:ring-2 focus:ring-brand-ink/20 focus:outline-none disabled:opacity-60 ${
              sendError ? 'border-error' : 'border-border-default'
            } ${capturing ? 'opacity-0' : ''}`}
            aria-hidden={capturing || undefined}
            tabIndex={capturing ? -1 : undefined}
            aria-label="Message input"
          />
          {capturing && (
            <CaptureStrip
              mode={recording ? 'recording' : transcribing ? 'transcribing' : 'requesting'}
              stopLabel={stopRecordingLabel}
            />
          )}
        </div>

        {/* Mic button — the primary target, so it is the large one */}
        <MicButton
          state={micState}
          disabled={(disabled && !speaking) || sending || requesting || transcribing}
          onClick={handleMicClick}
          stopLabel={stopRecordingLabel}
        />

        {/* Send button */}
        <motion.button
          onClick={handleSend}
          disabled={!canSend}
          className={`flex size-12 min-h-[48px] min-w-[48px] shrink-0 items-center justify-center rounded-full transition-colors duration-150 ${
            canSend
              ? 'bg-brand-ink text-white hover:bg-brand-ink-hover'
              : 'cursor-not-allowed bg-sunken text-text-placeholder'
          }`}
          whileTap={canSend && !reducedMotion ? { scale: 0.93 } : {}}
          transition={{ type: 'spring', stiffness: 700, damping: 45 }}
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

      <MicHelpModal
        open={helpOpen}
        onClose={() => setHelpOpen(false)}
        langCode={langCode}
        onRecheck={recheckPermission}
      />
    </div>
  )
}
