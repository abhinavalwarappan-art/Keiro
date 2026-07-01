'use client'

import { useEffect, useState } from 'react'
import { subscribeSpeechState } from '@/lib/speech'

/** Tracks whether app TTS is currently playing (Kai speaking). */
export function useSpeechActive(): boolean {
  const [active, setActive] = useState(false)

  useEffect(() => {
    const unsubscribe = subscribeSpeechState(setActive)
    return () => {
      if (typeof unsubscribe === 'function') {
        unsubscribe()
      }
    }
  }, [])

  return active
}