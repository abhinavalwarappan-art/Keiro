/**
 * Kai's voice.
 *
 * Two engines behind one entry point. Fish Audio is the real voice, and the
 * browser's own speechSynthesis is the fallback for when the API is
 * unconfigured or unreachable. Callers never choose an engine.
 *
 * Playback is an explicit state machine, shared by the whole page:
 *
 *   idle ──tap──▶ loading ──audio fetched──▶ ready ──audio starts──▶ playing ──tap──▶ paused
 *                    │                                               │  ▲              │
 *                    │                                            ended └──── tap ──────┘
 *                    ▼                        ▼
 *                  error ◀── fails ──      idle
 *
 * One snapshot ({ key, phase, error }) says which message owns the voice and
 * what it is doing, so every Listen button renders from the same truth. That
 * replaced per-button "am I speaking?" flags, which went stale whenever
 * playback was stopped from somewhere else (the mic, another message) and left
 * a silent button stuck on "Stop".
 *
 * Why each piece exists — every one of these was a real "I pressed Listen and
 * nothing happened" report:
 *  • `loading` is visible. Synthesis takes 1–4s; with no feedback patients
 *    tapped again, and every tap cancelled the request in flight and started a
 *    new one, so on a slow connection the audio could never arrive.
 *  • Taps during `loading` are ignored for that message, and identical text is
 *    served from an in-memory cache, so replays are instant and never re-bill.
 *  • The iOS unlock clip actually loads. The old one was a `data:` URI, which
 *    the CSP (`media-src 'self' blob:`) blocks — so on iPhone the unlock never
 *    happened and the real clip, arriving after the network wait, was refused.
 *  • A pause the app didn't ask for (a call, Siri, another app taking audio)
 *    lands in `paused`, not a `playing` that never ends and locks the chat.
 *  • A play() the browser blocks lands in `error: 'blocked'` with the audio
 *    already cached, so the next tap — a fresh gesture — plays immediately.
 */

import { stripMarkdownAndEmoji } from './text'
import { normalizeLocale } from './languages'

/* ------------------------------------------------------------------ *
 * Device-voice selection (fallback engine)
 * ------------------------------------------------------------------ */

const QUALITY_HINTS = ['premium', 'enhanced', 'neural', 'natural', 'hd', 'wavenet', 'online']
const AVOID_HINTS = ['compact', 'espeak', 'squeak', 'cellos', 'super-compact']

function voiceScore(voice: SpeechSynthesisVoice, langCode: string): number {
  const prefix = langCode.split('-')[0]
  const name = voice.name.toLowerCase()
  const lang = voice.lang.toLowerCase()
  let score = 0

  if (lang === langCode.toLowerCase()) score += 40
  else if (lang.startsWith(prefix)) score += 25
  else return -1

  for (const hint of QUALITY_HINTS) {
    if (name.includes(hint)) score += 12
  }
  for (const hint of AVOID_HINTS) {
    if (name.includes(hint)) score -= 20
  }

  if (voice.localService) score += 6
  if (name.includes('google')) score += 8
  if (name.includes('microsoft')) score += 6
  if (name.includes('samantha') || name.includes('karen') || name.includes('daniel')) score += 5

  return score
}

export function getBestVoice(langCode: string): SpeechSynthesisVoice | null {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return null

  const voices = window.speechSynthesis.getVoices()
  if (voices.length === 0) return null

  const ranked = voices
    .map((voice) => ({ voice, score: voiceScore(voice, langCode) }))
    .filter((entry) => entry.score >= 0)
    .sort((a, b) => b.score - a.score)

  return ranked[0]?.voice ?? null
}

export function applyClearSpeechSettings(
  utterance: SpeechSynthesisUtterance,
  voice: SpeechSynthesisVoice | null,
  langCode: string,
) {
  if (voice) utterance.voice = voice
  utterance.lang = voice?.lang || langCode
  utterance.rate = 1
  utterance.pitch = 1
  utterance.volume = 1
}

function splitForSpeech(text: string): string[] {
  return text
    .split(/(?<=[.!?।؟\n])\s+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 0)
}

/* ------------------------------------------------------------------ *
 * The shared state machine
 * ------------------------------------------------------------------ */

/**
 * `ready` is the short gap between the audio arriving and the browser actually
 * starting it — still "preparing" to the patient, but distinct so tests and the
 * UI can tell a slow network from a slow decoder.
 */
export type SpeechPhase = 'idle' | 'loading' | 'ready' | 'playing' | 'paused' | 'error'

