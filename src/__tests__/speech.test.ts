import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

/**
 * The Listen button's state machine. Each case is a real "I pressed Listen and
 * nothing happened" failure the rewrite exists to prevent.
 */

type PlayOutcome = 'resolve' | 'block' | 'pending'

class FakeAudio {
  static instances: FakeAudio[] = []
  static nextPlay: PlayOutcome = 'resolve'
  src = ''
  preload = ''
  paused = true
  ended = false
  onplaying: (() => void) | null = null
  onended: (() => void) | null = null
  onerror: (() => void) | null = null
  onpause: (() => void) | null = null

  constructor() {
    FakeAudio.instances.push(this)
  }

  play(): Promise<void> {
    // The silent unlock clip always "plays"; only real clips follow nextPlay.
    if (this.src === 'blob:silent') return Promise.resolve()
    const outcome = FakeAudio.nextPlay
    if (outcome === 'block') return Promise.reject(new DOMException('blocked', 'NotAllowedError'))
    if (outcome === 'pending') return new Promise(() => {})
    this.paused = false
    queueMicrotask(() => this.onplaying?.())
    return Promise.resolve()
  }

  pause() {
    this.paused = true
    this.onpause?.()
  }
}

function deferredResponse() {
  let resolve!: (r: Response) => void
  const promise = new Promise<Response>((r) => {
    resolve = r
  })
  return { promise, resolve }
}

const audioResponse = () =>
  new Response(new Blob([new Uint8Array([1, 2, 3])], { type: 'audio/mpeg' }), { status: 200 })

async function loadSpeech() {
  vi.resetModules()
  return import('@/lib/speech')
}

const flush = () => new Promise((r) => setTimeout(r, 0))

