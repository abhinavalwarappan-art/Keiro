/**
 * Shared plumbing for outbound third-party calls (DeepSeek, Groq, DeepL, Google).
 *
 * Two things every provider call needs and none of them had:
 *
 *  1. An explicit timeout. Without one a hung upstream connection holds the
 *     serverless function open until Vercel's platform cap kills it — the patient
 *     sees an opaque 504 and nothing lands in the logs. With one we fail fast,
 *     log which provider stalled, and return a status code that says what broke.
 *
 *  2. A failure type that survives the throw. Routes previously collapsed every
 *     upstream fault into a generic 500, so "DeepSeek is rate-limiting us" and
 *     "our code has a bug" were indistinguishable in production.
 *
 * Upstream response bodies are attached for server-side logging only. Routes must
 * never forward `message` to the client — it can echo request content back.
 */

export type UpstreamKind = 'timeout' | 'rate_limited' | 'unavailable' | 'bad_response'

export class UpstreamError extends Error {
  readonly provider: string
  readonly kind: UpstreamKind
  readonly status?: number

  constructor(provider: string, kind: UpstreamKind, message: string, status?: number) {
    super(message)
    this.name = 'UpstreamError'
    this.provider = provider
    this.kind = kind
    this.status = status
  }

  /** The status *we* return to *our* client for this upstream failure. */
  get clientStatus(): number {
    if (this.kind === 'timeout') return 504
    if (this.kind === 'rate_limited') return 429
    return 502
  }
}

/**
 * fetch() with a hard timeout, normalising every failure mode into UpstreamError.
 *
 * Note the timeout bounds the *entire* request including the response body, not
 * just time-to-headers. For streaming callers that means the budget must cover
 * the full generation — see DEEPSEEK_STREAM_TIMEOUT_MS.
 */
export async function fetchUpstream(
  provider: string,
  url: string,
  init: RequestInit,
  timeoutMs: number
): Promise<Response> {
  let response: Response

  try {
    response = await fetch(url, { ...init, signal: AbortSignal.timeout(timeoutMs) })
  } catch (err) {
    const name = err instanceof Error ? err.name : ''
    if (name === 'TimeoutError' || name === 'AbortError') {
      throw new UpstreamError(provider, 'timeout', `${provider} timed out after ${timeoutMs}ms`)
    }
    throw new UpstreamError(provider, 'unavailable', `${provider} unreachable: ${name || 'network error'}`)
  }

  if (!response.ok) {
    const detail = await response.text().catch(() => '')
    const kind: UpstreamKind = response.status === 429 ? 'rate_limited' : 'unavailable'
    throw new UpstreamError(
      provider,
      kind,
      `${provider} responded ${response.status} ${response.statusText}: ${detail.slice(0, 300)}`,
      response.status
    )
  }

  return response
}
