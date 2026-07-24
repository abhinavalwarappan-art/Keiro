'use client'

import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from 'react'
import { stopSpeech } from '@/lib/speech'
import {
  classifyMicError,
  classifyMissingMediaDevices,
  detectInAppBrowser,
  queryMicPermission,
  reportMicFailure,
  requestMicStream,
  watchMicPermission,
  type MicErrorKind,
  type MicPermissionState,
} from '@/lib/micDiagnostics'

/**
 * Voice input with a two-tier strategy:
 *  1. Browser Web Speech API — real-time, free, no server round-trip. Used when
 *     the browser supports the language.
 *  2. Server-side Whisper (`/api/transcribe`) — the fallback for languages the
 *     browser's speech engine can't handle (e.g. Amharic, Somali) or browsers
 *     with no SpeechRecognition at all (Firefox). Records via MediaRecorder,
 *     uploads the clip, and fills in the transcript when it returns.
 *
 * When Web Speech reports `language-not-supported`, that language is remembered
 * for the rest of the session and routed straight to Whisper on the next tap.
 *
 * Both tiers are gated behind ONE explicit getUserMedia probe fired straight
 * from the tap (see `toggle`). That probe exists for two reasons:
 *  • iOS Safari only honours a mic request while the tap's user-gesture token is
 *    live, and letting SpeechRecognition ask implicitly loses that race.
 *  • getUserMedia rejects with a specific DOMException name, so a failure can be
 *    told apart (denied / no hardware / device busy / insecure) instead of
 *    collapsing into one useless "blocked" message.
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

const WHISPER_MIME_PREFS = ['audio/webm;codecs=opus', 'audio/webm', 'audio/mp4', 'audio/ogg']

// The user agent never changes, so there is nothing to subscribe to.
const noopSubscribe = () => () => {}
// Server render has no navigator; returning null keeps the markup identical on
// both sides so reading the UA can't cause a hydration mismatch.
const noInAppBrowserOnServer = () => null

function pickWhisperMimeType(): string | undefined {
  if (typeof MediaRecorder === 'undefined') return undefined
  for (const type of WHISPER_MIME_PREFS) {
    if (MediaRecorder.isTypeSupported(type)) return type
  }
  return undefined
}

// Safari lacks continuous mode — it fires onend after each utterance pause, so we
// restart manually and accumulate transcripts across sessions.
function isSafariBrowser(): boolean {
  return /^((?!chrome|android).)*safari/i.test(navigator.userAgent)
}

/**
 * One message per failure mode. `denied` is the ONLY one that means "the patient
 * must change a setting" — the others previously shared that copy, which sent
 * testers to a permission switch that was already on.
 */
const MIC_ERROR_MESSAGE: Record<MicErrorKind, string> = {
  denied:
    'Microphone access is turned off for Keiro. Tap “How to turn it on” for the steps — or type your message instead.',
  'no-hardware':
    'No microphone was found on this device. Please type your message instead.',
  'in-use':
    'Your microphone is busy in another app or browser tab. Close it and try again — or type your message instead.',
  insecure:
    'Voice input needs a secure connection on this device. Please type your message instead.',
  unsupported:
    'This browser does not support voice input. Please type your message instead, or open Keiro in Safari or Chrome.',
  unknown:
    'Voice input could not start on this device. Please type your message instead.',
}

// Mic faults raised by the Web Speech engine rather than the getUserMedia probe.
// Everything else the engine reports is a speech/network problem, not a mic one.
const SPEECH_MIC_ERROR_KINDS: Record<string, MicErrorKind> = {
  'not-allowed': 'denied',
  'audio-capture': 'no-hardware',
}

