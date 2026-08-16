import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, act, waitFor } from '@testing-library/react'
import { useVoiceInput } from '@/hooks/useVoiceInput'

/**
 * Covers the four reliability scenarios that motivated the mic rework:
 *  (a) fresh permission prompt,
 *  (b) a denied state, which is the only one allowed to read as "blocked",
 *  (c) permission granted at the OS level but getUserMedia still failing —
 *      this must surface a real, non-generic cause rather than "blocked",
 *  (d) the gesture rule: getUserMedia is invoked synchronously from the tap.
 *
 * Plus (e): the capture → /api/transcribe → Fish Audio round trip, whose
 * failure modes must always land the patient on "type it instead" rather than
 * on a spinner that never clears.
 */

vi.mock('@/lib/speech', () => ({ stopSpeech: vi.fn() }))
// jsdom has no Web Audio; the WAV re-encode is covered by its own tests. Pass
// the clip through so these tests still assert on what reaches the network.
vi.mock('@/lib/audioWav', () => ({
  toWav: vi.fn(async (blob: Blob) => new Blob([blob], { type: 'audio/wav' })),
}))

/**
 * jsdom ships no MediaRecorder. This is the smallest stand-in that exercises
 * the real control flow: stop() flushes one chunk and then fires onstop, which
 * is the order a browser guarantees and the order the hook depends on to have
 * a non-empty blob to upload.
 */
class FakeMediaRecorder {
  static isTypeSupported = () => true
  state: 'inactive' | 'recording' = 'inactive'
  mimeType: string
  ondataavailable: ((e: { data: Blob }) => void) | null = null
  onstop: (() => void) | null = null

  constructor(_stream: MediaStream, options?: { mimeType?: string }) {
    this.mimeType = options?.mimeType ?? 'audio/webm'
  }
  start() {
    this.state = 'recording'
  }
  stop() {
    this.state = 'inactive'
    this.ondataavailable?.({ data: new Blob(['audio-bytes'], { type: this.mimeType }) })
    this.onstop?.()
  }
}

function micError(name: string): Error {
  const err = new Error(`${name} raised`)
  err.name = name
  return err
}

function fakeStream() {
  const track = { stop: vi.fn() }
  return { stream: { getTracks: () => [track] } as unknown as MediaStream, track }
}

const originalMediaDevices = navigator.mediaDevices
const originalPermissions = navigator.permissions

function setMediaDevices(value: unknown) {
  Object.defineProperty(navigator, 'mediaDevices', { value, configurable: true })
}

function setPermissionState(state: string | null) {
  Object.defineProperty(navigator, 'permissions', {
    value:
      state === null
        ? undefined
        : { query: vi.fn().mockResolvedValue({ state, addEventListener: vi.fn(), removeEventListener: vi.fn() }) },
    configurable: true,
  })
}

function renderVoiceInput() {
  return renderHook(() => useVoiceInput({ langCode: 'en-US', onTranscript: vi.fn() }))
}

beforeEach(() => {
  vi.restoreAllMocks()
  // Diagnostics are fire-and-forget; keep them off the network in tests.
  vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(null, { status: 204 })))
  // The hook must never touch these — audio goes to Fish, not to Google/Apple.
  // Defining them proves the recorder path is chosen on its own merits rather
  // than only because jsdom happens to lack SpeechRecognition.
  vi.stubGlobal('SpeechRecognition', vi.fn())
  vi.stubGlobal('webkitSpeechRecognition', vi.fn())
  setPermissionState('prompt')
})

afterEach(() => {
  setMediaDevices(originalMediaDevices)
  Object.defineProperty(navigator, 'permissions', { value: originalPermissions, configurable: true })
  vi.unstubAllGlobals()
})

describe('(d) permission request timing', () => {
  it('invokes getUserMedia synchronously inside the tap, before any await', () => {
    const getUserMedia = vi.fn().mockReturnValue(new Promise<MediaStream>(() => {}))
    setMediaDevices({ getUserMedia })

    const { result } = renderVoiceInput()

    act(() => {
      result.current.toggle()
    })

    // Already called by the time toggle() returns — no microtask needed. This is
    // what iOS Safari requires to honour the request.
    expect(getUserMedia).toHaveBeenCalledTimes(1)
    expect(getUserMedia).toHaveBeenCalledWith({ audio: true })
  })

  it('ignores a second tap while the prompt is still open, so only one stream opens', () => {
    const getUserMedia = vi.fn().mockReturnValue(new Promise<MediaStream>(() => {}))
    setMediaDevices({ getUserMedia })

    const { result } = renderVoiceInput()

    act(() => {
      result.current.toggle()
      result.current.toggle()
    })

    expect(getUserMedia).toHaveBeenCalledTimes(1)
  })
})

