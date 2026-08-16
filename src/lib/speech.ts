/**
 * Kai's voice.
 *
 * Two engines behind one entry point. Fish Audio is the real voice — one model
 * for every patient in every language — and the browser's own speechSynthesis
 * is the fallback for when the API is unconfigured, the network is down, or
 * playback is blocked. Callers never choose: speakText() tries Fish and drops
 * to the browser on any failure, so speech degrades in quality but never
 * disappears.
 */

import { stripMarkdownAndEmoji } from './text'

const QUALITY_HINTS = [
  'premium',
  'enhanced',
  'neural',
  'natural',
  'hd',
  'wavenet',
  'online',
]

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

export interface SpeakOptions {
  /** Browser-fallback voice name (device voice), used only when Fish can't play. */
  voiceName?: string
  onStart?: () => void
  onEnd?: () => void
  onError?: () => void
}

type SpeechStateListener = (active: boolean) => void

let speechActive = false
let speechGeneration = 0
const speechStateListeners = new Set<SpeechStateListener>()

function notifySpeechState(active: boolean) {
  if (speechActive === active) return
  speechActive = active
  speechStateListeners.forEach((listener) => listener(active))
}

/** Whether Kai (or any app TTS) is currently playing audio. */
export function isSpeechActive(): boolean {
  return speechActive
}

/** Subscribe to global TTS active/inactive changes. Returns an unsubscribe function. */
export function subscribeSpeechState(listener: SpeechStateListener): () => void {
  speechStateListeners.add(listener)
  listener(speechActive)
  return () => {
    speechStateListeners.delete(listener)
  }
}

/* ------------------------------------------------------------------ *
 * Fish Audio playback
 * ------------------------------------------------------------------ */

let audioEl: HTMLAudioElement | null = null
let audioObjectUrl: string | null = null

/**
 * A 44-byte RIFF/WAVE header with no samples — silence, built here rather than
 * pasted as a base64 blob so it can't rot into something unparseable.
 */
function silentWavDataUri(): string {
  const bytes = new Uint8Array(44)
  const view = new DataView(bytes.buffer)
  const ascii = (offset: number, s: string) => {
    for (let i = 0; i < s.length; i += 1) bytes[offset + i] = s.charCodeAt(i)
  }
  ascii(0, 'RIFF')
  view.setUint32(4, 36, true) // header bytes after this field, data chunk empty
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
  view.setUint32(40, 0, true) // zero samples

  let binary = ''
  bytes.forEach((b) => { binary += String.fromCharCode(b) })
  return `data:audio/wav;base64,${btoa(binary)}`
}

function revokeAudioUrl() {
  if (audioObjectUrl) {
    URL.revokeObjectURL(audioObjectUrl)
    audioObjectUrl = null
  }
}

/**
 * Get the shared audio element and "unlock" it for iOS Safari.
 *
 * MUST be called synchronously from the click handler, before any await. iOS
 * only lets media start inside the task the user's tap created, and the Fish
 * round-trip lands us several tasks later — so we start silence *now*, during
 * the gesture, which blesses the element for the real audio assigned to it
 * afterwards. Skip this and Kai is mute on iPhone specifically, which is most
 * of the patients who need him to talk.
 */
function prepareAudioElement(): HTMLAudioElement {
  if (!audioEl) {
    audioEl = new Audio()
    audioEl.preload = 'auto'
  }
  audioEl.pause()
  audioEl.src = silentWavDataUri()
  // Rejects on browsers that block it outright; the element is unlocked either
  // way on the platforms where unlocking is what matters.
  void audioEl.play().catch(() => {})
  return audioEl
}

/** Stop whichever engine is mid-playback, without touching the generation. */
function cancelPlayback() {
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    window.speechSynthesis.cancel()
  }
  if (audioEl) {
    audioEl.onplay = null
    audioEl.onended = null
    audioEl.onerror = null
    audioEl.pause()
  }
  revokeAudioUrl()
}

/**
 * Fetch and play the Fish Audio rendering. Resolves true when playback started
 * (or was superseded by a newer request), false when the caller should fall
 * back to browser speech.
 */
async function speakViaFish(
  text: string,
  generation: number,
  audio: HTMLAudioElement,
  options?: SpeakOptions,
): Promise<boolean> {
  let blob: Blob
  try {
    const response = await fetch('/api/tts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text }),
    })
    // 401/429/503 all mean "no Fish audio this time" — the browser can still talk.
    if (!response.ok) return false
    blob = await response.blob()
  } catch {
    return false
  }

  // A newer speakText() (or a stop) landed while we were fetching. Report success
  // so the caller doesn't start browser speech over the top of it.
  if (generation !== speechGeneration) return true
  if (blob.size === 0) return false

  revokeAudioUrl()
  audioObjectUrl = URL.createObjectURL(blob)
  audio.src = audioObjectUrl

  const finishAudio = (handler?: () => void) => {
    if (generation !== speechGeneration) return
    notifySpeechState(false)
    handler?.()
  }

  audio.onplay = () => {
    if (generation !== speechGeneration) return
    notifySpeechState(true)
    options?.onStart?.()
  }
  audio.onended = () => finishAudio(options?.onEnd)
  audio.onerror = () => finishAudio(options?.onError)

  try {
    await audio.play()
  } catch {
    // Blocked or interrupted. If we've since been superseded that's expected;
    // otherwise let the browser engine try.
    return generation !== speechGeneration
  }
  return true
}

