import 'server-only'
import { env } from './env'

/**
 * Which Fish Audio voice Kai speaks with, per language — the ONE place to
 * change it.
 *
 * Today every language uses the single default voice (`FISH_AUDIO_VOICE`): the
 * backbone model is multilingual, so one voice already speaks all 45 languages.
 * To give a language its own voice or accent later, add its Fish model id here:
 *
 *   'es-ES': '<fish model id for the Spanish voice>',
 *   ta: '<fish model id for the Tamil voice>',      // primary subtag = every Tamil locale
 *
 * Keys are a full Keiro language code (`es-ES`) or a primary subtag (`es`); the
 * full code wins. Anything unmapped falls back to the default voice. Do not add
 * an entry until the voice actually exists in Fish — an unknown id fails every
 * request for that language, and the patient hears the device voice instead.
 */
const VOICE_BY_LANGUAGE: Readonly<Record<string, string>> = {}

/** The Fish voice for `langCode`, or undefined when no voice is configured at all. */
export function resolveKaiVoice(langCode?: string): string | undefined {
  if (langCode) {
    const exact = VOICE_BY_LANGUAGE[langCode]
    if (exact) return exact
    const primary = VOICE_BY_LANGUAGE[langCode.split('-')[0].toLowerCase()]
    if (primary) return primary
  }
  return env.FISH_AUDIO_VOICE?.trim() || undefined
}