describe('(a) fresh permission prompt', () => {
  it('reports the prompt state before the patient taps anything', async () => {
    setMediaDevices({ getUserMedia: vi.fn() })
    const { result } = renderVoiceInput()

    await waitFor(() => expect(result.current.permission).toBe('prompt'))
    expect(result.current.error).toBeNull()
    expect(result.current.errorKind).toBeNull()
  })

  it('marks permission granted once a stream is actually returned', async () => {
    const { stream } = fakeStream()
    setMediaDevices({ getUserMedia: vi.fn().mockResolvedValue(stream) })
    // MediaRecorder is absent in jsdom; the granted transition happens before it.
    const { result } = renderVoiceInput()

    await act(async () => {
      result.current.toggle()
    })

    await waitFor(() => expect(result.current.permission).toBe('granted'))
  })
})

describe('(b) denied state', () => {
  it('classifies NotAllowedError as denied and offers the recovery path', async () => {
    setMediaDevices({ getUserMedia: vi.fn().mockRejectedValue(micError('NotAllowedError')) })

    const { result } = renderVoiceInput()

    await act(async () => {
      result.current.toggle()
    })

    await waitFor(() => expect(result.current.errorKind).toBe('denied'))
    expect(result.current.permission).toBe('denied')
    expect(result.current.error).toMatch(/turned off/i)
  })
})

describe('(c) granted at the OS level but still failing', () => {
  it('surfaces NotReadableError as in-use, NOT as blocked', async () => {
    setPermissionState('granted')
    setMediaDevices({ getUserMedia: vi.fn().mockRejectedValue(micError('NotReadableError')) })

    const { result } = renderVoiceInput()

    await act(async () => {
      result.current.toggle()
    })

    await waitFor(() => expect(result.current.errorKind).toBe('in-use'))
    // The regression this guards: a granted permission must never be reported as denied.
    expect(result.current.permission).not.toBe('denied')
    expect(result.current.error).toMatch(/busy/i)
    expect(result.current.error).not.toMatch(/blocked/i)
  })

  it('surfaces missing hardware as no-hardware, not as a permission problem', async () => {
    setPermissionState('granted')
    setMediaDevices({ getUserMedia: vi.fn().mockRejectedValue(micError('NotFoundError')) })

    const { result } = renderVoiceInput()

    await act(async () => {
      result.current.toggle()
    })

    await waitFor(() => expect(result.current.errorKind).toBe('no-hardware'))
    expect(result.current.permission).not.toBe('denied')
    expect(result.current.error).toMatch(/no microphone was found/i)
  })

  it('reports the real cause to the diagnostics endpoint', async () => {
    setPermissionState('granted')
    setMediaDevices({ getUserMedia: vi.fn().mockRejectedValue(micError('NotReadableError')) })

    const { result } = renderVoiceInput()

    await act(async () => {
      result.current.toggle()
    })

    await waitFor(() => {
      const calls = (globalThis.fetch as ReturnType<typeof vi.fn>).mock.calls
      const diagnostic = calls.find(([url]) => url === '/api/mic-diagnostics')
      expect(diagnostic).toBeDefined()
      const body = JSON.parse(diagnostic![1].body as string)
      expect(body.errorKind).toBe('in-use')
      expect(body.errorName).toBe('NotReadableError')
      expect(body.permissionState).toBe('granted')
      expect(body.userAgent).toBeTruthy()
    })
  })

  it('does not block the UI on the diagnostics call', async () => {
    setMediaDevices({ getUserMedia: vi.fn().mockRejectedValue(micError('NotReadableError')) })
    // A logging endpoint that never resolves must not stall the error surfacing.
    vi.stubGlobal('fetch', vi.fn().mockReturnValue(new Promise(() => {})))

    const { result } = renderVoiceInput()

    await act(async () => {
      result.current.toggle()
    })

    await waitFor(() => expect(result.current.errorKind).toBe('in-use'))
    expect(result.current.recording).toBe(false)
  })
})

describe('unsupported browsers', () => {
  it('reports unsupported rather than denied when getUserMedia is missing', async () => {
    setMediaDevices(undefined)
    Object.defineProperty(window, 'isSecureContext', { value: true, configurable: true })

    const { result } = renderVoiceInput()

    await act(async () => {
      result.current.toggle()
    })

    await waitFor(() => expect(result.current.errorKind).toBe('unsupported'))
    expect(result.current.permission).not.toBe('denied')
  })

  it('leaves permission at unsupported when the Permissions API is absent', async () => {
    setPermissionState(null)
    setMediaDevices({ getUserMedia: vi.fn() })

    const { result } = renderVoiceInput()

    // Must not be mistaken for a denial — the UI would wrongly offer the modal.
    await waitFor(() => expect(result.current.permission).toBe('unsupported'))
  })
})

