import { describe, it, expect, vi, beforeEach } from 'vitest'

/**
 * The language hint is the sharp edge of the ASR integration.
 *
 * /v1/asr rejects a code it doesn't know with a 400 that fails the WHOLE
 * request — it does not fall back to auto-detect. So a naive `langCode
 * .split('-')[0]` silently breaks voice input for every Keiro language Fish
 * happens not to list, which at the time of writing is seven of the forty-five.
 * These tests pin the mapping against the set the live API actually accepts.
 */

vi.mock('server-only', () => ({}))
vi.mock('@/lib/env', () => ({
  env: { FISH_AUDIO_API_KEY: 'test-key', FISH_AUDIO_VOICE: 'test-voice' },
}))

const fetchUpstreamMock = vi.fn()
vi.mock('@/lib/upstream', async importOriginal => {
  const actual = await importOriginal<typeof import('@/lib/upstream')>()
  return { ...actual, fetchUpstream: (...args: unknown[]) => fetchUpstreamMock(...args) }
})

import { transcribeSpeech } from '@/lib/fishAudio'
import { UpstreamError } from '@/lib/upstream'
import { LANGUAGES } from '@/lib/languages'

/**
 * Codes the live endpoint refuses. Established by sending all 45 Keiro codes to
 * /v1/asr on 2026-08-16: `nb` was the only rejection, and it is a 400 that fails
 * the whole transcription. Kept as an INDEPENDENT oracle so a regression in the
 * mapping shows up here rather than as dead voice input for one language.
 */
const API_REJECTED = new Set(['nb'])

const clip = () => new Blob(['fake-audio'], { type: 'audio/webm' })

/** The `language` field actually put on the wire, or null when omitted. */
async function sentLanguage(langCode?: string): Promise<string | null> {
  fetchUpstreamMock.mockResolvedValue(
    new Response(JSON.stringify({ text: 'ok', language_code: 'en' }), {
      headers: { 'Content-Type': 'application/json' },
    }),
  )
  await transcribeSpeech(clip(), langCode)
  const init = fetchUpstreamMock.mock.calls.at(-1)![2] as RequestInit
  const value = (init.body as FormData).get('language')
  return value === null ? null : String(value)
}

beforeEach(() => {
  fetchUpstreamMock.mockReset()
})

describe('language hint', () => {
  it('sends the bare ISO 639-1 code, dropping the region', async () => {
    expect(await sentLanguage('ta-IN')).toBe('ta')
    expect(await sentLanguage('vi-VN')).toBe('vi')
    expect(await sentLanguage('en-US')).toBe('en')
  })

  it('collapses both Chinese variants onto zh', async () => {
    expect(await sentLanguage('zh-CN')).toBe('zh')
    expect(await sentLanguage('zh-TW')).toBe('zh')
  })

  it('sends Norwegian as the macrolanguage Fish expects, not the Bokmål subtag', async () => {
    // 'nb' is a 400 — this alias is the whole reason Norwegian voice input works.
    expect(await sentLanguage('nb-NO')).toBe('no')
  })

  it('still sends the hint for the smaller languages the API accepts in practice', async () => {
    // Fish's own 400 text omits these, but the endpoint takes them — dropping
    // the hint here would quietly cost accuracy on exactly the languages that
    // need it most.
    for (const code of ['te-IN', 'gu-IN', 'pa-IN', 'am-ET', 'so-SO', 'bn-BD', 'ml-IN']) {
      expect(await sentLanguage(code)).toBe(code.split('-')[0])
    }
  })

  it('omits the hint when no language is known yet', async () => {
    expect(await sentLanguage(undefined)).toBeNull()
  })

  it('sends a hint for every one of the 45 languages, and never a rejected code', async () => {
    for (const lang of LANGUAGES) {
      const sent = await sentLanguage(lang.code)
      expect(sent, `${lang.code} should send a language hint`).not.toBeNull()
      expect(
        API_REJECTED.has(sent!),
        `${lang.code} → '${sent}' is rejected by /v1/asr with a 400`,
      ).toBe(false)
    }
  })
})

describe('response handling', () => {
  it('returns the transcript and the language Fish actually detected', async () => {
    fetchUpstreamMock.mockResolvedValue(
      new Response(JSON.stringify({ text: ' my chest hurts ', duration: 2.5, language_code: 'en' })),
    )
    const result = await transcribeSpeech(clip(), 'en-US')
    expect(result.text).toBe(' my chest hurts ')
    expect(result.duration).toBe(2.5)
    expect(result.detectedLanguage).toBe('en')
    expect(result.segments).toEqual([])
  })

  it('treats a 200 with the wrong shape as a provider fault, not an empty transcript', async () => {
    fetchUpstreamMock.mockResolvedValue(new Response(JSON.stringify({ unexpected: true })))
    await expect(transcribeSpeech(clip(), 'en-US')).rejects.toBeInstanceOf(UpstreamError)
  })

  it('does not set Content-Type — fetch must own the multipart boundary', async () => {
    fetchUpstreamMock.mockResolvedValue(new Response(JSON.stringify({ text: 'x' })))
    await transcribeSpeech(clip(), 'en-US')
    const init = fetchUpstreamMock.mock.calls.at(-1)![2] as RequestInit
    const headers = init.headers as Record<string, string>
    expect(Object.keys(headers).map(k => k.toLowerCase())).not.toContain('content-type')
    expect(headers.Authorization).toBe('Bearer test-key')
  })
})
