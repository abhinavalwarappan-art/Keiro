'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { stopSpeech } from '@/lib/speech'

/**
 * Voice input with a two-tier strategy:
 *  1. Browser Web Speech API — real-time, free, no server round-trip. Used when
 *     the browser supports the language.
 *  2. Server-side OpenAI Whisper (`/api/transcribe`) — the fallback for languages
 *     the browser's speech engine can't handle (e.g. Amharic, Somali) or browsers
 *     with no SpeechRecognition at all (Firefox). Records via MediaRecorder,
 *     uploads the clip, and fills in the transcript when it returns.
 *
 * When Web Speech reports `language-not-supported`, that language is remembered
 * for the rest of the session and routed straight to Whisper on the next tap.
 */

// Languages this browser's Web Speech engine has rejected this session. Kept in
// module scope so the routing decision survives component remounts. In-memory
// only (resets on reload) so a browser that later gains support isn't stuck
// paying for Whisper forever.
const whisperOnlyLangs = new Set<string>()

// Languages whose browser Web Speech coverage is unreliable across Chrome and
// Safari (mostly regional South-Asian, East-African, and Southeast-Asian
// languages). These skip the browser engine and record straight to server-side
// Whisper, which handles them consistently — so there's no wasted first attempt
// and no already-spoken audio lost to a mid-stream fallback. Matched on the full
// BCP-47 `code`. Adjust freely: anything missed here is still caught by the
// onerror fallback below, which routes any failed browser attempt to Whisper.
const WHISPER_FIRST_LANGS = new Set<string>([
  'ta-IN', 'te-IN', 'gu-IN', 'pa-IN', 'ml-IN', 'bn-BD', // South Asian regional
  'ur-PK', 'fa-IR',                                       // Urdu, Farsi
  'am-ET', 'so-SO', 'sw-KE',                              // East African
  'tl-PH',                                                // Tagalog
])

// WebKit's MediaRecorder only ever emits MP4/AAC, and its isTypeSupported() can
// report webm as supported anyway — so asking for webm there yields MP4 bytes under
// a webm label, which Whisper then refuses to decode. Ask WebKit for mp4 first.
const WHISPER_MIME_PREFS = ['audio/webm;codecs=opus', 'audio/webm', 'audio/mp4', 'audio/ogg']
const WHISPER_MIME_PREFS_WEBKIT = ['audio/mp4', 'audio/webm;codecs=opus', 'audio/webm', 'audio/ogg']

function pickWhisperMimeType(): string | undefined {
  if (typeof MediaRecorder === 'undefined') return undefined
  const prefs = isWebKitBrowser() ? WHISPER_MIME_PREFS_WEBKIT : WHISPER_MIME_PREFS
  for (const type of prefs) {
    if (MediaRecorder.isTypeSupported(type)) return type
  }
  return undefined
}

// Safari lacks continuous mode — it fires onend after each utterance pause, so we
// restart manually and accumulate transcripts across sessions.
function isSafariBrowser(): boolean {
  return /^((?!chrome|android).)*safari/i.test(navigator.userAgent)
}

// Every iOS browser — Chrome and Firefox included — is WebKit underneath and shares
// Safari's MediaRecorder behaviour, so a Safari-only UA test would miss them.
// iPadOS 13+ also reports a desktop "Macintosh" UA; no real Mac has a touchscreen.
function isWebKitBrowser(): boolean {
  const ua = navigator.userAgent
  if (/iPad|iPhone|iPod/.test(ua)) return true
  if (/Macintosh/.test(ua) && navigator.maxTouchPoints > 1) return true
  return isSafariBrowser()
}

function getSpeechErrorMessage(error: string): string | null {
  switch (error) {
    case 'aborted':
    case 'no-speech':
      return null
    case 'audio-capture':
      return 'No microphone was found. Please check your microphone and try again.'
    case 'network':
      return 'Voice input needs an internet connection. Please type your message instead.'
    case 'not-allowed':
    case 'service-not-allowed':
      return 'Microphone access is blocked. Please allow microphone access in your browser settings and try again.'
    default:
      return 'Voice input failed in this browser. Please type your message instead.'
  }
}

