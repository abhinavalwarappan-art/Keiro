'use client'

import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from 'react'
import { setAudioSessionType, stopSpeech } from '@/lib/speech'
import { toWav } from '@/lib/audioWav'
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
 * Voice input: record locally, transcribe on the server.
 *
 * The mic captures raw audio with MediaRecorder, re-encodes the clip to WAV
 * (see `toWav` — Fish cannot decode any container a browser records), and
 * uploads it to `/api/transcribe`, which transcribes it with Fish Audio ASR —
 * the same provider and the same key as Kai's voice. There is ONE path for all
 * 45 languages.
 *
 * The browser's own SpeechRecognition is deliberately not used. It does not
 * transcribe locally: Chrome and Safari stream the audio to Google's and
 * Apple's servers, which would send patient health information to a third party
 * nobody agreed to, and bypass Fish entirely. The cost of doing without it is
 * real and worth naming — no interim "words appear as you speak" transcript,
 * and a round-trip's latency once the patient stops — but neither is worth
 * leaking PHI for.
 *
 * Capture is gated behind ONE explicit getUserMedia probe fired straight from
 * the tap (see `toggle`). That probe exists for two reasons:
 *  • iOS Safari only honours a mic request while the tap's user-gesture token is
 *    live, and asking any later loses that race.
 *  • getUserMedia rejects with a specific DOMException name, so a failure can be
 *    told apart (denied / no hardware / device busy / insecure) instead of
 *    collapsing into one useless "blocked" message.
 *
 * Typing is always the fallback: every failure here ends in a message that says
 * so, and never in a spinner that stays up.
 */

/**
 * Recording containers, best first. These are chosen for what browsers record
 * WELL, not for what Fish can read — nothing MediaRecorder produces is
 * decodable by /v1/asr, so the clip is re-encoded to WAV before upload (see
 * `toWav`). That decoupling is deliberate: this list can follow browser support,
 * and the format contract with Fish is honoured in exactly one place.
 */
const RECORDING_MIME_PREFS = ['audio/webm;codecs=opus', 'audio/webm', 'audio/mp4', 'audio/ogg']

// The user agent never changes, so there is nothing to subscribe to.
const noopSubscribe = () => () => {}
// Server render has no navigator; returning null keeps the markup identical on
// both sides so reading the UA can't cause a hydration mismatch.
const noInAppBrowserOnServer = () => null

/**
 * Hand iOS audio routing back once capture ends. While the mic is open Safari
 * runs a play-and-record session that sends output to the quiet earpiece; left
 * in place, Kai's next reply plays where nobody can hear it.
 */
function releaseAudioSession() {
  setAudioSessionType('auto')
}