/**
 * Why playback failed, phrased by what the patient can do about it:
 *  • blocked     — the browser refused to start audio; tapping again will work.
 *  • network     — Kai's voice couldn't be fetched and no device voice exists.
 *  • unavailable — this device has no voice for the language at all.
 */
export type SpeechErrorKind = 'blocked' | 'network' | 'unavailable'

export interface SpeechSnapshot {
  /** Which message owns the voice right now; null when nothing is happening. */
  key: string | null
  phase: SpeechPhase
  error: SpeechErrorKind | null
  /** Pause/resume works on Kai's real voice; the device voice can only stop. */
  canPause: boolean
}

const IDLE: SpeechSnapshot = { key: null, phase: 'idle', error: null, canPause: false }

let snapshot: SpeechSnapshot = IDLE
const snapshotListeners = new Set<() => void>()

function setSnapshot(next: SpeechSnapshot) {
  const wasActive = snapshot.phase === 'playing'
  snapshot = next
  snapshotListeners.forEach((listener) => listener())
  const isActive = next.phase === 'playing'
  if (wasActive !== isActive) activeListeners.forEach((listener) => listener(isActive))
}

/** Current playback state. Stable object identity until it changes (useSyncExternalStore-safe). */
export function getSpeechSnapshot(): SpeechSnapshot {
  return snapshot
}

/** Server render: nothing is ever playing. */
export function getServerSpeechSnapshot(): SpeechSnapshot {
  return IDLE
}

export function subscribeSpeech(listener: () => void): () => void {
  snapshotListeners.add(listener)
  return () => {
    snapshotListeners.delete(listener)
  }
}

type SpeechStateListener = (active: boolean) => void
const activeListeners = new Set<SpeechStateListener>()

/** Whether Kai's voice is audibly playing right now. */
export function isSpeechActive(): boolean {
  return snapshot.phase === 'playing'
}

/** Subscribe to playing/not-playing changes. Returns an unsubscribe function. */
export function subscribeSpeechState(listener: SpeechStateListener): () => void {
  activeListeners.add(listener)
  listener(isSpeechActive())
  return () => {
    activeListeners.delete(listener)
  }
}

export interface SpeakOptions {
  /** Identifies the control that owns this playback, e.g. a message id. */
  key?: string
  /** Browser-fallback voice name (device voice), used only when Fish can't play. */
  voiceName?: string
  onStart?: () => void
  onEnd?: () => void
  onError?: () => void
}

/* ------------------------------------------------------------------ *
 * iOS audio routing
 * ------------------------------------------------------------------ */

type AudioSessionType = 'auto' | 'playback' | 'play-and-record'

/**
 * Tell Safari what kind of audio this is (Audio Session API, Safari 16.4+;
 * a no-op everywhere else).
 *
 * After the mic has been used, iOS keeps the page in a play-and-record session
 * that routes output to the quiet phone earpiece — Kai "plays" but a patient
 * holding the phone at arm's length hears nothing. Declaring `playback` before
 * Kai speaks puts him back on the loudspeaker.
 */
export function setAudioSessionType(type: AudioSessionType) {
  if (typeof navigator === 'undefined') return
  try {
    const session = (navigator as Navigator & { audioSession?: { type: string } }).audioSession
    if (session && session.type !== type) session.type = type
  } catch {
    // Read-only or unsupported in this engine — routing stays the browser's call.
  }
}

/* ------------------------------------------------------------------ *
 * Fish Audio engine
 * ------------------------------------------------------------------ */

let audioEl: HTMLAudioElement | null = null
let audioObjectUrl: string | null = null
let fetchAbort: AbortController | null = null
let generation = 0
/** Set while WE pause the element, so the pause handler can tell it apart from the OS doing it. */
let pausingByApp = false

/**
 * Synthesized audio, keyed by language + exact text. Replaying a message is
 * then instant and never re-bills Fish. Memory only, gone with the tab — this
 * is the patient's clinical dialogue, so it is never written to storage.
 */
const AUDIO_CACHE_LIMIT = 12
const audioCache = new Map<string, Blob>()

function cacheGet(id: string): Blob | undefined {
  const blob = audioCache.get(id)
  if (blob) {
    audioCache.delete(id)
    audioCache.set(id, blob)
  }
  return blob
}