interface UseVoiceInputOptions {
  langCode: string
  /** Called with the running transcript (Web Speech) or the final text (Whisper). */
  onTranscript: (text: string) => void
  /** Fires once a user-ended dictation settles with non-empty text — e.g. to refocus. */
  onFinal?: () => void
}

interface UseVoiceInput {
  recording: boolean
  transcribing: boolean
  error: string | null
  toggle: () => void
  stop: () => void
  clearError: () => void
}

export function useVoiceInput({ langCode, onTranscript, onFinal }: UseVoiceInputOptions): UseVoiceInput {
  const [recording, setRecording] = useState(false)
  const [transcribing, setTranscribing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const recognitionRef = useRef<SpeechRecognition | null>(null)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const streamRef = useRef<MediaStream | null>(null)

  const latestTranscriptRef = useRef('')
  const safariAccumulatedRef = useRef('')
  const userStoppedRef = useRef(false)
  const discardRef = useRef(false)
  const fellBackRef = useRef(false)

  // Keep callbacks fresh without re-creating start/stop on every render.
  const onTranscriptRef = useRef(onTranscript)
  const onFinalRef = useRef(onFinal)
  useEffect(() => {
    onTranscriptRef.current = onTranscript
    onFinalRef.current = onFinal
  })

  const stopTracks = () => {
    streamRef.current?.getTracks().forEach(t => t.stop())
    streamRef.current = null
  }

  const transcribe = useCallback(async (blob: Blob) => {
    setTranscribing(true)
    try {
      const form = new FormData()
      form.append('audio', blob)
      form.append('langCode', langCode)
      const res = await fetch('/api/transcribe', { method: 'POST', body: form })
      if (res.status === 429) {
        setError('Please wait a moment before continuing.')
        return
      }
      if (!res.ok) {
        setError('Voice input failed. Please type your message instead.')
        return
      }
      const data = (await res.json()) as { text?: string }
      const text = typeof data.text === 'string' ? data.text.trim() : ''
      if (text) {
        onTranscriptRef.current(text)
        onFinalRef.current?.()
      }
    } catch {
      setError('Voice input needs an internet connection. Please type your message instead.')
    } finally {
      setTranscribing(false)
    }
  }, [langCode])

  const startWhisper = useCallback(async () => {
    if (typeof navigator === 'undefined' || !navigator.mediaDevices?.getUserMedia || typeof MediaRecorder === 'undefined') {
      setError('Voice input is not supported in this browser. Please type your message instead.')
      return
    }

    let stream: MediaStream
    try {
      stream = await navigator.mediaDevices.getUserMedia({ audio: true })
    } catch {
      setError('Microphone access is blocked. Please allow microphone access in your browser settings and try again.')
      return
    }
    streamRef.current = stream

    const mimeType = pickWhisperMimeType()
    let recorder: MediaRecorder
    try {
      recorder = mimeType ? new MediaRecorder(stream, { mimeType }) : new MediaRecorder(stream)
    } catch {
      stopTracks()
      setError('Voice input could not start. Please try again.')
      return
    }

    const chunks: Blob[] = []
    recorder.ondataavailable = e => {
      if (e.data.size > 0) chunks.push(e.data)
    }
    recorder.onstop = () => {
      stopTracks()
      setRecording(false)
      mediaRecorderRef.current = null
      if (discardRef.current || chunks.length === 0) return
      // Label the clip with what was actually recorded, falling back to the type we
      // asked for — never to a hardcoded container. Safari can leave `mimeType`
      // empty while emitting MP4/AAC, and /api/transcribe derives the upload
      // filename's extension from this type: mislabel it webm and Whisper can't
      // demux the bytes, which surfaces to the patient as "Voice input failed".
      const blob = new Blob(chunks, { type: recorder.mimeType || mimeType || '' })
      void transcribe(blob)
    }

    mediaRecorderRef.current = recorder
    try {
      recorder.start()
      setRecording(true)
    } catch {
      stopTracks()
      mediaRecorderRef.current = null
      setError('Voice input could not start. Please try again.')
    }
  }, [transcribe])

  const startWebSpeech = useCallback((Ctor: { new (): SpeechRecognition }) => {
    const isSafari = isSafariBrowser()

    const startOne = () => {
      const recognition = new Ctor()
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
        onTranscriptRef.current(fullText)
      }

      recognition.onend = () => {
        // A language-not-supported fallback already took over — ignore the trailing onend.
        if (fellBackRef.current) {
          fellBackRef.current = false
          return
        }
        if (isSafari && !userStoppedRef.current) {
          safariAccumulatedRef.current = latestTranscriptRef.current
          try {
            startOne()
          } catch {
            setRecording(false)
            recognitionRef.current = null
            userStoppedRef.current = false
          }
          return
        }
        setRecording(false)
        recognitionRef.current = null
        if (userStoppedRef.current && latestTranscriptRef.current.trim()) {
          onFinalRef.current?.()
        }
        userStoppedRef.current = false
      }

      recognition.onerror = (e: SpeechRecognitionErrorEvent) => {
        // A trailing error that arrives AFTER the user has already stopped, or
        // after we've already captured speech, is teardown noise — not a "this
        // engine can't do this language" signal. Android Chrome routinely fires a
        // spurious 'network' error as recognition winds down after stop(), even
        // when the dictation succeeded. Without this guard that benign error
        // hijacks the finished session into a fresh Whisper recording, whose
        // short clip then fails at /api/transcribe and surfaces a false
        // "Voice input failed" — the exact regression seen only on real phones
        // (desktop Chrome never emits the spurious error). Let onend finalize the
        // transcript we already have.
        if (userStoppedRef.current || latestTranscriptRef.current.trim()) {
          return
        }
        // The browser engine can't transcribe this language here — hand off to
        // server-side Whisper and remember the language for the rest of the
        // session. Browsers signal this inconsistently: Chrome tends to fire
        // 'language-not-supported' or 'network', Safari 'service-not-allowed'.
        // Treat any of those (and any unexpected code) as a fallback trigger —
        // everything except a genuine mic permission/hardware fault
        // ('not-allowed', 'audio-capture') or the benign 'no-speech'/'aborted'.
        if (
          e.error !== 'not-allowed' &&
          e.error !== 'audio-capture' &&
          e.error !== 'no-speech' &&
          e.error !== 'aborted'
        ) {
          whisperOnlyLangs.add(langCode)
          fellBackRef.current = true
          recognitionRef.current = null
          void startWhisper()
          return
        }
        userStoppedRef.current = false
        setRecording(false)
        recognitionRef.current = null
        const message = getSpeechErrorMessage(e.error)
        if (message) setError(message)
      }

      recognitionRef.current = recognition
      try {
        recognition.start()
      } catch {
        userStoppedRef.current = false
        recognitionRef.current = null
        setRecording(false)
        setError('Voice input could not start. Please wait a moment and try again.')
      }
    }

    startOne()
  }, [langCode, startWhisper])

  const stop = useCallback(() => {
    if (recognitionRef.current) {
      userStoppedRef.current = true
      recognitionRef.current.stop()
      return
    }
    const recorder = mediaRecorderRef.current
    if (recorder && recorder.state !== 'inactive') {
      recorder.stop()
    }
  }, [])

  const toggle = useCallback(() => {
    if (transcribing) return
    if (recording) {
      stop()
      return
    }

    stopSpeech()
    setError(null)
    latestTranscriptRef.current = ''
    safariAccumulatedRef.current = ''
    userStoppedRef.current = false
    discardRef.current = false
    fellBackRef.current = false

    const Ctor = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!Ctor || whisperOnlyLangs.has(langCode) || WHISPER_FIRST_LANGS.has(langCode)) {
      void startWhisper()
      return
    }
    startWebSpeech(Ctor)
  }, [recording, transcribing, langCode, stop, startWhisper, startWebSpeech])

  const clearError = useCallback(() => setError(null), [])

  // Discard any in-flight capture on unmount without transcribing it.
  useEffect(() => {
    return () => {
      discardRef.current = true
      userStoppedRef.current = false
      recognitionRef.current?.abort()
      const recorder = mediaRecorderRef.current
      if (recorder && recorder.state !== 'inactive') recorder.stop()
      streamRef.current?.getTracks().forEach(t => t.stop())
    }
  }, [])

  return { recording, transcribing, error, toggle, stop, clearError }
}
