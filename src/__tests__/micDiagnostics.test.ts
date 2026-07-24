import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import {
  classifyMicError,
  classifyMissingMediaDevices,
  detectInAppBrowser,
  detectMicPlatform,
  queryMicPermission,
  requestMicStream,
} from '@/lib/micDiagnostics'

/** Build a DOMException-shaped error, since jsdom's DOMException is limited. */
function micError(name: string): Error {
  const err = new Error(`${name} raised`)
  err.name = name
  return err
}

const IOS_SAFARI =
  'Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Mobile/15E148 Safari/604.1'
const IOS_CHROME =
  'Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) CriOS/126.0 Mobile/15E148 Safari/604.1'
const ANDROID_CHROME =
  'Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Mobile Safari/537.36'
const ANDROID_SAMSUNG =
  'Mozilla/5.0 (Linux; Android 14; SM-S911B) AppleWebKit/537.36 (KHTML, like Gecko) SamsungBrowser/25.0 Chrome/121.0.0.0 Mobile Safari/537.36'
const INSTAGRAM_IOS = `${IOS_SAFARI} Instagram 302.0.0.23.113`
const FACEBOOK_ANDROID = `${ANDROID_CHROME} [FB_IAB/FB4A;FBAV/465.0.0.39.109;]`
const TIKTOK_ANDROID = `${ANDROID_CHROME} BytedanceWebview/d8a21c6 musical_ly_2022804040`

describe('classifyMicError', () => {
  // The whole point of the change: these must NOT all collapse into "denied".
  it('maps NotAllowedError to denied — the only kind that means "change a setting"', () => {
    expect(classifyMicError(micError('NotAllowedError'))).toBe('denied')
    expect(classifyMicError(micError('PermissionDeniedError'))).toBe('denied')
  })

  it('maps NotFoundError to no-hardware, not denied', () => {
    expect(classifyMicError(micError('NotFoundError'))).toBe('no-hardware')
    expect(classifyMicError(micError('DevicesNotFoundError'))).toBe('no-hardware')
  })

  it('maps NotReadableError to in-use — the OS-granted-but-still-failing case', () => {
    expect(classifyMicError(micError('NotReadableError'))).toBe('in-use')
    expect(classifyMicError(micError('TrackStartError'))).toBe('in-use')
    expect(classifyMicError(micError('AbortError'))).toBe('in-use')
  })

  it('maps SecurityError to insecure', () => {
    expect(classifyMicError(micError('SecurityError'))).toBe('insecure')
  })

  it('falls back to unknown for an unrecognised error rather than guessing denied', () => {
    expect(classifyMicError(micError('OverconstrainedError'))).toBe('unknown')
    expect(classifyMicError('not an error at all')).toBe('unknown')
    expect(classifyMicError(null)).toBe('unknown')
  })
})

describe('classifyMissingMediaDevices', () => {
  const originalSecure = window.isSecureContext

  afterEach(() => {
    Object.defineProperty(window, 'isSecureContext', {
      value: originalSecure,
      configurable: true,
    })
  })

  it('reports insecure when the page is not a secure context', () => {
    Object.defineProperty(window, 'isSecureContext', { value: false, configurable: true })
    expect(classifyMissingMediaDevices()).toBe('insecure')
  })

  it('reports unsupported on a secure context with no getUserMedia', () => {
    Object.defineProperty(window, 'isSecureContext', { value: true, configurable: true })
    expect(classifyMissingMediaDevices()).toBe('unsupported')
  })
})

describe('detectInAppBrowser', () => {
  it('detects the webviews that block the mic outright', () => {
    expect(detectInAppBrowser(INSTAGRAM_IOS)).toBe('Instagram')
    expect(detectInAppBrowser(FACEBOOK_ANDROID)).toBe('Facebook')
    expect(detectInAppBrowser(TIKTOK_ANDROID)).toBe('TikTok')
    expect(detectInAppBrowser('Mozilla/5.0 Line/13.5.0')).toBe('LINE')
  })

  it('returns null for real browsers so the banner stays hidden', () => {
    expect(detectInAppBrowser(IOS_SAFARI)).toBeNull()
    expect(detectInAppBrowser(ANDROID_CHROME)).toBeNull()
    expect(detectInAppBrowser('')).toBeNull()
  })
})

describe('detectMicPlatform', () => {
  it('detects iOS Safari', () => {
    expect(detectMicPlatform(IOS_SAFARI)).toBe('ios-safari')
  })

  it('does not call Chrome-on-iOS "Safari" — its permission UI lives elsewhere', () => {
    expect(detectMicPlatform(IOS_CHROME)).toBe('other')
  })

  it('detects Android Chrome', () => {
    expect(detectMicPlatform(ANDROID_CHROME)).toBe('android-chrome')
  })

  it('does not claim Samsung Internet is Chrome', () => {
    expect(detectMicPlatform(ANDROID_SAMSUNG)).toBe('other')
  })

  it('falls back to other rather than guessing', () => {
    expect(detectMicPlatform('Mozilla/5.0 (X11; Linux x86_64) Firefox/128.0')).toBe('other')
    expect(detectMicPlatform('')).toBe('other')
  })
})

describe('queryMicPermission', () => {
  const originalPermissions = navigator.permissions

  const setPermissions = (value: unknown) => {
    Object.defineProperty(navigator, 'permissions', { value, configurable: true })
  }

  afterEach(() => {
    setPermissions(originalPermissions)
  })

  it('returns the live state so the UI can tell "never asked" from "denied"', async () => {
    setPermissions({ query: vi.fn().mockResolvedValue({ state: 'prompt' }) })
    await expect(queryMicPermission()).resolves.toBe('prompt')

    setPermissions({ query: vi.fn().mockResolvedValue({ state: 'denied' }) })
    await expect(queryMicPermission()).resolves.toBe('denied')
  })

  it('reports unsupported — never denied — when the API is missing', async () => {
    setPermissions(undefined)
    await expect(queryMicPermission()).resolves.toBe('unsupported')
  })

  it('reports unsupported when the descriptor throws, as it does on Firefox', async () => {
    setPermissions({ query: vi.fn().mockRejectedValue(new TypeError('unsupported name')) })
    await expect(queryMicPermission()).resolves.toBe('unsupported')
  })
})

describe('requestMicStream', () => {
  const originalMediaDevices = navigator.mediaDevices

  const setMediaDevices = (value: unknown) => {
    Object.defineProperty(navigator, 'mediaDevices', { value, configurable: true })
  }

  beforeEach(() => {
    setMediaDevices(undefined)
  })

  afterEach(() => {
    setMediaDevices(originalMediaDevices)
  })

  it('returns the pending promise without awaiting it, keeping the gesture alive', () => {
    let settled = false
    const pending = new Promise<MediaStream>(() => {})
    const getUserMedia = vi.fn().mockReturnValue(pending)
    setMediaDevices({ getUserMedia })

    const result = requestMicStream()

    // Called synchronously, and still unresolved — the caller gets the promise.
    expect(getUserMedia).toHaveBeenCalledTimes(1)
    expect(getUserMedia).toHaveBeenCalledWith({ audio: true })
    void result?.then(() => {
      settled = true
    })
    expect(settled).toBe(false)
  })

  it('returns null when the browser exposes no getUserMedia', () => {
    expect(requestMicStream()).toBeNull()
  })

  it('returns null instead of throwing when getUserMedia throws synchronously', () => {
    setMediaDevices({
      getUserMedia: vi.fn(() => {
        throw new TypeError('legacy implementation')
      }),
    })
    expect(requestMicStream()).toBeNull()
  })
})
