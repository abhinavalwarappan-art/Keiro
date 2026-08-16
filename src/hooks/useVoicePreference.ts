'use client'

import { useEffect, useMemo, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { DEFAULT_VOICE_TYPE } from '@/lib/patientProfile'
import type { VoiceType } from '@/types'

/**
 * The voice Kai speaks in for the signed-in user: their Settings choice, or
 * DEFAULT_VOICE_TYPE until they make one.
 *
 * Deliberately never returns undefined. An unset voice makes speakText() fall
 * through to the device's own speechSynthesis voice, and that fallback is
 * reserved for "Fish Audio is unreachable" — using it for "nobody chose" is
 * what made Kai appear to change voice between visits at random.
 *
 * Starts on the default and upgrades once the profile row arrives, so the first
 * paint never blocks on the network.
 */
export function useVoicePreference(): VoiceType {
  const supabase = useMemo(() => createClient(), [])
  const [voice, setVoice] = useState<VoiceType>(DEFAULT_VOICE_TYPE)

  useEffect(() => {
    let cancelled = false

    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user || cancelled) return

      const { data } = await supabase
        .from('profiles')
        .select('preferred_voice')
        .eq('id', user.id)
        .single()

      // Rows written before Fish Audio hold a device voice name in this column;
      // only a real VoiceType counts, anything else keeps the default.
      const stored = data?.preferred_voice
      if (!cancelled && (stored === 'male' || stored === 'female')) {
        setVoice(stored)
      }
    }

    load()
    return () => { cancelled = true }
  }, [supabase])

  return voice
}
