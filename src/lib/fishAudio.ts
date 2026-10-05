import 'server-only'
import { env } from './env'
import { fetchUpstream, UpstreamError } from './upstream'

/**
 * Both directions of Keiro's voice pipeline, on one Fish Audio account.
 *
 *  • TTS  (/v1/tts) — Kai's spoken voice. One custom voice model does all 45
 *    languages, each with its own Fish voice chosen by the patient's language
 *    (mapped in ONE place — `kaiVoices.ts`; English is `FISH_AUDIO_VOICE`).
 *    Nobody picks a voice, here or in Settings.
 *  • ASR  (/v1/asr) — the patient's speech, transcribed. Everything the mic
 *    captures lands here.
 *
 * They share one key, so they share one module — there is exactly one place
 * where FISH_AUDIO_API_KEY is read. Note the two features have different
 * configuration needs: TTS also requires a voice id, ASR requires only the key.
 *
 * The API key never reaches the browser: the client posts text to /api/tts and
 * audio to /api/transcribe, and gets bytes / a transcript back.
 */

const FISH_TTS_URL = 'https://api.fish.audio/v1/tts'
const FISH_ASR_URL = 'https://api.fish.audio/v1/asr'

/**
 * Backbone model. Fish's own default is now `s2.1-pro`; `s1` is pinned here as
 * the deliberate quality/cost pick. Changing voices means changing the env IDs —
 * changing the engine means changing this line.
 */
const FISH_MODEL = 's1'

/** Generation of a few sentences is fast, but a cold upstream is not. */
const FISH_TIMEOUT_MS = 30_000

/**
 * Kai's replies run a few sentences. This cap is well clear of that and exists
 * so a runaway model reply — or a crafted request — can't bill an unbounded
 * synthesis. Fish charges per character.
 */
export const MAX_TTS_CHARS = 2000

/**
 * Whether Kai's voice can actually be synthesized with `voiceId`. False when the
 * key or the resolved voice is missing — the route then tells the client to fall
 * back to browser speech instead of failing the request.
 */
export function isFishConfigured(voiceId: string | undefined): boolean {
  return Boolean(env.FISH_AUDIO_API_KEY?.trim() && voiceId)
}

/**
 * Synthesize `text` with the Fish voice `voiceId`, returning MP3 bytes. The id
 * must come from `resolveFishVoiceId` on the server — never from a request.
 *
 * Throws UpstreamError on any Fish-side failure so the route can log the
 * provider fault without ever echoing the request body — the text is patient
 * health information.
 */
export async function synthesizeSpeech(text: string, voiceId: string): Promise<ArrayBuffer> {
  const apiKey = env.FISH_AUDIO_API_KEY?.trim()
  const reference = voiceId.trim()

  if (!apiKey || !reference) {
    throw new UpstreamError('fish', 'unavailable', 'Fish Audio is not configured')
  }

  const response = await fetchUpstream(
    'fish',
    FISH_TTS_URL,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        // The backbone model travels as a header, not a body field.
        model: FISH_MODEL,
      },
      body: JSON.stringify({
        text,
        reference_id: reference,
        format: 'mp3',
        mp3_bitrate: 128,
        // Patients are often on clinic wifi and half of them are hard of hearing;
        // normalized text and default latency beat shaving a few hundred ms.
        normalize: true,
        latency: 'normal',
      }),
    },
    FISH_TIMEOUT_MS,
  )

  const audio = await response.arrayBuffer()
  if (audio.byteLength === 0) {
    throw new UpstreamError('fish', 'bad_response', 'Fish Audio returned empty audio')
  }
  return audio
}

/* ── Speech-to-text ─────────────────────────────────────────────────────────
 * A clip is uploaded whole rather than streamed, so the budget covers a slow
 * mobile upload plus the transcription itself, not just the model.
 */
const FISH_ASR_TIMEOUT_MS = 30_000

export interface TranscriptSegment {
  text: string
  /** Seconds from the start of the clip. */
  start: number
  end: number
}

export interface Transcription {
  text: string
  /** Clip length in seconds, as measured by Fish. */
  duration?: number
  /** Empty unless timestamps were requested — see `ignore_timestamps` below. */
  segments: TranscriptSegment[]
  /** What Fish actually heard, ISO 639-1. Differs from the hint when a patient
   *  answers in another language, so it is worth logging. */
  detectedLanguage?: string
}

/**
 * Whether speech can be transcribed. Unlike `isFishConfigured`, this does NOT
 * need a voice id — ASR uses the key alone, so transcription keeps working on a
 * deploy that has no voice configured.
 */
