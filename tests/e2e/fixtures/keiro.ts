import { test as base, expect, type Page, type Route, type Locator } from '@playwright/test'

export { expect }

/**
 * Shared `test` with global determinism baked in for every spec that imports it:
 *  - dismisses the analytics/cookie banner (CookieConsent in layout.tsx appears
 *    after 600ms and otherwise intercepts clicks at the bottom of the viewport),
 *  - neutralizes TTS so `isKaiSpeaking` never blocks the composer.
 * Both run as init scripts before any navigation.
 */
export const test = base.extend({
  page: async ({ page }, use) => {
    await page.addInitScript(() => {
      try {
        window.localStorage.setItem('keiro_cookie_consent', 'declined')
      } catch {
        /* opaque origin (about:blank) — ignore */
      }
      try {
        if ('speechSynthesis' in window) {
          window.speechSynthesis.getVoices = () => []
          window.speechSynthesis.speak = () => {}
        }
      } catch {
        /* no-op */
      }
    })
    await use(page)
  },
})

/**
 * `role="alert"` scoped to real app alerts, excluding Next.js's always-present
 * route announcer (`#__next-route-announcer__`), which otherwise makes
 * getByRole('alert') ambiguous in strict mode.
 */
export function appAlert(page: Page): Locator {
  return page.locator('[role="alert"]:not(#__next-route-announcer__)')
}

// ───────────────────────── AI / translate mocks ─────────────────────────

/**
 * Build the exact SSE body /api/chat streams: one `data: {"text":"…"}` line per
 * chunk, terminated by `data: [DONE]`. Matches the client parser in
 * src/app/chat/page.tsx (splits on \n, reads `data: ` lines, parses JSON .text,
 * stops on [DONE]).
 */
export function buildChatSSE(chunks: string[]): string {
  const lines = chunks.map((c) => `data: ${JSON.stringify({ text: c })}\n`)
  lines.push('data: [DONE]\n')
  return lines.join('')
}

export interface ChatMockOptions {
  /** Text Kai streams back. A string is sent as one chunk; an array streams in parts. */
  reply?: string | string[]
  /** Respond with the emergency JSON ({emergency:true}) instead of a stream. */
  emergency?: boolean
  /** Force a non-200 status (e.g. 429 to exercise the rate-limit banner, 500 the error banner). */
  status?: number
}

/** A default Kai reply that ends the intake and offers a report. */
export const PREPARE_REPORT_REPLY =
  'Thank you for sharing that. Shall I prepare your report now?'

export async function mockChat(page: Page, opts: ChatMockOptions = {}): Promise<void> {
  await page.route('**/api/chat', async (route: Route) => {
    if (opts.status !== undefined && opts.status !== 200) {
      await route.fulfill({
        status: opts.status,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'mocked error' }),
      })
      return
    }
    if (opts.emergency) {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ emergency: true }),
      })
      return
    }
    const chunks = Array.isArray(opts.reply)
      ? opts.reply
      : [opts.reply ?? PREPARE_REPORT_REPLY]
    await route.fulfill({
      status: 200,
      headers: { 'content-type': 'text/event-stream', 'cache-control': 'no-cache' },
      body: buildChatSSE(chunks),
    })
  })
}

/** A realistic /api/report payload. The chat client fills gaps, so this is illustrative, not required-complete. */
export const DEFAULT_REPORT_DATA = {
  chief_complaint: 'Headache for two days',
  clinical_symptoms_summary: 'Patient reports a dull bilateral headache for two days, worse in the afternoon.',
  symptoms: [
    { location: 'head', severity: 5, duration: '2 days', character: 'dull', onset: 'gradual', modifiers: 'worse in afternoon' },
  ],
  associated_symptoms: { fever: false, nausea: false, fatigue: true, dizziness: false, appetite_loss: false },
  medications: [],
  allergies: [],
  conditions: [],
  history: 'Not reported',
  family_history: 'Not reported',
  lifestyle: { smoker: false, alcohol: false, recent_travel: false },
  lmp: null,
  additional_notes: 'Not reported',
  possible_conditions: [
    { condition: 'Tension headache', reasoning: 'Bilateral dull pain without red-flag features.' },
  ],
}

export interface ReportMockOptions {
  reportId?: string
  reportData?: Record<string, unknown>
  status?: number
}

export async function mockReport(page: Page, opts: ReportMockOptions = {}): Promise<void> {
  await page.route('**/api/report', async (route: Route) => {
    // PATCH = consult notes/transcript update — just acknowledge.
    if (route.request().method() === 'PATCH') {
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ ok: true }) })
      return
    }
    if (opts.status !== undefined && opts.status !== 200) {
      await route.fulfill({ status: opts.status, contentType: 'application/json', body: JSON.stringify({ error: 'mocked error' }) })
      return
    }
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        reportId: opts.reportId ?? 'KR-2026-12345',
        reportData: opts.reportData ?? DEFAULT_REPORT_DATA,
        savedToDb: false,
        patientProfile: null,
      }),
    })
  })
}

