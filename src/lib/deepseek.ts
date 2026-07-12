// API key loaded from environment — never hardcode
//
// DeepSeek chat completions via the OpenAI-compatible endpoint.
// `deepseek-chat` is the non-thinking alias of deepseek-v4-flash (their cheapest
// tier). The alias retires 2026-07-24 15:59 UTC — after that, switch MODEL to
// 'deepseek-v4-flash' directly (same pricing, same non-thinking behaviour when
// `thinking: { type: 'disabled' }` is sent).

import { fetchUpstream, UpstreamError } from '@/lib/upstream'

const DEEPSEEK_BASE_URL = 'https://api.deepseek.com'
const DEEPSEEK_MODEL = 'deepseek-chat'

// Non-streaming calls (report generation, consult translation) block the whole
// response, so they get the tighter budget. Streaming has to cover the full
// generation — the timeout bounds the body, not just the headers — so it gets a
// longer one that still fires before the route's maxDuration cap.
const DEEPSEEK_TIMEOUT_MS = 45_000
const DEEPSEEK_STREAM_TIMEOUT_MS = 55_000

export type DeepseekRole = 'user' | 'assistant'

export interface DeepseekTurn {
  role: DeepseekRole
  content: string
}

interface DeepseekParams {
  /** Steering prompt. Sent as the first `system` message (OpenAI format has no
   *  separate system field like Anthropic does). */
  system: string
  /** Conversation turns — user/assistant only, no system turns. */
  messages: DeepseekTurn[]
  maxTokens: number
  temperature?: number
}

function getApiKey(): string {
  const key = process.env.DEEPSEEK_API_KEY
  if (!key) {
    throw new Error('DEEPSEEK_API_KEY environment variable is not set')
  }
  return key
}

function buildBody(params: DeepseekParams, stream: boolean) {
  return {
    model: DEEPSEEK_MODEL,
    messages: [
      { role: 'system' as const, content: params.system },
      ...params.messages,
    ],
    max_tokens: params.maxTokens,
    ...(params.temperature !== undefined ? { temperature: params.temperature } : {}),
    // Non-thinking mode — thinking tokens bill as output and we don't need them.
    thinking: { type: 'disabled' as const },
    stream,
  }
}

async function postChatCompletions(params: DeepseekParams, stream: boolean): Promise<Response> {
  return fetchUpstream(
    'deepseek',
    `${DEEPSEEK_BASE_URL}/chat/completions`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getApiKey()}`,
      },
      body: JSON.stringify(buildBody(params, stream)),
    },
    stream ? DEEPSEEK_STREAM_TIMEOUT_MS : DEEPSEEK_TIMEOUT_MS
  )
}

/**
 * Single-turn / non-streaming completion. Returns the assistant's text.
 * OpenAI response shape: `choices[0].message.content`.
 */
export async function deepseekChat(params: DeepseekParams): Promise<string> {
  const response = await postChatCompletions(params, false)

  const data = await response.json()
  const text = data?.choices?.[0]?.message?.content
  if (typeof text !== 'string') {
    throw new UpstreamError('deepseek', 'bad_response', 'DeepSeek returned an unexpected response shape')
  }
  return text
}

/**
 * Streaming completion. Yields text deltas as they arrive.
 * DeepSeek's OpenAI-compatible stream is SSE: `data: {json}\n\n` frames where
 * each frame carries `choices[0].delta.content`, terminated by `data: [DONE]`.
 */
export async function* deepseekChatStream(params: DeepseekParams): AsyncGenerator<string> {
  const response = await postChatCompletions(params, true)

  if (!response.body) {
    throw new UpstreamError('deepseek', 'bad_response', 'DeepSeek stream returned no body')
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
      if (payload === '[DONE]') return

      try {
        const json = JSON.parse(payload)
        const delta = json?.choices?.[0]?.delta?.content
        if (typeof delta === 'string' && delta.length > 0) {
          yield delta
        }
      } catch {
        // Non-JSON keep-alive or partial frame — skip it.
      }
    }
  }
}