export function isFishAsrConfigured(): boolean {
  return Boolean(env.FISH_AUDIO_API_KEY?.trim())
}

/**
 * Keiro codes whose primary subtag is not what Fish calls the language.
 *
 * Only Norwegian differs, and it matters: Keiro pins Bokmål (`nb-NO`) but Fish
 * takes only the macrolanguage, and answers `nb` with a 400 that fails the
 * ENTIRE transcription rather than falling back to auto-detect. Without this
 * alias, Norwegian voice input does not work at all.
 *
 * All 45 Keiro codes were sent to the live endpoint on 2026-08-16: the other 44
 * primary subtags are accepted as-is. Note that the enumerated list in Fish's
 * own 400 message is NOT a reliable allowlist — it omits several codes (bn, te,
 * gu, pa, am, so, ml) that the endpoint accepts in practice, so trusting it
 * would silently drop useful hints. Re-verify by replaying that sweep, not by
 * reading the error text.
 */
const FISH_LANGUAGE_ALIASES: Record<string, string> = { nb: 'no' }

/**
 * Fish speaks ISO 639-1, so the region is dropped: `ta-IN` → `ta`,
 * `zh-TW` → `zh`, `nb-NO` → `no`.
 */
function toFishLanguage(langCode: string): string | undefined {
  const primary = langCode.trim().split('-')[0].toLowerCase()
  if (!primary) return undefined
  return FISH_LANGUAGE_ALIASES[primary] ?? primary
}

/**
 * A readable filename for the upload. Fish decides the format by SNIFFING the
 * bytes, not by reading this — a WebM clip named `.ogg` is still rejected as
 * undecodable — so this exists purely to keep uploads legible when debugging a
 * failure. Unknown types get no extension rather than a wrong one.
 */
function asrFilename(mimeType: string): string {
  const base = mimeType.split(';')[0].trim()
  if (base === 'audio/mp4') return 'audio.mp4'
  if (base === 'audio/ogg') return 'audio.ogg'
  if (base === 'audio/mpeg') return 'audio.mp3'
  if (base === 'audio/wav' || base === 'audio/x-wav') return 'audio.wav'
  if (base === 'audio/webm') return 'audio.webm'
  return 'audio'
}

/**
 * Transcribe a recorded clip.
 *
 * `langCode` is the patient's chosen language, and is a HINT — Fish auto-detects
 * regardless. Pass it whenever it is known: pinning the language measurably
 * helps on short or noisy clips, which is most of what patients actually record.
 * Omit it before a language has been picked and let Fish decide.
 *
 * Throws UpstreamError on any Fish-side failure so the route can log the
 * provider fault without echoing the response body — it can carry the
 * transcript, which is patient health information.
 */
export async function transcribeSpeech(audio: Blob, langCode?: string): Promise<Transcription> {
  const apiKey = env.FISH_AUDIO_API_KEY?.trim()
  if (!apiKey) {
    throw new UpstreamError('fish', 'unavailable', 'Fish Audio is not configured')
  }

  // /v1/asr takes multipart or msgpack — JSON is rejected outright.
  const form = new FormData()
  form.append('audio', audio, asrFilename(audio.type))
  const language = langCode ? toFishLanguage(langCode) : undefined
  if (language) form.append('language', language)
  // Per-segment timestamps cost latency and nothing downstream reads them; the
  // chat only ever needs the text. Flip to 'false' if that changes.
  form.append('ignore_timestamps', 'true')

  const response = await fetchUpstream(
    'fish',
    FISH_ASR_URL,
    {
      method: 'POST',
      // Content-Type is deliberately absent: fetch has to set it itself so the
      // multipart boundary matches the body it generates.
      headers: { Authorization: `Bearer ${apiKey}` },
      body: form,
    },
    FISH_ASR_TIMEOUT_MS,
  )

  const data = (await response.json().catch(() => null)) as {
    text?: unknown
    duration?: unknown
    segments?: unknown
    language_code?: unknown
  } | null

  // A 200 carrying the wrong shape is a provider fault, not an empty result —
  // treat it as one rather than silently handing the patient a blank message.
  if (typeof data?.text !== 'string') {
    throw new UpstreamError('fish', 'bad_response', 'Fish Audio returned an unexpected ASR response shape')
  }

  return {
    text: data.text,
    duration: typeof data.duration === 'number' ? data.duration : undefined,
    segments: Array.isArray(data.segments) ? (data.segments as TranscriptSegment[]) : [],
    detectedLanguage: typeof data.language_code === 'string' ? data.language_code : undefined,
  }
}
