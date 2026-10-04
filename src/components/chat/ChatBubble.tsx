'use client'

import { useState, useEffect, useMemo, useRef } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { Loader2, Play, RotateCcw, Volume2 } from 'lucide-react'
import { ChatMessage } from '@/types'
import KaiAvatar from '@/components/kai/KaiAvatar'
import { toggleSpeech, type SpeechErrorKind, type SpeechPhase } from '@/lib/speech'
import { stripMarkdownAndEmoji } from '@/lib/text'
import { useSpeech } from '@/hooks/useSpeech'
import { useTranslations, type MessageKey, type TranslateFn } from '@/i18n/useTranslations'

const REPORT_KEYS = ['chief_complaint', 'condition', 'reasoning', 'symptoms', 'emergency', 'possible_conditions']
const DEFAULT_REVEAL_DELAY_MS = 18

let graphemeSegmenter: Intl.Segmenter | null = null

function getGraphemeSegmenter(): Intl.Segmenter | null {
  if (typeof Intl === 'undefined' || !('Segmenter' in Intl)) return null
  graphemeSegmenter ??= new Intl.Segmenter(undefined, { granularity: 'grapheme' })
  return graphemeSegmenter
}

function getNextGraphemeEnd(text: string, start: number): number {
  if (start >= text.length) return text.length

  const segmenter = getGraphemeSegmenter()
  if (segmenter) {
    const first = segmenter.segment(text.slice(start))[Symbol.iterator]().next().value
    if (first?.segment) return start + first.segment.length
  }

  const [first = ''] = Array.from(text.slice(start))
  return start + first.length
}

function getRevealDelay(text: string, nextEnd: number): number {
  const previousChar = text.slice(Math.max(0, nextEnd - 1), nextEnd)

  if (/\n/.test(previousChar)) return 160
  if (/[.!?।؟]/.test(previousChar)) return 130
  if (/[,;:،]/.test(previousChar)) return 70
  if (/\s/.test(previousChar)) return 28

  return DEFAULT_REVEAL_DELAY_MS
}

function SmoothKaiText({ text, shouldAnimate }: { text: string; shouldAnimate: boolean }) {
  const [visibleText, setVisibleText] = useState(() => (shouldAnimate ? '' : text))
  const visibleTextRef = useRef(visibleText)

  useEffect(() => {
    visibleTextRef.current = visibleText
  }, [visibleText])

  useEffect(() => {
    if (!shouldAnimate) {
      visibleTextRef.current = text
      setVisibleText(text)
      return
    }

    let timeoutId: number | undefined
    let cancelled = false

    const revealNext = () => {
      if (cancelled) return

      const current = visibleTextRef.current
      if (current === text) return

      if (!text.startsWith(current)) {
        visibleTextRef.current = text
        setVisibleText(text)
        return
      }

      const nextEnd = getNextGraphemeEnd(text, current.length)
      const nextText = text.slice(0, nextEnd)
      visibleTextRef.current = nextText
      setVisibleText(nextText)

      if (nextText !== text) {
        timeoutId = window.setTimeout(revealNext, getRevealDelay(text, nextEnd))
      }
    }

    timeoutId = window.setTimeout(revealNext, DEFAULT_REVEAL_DELAY_MS)

    return () => {
      cancelled = true
      if (timeoutId !== undefined) window.clearTimeout(timeoutId)
    }
  }, [shouldAnimate, text])

  const renderedText = shouldAnimate ? visibleText : text

  const tailStart = Math.max(0, renderedText.length - 1)
  const stableText = renderedText.slice(0, tailStart)
  const tail = renderedText.slice(tailStart)

  return (
    <>
      {stableText}
      {tail && (
        <motion.span
          key={visibleText.length}
          initial={{ opacity: 0.35, y: 3, filter: 'blur(2px)' }}
          animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
          transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
          className="inline-block will-change-transform"
        >
          {tail}
        </motion.span>
      )}
      {shouldAnimate && renderedText !== text && (
        <motion.span
          aria-hidden
          className="ml-0.5 inline-block h-[1em] w-px translate-y-0.5 rounded-full bg-brand/45 align-[-0.12em]"
          animate={{ opacity: [0.25, 0.75, 0.25] }}
          transition={{ duration: 0.9, repeat: Infinity, ease: 'easeInOut' }}
        />
      )}
    </>
  )
}

