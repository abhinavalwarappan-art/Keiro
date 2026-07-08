// API key loaded from environment — never hardcode
//
// DeepSeek chat completions via the OpenAI-compatible endpoint.
// `deepseek-chat` is the non-thinking alias of deepseek-v4-flash (their cheapest
// tier). The alias retires 2026-07-24 15:59 UTC — after that, switch MODEL to
// 'deepseek-v4-flash' directly (same pricing, same non-thinking behaviour when
// `thinking: { type: 'disabled' }` is sent).

const DEEPSEEK_BASE_URL = 'https://api.deepseek.com'
const DEEPSEEK_MODEL = 'deepseek-chat'

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
  return fetch(`${DEEPSEEK_BASE_URL}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${getApiKey()}`,
    },
    body: JSON.stringify(buildBody(params, stream)),
  })
}

/**
 * Single-turn / non-streaming completion. Returns the assistant's text.
 * OpenAI response shape: `choices[0].message.content`.
 */
export async function deepseekChat(params: DeepseekParams): Promise<string> {
  const response = await postChatCompletions(params, false)

  if (!response.ok) {
    const errorBody = await response.text().catch(() => 'unknown error')
    throw new Error(`DeepSeek request failed: ${response.status} ${response.statusText} — ${errorBody}`)
  }

  const data = await response.json()
  const text = data?.choices?.[0]?.message?.content
  if (typeof text !== 'string') {
    throw new Error('Unexpected response format from DeepSeek API')
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

  if (!response.ok || !response.body) {
    const errorBody = await response.text().catch(() => 'unknown error')
    throw new Error(`DeepSeek stream failed: ${response.status} ${response.statusText} — ${errorBody}`)
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