function pickRecordingMimeType(): string | undefined {
  if (typeof MediaRecorder === 'undefined') return undefined
  for (const type of RECORDING_MIME_PREFS) {
    if (MediaRecorder.isTypeSupported(type)) return type
  }
  return undefined
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

/** Non-hardware voice failures, as stable codes the UI can translate. */
export type VoiceErrorCode = 'failed' | 'rateLimited' | 'noSpeech' | 'interrupted' | 'startFailed'

interface UseVoiceInputOptions {
  langCode: string
  /** Called once with the finished transcript. */
  onTranscript: (text: string) => void
  /** Fires once a user-ended dictation settles with non-empty text — e.g. to refocus. */
  onFinal?: () => void
}

interface UseVoiceInput {
  requesting: boolean
  recording: boolean
  transcribing: boolean
  error: string | null
  /** Set only for microphone faults — null for transcription/network errors. */
  errorKind: MicErrorKind | null
  /** Set for transcription/network faults, so the UI can show them in the patient's language. */
  errorCode: VoiceErrorCode | null
  /** Live Permissions API reading; 'unsupported' where the API is unavailable. */
  permission: MicPermissionState
  /** Host app name when running inside a webview that commonly blocks the mic. */
  inAppBrowser: string | null
  toggle: () => void
  stop: () => void
  /** Abandon capture/upload so typing is immediately available. */
  cancel: () => void
  clearError: () => void
  /** Re-read the live permission state — backs the help modal's "Try again". */
  recheckPermission: () => Promise<MicPermissionState>
}

export function useVoiceInput({ langCode, onTranscript, onFinal }: UseVoiceInputOptions): UseVoiceInput {
  const [requesting, setRequesting] = useState(false)
  const [recording, setRecording] = useState(false)
  const [transcribing, setTranscribing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [errorKind, setErrorKind] = useState<MicErrorKind | null>(null)
  const [errorCode, setErrorCode] = useState<VoiceErrorCode | null>(null)

  /** A voice failure that isn't the microphone's: English for logs/tests, a code for the UI. */
  const failVoice = useCallback((code: VoiceErrorCode, message: string) => {
    setErrorCode(code)
    setError(message)
  }, [])
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

  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const requestGenerationRef = useRef(0)
  const transcriptionAbortRef = useRef<AbortController | null>(null)

  const discardRef = useRef(false)
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
    releaseAudioSession()
  }

  /**
   * Surface a mic fault with its real cause and ship the details to the
   * diagnostics endpoint. The report is fire-and-forget — nothing here awaits it.
   */
  const failMic = useCallback(
    (kind: MicErrorKind, err: unknown, source: 'getUserMedia' | 'speech-recognition') => {
      releaseAudioSession()
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

  /**
   * Upload the clip and hand the transcript to the caller.
   *
   * Every exit path either delivers text or sets a message — a tap must never
   * end in a cleared spinner and nothing else, because the patient's only cue
   * that voice failed is what this writes.
   */
  const transcribe = useCallback(async (recorded: Blob) => {
    const controller = new AbortController()
    transcriptionAbortRef.current = controller
    const timeout = setTimeout(() => controller.abort(new DOMException('Transcription timed out', 'TimeoutError')), 45_000)
    setTranscribing(true)
    try {
      // Fish cannot read any container a browser records, so hand it WAV.
      let wav: Blob
      try {
        wav = await toWav(recorded)
      } catch {
        failVoice('failed', 'Voice input failed. Please type your message instead.')
        return
      }

      const form = new FormData()
      if (controller.signal.aborted) return
      form.append('audio', wav)
      form.append('langCode', langCode)
      const res = await fetch('/api/transcribe', { method: 'POST', body: form, signal: controller.signal })
      if (res.status === 429) {
        failVoice('rateLimited', 'Please wait a moment before trying voice again, or type your message instead.')
        return
      }
      // Everything else — a Fish timeout, a rate limit upstream, malformed
      // audio, an unconfigured deploy — reads the same to the patient, because
      // the action is the same: type it instead.
      if (!res.ok) {
        failVoice('failed', 'Voice input failed. Please type your message instead.')
        return
      }
      const data = (await res.json()) as { text?: string }
      if (controller.signal.aborted) return
      const text = typeof data.text === 'string' ? data.text.trim() : ''
      if (!text) {
        // A successful transcription of silence. Saying nothing here would look
        // identical to the mic being broken.
        failVoice('noSpeech', 'No speech was heard. Please try again, or type your message instead.')
        return
      }
      onTranscriptRef.current(text)
      onFinalRef.current?.()
    } catch {
      if (controller.signal.reason?.name !== 'AbortError') {
        failVoice('interrupted', 'Voice input could not finish. Please try again, or type your message instead.')
      }
    } finally {
      clearTimeout(timeout)
      if (transcriptionAbortRef.current === controller) {
        transcriptionAbortRef.current = null
        setTranscribing(false)
      }
    }
  }, [langCode, failVoice])

  /**
   * Record using a stream the caller already opened. The stream is never
   * acquired here: the getUserMedia call has to happen in the tap handler
   * itself to keep iOS Safari's gesture token alive.
   */
  const startRecording = useCallback((stream: MediaStream) => {
    if (typeof MediaRecorder === 'undefined') {
      stream.getTracks().forEach(t => t.stop())
      failMic('unsupported', null, 'getUserMedia')
      return
    }

    streamRef.current = stream

    const mimeType = pickRecordingMimeType()
    let recorder: MediaRecorder
    try {
      recorder = mimeType ? new MediaRecorder(stream, { mimeType }) : new MediaRecorder(stream)
    } catch {
      stopTracks()
      failVoice('startFailed', 'Voice input could not start. Please try again.')
      return
    }

    const chunks: Blob[] = []
    recorder.ondataavailable = e => {
      if (e.data.size > 0) chunks.push(e.data)
    }
    recorder.onstop = () => {
      stream.getTracks().forEach(t => t.stop())
      releaseAudioSession()
      if (mediaRecorderRef.current !== recorder) return
      streamRef.current = null
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
      failVoice('startFailed', 'Voice input could not start. Please try again.')
    }
  }, [transcribe, failMic, failVoice])

  const stop = useCallback(() => {
    const recorder = mediaRecorderRef.current
    if (recorder && recorder.state !== 'inactive') {
      recorder.stop()
    }
  }, [])

  /**
   * Start capture on the opened stream, turning any rejection into a specific,
   * reportable cause.
   */
  const openMic = useCallback(
    async (micRequest: Promise<MediaStream> | null, generation: number) => {
      if (!micRequest) {
        openingRef.current = false
        setRequesting(false)
        failMic(classifyMissingMediaDevices(), null, 'getUserMedia')
        return
      }

      let stream: MediaStream
      try {
        stream = await micRequest
      } catch (err) {
        if (generation !== requestGenerationRef.current) return
        openingRef.current = false
        setRequesting(false)
        failMic(classifyMicError(err), err, 'getUserMedia')
        return
      }
      if (generation !== requestGenerationRef.current) {
        stream.getTracks().forEach(t => t.stop())
        releaseAudioSession()
        return
      }
      openingRef.current = false
      setRequesting(false)

      // The prompt can outlive the component (patient navigates away while it is
      // open). Releasing here is what actually turns the mic off — otherwise the
      // browser's recording indicator stays lit with nothing listening.
      if (discardRef.current) {
        stream.getTracks().forEach(t => t.stop())
        releaseAudioSession()
        return
      }

      // The stream proves permission regardless of what the Permissions API
      // says (it reports 'unsupported' on Firefox and older Safari).
      applyProbedPermission('granted')

      startRecording(stream)
    },
    [startRecording, failMic, applyProbedPermission],
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
    // Synchronous and after the request is already made, so the gesture token
    // above is untouched. Declares the session before capture actually begins.
    setAudioSessionType('play-and-record')

    openingRef.current = true
    setRequesting(true)
    stopSpeech()
    setError(null)
    setErrorKind(null)
    setErrorCode(null)
    discardRef.current = false

    void openMic(micRequest, ++requestGenerationRef.current)
  }, [recording, transcribing, stop, openMic])

  const cancel = useCallback(() => {
    requestGenerationRef.current += 1
    discardRef.current = true
    openingRef.current = false
    transcriptionAbortRef.current?.abort()
    transcriptionAbortRef.current = null
    stop()
    mediaRecorderRef.current = null
    stopTracks()
    setRequesting(false)
    setRecording(false)
    setTranscribing(false)
  }, [stop])

  const clearError = useCallback(() => {
    setError(null)
    setErrorKind(null)
    setErrorCode(null)
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
      setErrorCode(null)
    }
    return state
  }, [applyProbedPermission])

  // Discard any in-flight capture on unmount without transcribing it.
  useEffect(() => {
    return () => {
      requestGenerationRef.current += 1
      transcriptionAbortRef.current?.abort()
      discardRef.current = true
      const recorder = mediaRecorderRef.current
      if (recorder && recorder.state !== 'inactive') recorder.stop()
      streamRef.current?.getTracks().forEach(t => t.stop())
    }
  }, [])

  return {
    requesting,
    recording,
    transcribing,
    error,
    errorKind,
    errorCode,
    permission,
    inAppBrowser,
    toggle,
    stop,
    cancel,
    clearError,
    recheckPermission,
  }
}