/**
 * Strip raw JSON blocks and code fences from Kai's response before showing to patient.
 * The model occasionally leaks JSON (e.g. {"condition":...}) or code fences into the stream.
 */
function cleanChatContent(raw: string): string {
  // Unwrap code fences before checking for JSON so fenced report payloads
  // do not fall back to the raw, patient-visible text.
  let text = raw.replace(/```(?:json)?\s*([\s\S]*?)```/gi, '$1').trim()

  // If the entire message is a JSON object/array, don't show it at all
  const t = text.trim()
  if ((t.startsWith('{') && t.endsWith('}')) || (t.startsWith('[') && t.endsWith(']'))) {
    try {
      JSON.parse(t)
      return '' // valid JSON — suppress entirely
    } catch { /* not pure JSON, fall through */ }
  }

  // Strip embedded JSON objects that contain known report keys
  // Matches { ... "key": ... } blocks where key is a medical report field
  const reportJsonPattern = new RegExp(`\\{[^{}]*"(?:${REPORT_KEYS.join('|')})"[\\s\\S]*?\\}`, 'g')
  text = text.replace(reportJsonPattern, '').trim()

  // Drop markdown markers and emoji so the bubble matches what Kai speaks aloud
  return stripMarkdownAndEmoji(text)
}

interface ChatBubbleProps {
  message: ChatMessage
  langCode: string
  voiceName?: string
  /** Kai is still streaming this message — reading it aloud now would read half of it. */
  streaming?: boolean
}

/* Kai speaks without a bubble — brand mark + plain text on the canvas
   (the Claude/Perplexity pattern). Only the patient sits in a bubble. */
export default function ChatBubble({ message, langCode, voiceName, streaming = false }: ChatBubbleProps) {
  const t = useTranslations(langCode)
  const speech = useSpeech()
  const isKai = message.role === 'kai'
  const [shouldRevealKaiText] = useState(() => isKai && message.content.length === 0)
  const reduceMotion = useReducedMotion()

  const displayContent = useMemo(() => cleanChatContent(message.content), [message.content])

  // This message's slice of the page-wide playback state. Only one message owns
  // Kai's voice at a time; every other Listen button reads as idle.
  const owns = speech.key === message.id
  const phase: SpeechPhase = owns ? speech.phase : 'idle'

  if (!displayContent) return null

  if (!isKai) {
    return (
      <motion.div
        className="mb-5 flex justify-end"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 380, damping: 36 }}
      >
        {/* lang + dir: message text is in the patient's language, not the page
            default — screen readers pick the pronunciation rules (WCAG 3.1.2)
            and browser translators segment correctly off this attribute. */}
        <div
          lang={langCode}
          dir="auto"
          className="max-w-[80%] rounded-[1.375rem] rounded-ee-md bg-brand-ink px-4 py-3 text-[1.0625rem] leading-relaxed text-white"
        >
          {displayContent}
        </div>
      </motion.div>
    )
  }

  return (
    <motion.div
      className="mb-7 flex items-start gap-3"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 380, damping: 36 }}
    >
      <KaiAvatar pixels={32} />

      <div className="min-w-0 flex-1 pt-1">
        <div lang={langCode} dir="auto" className="max-w-[65ch] text-[1.0625rem] leading-relaxed text-text-primary">
          <SmoothKaiText
            text={displayContent}
            shouldAnimate={shouldRevealKaiText && !reduceMotion}
          />
        </div>

        {!streaming && (
          <ListenControl
            phase={phase}
            canPause={owns && speech.canPause}
            error={owns ? speech.error : null}
            t={t}
            reduceMotion={Boolean(reduceMotion)}
            onPress={() => toggleSpeech(message.id, displayContent, langCode, { voiceName })}
          />
        )}
      </div>
    </motion.div>
  )
}

