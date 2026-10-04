'use client'

import { useSyncExternalStore } from 'react'
import {
  getServerSpeechSnapshot,
  getSpeechSnapshot,
  subscribeSpeech,
  type SpeechSnapshot,
} from '@/lib/speech'

/** The page-wide playback state: which control owns Kai's voice, and what it is doing. */
export function useSpeech(): SpeechSnapshot {
  return useSyncExternalStore(subscribeSpeech, getSpeechSnapshot, getServerSpeechSnapshot)
}