export async function mockTranslate(page: Page, translated = 'Texto traducido'): Promise<void> {
  await page.route('**/api/translate', (route: Route) =>
    route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ translated }) }),
  )
}

export interface AIMockOptions {
  chat?: ChatMockOptions
  report?: ReportMockOptions
  translate?: string
}

/** Install chat + report + translate mocks with sensible defaults. Call before navigating. */
export async function installAIMocks(page: Page, opts: AIMockOptions = {}): Promise<void> {
  await mockChat(page, opts.chat)
  await mockReport(page, opts.report)
  await mockTranslate(page, opts.translate)
}

/**
 * Remove TTS nondeterminism: with no voices, the app's speakText() no-ops, so
 * `isKaiSpeaking` never blocks the input. Headless already has no voices; this
 * guarantees it everywhere. Must run before navigation.
 */
export async function silenceSpeech(page: Page): Promise<void> {
  await page.addInitScript(() => {
    try {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.getVoices = () => []
        window.speechSynthesis.speak = () => {}
      }
    } catch {
      /* no-op */
    }
  })
}

// ───────────────────────── flow helpers ─────────────────────────

export interface LangOpts {
  lang?: string
  langName?: string
  langNative?: string
  roman?: boolean
}

function chatQuery(o: LangOpts): string {
  return new URLSearchParams({
    lang: o.lang ?? 'en-US',
    langName: o.langName ?? 'English',
    langNative: o.langNative ?? 'English',
    roman: o.roman ? '1' : '0',
  }).toString()
}

/**
 * Drive the REAL anonymous-auth path: open /auth with language params, click
 * "Start without an account" (→ supabase.auth.signInAnonymously), land on /chat.
 */
export async function guestLogin(page: Page, o: LangOpts = {}): Promise<void> {
  await silenceSpeech(page)
  await page.goto(`/auth?${chatQuery(o)}`)
  await page.getByRole('button', { name: /start without an account/i }).click()
  await page.waitForURL('**/chat**')
}

export interface ProfileOpts {
  fullName?: string
  dob?: string // yyyy-mm-dd
  sex?: 'Male' | 'Female' | 'Other'
}

/** Fill and submit the PatientProfileIntake consent/profile gate that precedes chat. */
export async function completeProfileIntake(page: Page, o: ProfileOpts = {}): Promise<void> {
  const dialog = page.getByRole('dialog', { name: /patient information/i })
  await expect(dialog).toBeVisible()
  // Wait out the loadProfile() skeleton.
  const fullName = dialog.getByLabel('Full name')
  await expect(fullName).toBeVisible()
  await fullName.fill(o.fullName ?? 'Test Patient')
  await dialog.getByLabel('Date of birth').fill(o.dob ?? '1990-01-01')
  await dialog.getByRole('button', { name: o.sex ?? 'Male', exact: true }).click()
  await dialog.getByRole('checkbox').check()
  await dialog.getByRole('button', { name: /continue to symptom intake/i }).click()
  await expect(dialog).toBeHidden()
}

/**
 * Enter a chat-ready state: intake done, composer interactive.
 *
 * The real anonymous Supabase session comes from the shared authenticated
 * storageState (see tests/e2e/auth.setup.ts + the `chromium-authed` project),
 * so we navigate straight into /chat rather than re-running signInAnonymously
 * per test — Supabase throttles sign-ins per IP, and ~one-per-test exhausts it.
 * Call installAIMocks(page, …) first to control the replies.
 */
export async function startGuestSession(page: Page, lang: LangOpts = {}, profile: ProfileOpts = {}): Promise<void> {
  await page.goto(`/chat?${chatQuery(lang)}`)
  await completeProfileIntake(page, profile)
  // Opening message + enabled composer means the chat is interactive.
  await expect(page.getByRole('log', { name: /conversation with kai/i })).toBeVisible()
  await expect(page.locator('#chat-input')).toBeEnabled()
}

/**
 * Type a message and send it via the composer. Waits for the send control to be
 * enabled (composer idle, not mid-stream) before clicking, so the send isn't
 * issued while the parent is transiently locked. Works for both success and
 * error-path tests (a failed send legitimately keeps its text).
 */
export async function sendChatMessage(page: Page, text: string): Promise<void> {
  const input = page.locator('#chat-input')
  await expect(input).toBeEnabled()
  await input.fill(text)
  const sendButton = page.getByRole('button', { name: /send message/i })
  await expect(sendButton).toBeEnabled()
  await sendButton.click()
}