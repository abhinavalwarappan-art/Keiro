import 'server-only'
import { transcribeSpeech as transcribeWithFish, isFishAsrConfigured, type Transcription } from './fishAudio'
import { transcribeSpeechGemini } from './gemini'
import { getLanguageByCode } from './languages'

/**
 * Picks the transcription provider for a language.
 *
 * A patient who speaks Tamil must get Tamil back — in Tamil script, in the same
 * box a Tamil speaker would type into. A romanized transcript is not a partial
 * success: it is unreadable to the patient checking their own words, and it
 * lands in the clinical report the doctor reads.
 *
 * Fish Audio is right for most of the 45 and stays the default: it is fast
 * (~1s), and English, Vietnamese, Hindi, Mandarin, Arabic, Russian, Korean and
 * Japanese all come back word-perfect in their own scripts. But on some
 * languages it does not merely mis-hear — it writes the right sounds in the
 * WRONG SCRIPT, which no amount of audio quality fixes.
 */

/**
 * Languages Fish Audio cannot reliably write in their own script, measured
 * against the live endpoint on 2026-08-16 with one spoken sentence each:
 *
 *   te  Telugu     → romanized Latin, detected as Malay
 *   bn  Bengali    → Devanagari (i.e. Hindi's script), detected as Hindi
 *   gu  Gujarati   → Perso-Arabic, detected as Farsi
 *   pa  Punjabi    → Perso-Arabic, detected as Farsi
 *   fa  Farsi      → romanized Latin, detected as Malay
 *   am  Amharic    → Arabic, detected as Arabic
 *   ml  Malayalam  → romanized Latin, detected as Finnish
 *   ta  Tamil      → INCONSISTENT: correct Tamil on one clip, romanized Latin
 *                    (and once Thai script) on four others, detected as Malay.
 *                    Unpredictable is worse than reliably broken, so it routes
 *                    here too.
 *
 * Gemini was given the IDENTICAL audio and returned all eight in the correct
 * script, several word-perfect — so the recordings were fine and the script
 * failure is Fish's. Re-verify by replaying that comparison, not by reasoning
 * from Fish's `language_code`, which is itself wrong in every case above.
 */
const GEMINI_SCRIPT_LANGS = new Set(['ta', 'te', 'gu', 'pa', 'fa', 'am', 'bn', 'ml'])

/** BCP-47 → primary subtag, the granularity provider support is decided at. */
function primarySubtag(langCode: string): string {
  return langCode.trim().split('-')[0].toLowerCase()
}

export type TranscriptionProvider = 'fish' | 'gemini'

/**
 * Which provider handles this language. Exported so the route can log it and so
 * the choice is testable without a network call.
 *
 * With no language known yet there is nothing to route on, so Fish takes it and
 * auto-detects — the same behaviour as before this split existed.
 */
export function providerFor(langCode?: string): TranscriptionProvider {
  if (!langCode) return 'fish'
  return GEMINI_SCRIPT_LANGS.has(primarySubtag(langCode)) ? 'gemini' : 'fish'
}

/** Whether the provider this language needs can actually run. */
export function isTranscriptionConfigured(langCode?: string): boolean {
  return providerFor(langCode) === 'gemini'
    ? Boolean(process.env.GEMINI_API_KEY)
    : isFishAsrConfigured()
}

/**
 * Transcribe a clip, in the patient's own script.
 *
 * Throws UpstreamError on any provider failure so the route can log the fault
 * without echoing the body — it can carry the transcript, which is patient
 * health information.
 */
export async function transcribeSpeech(audio: Blob, langCode?: string): Promise<Transcription> {
  if (providerFor(langCode) === 'fish') {
    return transcribeWithFish(audio, langCode)
  }

  // Gemini is told the language by NAME rather than code: the instruction is a
  // prompt, and "Malayalam" steers the script far more reliably than "ml".
  // langCode is guaranteed present here — providerFor only returns 'gemini' for
  // a known code — and the route has already checked it is one of the 45.
  const language = getLanguageByCode(langCode!)
  const text = await transcribeSpeechGemini(audio, language?.en ?? langCode!)

  return {
    text,
    // Gemini returns prose, not a timed transcript. The shape stays identical so
    // callers cannot tell the providers apart; nothing downstream reads these.
    segments: [],
    detectedLanguage: primarySubtag(langCode!),
  }
}
