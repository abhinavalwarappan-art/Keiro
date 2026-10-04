'use client'

import { useSpeech } from './useSpeech'

/** Whether Kai's voice is audibly playing right now. */
export function useSpeechActive(): boolean {
  return useSpeech().phase === 'playing'
}
