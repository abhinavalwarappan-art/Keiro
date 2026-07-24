'use client'

/**
 * Microphone failure diagnosis.
 *
 * Every mic failure used to collapse into one "access is blocked" string, which
 * made the field reports unactionable: a tester who had already granted mic
 * permission in their phone's Settings still saw "blocked", so the message sent
 * them back to a switch that was already on. That case is NOT a permission
 * denial — it is usually NotReadableError (another app holds the mic) or an
 * in-app browser that never exposes the mic at all.
 *
 * This module separates the failure modes, reads the real permission state
 * independently of any getUserMedia call, and ships the details to
 * /api/mic-diagnostics so we can see why a specific tester's mic fails instead
 * of guessing.
 */

/** What actually went wrong. Only `denied` means "the user must change a setting". */
export type MicErrorKind =
  | 'denied'      // NotAllowedError — permission refused or previously blocked
  | 'no-hardware' // NotFoundError — no capture device on this machine
  | 'in-use'      // NotReadableError — another app/tab holds the mic, or an OS-level fault
  | 'insecure'    // SecurityError / non-HTTPS origin / permissions-policy block
  | 'unsupported' // browser exposes no getUserMedia at all
  | 'unknown'     // anything else — the real name/message goes to the diagnostics log

/** Live permission state, read via the Permissions API where it exists. */
export type MicPermissionState = 'granted' | 'denied' | 'prompt' | 'unsupported'

/** Which recovery instructions to show. */
export type MicPlatform = 'ios-safari' | 'android-chrome' | 'other'

/**
 * Request the mic stream.
 *
 * MUST be called as the first synchronous statement of a tap handler — see the
 * gesture note in useVoiceInput.toggle. Returns the pending promise (never
 * awaits) so the caller can sequence its own work after the request is already
 * in flight. Returns null when the browser has no getUserMedia to call.
 */
export function requestMicStream(): Promise<MediaStream> | null {
  if (typeof navigator === 'undefined' || !navigator.mediaDevices?.getUserMedia) {
    return null
  }
  try {
    return navigator.mediaDevices.getUserMedia({ audio: true })
  } catch {
    // Legacy implementations can throw synchronously instead of rejecting.
    return null
  }
}

/**
 * Why `requestMicStream` returned null: an insecure origin strips
 * `navigator.mediaDevices` entirely, which is indistinguishable from "old
 * browser" unless we check the secure context separately.
 */
export function classifyMissingMediaDevices(): MicErrorKind {
  if (typeof window !== 'undefined' && window.isSecureContext === false) return 'insecure'
  return 'unsupported'
}

/** Map a getUserMedia rejection onto a kind. Names follow the WebRTC spec plus legacy aliases. */
export function classifyMicError(error: unknown): MicErrorKind {
  const name = error instanceof Error ? error.name : ''
  switch (name) {
    case 'NotAllowedError':
    case 'PermissionDeniedError':
      return 'denied'
    case 'NotFoundError':
    case 'DevicesNotFoundError':
      return 'no-hardware'
    case 'NotReadableError':
    case 'TrackStartError':
    case 'AbortError':
      return 'in-use'
    case 'SecurityError':
      return 'insecure'
    case 'TypeError':
      // getUserMedia missing/unusable — nearly always an insecure origin.
      return classifyMissingMediaDevices()
    default:
      return 'unknown'
  }
}

/**
 * Current permission state, independent of any getUserMedia call — this is what
 * lets the UI tell "never asked" apart from "permanently denied" before the
 * patient even taps the mic.
 *
 * Firefox and older Safari throw on the 'microphone' descriptor rather than
 * returning a state; both surface as 'unsupported' so callers fall back to
 * probing rather than assuming a denial.
 */
export async function queryMicPermission(): Promise<MicPermissionState> {
  if (typeof navigator === 'undefined' || !navigator.permissions?.query) return 'unsupported'
  try {
    // 'microphone' is a valid descriptor at runtime but is missing from the DOM
    // lib's PermissionName union, so the cast is required to compile.
    const status = await navigator.permissions.query({ name: 'microphone' as PermissionName })
    return status.state
  } catch {
    return 'unsupported'
  }
}

/**
 * Subscribe to permission changes. Lets the UI recover on its own when a tester
 * flips the switch in Settings and comes back to the tab. No-op (returns a
 * no-op unsubscribe) where the Permissions API is unavailable.
 */