describe('recheckPermission', () => {
  it('clears the error once the patient fixes the setting', async () => {
    setMediaDevices({ getUserMedia: vi.fn().mockRejectedValue(micError('NotAllowedError')) })

    const { result } = renderVoiceInput()

    await act(async () => {
      result.current.toggle()
    })
    await waitFor(() => expect(result.current.errorKind).toBe('denied'))

    setPermissionState('granted')
    let state: string | undefined
    await act(async () => {
      state = await result.current.recheckPermission()
    })

    expect(state).toBe('granted')
    await waitFor(() => expect(result.current.errorKind).toBeNull())
    expect(result.current.error).toBeNull()
  })

  it('keeps the error while the permission is still denied', async () => {
    setPermissionState('denied')
    setMediaDevices({ getUserMedia: vi.fn().mockRejectedValue(micError('NotAllowedError')) })

    const { result } = renderVoiceInput()

    await act(async () => {
      result.current.toggle()
    })
    await waitFor(() => expect(result.current.errorKind).toBe('denied'))

    let state: string | undefined
    await act(async () => {
      state = await result.current.recheckPermission()
    })

    expect(state).toBe('denied')
    expect(result.current.errorKind).toBe('denied')
  })
})

describe('(e) capture and transcription', () => {
  /** Route /api/transcribe to `respond`; everything else (diagnostics) 204s. */
  function stubTranscribeApi(respond: () => Response) {
    const fetchMock = vi.fn((url: string, _init?: RequestInit) =>
      Promise.resolve(url === '/api/transcribe' ? respond() : new Response(null, { status: 204 })),
    )
    vi.stubGlobal('fetch', fetchMock)
    return fetchMock
  }

  /** Tap to record, then tap again to stop — the full patient gesture. */
  async function recordAndStop(onTranscript = vi.fn()) {
    const { stream } = fakeStream()
    setMediaDevices({ getUserMedia: vi.fn().mockResolvedValue(stream) })
    vi.stubGlobal('MediaRecorder', FakeMediaRecorder)

    const { result } = renderHook(() => useVoiceInput({ langCode: 'ta-IN', onTranscript }))

    await act(async () => {
      result.current.toggle()
    })
    await waitFor(() => expect(result.current.recording).toBe(true))

    await act(async () => {
      result.current.stop()
    })
    return { result, onTranscript }
  }

  it('uploads the recorded clip to /api/transcribe with the language hint', async () => {
    const fetchMock = stubTranscribeApi(() => Response.json({ text: 'vayiru valikkirathu' }))

    const { onTranscript } = await recordAndStop()

    await waitFor(() => expect(onTranscript).toHaveBeenCalledWith('vayiru valikkirathu'))

    const call = fetchMock.mock.calls.find(([url]) => url === '/api/transcribe')
    expect(call).toBeDefined()
    const body = call![1]!.body as FormData
    expect(body.get('langCode')).toBe('ta-IN')
    expect(body.get('audio')).toBeInstanceOf(Blob)
  })

  it('never starts the browser speech engine — audio must reach Fish, not Google', async () => {
    stubTranscribeApi(() => Response.json({ text: 'hello' }))
    await recordAndStop()

    expect(window.SpeechRecognition).not.toHaveBeenCalled()
    expect(window.webkitSpeechRecognition).not.toHaveBeenCalled()
  })

  it('falls back to "type instead" when the Fish call fails, and clears the spinner', async () => {
    stubTranscribeApi(() => new Response('upstream boom', { status: 502 }))

    const { result, onTranscript } = await recordAndStop()

    await waitFor(() => expect(result.current.error).toMatch(/type your message instead/i))
    // The stuck-state regression: both indicators must settle, or the mic looks
    // like it is still listening forever.
    expect(result.current.transcribing).toBe(false)
    expect(result.current.recording).toBe(false)
    expect(onTranscript).not.toHaveBeenCalled()
    // A transcription fault is not a mic fault — offering the permission modal
    // here would send the patient to a setting that is already correct.
    expect(result.current.errorKind).toBeNull()
  })

  it('says so when the clip transcribes to nothing, instead of failing silently', async () => {
    stubTranscribeApi(() => Response.json({ text: '   ' }))

    const { result, onTranscript } = await recordAndStop()

    await waitFor(() => expect(result.current.error).toMatch(/no speech was heard/i))
    expect(onTranscript).not.toHaveBeenCalled()
    expect(result.current.transcribing).toBe(false)
  })

  it('surfaces a rate limit as a wait message, not as a failure', async () => {
    stubTranscribeApi(() => new Response('{}', { status: 429 }))

    const { result } = await recordAndStop()

    await waitFor(() => expect(result.current.error).toMatch(/wait a moment/i))
    expect(result.current.transcribing).toBe(false)
  })

  it('tells the patient to type when the network drops mid-upload', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn((url: string) =>
        url === '/api/transcribe'
          ? Promise.reject(new TypeError('Failed to fetch'))
          : Promise.resolve(new Response(null, { status: 204 })),
      ),
    )

    const { result } = await recordAndStop()

    await waitFor(() => expect(result.current.error).toMatch(/type your message instead/i))
    expect(result.current.transcribing).toBe(false)
  })
})

describe('in-app browser detection', () => {
  it('exposes the host app so the banner can render', async () => {
    Object.defineProperty(navigator, 'userAgent', {
      value: 'Mozilla/5.0 (iPhone) Instagram 302.0.0.23.113',
      configurable: true,
    })
    setMediaDevices({ getUserMedia: vi.fn() })

    const { result } = renderVoiceInput()

    expect(result.current.inAppBrowser).toBe('Instagram')
  })
})
