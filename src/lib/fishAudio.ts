import 'server-only'
import { env } from './env'
import { fetchUpstream, UpstreamError } from './upstream'

/**
 * Kai's spoken voice, via Fish Audio TTS.
 *
 * One custom voice model does all 45 languages — the backbone model is
 * multilingual, so the patient's language needs no voice mapping, only the text
 * itself. Kai sounds the same to every patient in every language; nobody picks
 * a voice, here or in Settings.
 *
 * The API key never reaches the browser: the client posts text to /api/tts and
 * gets audio bytes back.
 */

const FISH_TTS_URL = 'https://api.fish.audio/v1/tts'

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

function voiceId(voice: VoiceType): string | undefined {
  const id = voice === 'male' ? env.FISH_AUDIO_VOICE_MALE : env.FISH_AUDIO_VOICE_FEMALE
  return id?.trim() || undefined
}

/**
 * Whether this voice can actually be synthesized. False when the key or that
 * voice's model id is unset — the route then tells the client to fall back to
 * browser speech instead of failing the request.
 */
export function isFishConfigured(voice: VoiceType): boolean {
  return Boolean(env.FISH_AUDIO_API_KEY?.trim() && voiceId(voice))
}

/**
 * Synthesize `text` in the patient's chosen voice, returning MP3 bytes.
 *
 * Throws UpstreamError on any Fish-side failure so the route can log the
 * provider fault without ever echoing the request body — the text is patient
 * health information.
 */
export async function synthesizeSpeech(text: string, voice: VoiceType): Promise<ArrayBuffer> {
  const apiKey = env.FISH_AUDIO_API_KEY?.trim()
  const reference = voiceId(voice)

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