const AUDIO_ERROR_KEY: Record<SpeechErrorKind, MessageKey> = {
  blocked: 'chat.audioBlocked',
  network: 'chat.audioFailed',
  unavailable: 'chat.audioUnavailable',
}

interface ListenControlProps {
  phase: SpeechPhase
  canPause: boolean
  error: SpeechErrorKind | null
  t: TranslateFn
  reduceMotion: boolean
  onPress: () => void
}

/**
 * Listen, with every state visible. A patient must never wonder whether the tap
 * registered: the button changes the instant it is pressed, says what Kai is
 * doing in words as well as shape, and explains a failure next to it.
 */
function ListenControl({ phase, canPause, error, t, reduceMotion, onPress }: ListenControlProps) {
  const loading = phase === 'loading'
  const active = phase === 'playing' || phase === 'paused'

  let icon: React.ReactNode
  let label: string
  let accessibleName: string
  if (loading) {
    icon = <Loader2 size={20} className="animate-spin motion-reduce:animate-none" aria-hidden />
    label = t('chat.preparingAudio')
    accessibleName = t('chat.preparingAudio')
  } else if (phase === 'playing') {
    icon = <SoundWave reduceMotion={reduceMotion} />
    label = canPause ? t('chat.pause') : t('chat.stop')
    accessibleName = canPause ? t('chat.pauseReading') : t('chat.stopReading')
  } else if (phase === 'paused') {
    icon = <Play size={18} fill="currentColor" strokeWidth={0} aria-hidden />
    label = t('chat.resume')
    accessibleName = t('chat.resumeReading')
  } else if (phase === 'error') {
    icon = <RotateCcw size={18} aria-hidden />
    label = t('chat.retryAudio')
    accessibleName = t('chat.retryAudio')
  } else {
    icon = <Volume2 size={20} aria-hidden />
    label = t('chat.listen')
    accessibleName = t('chat.listenAloud')
  }

  const status = loading
    ? t('chat.preparingAudio')
    : phase === 'playing'
      ? t('chat.audioPlaying')
      : error
        ? t(AUDIO_ERROR_KEY[error])
        : ''

  return (
    <div className="mt-3">
      <motion.button
        type="button"
        onClick={onPress}
        // Not `disabled`: a disabled button drops focus and goes silent for
        // screen readers mid-request. aria-disabled + aria-busy keep it
        // announced while the press handler ignores repeat taps.
        aria-disabled={loading || undefined}
        aria-busy={loading || undefined}
        aria-label={accessibleName}
        whileTap={loading || reduceMotion ? undefined : { scale: 0.96 }}
        transition={{ type: 'spring', stiffness: 700, damping: 45 }}
        className={`inline-flex min-h-12 items-center gap-2.5 rounded-full px-5 text-base font-semibold transition-colors duration-150 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand-ink/25 ${
          active
            ? 'bg-brand-ink text-white hover:bg-brand-ink-hover'
            : loading
              ? 'cursor-progress bg-brand-subtle text-brand-ink'
              : phase === 'error'
                ? 'bg-error-subtle text-error-text hover:bg-error-subtle/80'
                : 'bg-brand-subtle text-brand-ink hover:bg-brand-muted'
        }`}
      >
        {icon}
        <span>{label}</span>
      </motion.button>

      {/* The words that explain the state — and the only place a failure is
          described, so it stays calm and says what to do next. */}
      <p
        className={`mt-2 max-w-[42ch] text-sm leading-snug ${error ? 'text-error-text' : 'sr-only'}`}
        role="status"
        aria-live="polite"
      >
        {status}
      </p>
    </div>
  )
}

function SoundWave({ reduceMotion }: { reduceMotion: boolean }) {
  return (
    <div className="flex items-center gap-0.5" aria-hidden>
      {[1, 2, 3, 2, 1].map((h, i) => (
        <motion.div
          key={i}
          className="w-0.75 rounded-full bg-white"
          style={{ height: h * 5 }}
          animate={reduceMotion ? false : { scaleY: [1, 1.8, 1] }}
          transition={{ duration: 0.5, repeat: Infinity, delay: i * 0.08, ease: 'easeInOut' }}
        />
      ))}
    </div>
  )
}