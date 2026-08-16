// API key loaded from environment — never hardcode
//
// Gemini content generation via the Google Generative Language REST API.
//
// MODEL: pinned to an exact version on purpose. `gemini-flash-lite-latest` would
// also work, but it is a moving alias — Google repoints it at new releases without
// notice, which would let Kai's clinical phrasing and language adherence change
// under a medical intake flow with no code change on our side. Pin, don't drift.
//
// Note `gemini-2.5-flash-lite` is NOT usable: it 404s with "no longer available to
// new users" on keys created after Google retired the 2.5 family. It still appears
// in the ListModels catalog, which makes it look available — it isn't.
//
// Thinking is OFF by default on the flash-lite tier (verified: thoughtsTokenCount
// is 0 without a thinkingConfig), which is what we want — on the thinking models,
// reasoning tokens bill as output AND consume maxOutputTokens, starving the reply.
// We deliberately send no thinkingConfig: the 2.5 series took `thinkingBudget` and
// the 3.x series takes `thinkingLevel`, so hardcoding either would 400 on a version
// bump. If this constant is ever moved to a new major, re-check that default.

import { fetchUpstream, UpstreamError } from '@/lib/upstream'

const GEMINI_BASE_URL = 'https://generativelanguage.googleapis.com/v1beta'
const GEMINI_MODEL = 'gemini-3.1-flash-lite'

// Non-streaming calls (report generation, consult translation) block the whole
// response, so they get the tighter budget. Streaming has to cover the full
// generation — the timeout bounds the body, not just the headers — so it gets a
// longer one that still fires before the route's maxDuration cap.
const GEMINI_TIMEOUT_MS = 45_000
const GEMINI_STREAM_TIMEOUT_MS = 55_000

export type GeminiRole = 'user' | 'assistant'

export interface GeminiTurn {
  role: GeminiRole
  content: string
}

interface GeminiParams {
  /** Steering prompt. Sent as `systemInstruction` (Gemini has a dedicated field,
   *  unlike the OpenAI format's leading system message). */
  system: string
  /** Conversation turns — user/assistant only, no system turns. */
  messages: GeminiTurn[]
  maxTokens: number
  temperature?: number
}

function getApiKey(): string {
  const key = process.env.GEMINI_API_KEY
  if (!key) {
    throw new Error('GEMINI_API_KEY environment variable is not set')
  }
  return key
}

function buildBody(params: GeminiParams) {
  return {
    systemInstruction: { parts: [{ text: params.system }] },
    // Gemini names the assistant role 'model'. It accepts a history that opens on
    // a model turn, which ours always does after the greeting — so the turns map
    // across 1:1 with no reordering or dropping.
    contents: params.messages.map(m => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }],
    })),
    generationConfig: {
      maxOutputTokens: params.maxTokens,
      ...(params.temperature !== undefined ? { temperature: params.temperature } : {}),
    },
  }
}

async function postGenerateContent(params: GeminiParams, stream: boolean): Promise<Response> {
  const endpoint = stream ? 'streamGenerateContent?alt=sse' : 'generateContent'
  return fetchUpstream(
    'gemini',
    `${GEMINI_BASE_URL}/models/${GEMINI_MODEL}:${endpoint}`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // Header rather than ?key= so the secret never lands in a URL, where it
        // would be echoed into request logs and error traces.
        'x-goog-api-key': getApiKey(),
      },
      body: JSON.stringify(buildBody(params)),
    },
    stream ? GEMINI_STREAM_TIMEOUT_MS : GEMINI_TIMEOUT_MS
  )
}

/**
 * Pull the text out of one GenerateContentResponse (streamed frame or whole body).
 * Gemini splits a reply across `parts`, so they have to be concatenated — reading
 * only parts[0] silently truncates.
 *
 * Returns '' when a candidate carries no text, which is normal for the final frame
 * of a stream (it holds only usageMetadata) and is how a safety block presents
 * (finishReason SAFETY, no parts). Callers decide whether empty is a failure.
 */
function extractText(payload: unknown): string {
  const parts = (payload as {
    candidates?: Array<{ content?: { parts?: Array<{ text?: unknown }> } }>
  })?.candidates?.[0]?.content?.parts

  if (!Array.isArray(parts)) return ''
  return parts
    .map(p => (typeof p?.text === 'string' ? p.text : ''))
    .join('')
}

/**
 * Single-turn / non-streaming completion. Returns the model's text.
 */