describe('speech state machine', () => {
  let fetchMock: ReturnType<typeof vi.fn>

  beforeEach(() => {
    FakeAudio.instances = []
    FakeAudio.nextPlay = 'resolve'
    vi.stubGlobal('Audio', FakeAudio)
    vi.stubGlobal('URL', Object.assign(URL, {
      createObjectURL: vi.fn((blob: Blob) => (blob.type === 'audio/wav' ? 'blob:silent' : `blob:fake-${Math.random()}`)),
      revokeObjectURL: vi.fn(),
    }))
    fetchMock = vi.fn(() => Promise.resolve(audioResponse()))
    vi.stubGlobal('fetch', fetchMock)
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('shows loading the instant Listen is pressed, then playing once audio starts', async () => {
    const speech = await loadSpeech()
    const pending = deferredResponse()
    fetchMock.mockReturnValueOnce(pending.promise)

    speech.toggleSpeech('m1', 'Hello there.', 'en-US')
    expect(speech.getSpeechSnapshot()).toMatchObject({ key: 'm1', phase: 'loading' })

    pending.resolve(audioResponse())
    await flush()
    await flush()
    expect(speech.getSpeechSnapshot()).toMatchObject({ key: 'm1', phase: 'playing', canPause: true })
  })

  it('ignores repeat taps while loading — one request, never a restart', async () => {
    const speech = await loadSpeech()
    const pending = deferredResponse()
    fetchMock.mockReturnValueOnce(pending.promise)

    speech.toggleSpeech('m1', 'Hello there.', 'en-US')
    speech.toggleSpeech('m1', 'Hello there.', 'en-US')
    speech.toggleSpeech('m1', 'Hello there.', 'en-US')

    expect(fetchMock).toHaveBeenCalledTimes(1)
    expect(speech.getSpeechSnapshot().phase).toBe('loading')
  })

  it('unlocks with a blob: clip — the CSP blocks data: media', async () => {
    const speech = await loadSpeech()
    speech.toggleSpeech('m1', 'Hello there.', 'en-US')
    expect(FakeAudio.instances[0].src).toBe('blob:silent')
  })

  it('sends the language so a per-language voice can be resolved', async () => {
    const speech = await loadSpeech()
    speech.toggleSpeech('m1', 'Hola.', 'es-ES')
    const body = JSON.parse((fetchMock.mock.calls[0] as [string, RequestInit])[1].body as string)
    expect(body).toEqual({ text: 'Hola.', langCode: 'es-ES' })
  })

  it('replays from memory without fetching again', async () => {
    const speech = await loadSpeech()
    speech.toggleSpeech('m1', 'Hello there.', 'en-US')
    await flush()
    await flush()
    FakeAudio.instances[0].ended = true
    FakeAudio.instances[0].onended?.()
    expect(speech.getSpeechSnapshot().phase).toBe('idle')

    speech.toggleSpeech('m1', 'Hello there.', 'en-US')
    await flush()
    expect(fetchMock).toHaveBeenCalledTimes(1)
    expect(speech.getSpeechSnapshot().phase).toBe('playing')
  })

  it('pauses and resumes on the same button', async () => {
    const speech = await loadSpeech()
    speech.toggleSpeech('m1', 'Hello there.', 'en-US')
    await flush()
    await flush()

    speech.toggleSpeech('m1', 'Hello there.', 'en-US')
    expect(speech.getSpeechSnapshot().phase).toBe('paused')

    speech.toggleSpeech('m1', 'Hello there.', 'en-US')
    await flush()
    expect(speech.getSpeechSnapshot().phase).toBe('playing')
  })

  it('lands in paused, not stuck playing, when the OS pauses audio', async () => {
    const speech = await loadSpeech()
    speech.toggleSpeech('m1', 'Hello there.', 'en-US')
    await flush()
    await flush()

    // A phone call / Siri: the element pauses without our asking.
    FakeAudio.instances[0].pause()
    expect(speech.getSpeechSnapshot().phase).toBe('paused')
    expect(speech.isSpeechActive()).toBe(false)
  })

  it('reports a blocked play as a retryable error, and the retry needs no new request', async () => {
    const speech = await loadSpeech()
    FakeAudio.nextPlay = 'block'
    speech.toggleSpeech('m1', 'Hello there.', 'en-US')
    await flush()
    await flush()
    expect(speech.getSpeechSnapshot()).toMatchObject({ key: 'm1', phase: 'error', error: 'blocked' })

    FakeAudio.nextPlay = 'resolve'
    speech.toggleSpeech('m1', 'Hello there.', 'en-US')
    await flush()
    expect(fetchMock).toHaveBeenCalledTimes(1)
    expect(speech.getSpeechSnapshot().phase).toBe('playing')
  })

  it('reports a network failure when there is no device voice to fall back to', async () => {
    const speech = await loadSpeech()
    fetchMock.mockRejectedValueOnce(new TypeError('Failed to fetch'))
    speech.toggleSpeech('m1', 'Hello there.', 'en-US')
    await flush()
    await flush()
    expect(speech.getSpeechSnapshot()).toMatchObject({ phase: 'error', error: 'network' })
  })

  it('hands the voice to another message and leaves the first one idle', async () => {
    const speech = await loadSpeech()
    speech.toggleSpeech('m1', 'First.', 'en-US')
    await flush()
    await flush()
    speech.toggleSpeech('m2', 'Second.', 'en-US')
    expect(speech.getSpeechSnapshot()).toMatchObject({ key: 'm2', phase: 'loading' })
  })

  it('stopSpeech returns everything to idle', async () => {
    const speech = await loadSpeech()
    speech.toggleSpeech('m1', 'Hello there.', 'en-US')
    await flush()
    await flush()
    speech.stopSpeech()
    expect(speech.getSpeechSnapshot()).toEqual({ key: null, phase: 'idle', error: null, canPause: false })
  })

  it('passes through ready (audio arrived) before playing', async () => {
    const speech = await loadSpeech()
    FakeAudio.nextPlay = 'pending'
    speech.toggleSpeech('m1', 'Hello there.', 'en-US')
    await flush()
    await flush()
    expect(speech.getSpeechSnapshot().phase).toBe('ready')
    // Still a "preparing" phase: repeat taps are ignored here too.
    speech.toggleSpeech('m1', 'Hello there.', 'en-US')
    expect(fetchMock).toHaveBeenCalledTimes(1)
  })

  it('never replays one language’s audio for another: a locale change fetches again', async () => {
    const speech = await loadSpeech()
    speech.toggleSpeech('m1', 'Kai', 'ta-IN')
    await flush()
    await flush()
    speech.stopSpeech()
    speech.toggleSpeech('m1', 'Kai', 'da-DK')
    await flush()
    expect(fetchMock).toHaveBeenCalledTimes(2)
    const sent = fetchMock.mock.calls.map((c) => JSON.parse((c as [string, RequestInit])[1].body as string).langCode)
    expect(sent).toEqual(['ta-IN', 'da-DK'])
  })

  it('normalizes the locale it sends and caches under (es → es-ES)', async () => {
    const speech = await loadSpeech()
    speech.toggleSpeech('m1', 'Hola.', 'es')
    await flush()
    await flush()
    speech.stopSpeech()
    speech.toggleSpeech('m1', 'Hola.', 'es-ES')
    await flush()
    expect(fetchMock).toHaveBeenCalledTimes(1)
    expect(JSON.parse((fetchMock.mock.calls[0] as [string, RequestInit])[1].body as string).langCode).toBe('es-ES')
  })

  it('ignores a stale response that lands after the patient moved on', async () => {
    const speech = await loadSpeech()
    const first = deferredResponse()
    fetchMock.mockReturnValueOnce(first.promise)
    speech.toggleSpeech('m1', 'First.', 'ta-IN')
    speech.stopSpeech() // e.g. the language changed
    first.resolve(audioResponse())
    await flush()
    await flush()
    expect(speech.getSpeechSnapshot().phase).toBe('idle')
    expect(FakeAudio.instances[0].src).not.toMatch(/^blob:fake/)
  })

  it('retry after a failed Fish request starts a fresh request and plays', async () => {
    const speech = await loadSpeech()
    fetchMock.mockRejectedValueOnce(new TypeError('Failed to fetch'))
    speech.toggleSpeech('m1', 'Hello there.', 'en-US')
    await flush()
    await flush()
    expect(speech.getSpeechSnapshot()).toMatchObject({ phase: 'error', error: 'network' })

    speech.toggleSpeech('m1', 'Hello there.', 'en-US')
    expect(speech.getSpeechSnapshot().phase).toBe('loading')
    await flush()
    await flush()
    expect(fetchMock).toHaveBeenCalledTimes(2)
    expect(speech.getSpeechSnapshot().phase).toBe('playing')
  })
})
