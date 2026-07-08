/** Shared browser TTS helpers — tuned for clearer, less muffled playback. */

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

/** Speak text with the clearest available voice for the language. */
export function speakText(text: string, langCode: string, options?: SpeakOptions): boolean {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return false

  // Never read markdown markers or emoji aloud — strip them before speaking.
  const spoken = stripMarkdownAndEmoji(text)
  if (!spoken || spoken.trim().length === 0) {
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

  const generation = ++speechGeneration
  window.speechSynthesis.cancel()
  notifySpeechState(false)

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

export function stopSpeech() {
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    speechGeneration += 1
    window.speechSynthesis.cancel()
  }
  notifySpeechState(false)
}

/** Call once on app load so voices are ready before first playback. */
export function preloadSpeechVoices() {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return

  const load = () => window.speechSynthesis.getVoices()
  load()
  window.speechSynthesis.onvoiceschanged = load
}