function cacheSet(id: string, blob: Blob) {
  audioCache.delete(id)
  audioCache.set(id, blob)
  while (audioCache.size > AUDIO_CACHE_LIMIT) {
    const oldest = audioCache.keys().next().value
    if (oldest === undefined) break
    audioCache.delete(oldest)
  }
}

/**
 * 50ms of real silence (8 kHz, 8-bit mono, centred at 0x80), served as a
 * `blob:` URL. Both details are load-bearing:
 *  • It must contain samples — a header-only WAV is rejected as undecodable.
 *  • It must NOT be a `data:` URI. The CSP is `media-src 'self' blob:`, so a
 *    data: clip is blocked before it loads. The old unlock clip was exactly
 *    that, which means the iOS unlock below never actually ran — the root of
 *    "Listen does nothing on iPhone": the real clip then arrived outside the
 *    gesture and Safari refused to play it.
 * Created once and never revoked; it is 444 bytes.
 */
let silentClipUrl: string | null = null
function silentClip(): string {
  if (silentClipUrl) return silentClipUrl
  const samples = 400
  const bytes = new Uint8Array(44 + samples)
  const view = new DataView(bytes.buffer)
  const ascii = (offset: number, s: string) => {
    for (let i = 0; i < s.length; i += 1) bytes[offset + i] = s.charCodeAt(i)
  }
  ascii(0, 'RIFF')
  view.setUint32(4, 36 + samples, true)
  ascii(8, 'WAVE')
  ascii(12, 'fmt ')
  view.setUint32(16, 16, true) // PCM format chunk length
  view.setUint16(20, 1, true) // PCM
  view.setUint16(22, 1, true) // mono
  view.setUint32(24, 8000, true) // sample rate
  view.setUint32(28, 8000, true) // byte rate
  view.setUint16(32, 1, true) // block align
  view.setUint16(34, 8, true) // bits per sample
  ascii(36, 'data')
  view.setUint32(40, samples, true)
  bytes.fill(0x80, 44)
  silentClipUrl = URL.createObjectURL(new Blob([bytes], { type: 'audio/wav' }))
  return silentClipUrl
}

function getAudioElement(): HTMLAudioElement {
  if (!audioEl) {
    audioEl = new Audio()
    audioEl.preload = 'auto'
  }
  return audioEl
}

function detachAudioHandlers(audio: HTMLAudioElement) {
  audio.onplaying = null
  audio.onended = null
  audio.onerror = null
  audio.onpause = null
}

/**
 * Unlock the shared element for iOS Safari. MUST run synchronously inside the
 * tap, before any await: iOS only lets media start in the task the gesture
 * created, and the Fish round-trip lands several tasks later. Playing silence
 * now blesses the element for the real audio assigned to it afterwards.
 */
function unlockAudioElement(audio: HTMLAudioElement) {
  detachAudioHandlers(audio)
  audio.src = silentClip()
  void audio.play().catch(() => {
    // Expected when the real audio replaces this clip mid-play (AbortError).
  })
}

function revokeAudioUrl() {
  if (audioObjectUrl) {
    URL.revokeObjectURL(audioObjectUrl)
    audioObjectUrl = null
  }
}

/** Stop whichever engine is mid-playback and drop any request in flight. */
function cancelPlayback() {
  fetchAbort?.abort()
  fetchAbort = null
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    window.speechSynthesis.cancel()
  }
  if (audioEl) {
    detachAudioHandlers(audioEl)
    pausingByApp = true
    audioEl.pause()
    pausingByApp = false
  }
  revokeAudioUrl()
}

type FetchResult = { blob: Blob } | { failure: 'network' | 'unavailable' | 'aborted' }

async function fetchKaiAudio(text: string, langCode: string, signal: AbortSignal): Promise<FetchResult> {
  try {
    const response = await fetch('/api/tts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text, langCode }),
      signal,
    })
    // 429/503/5xx all mean "no Fish audio this time" — the device voice can still talk.
    if (!response.ok) return { failure: 'unavailable' }
    const blob = await response.blob()
    if (blob.size === 0) return { failure: 'unavailable' }
    return { blob }
  } catch {
    return { failure: signal.aborted ? 'aborted' : 'network' }
  }
}

function fail(gen: number, key: string | null, error: SpeechErrorKind, options?: SpeakOptions) {
  if (gen !== generation) return
  setSnapshot({ key, phase: 'error', error, canPause: false })
  options?.onError?.()
}

function finish(gen: number, options?: SpeakOptions) {
  if (gen !== generation) return
  setSnapshot(IDLE)
  options?.onEnd?.()
}