export async function geminiChat(params: GeminiParams): Promise<string> {
  const response = await postGenerateContent(params, false)

  const data = await response.json()
  const text = extractText(data)
  if (!text) {
    // No text means a refusal, a safety block, or a shape we don't understand —
    // all of which are upstream faults, not our bug. Surface the reason for the
    // server-side log; the route never forwards this message to the patient.
    const reason =
      (data as { candidates?: Array<{ finishReason?: string }> })?.candidates?.[0]?.finishReason ??
      (data as { promptFeedback?: { blockReason?: string } })?.promptFeedback?.blockReason ??
      'no candidates'
    throw new UpstreamError('gemini', 'bad_response', `Gemini returned no text (${reason})`)
  }
  return text
}

/**
 * Streaming completion. Yields text deltas as they arrive.
 * With `?alt=sse` Gemini streams `data: {json}\n\n` frames, each carrying a partial
 * GenerateContentResponse. Unlike OpenAI-compatible APIs there is no `[DONE]`
 * sentinel — the stream simply ends, so EOF on the reader is the terminator.
 */
export async function* geminiChatStream(params: GeminiParams): AsyncGenerator<string> {
  const response = await postGenerateContent(params, true)

  if (!response.body) {
    throw new UpstreamError('gemini', 'bad_response', 'Gemini stream returned no body')
  }

  const reader = response.body.getReader()
  const decoder = new TextDecoder()
  let buffer = ''

  while (true) {
    const { done, value } = await reader.read()
    if (done) break

    buffer += decoder.decode(value, { stream: true })
    // Process complete lines; keep any trailing partial line in the buffer.
    const lines = buffer.split('\n')
    buffer = lines.pop() ?? ''

    for (const line of lines) {
      const trimmed = line.trim()
      if (!trimmed.startsWith('data:')) continue

      const payload = trimmed.slice(5).trim()
      if (!payload) continue

      try {
        const delta = extractText(JSON.parse(payload))
        if (delta.length > 0) {
          yield delta
        }
      } catch {
        // Non-JSON keep-alive or partial frame — skip it.
      }
    }
  }
}

/* ── Speech-to-text ─────────────────────────────────────────────────────────
 * Gemini transcribes the languages Fish Audio cannot write in their own script
 * (see `GEMINI_SCRIPT_LANGS` in lib/transcription.ts for which, and why).
 *
 * This is a second ASR provider, not a replacement: Fish is faster and correct
 * for most of the 45, and only the scripts it mangles come here.
 */

/** Audio upload plus a full generation — slower than a plain text turn. */
const GEMINI_ASR_TIMEOUT_MS = 55_000

/**
 * Transcribe `audio` verbatim in `languageName`'s own script.
 *
 * The instruction is emphatic about script because that is the entire reason
 * this path exists — a romanized or translated transcript is a failure here,
 * even though it would look like a plausible answer.
 */
export async function transcribeSpeechGemini(
  audio: Blob,
  languageName: string,
): Promise<string> {
  const bytes = Buffer.from(await audio.arrayBuffer()).toString('base64')
  const mimeType = audio.type.split(';')[0].trim() || 'audio/wav'

  const response = await fetchUpstream(
    'gemini',
    `${GEMINI_BASE_URL}/models/${GEMINI_MODEL}:generateContent`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': getApiKey(),
      },
      body: JSON.stringify({
        contents: [{
          parts: [
            {
              text:
                `Transcribe this ${languageName} audio VERBATIM, in the ${languageName} ` +
                `language's own native script.\n` +
                `Output ONLY the transcription — no preamble, no quotes, no notes.\n` +
                `Never romanize. Never translate. Never transliterate into another script.\n` +
                `If the audio contains no speech, output nothing at all.`,
            },
            { inline_data: { mime_type: mimeType, data: bytes } },
          ],
        }],
        // Deterministic: this is a transcription, not a creative turn.
        generationConfig: { temperature: 0 },
      }),
    },
    GEMINI_ASR_TIMEOUT_MS,
  )

  const payload = await response.json().catch(() => null)
  if (payload === null) {
    throw new UpstreamError('gemini', 'bad_response', 'Gemini returned a non-JSON ASR response')
  }
  // Empty is legitimate here — it is how "no speech" and a safety block both
  // present — so the caller treats it as an empty transcript, not an error.
  return extractText(payload).trim()
}
