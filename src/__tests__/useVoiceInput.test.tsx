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
 */

vi.mock('@/lib/speech', () => ({ stopSpeech: vi.fn() }))

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
  // Force the Whisper branch so the tests exercise the getUserMedia path rather
  // than jsdom's absent SpeechRecognition.
  vi.stubGlobal('SpeechRecognition', undefined)
  vi.stubGlobal('webkitSpeechRecognition', undefined)
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