export async function watchMicPermission(
  onChange: (state: MicPermissionState) => void,
): Promise<() => void> {
  if (typeof navigator === 'undefined' || !navigator.permissions?.query) return () => {}
  try {
    const status = await navigator.permissions.query({ name: 'microphone' as PermissionName })
    const handler = () => onChange(status.state)
    status.addEventListener('change', handler)
    return () => status.removeEventListener('change', handler)
  } catch {
    return () => {}
  }
}

/**
 * In-app browsers (the webview inside Instagram, TikTok, etc). These commonly
 * refuse mic access outright with no user-reachable setting, so they look
 * identical to a permanently-blocked mic but cannot be fixed by the recovery
 * steps in the help modal — the only fix is opening the page in a real browser.
 */
const IN_APP_BROWSERS: ReadonlyArray<readonly [name: string, pattern: RegExp]> = [
  ['Instagram', /Instagram/i],
  ['Facebook', /FBAN|FBAV|FB_IAB|FB4A/i],
  ['Messenger', /Messenger/i],
  ['TikTok', /BytedanceWebview|musical_ly|TikTok/i],
  ['LINE', /\bLine\//i],
  ['WeChat', /MicroMessenger/i],
  ['Snapchat', /Snapchat/i],
  ['Pinterest', /Pinterest/i],
  ['LinkedIn', /LinkedInApp/i],
  ['X', /TwitterAndroid|Twitter for/i],
]

/** Name of the host app when running inside its webview, else null. */
export function detectInAppBrowser(userAgent?: string): string | null {
  const ua = userAgent ?? (typeof navigator === 'undefined' ? '' : navigator.userAgent)
  if (!ua) return null
  for (const [name, pattern] of IN_APP_BROWSERS) {
    if (pattern.test(ua)) return name
  }
  return null
}

/**
 * Which set of recovery steps applies. Falls back to 'other' rather than
 * guessing, so the modal can offer manual browser tabs instead of confidently
 * showing the wrong instructions.
 */
export function detectMicPlatform(userAgent?: string): MicPlatform {
  const ua = userAgent ?? (typeof navigator === 'undefined' ? '' : navigator.userAgent)
  if (!ua) return 'other'

  const isIos = /iPhone|iPad|iPod/i.test(ua)
  if (isIos) {
    // Chrome/Firefox/Edge/Opera on iOS are Safari underneath but their
    // permission UI lives in a different place, so they are not 'ios-safari'.
    const isOtherIosBrowser = /CriOS|FxiOS|EdgiOS|OPiOS|Brave/i.test(ua)
    return isOtherIosBrowser ? 'other' : 'ios-safari'
  }

  if (/Android/i.test(ua)) {
    const isChrome = /Chrome\//i.test(ua) && !/SamsungBrowser|EdgA|OPR|Firefox/i.test(ua)
    return isChrome ? 'android-chrome' : 'other'
  }

  return 'other'
}

interface MicFailureInput {
  kind: MicErrorKind
  /** The raw rejection, when there was one. */
  error?: unknown
  langCode: string
  /** Where the failure came from: the getUserMedia probe or the Web Speech engine. */
  source: 'getUserMedia' | 'speech-recognition'
}

/**
 * Ship a failure to the diagnostics endpoint. Fire-and-forget by construction:
 * nothing awaits it, every error is swallowed, and the UI never blocks on it.
 */
export function reportMicFailure({ kind, error, langCode, source }: MicFailureInput): void {
  if (typeof window === 'undefined') return

  void (async () => {
    try {
      const permission = await queryMicPermission()
      const body = JSON.stringify({
        errorKind: kind,
        errorName: error instanceof Error ? error.name : null,
        errorMessage: error instanceof Error ? error.message : null,
        source,
        langCode,
        permissionState: permission,
        inAppBrowser: detectInAppBrowser(),
        platform: detectMicPlatform(),
        userAgent: navigator.userAgent,
        secureContext: window.isSecureContext !== false,
        hasMediaDevices: !!navigator.mediaDevices?.getUserMedia,
      })
      await fetch('/api/mic-diagnostics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body,
        // Survive the tab being backgrounded or navigated right after a failure.
        keepalive: true,
      })
    } catch {
      // Diagnostics are best-effort — a logging failure must never reach the patient.
    }
  })()
}