/**
 * Play a synthesized clip on the shared element. Called synchronously from the
 * tap when the clip is cached (so iOS sees the gesture), or after the fetch.
 */
function playBlob(
  blob: Blob,
  gen: number,
  key: string | null,
  spoken: string,
  langCode: string,
  options?: SpeakOptions,
) {
  const audio = getAudioElement()
  detachAudioHandlers(audio)
  revokeAudioUrl()
  const url = URL.createObjectURL(blob)
  audioObjectUrl = url
  audio.src = url

  const current = () => gen === generation && audio.src === url

  audio.onplaying = () => {
    if (!current()) return
    const firstStart = snapshot.phase === 'loading' || snapshot.phase === 'ready'
    setSnapshot({ key, phase: 'playing', error: null, canPause: true })
    if (firstStart) options?.onStart?.()
  }
  audio.onended = () => {
    if (current()) finish(gen, options)
  }
  audio.onpause = () => {
    // Our own pause/stop already set the state. Anything else — a phone call,
    // Siri, another app grabbing audio — must not leave us "playing" forever.
    if (!current() || pausingByApp || audio.ended) return
    if (snapshot.phase === 'playing') setSnapshot({ key, phase: 'paused', error: null, canPause: true })
  }
  audio.onerror = () => {
    // The clip itself is unplayable; the device voice is the honest fallback.
    if (!current()) return
    detachAudioHandlers(audio)
    speakViaBrowser(spoken, langCode, gen, key, 'unavailable', options)
  }

  if (snapshot.phase === 'loading') setSnapshot({ key, phase: 'ready', error: null, canPause: false })
  audio.play().catch((err: unknown) => {
    if (!current()) return
    if (err instanceof DOMException && err.name === 'NotAllowedError') {
      // Autoplay policy: the gesture expired before the audio arrived. The clip
      // is cached, so the next tap starts it instantly inside its own gesture.
      fail(gen, key, 'blocked', options)
      return
    }
    // AbortError from a src swap is handled by `current()`; anything else —
    // let the device voice try rather than leave the patient in silence.
    if (snapshot.phase === 'loading' || snapshot.phase === 'ready') {
      detachAudioHandlers(audio)
      speakViaBrowser(spoken, langCode, gen, key, 'unavailable', options)
    }
  })
}

/* ------------------------------------------------------------------ *
 * Browser speechSynthesis fallback
 * ------------------------------------------------------------------ */

/** Consecutive 500ms polls with the engine idle before a never-started utterance counts as dropped. */
const DROPPED_SPEECH_POLLS = 3

function speakViaBrowser(
  spoken: string,
  langCode: string,
  gen: number,
  key: string | null,
  failureKind: SpeechErrorKind,
  options?: SpeakOptions,
) {
  if (gen !== generation) return
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    fail(gen, key, failureKind, options)
    return
  }

  const voices = window.speechSynthesis.getVoices()
  const voice =
    (options?.voiceName ? voices.find((v) => v.name === options.voiceName) ?? null : null) ??
    getBestVoice(langCode)
  const chunks = splitForSpeech(spoken)
  if (!voice || chunks.length === 0) {
    fail(gen, key, failureKind, options)
    return
  }

  let index = 0
  let started = false
  let idlePolls = 0
  let watchdog: number | null = null

  const stopWatchdog = () => {
    if (watchdog !== null) {
      window.clearInterval(watchdog)
      watchdog = null
    }
  }

  // Chrome intermittently drops utterance `onend` events (long text, tab blur,
  // its ~15s synthesis watchdog), and iOS silently ignores speak() outside a
  // tap. Neither reports anything. Poll the engine's real state instead: once it
  // is neither speaking nor queued, playback has either finished (started) or
  // was dropped (never started) — both must leave the loading/playing state.
  watchdog = window.setInterval(() => {
    if (gen !== generation) {
      stopWatchdog()
      return
    }
    const engineIdle = !window.speechSynthesis.speaking && !window.speechSynthesis.pending
    if (!engineIdle) {
      idlePolls = 0
      return
    }
    idlePolls += 1
    if (started) {
      stopWatchdog()
      finish(gen, options)
    } else if (idlePolls >= DROPPED_SPEECH_POLLS) {
      stopWatchdog()
      fail(gen, key, failureKind, options)
    }
  }, 500)

  const speakNext = () => {
    if (gen !== generation) return
    if (index >= chunks.length) {
      stopWatchdog()
      finish(gen, options)
      return
    }

    const utterance = new SpeechSynthesisUtterance(chunks[index])
    applyClearSpeechSettings(utterance, voice, langCode)

    utterance.onstart = () => {
      if (gen !== generation || started) return
      started = true
      setSnapshot({ key, phase: 'playing', error: null, canPause: false })
      options?.onStart?.()
    }
    utterance.onend = () => {
      if (gen !== generation) return
      index += 1
      speakNext()
    }
    utterance.onerror = (event: SpeechSynthesisErrorEvent) => {
      if (gen !== generation) return
      // Benign: our own cancel() during a generation change.
      if (event.error === 'interrupted' || event.error === 'canceled') return
      index += 1
      speakNext()
    }

    window.speechSynthesis.speak(utterance)
  }

  speakNext()
}

