'use client'

import { useState, useCallback, useEffect, useMemo, useRef } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { Volume2 } from 'lucide-react'
import { ChatMessage } from '@/types'
import KaiAvatar from '@/components/kai/KaiAvatar'
import { speakText, stopSpeech } from '@/lib/speech'
import { stripMarkdownAndEmoji } from '@/lib/text'
import { useSpeechActive } from '@/hooks/useSpeechActive'

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
 * Claude occasionally leaks JSON (e.g. {"condition":...}) or code fences into the stream.
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
}

/* Kai speaks without a bubble — brand mark + plain text on the canvas
   (the Claude/Perplexity pattern). Only the patient sits in a bubble. */
export default function ChatBubble({ message, langCode, voiceName }: ChatBubbleProps) {
  const [localSpeaking, setLocalSpeaking] = useState(false)
  const globalSpeaking = useSpeechActive()
  const listenDisabled = globalSpeaking && !localSpeaking
  const isKai = message.role === 'kai'
  const [shouldRevealKaiText] = useState(() => isKai && message.content.length === 0)
  const reduceMotion = useReducedMotion()

  const displayContent = useMemo(() => cleanChatContent(message.content), [message.content])

  const speak = useCallback(() => {
    if (globalSpeaking && !localSpeaking) return

    if (localSpeaking) {
      stopSpeech()
      setLocalSpeaking(false)
      return
    }

    stopSpeech()
    const started = speakText(displayContent, langCode, {
      voiceName,
      onStart: () => setLocalSpeaking(true),
      onEnd: () => setLocalSpeaking(false),
      onError: () => setLocalSpeaking(false),
    })
    if (!started) setLocalSpeaking(false)
  }, [globalSpeaking, localSpeaking, displayContent, langCode, voiceName])

  if (!displayContent) return null

  if (!isKai) {
    return (
      <motion.div
        className="mb-4 flex justify-end"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
      >
        <div className="max-w-[75%] rounded-lg rounded-br-sm bg-brand-ink px-4 py-2.5 text-base leading-relaxed text-white">
          {displayContent}
        </div>
      </motion.div>
    )
  }

  return (
    <motion.div
      className="mb-6 flex items-start gap-3"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
    >
      <KaiAvatar pixels={32} />

      <div className="min-w-0 flex-1 pt-1">
        <div className="max-w-[65ch] text-base leading-relaxed text-text-primary">
          <SmoothKaiText
            text={displayContent}
            shouldAnimate={shouldRevealKaiText && !reduceMotion}
          />
        </div>

        <button
          onClick={speak}
          disabled={listenDisabled}
          className={`mt-1.5 -ml-2 flex min-h-[36px] items-center gap-1.5 rounded-md px-2 py-1.5 text-xs font-medium transition-colors duration-150 disabled:cursor-not-allowed disabled:opacity-50 ${
            localSpeaking
              ? 'bg-brand-subtle text-brand-ink'
              : 'text-text-tertiary hover:bg-sunken hover:text-text-secondary'
          }`}
          aria-label={localSpeaking ? 'Stop reading' : 'Listen to Kai'}
        >
          {localSpeaking ? (
            <>
              <SoundWave reduceMotion={Boolean(reduceMotion)} />
              <span>Stop</span>
            </>
          ) : (
            <>
              <Volume2 size={13} aria-hidden />
              <span>Listen</span>
            </>
          )}
        </button>
      </div>
    </motion.div>
  )
}

function SoundWave({ reduceMotion }: { reduceMotion: boolean }) {
  return (
    <div className="flex items-center gap-0.5" aria-hidden>
      {[1, 2, 3, 2, 1].map((h, i) => (
        <motion.div
          key={i}
          className="w-0.5 rounded-full bg-brand"
          style={{ height: h * 4 }}
          animate={reduceMotion ? false : { scaleY: [1, 1.8, 1] }}
          transition={{ duration: 0.5, repeat: Infinity, delay: i * 0.08, ease: 'easeInOut' }}
        />
      ))}
    </div>
  )
}