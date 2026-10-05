import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextRequest } from 'next/server'

/**
 * The whole server path, not just the map: request → locale validation →
 * resolver → the Fish request body. Asserts on what is actually put on the
 * wire to Fish, for every supported locale.
 */

vi.mock('server-only', () => ({}))
vi.mock('@/lib/env', () => ({ env: { FISH_AUDIO_API_KEY: 'test-key', FISH_AUDIO_VOICE: 'existing-english-voice' } }))
vi.mock('@/lib/logger', () => ({ logger: { warn: vi.fn(), info: vi.fn(), error: vi.fn() } }))
vi.mock('@/lib/supabase/server', () => ({
  createClient: async () => ({ auth: { getUser: async () => ({ data: { user: null } }) } }),
}))
vi.mock('@/lib/rateLimit', () => ({
  checkRateLimit: async () => ({ allowed: true }),
  checkIpRateLimit: async () => ({ allowed: true }),
}))
vi.mock('@/lib/clientIp', () => ({ getClientIp: () => '127.0.0.1', hashIp: async () => 'hash' }))

const fetchUpstream = vi.fn()
vi.mock('@/lib/upstream', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/lib/upstream')>()
  return { ...actual, fetchUpstream: (...args: unknown[]) => fetchUpstream(...args) }
})

import { POST } from '@/app/api/tts/route'
import { FISH_VOICE_BY_LOCALE } from '@/lib/kaiVoices'
import { SUPPORTED_LOCALES } from '@/lib/languages'

function ttsRequest(body: unknown) {
  return new NextRequest('http://localhost/api/tts', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: typeof body === 'string' ? body : JSON.stringify(body),
  })
}

/** The reference_id and auth header of the last request sent to Fish. */
function lastFishCall() {
  const [, url, init] = fetchUpstream.mock.calls.at(-1)! as [string, string, RequestInit]
  return { url, referenceId: JSON.parse(init.body as string).reference_id as string, headers: init.headers as Record<string, string> }
}

describe('POST /api/tts voice routing', () => {
  beforeEach(() => {
    fetchUpstream.mockReset()
    fetchUpstream.mockImplementation(async () => new Response(new Uint8Array([1, 2, 3]), { status: 200 }))
  })

  it.each([...SUPPORTED_LOCALES])('%s → Fish receives that locale’s voice', async (locale) => {
    const res = await POST(ttsRequest({ text: 'Hello', langCode: locale }))
    expect(res.status).toBe(200)
    expect(res.headers.get('X-Keiro-Voice-Locale')).toBe(locale)
    const expected = locale === 'en-US' ? 'existing-english-voice' : FISH_VOICE_BY_LOCALE[locale]
    expect(lastFishCall().referenceId).toBe(expected)
  })

  it('keeps the Fish key server-side: it is sent to Fish, never returned', async () => {
    const res = await POST(ttsRequest({ text: 'Hello', langCode: 'ta-IN' }))
    const call = lastFishCall()
    expect(call.url).toBe('https://api.fish.audio/v1/tts')
    expect(call.headers.Authorization).toBe('Bearer test-key')
    expect([...res.headers.values()].join(' ')).not.toContain('test-key')
  })

  it.each(['voiceId', 'voice_id', 'reference_id', 'referenceId', 'voice', 'model'])(
    'rejects a client-supplied %s instead of using it',
    async (field) => {
      const res = await POST(ttsRequest({ text: 'Hello', langCode: 'ta-IN', [field]: 'attacker-chosen-voice' }))
      expect(res.status).toBe(400)
      expect(fetchUpstream).not.toHaveBeenCalled()
    },
  )

  it('falls back to the English voice only for an unknown locale, and says so', async () => {
    const res = await POST(ttsRequest({ text: 'Hello', langCode: 'xx-YY' }))
    expect(res.status).toBe(200)
    expect(res.headers.get('X-Keiro-Voice-Locale')).toBe('fallback')
    expect(lastFishCall().referenceId).toBe('existing-english-voice')
  })

  it('normalizes an alias before routing (no → Norwegian voice)', async () => {
    const res = await POST(ttsRequest({ text: 'Hei', langCode: 'no' }))
    expect(res.headers.get('X-Keiro-Voice-Locale')).toBe('nb-NO')
    expect(lastFishCall().referenceId).toBe(FISH_VOICE_BY_LOCALE['nb-NO'])
  })

  it.each([
    ['empty text', { text: '   ', langCode: 'ta-IN' }],
    ['non-object body', '"just a string"'],
    ['array body', '[1,2]'],
    ['malformed JSON', '{not json'],
  ])('rejects %s with 400', async (_label, body) => {
    const res = await POST(ttsRequest(body))
    expect(res.status).toBe(400)
    expect(fetchUpstream).not.toHaveBeenCalled()
  })
})