/* ------------------------------------------------------------------ *
 * Public controls
 * ------------------------------------------------------------------ */

/**
 * Start speaking `text` in Kai's voice. Must be called from a user gesture.
 *
 * Returns whether playback is being attempted. The outcome — playing, or an
 * error the UI can explain — arrives through the snapshot and `options`.
 */
export function speakText(text: string, langCode: string, options?: SpeakOptions): boolean {
  if (typeof window === 'undefined') return false
  const key = options?.key ?? null

  // Never read markdown markers or emoji aloud.
  const spoken = stripMarkdownAndEmoji(text)
  if (!spoken.trim()) {
    options?.onError?.()
    return false
  }

  cancelPlayback()
  const gen = ++generation
  setAudioSessionType('playback')
  setSnapshot({ key, phase: 'loading', error: null, canPause: false })

  // Keyed by the NORMALIZED locale: the server picks the voice from it, so one
  // locale is one voice, and audio can never be replayed in another language's
  // voice (`es` and `es-ES` share; `zh-CN` and `zh-TW` never do).
  const locale = normalizeLocale(langCode) ?? langCode
  const cacheId = `${locale}\u0000${spoken}`
  const cached = cacheGet(cacheId)
  if (cached) {
    playBlob(cached, gen, key, spoken, langCode, options)
    return true
  }

  unlockAudioElement(getAudioElement())
  const controller = new AbortController()
  fetchAbort = controller

  void fetchKaiAudio(spoken, locale, controller.signal).then((result) => {
    if (gen !== generation) return
    if (fetchAbort === controller) fetchAbort = null
    if ('blob' in result) {
      cacheSet(cacheId, result.blob)
      playBlob(result.blob, gen, key, spoken, langCode, options)
      return
    }
    if (result.failure === 'aborted') return
    speakViaBrowser(spoken, langCode, gen, key, result.failure === 'network' ? 'network' : 'unavailable', options)
  })
  return true
}

/** Pause Kai's voice where it is. Device-voice playback can only stop. */
export function pauseSpeech() {
  if (snapshot.phase !== 'playing') return
  if (!snapshot.canPause || !audioEl) {
    stopSpeech()
    return
  }
  pausingByApp = true
  audioEl.pause()
  pausingByApp = false
  setSnapshot({ ...snapshot, phase: 'paused' })
}

/** Resume a paused clip. Must be called from a user gesture. */
export function resumeSpeech() {
  if (snapshot.phase !== 'paused' || !audioEl) return
  const gen = generation
  const key = snapshot.key
  setAudioSessionType('playback')
  audioEl.play().catch(() => {
    if (gen === generation) fail(gen, key, 'blocked')
  })
}

/**
 * The one handler a Listen button needs. Same message: loading → ignored
 * (prevents duplicate requests), playing → pause, paused → resume, idle or
 * error → (re)start. A different message takes over the voice.
 */
export function toggleSpeech(key: string, text: string, langCode: string, options?: Omit<SpeakOptions, 'key'>) {
  if (snapshot.key === key) {
    if (snapshot.phase === 'loading' || snapshot.phase === 'ready') return
    if (snapshot.phase === 'playing') {
      pauseSpeech()
      return
    }
    if (snapshot.phase === 'paused') {
      resumeSpeech()
      return
    }
  }
  speakText(text, langCode, { ...options, key })
}

export function stopSpeech() {
  generation += 1
  cancelPlayback()
  if (snapshot !== IDLE) setSnapshot(IDLE)
}

/** Call once on app load so device voices are ready before a fallback is needed. */
export function preloadSpeechVoices() {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return

  const load = () => window.speechSynthesis.getVoices()
  load()
  window.speechSynthesis.onvoiceschanged = load
}