/* ------------------------------------------------------------------ *
 * Browser speechSynthesis fallback
 * ------------------------------------------------------------------ */

function speakViaBrowser(
  spoken: string,
  langCode: string,
  generation: number,
  options?: SpeakOptions,
): boolean {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    options?.onError?.()
    return false
  }

  const voices = window.speechSynthesis.getVoices()
  const voice =
    (options?.voiceName ? voices.find((v) => v.name === options.voiceName) ?? null : null) ??
    getBestVoice(langCode)
  if (!voice) {
    options?.onError?.()
    return false
  }

  const chunks = splitForSpeech(spoken)
  if (chunks.length === 0) {
    options?.onError?.()
    return false
  }

  let index = 0
  let started = false
  let watchdog: number | null = null

  const stopWatchdog = () => {
    if (watchdog !== null) {
      window.clearInterval(watchdog)
      watchdog = null
    }
  }

  const finish = (handler?: () => void) => {
    stopWatchdog()
    if (generation !== speechGeneration) return
    notifySpeechState(false)
    handler?.()
  }

  // Chrome intermittently drops utterance `onend`/`onerror` events (long text,
  // tab blur, the ~15s synthesis watchdog). When that happens the speak() queue
  // has drained but our onEnd never fires, so `speechActive` — and everything
  // gated on it (mic button, report buttons, quick-reply pickers) — sticks
  // "true" forever. Poll the real engine state as a backstop: once it is neither
  // speaking nor pending, treat playback as finished.
  const startWatchdog = () => {
    if (watchdog !== null) return
    watchdog = window.setInterval(() => {
      if (generation !== speechGeneration) {
        stopWatchdog()
        return
      }
      if (!started) return
      if (!window.speechSynthesis.speaking && !window.speechSynthesis.pending) {
        index = chunks.length
        finish(options?.onEnd)
      }
    }, 500)
  }

  const speakNext = () => {
    if (generation !== speechGeneration) return

    if (index >= chunks.length) {
      finish(options?.onEnd)
      return
    }

    const utterance = new SpeechSynthesisUtterance(chunks[index])
    applyClearSpeechSettings(utterance, voice, langCode)

    utterance.onstart = () => {
      if (generation !== speechGeneration) return
      if (!started) {
        started = true
        notifySpeechState(true)
        options?.onStart?.()
      }
    }
    utterance.onend = () => {
      if (generation !== speechGeneration) return
      index += 1
      speakNext()
    }
    utterance.onerror = (event: SpeechSynthesisErrorEvent) => {
      if (generation !== speechGeneration) return
      // Ignore benign interruption errors caused by cancel() during generation changes
      if (event.error === 'interrupted' || event.error === 'canceled') {
        return
      }
      index += 1
      speakNext()
    }

    window.speechSynthesis.speak(utterance)
  }

  speakNext()
  startWatchdog()
  return true
}

/**
 * Speak text in Kai's voice, falling back to the clearest device voice for the
 * language.
 *
 * Returns whether speech was started or is being started — the Fish request is
 * still in flight when this returns, so a late failure surfaces through
 * `options.onError` rather than the return value.
 */
export function speakText(text: string, langCode: string, options?: SpeakOptions): boolean {
  if (typeof window === 'undefined') return false

  // Never read markdown markers or emoji aloud — strip them before speaking.
  const spoken = stripMarkdownAndEmoji(text)
  if (!spoken || spoken.trim().length === 0) {
    options?.onError?.()
    return false
  }

  const generation = ++speechGeneration
  cancelPlayback()
  notifySpeechState(false)

  // Unlock before the await — see prepareAudioElement.
  const audio = prepareAudioElement()
  void speakViaFish(spoken, generation, audio, options).then((played) => {
    if (played || generation !== speechGeneration) return
    speakViaBrowser(spoken, langCode, generation, options)
  })
  return true
}

export function stopSpeech() {
  speechGeneration += 1
  cancelPlayback()
  notifySpeechState(false)
}

/** Call once on app load so voices are ready before first playback. */
export function preloadSpeechVoices() {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return

  const load = () => window.speechSynthesis.getVoices()
  load()
  window.speechSynthesis.onvoiceschanged = load
}