function getSpeechErrorMessage(error: string): string | null {
  switch (error) {
    case 'aborted':
    case 'no-speech':
      return null
    case 'network':
      return 'Voice input needs an internet connection. Please type your message instead.'
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
  /** Set only for microphone faults — null for transcription/network errors. */
  errorKind: MicErrorKind | null
  /** Live Permissions API reading; 'unsupported' where the API is unavailable. */
  permission: MicPermissionState
  /** Host app name when running inside a webview that commonly blocks the mic. */
  inAppBrowser: string | null
  toggle: () => void
  stop: () => void
  clearError: () => void
  /** Re-read the live permission state — backs the help modal's "Try again". */
  recheckPermission: () => Promise<MicPermissionState>
}

export function useVoiceInput({ langCode, onTranscript, onFinal }: UseVoiceInputOptions): UseVoiceInput {
  const [recording, setRecording] = useState(false)
  const [transcribing, setTranscribing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [errorKind, setErrorKind] = useState<MicErrorKind | null>(null)
  const [permission, setPermission] = useState<MicPermissionState>('unsupported')

  // Read straight from the user agent rather than mirroring it into state: the
  // value is fixed for the life of the page, and the server snapshot keeps
  // hydration stable. detectInAppBrowser returns a string or null, so the
  // snapshot is a primitive and can't loop the store.
  const inAppBrowser = useSyncExternalStore(
    noopSubscribe,
    detectInAppBrowser,
    noInAppBrowserOnServer,
  )

  const recognitionRef = useRef<SpeechRecognition | null>(null)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const streamRef = useRef<MediaStream | null>(null)

  const latestTranscriptRef = useRef('')
  const safariAccumulatedRef = useRef('')
  const userStoppedRef = useRef(false)
  const discardRef = useRef(false)
  const fellBackRef = useRef(false)
  // True between the getUserMedia call and the moment an engine takes over.
  // `recording` can't cover that window — it only flips once capture actually
  // starts — so without this a second tap during a slow prompt opens a second
  // stream and leaks the first (mic stays live, recording indicator stuck on).
  const openingRef = useRef(false)
  // Set once a real getUserMedia probe has settled the permission question.
  // The mount-time Permissions API read is async and can land AFTER a fast tap;
  // letting it win would overwrite a just-confirmed denial with a stale
  // 'prompt', and the UI would then stop offering recovery for a mic that
  // really is blocked.
  const probedRef = useRef(false)

  const applyProbedPermission = useCallback((state: MicPermissionState) => {
    probedRef.current = true
    setPermission(state)
  }, [])

  // Keep callbacks fresh without re-creating start/stop on every render.
  const onTranscriptRef = useRef(onTranscript)
  const onFinalRef = useRef(onFinal)
  useEffect(() => {
    onTranscriptRef.current = onTranscript
    onFinalRef.current = onFinal
  })

  // Read the real permission state up front so the UI can tell "never asked"
  // apart from "permanently denied" before the patient taps anything, and keep
  // it live so a fix made in the OS/browser settings recovers the UI without a
  // reload. Both are no-ops where the Permissions API is missing (Firefox, older
  // Safari), which leaves `permission` at 'unsupported' — callers must treat
  // that as "unknown, go ahead and probe", never as a denial.
  useEffect(() => {
    let cancelled = false
    let unsubscribe: (() => void) | undefined

    void queryMicPermission().then(state => {
      // Never downgrade an answer a live probe already established.
      if (!cancelled && !probedRef.current) setPermission(state)
    })
    // Change events are always newer than whatever we hold, so they apply
    // unconditionally — this is how the UI recovers when the patient flips the
    // switch in Settings and comes back.
    void watchMicPermission(state => {
      if (!cancelled) setPermission(state)
    }).then(fn => {
      if (cancelled) fn()
      else unsubscribe = fn
    })

    return () => {
      cancelled = true
      unsubscribe?.()
    }
  }, [])

  const stopTracks = () => {
    streamRef.current?.getTracks().forEach(t => t.stop())
    streamRef.current = null
  }

  /**
   * Surface a mic fault with its real cause and ship the details to the
   * diagnostics endpoint. The report is fire-and-forget — nothing here awaits it.
   */
  const failMic = useCallback(
    (kind: MicErrorKind, err: unknown, source: 'getUserMedia' | 'speech-recognition') => {
      setRecording(false)
      setErrorKind(kind)
      setError(MIC_ERROR_MESSAGE[kind])
      // Only a real NotAllowedError proves a denial. Everything else leaves the
      // permission reading alone so the help modal isn't offered for faults its
      // instructions can't fix.
      if (kind === 'denied') applyProbedPermission('denied')
      reportMicFailure({ kind, error: err, langCode, source })
    },
    [langCode, applyProbedPermission],
  )

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

  /**
   * Record for server-side Whisper using a stream the caller already opened.
   * The stream is never acquired here: the getUserMedia call has to happen in
   * the tap handler itself to keep iOS Safari's gesture token alive.
   */
  const startWhisper = useCallback((stream: MediaStream) => {
    if (typeof MediaRecorder === 'undefined') {
      stream.getTracks().forEach(t => t.stop())
      failMic('unsupported', null, 'getUserMedia')
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
      const blob = new Blob(chunks, { type: recorder.mimeType || 'audio/webm' })
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
  }, [transcribe, failMic])

  /**
   * Mid-session hand-off to Whisper after the Web Speech engine rejects a
   * language. The primed stream was released before the recogniser started, so
   * it has to be re-opened here. That is safe without a fresh user gesture
   * because the probe in `toggle` has already been granted for this page — and
   * it is no later in the lifecycle than the getUserMedia call this fallback
   * always made.
   */
  const startWhisperWithFreshStream = useCallback(async () => {
    const request = requestMicStream()
    if (!request) {
      failMic(classifyMissingMediaDevices(), null, 'getUserMedia')
      return
    }

    openingRef.current = true
    let stream: MediaStream
    try {
      stream = await request
    } catch (err) {
      openingRef.current = false
      failMic(classifyMicError(err), err, 'getUserMedia')
      return
    }
    openingRef.current = false

    if (discardRef.current) {
      stream.getTracks().forEach(t => t.stop())
      return
    }
    startWhisper(stream)
  }, [startWhisper, failMic])

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
          void startWhisperWithFreshStream()
          return
        }
        userStoppedRef.current = false
        setRecording(false)
        recognitionRef.current = null

        // A mic fault reaching here is notable: the getUserMedia probe in
        // `toggle` already succeeded, so the device works and permission was
        // granted — the speech engine is failing for its own reason. Log it with
        // the real cause rather than blaming the patient's settings.
        const micKind = SPEECH_MIC_ERROR_KINDS[e.error]
        if (micKind) {
          failMic(micKind, new Error(`SpeechRecognition: ${e.error}`), 'speech-recognition')
          return
        }

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
  }, [langCode, startWhisperWithFreshStream, failMic])

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

  /**
   * Route the opened stream to whichever engine handles this language, and turn
   * any rejection into a specific, reportable cause.
   */
  const openMic = useCallback(
    async (micRequest: Promise<MediaStream> | null) => {
      if (!micRequest) {
        openingRef.current = false
        failMic(classifyMissingMediaDevices(), null, 'getUserMedia')
        return
      }

      let stream: MediaStream
      try {
        stream = await micRequest
      } catch (err) {
        openingRef.current = false
        failMic(classifyMicError(err), err, 'getUserMedia')
        return
      }
      openingRef.current = false

      // The prompt can outlive the component (patient navigates away while it is
      // open). Releasing here is what actually turns the mic off — otherwise the
      // browser's recording indicator stays lit with nothing listening.
      if (discardRef.current) {
        stream.getTracks().forEach(t => t.stop())
        return
      }

      // The stream proves permission regardless of what the Permissions API
      // says (it reports 'unsupported' on Firefox and older Safari).
      applyProbedPermission('granted')

      const Ctor = window.SpeechRecognition || window.webkitSpeechRecognition
      if (!Ctor || whisperOnlyLangs.has(langCode) || WHISPER_FIRST_LANGS.has(langCode)) {
        startWhisper(stream)
        return
      }

      // Web Speech opens its own capture internally. Release the primed stream
      // first — holding two handles on one mic makes the recogniser fail with a
      // device-busy error on several Android builds.
      stream.getTracks().forEach(t => t.stop())
      startWebSpeech(Ctor)
    },
    [langCode, startWhisper, startWebSpeech, failMic, applyProbedPermission],
  )

  const toggle = useCallback(() => {
    if (transcribing || openingRef.current) return
    if (recording) {
      stop()
      return
    }

    // ── iOS Safari gesture rule — this line must stay first ──────────────────
    // getUserMedia has to be INVOKED as the first synchronous statement of the
    // tap handler. iOS Safari only honours a mic request while the tap's
    // user-gesture token is live, and an await, a state read, or a setState
    // before this point spends that token: the request is then denied SILENTLY
    // — no prompt, no error, no recording. That is the "works on one phone,
    // nothing happens on the other" report. Only the promise is created here;
    // every check, reset and routing decision is sequenced after it in openMic.
    const micRequest = requestMicStream()

    openingRef.current = true
    stopSpeech()
    setError(null)
    setErrorKind(null)
    latestTranscriptRef.current = ''
    safariAccumulatedRef.current = ''
    userStoppedRef.current = false
    discardRef.current = false
    fellBackRef.current = false

    void openMic(micRequest)
  }, [recording, transcribing, stop, openMic])

  const clearError = useCallback(() => {
    setError(null)
    setErrorKind(null)
  }, [])

  /**
   * Re-read the live permission state. Backs the help modal's "Try again" so a
   * patient who just flipped the switch in Settings sees the UI recover instead
   * of being told to fix something they already fixed.
   */
  const recheckPermission = useCallback(async () => {
    const state = await queryMicPermission()
    applyProbedPermission(state)
    if (state !== 'denied') {
      setError(null)
      setErrorKind(null)
    }
    return state
  }, [applyProbedPermission])

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

  return {
    recording,
    transcribing,
    error,
    errorKind,
    permission,
    inAppBrowser,
    toggle,
    stop,
    clearError,
    recheckPermission,
  }
}
