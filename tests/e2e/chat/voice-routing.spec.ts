import { test, expect, installAIMocks, startGuestSession } from '../fixtures/keiro'
import type { Page } from '@playwright/test'
import { LANGUAGES } from '../../../src/lib/languages'

/**
 * Listen → /api/tts carries the patient's language, for every supported locale.
 *
 * Default (CI): /api/tts is answered locally with a short silent MP3 so the suite
 * never bills Fish; the assertion is on what the UI SENT (the locale) and on the
 * Listen state machine. The server half (locale → exact Fish voice id on the
 * wire) is covered per-locale in src/__tests__/ttsRoute.test.ts.
 *
 * KEIRO_LIVE_VOICE=1: requests go to the real route and the real Fish account;
 * each locale must come back as MP3 audio tagged with that same locale.
 */
const LIVE = process.env.KEIRO_LIVE_VOICE === '1'

/** The smallest valid MPEG frame header + padding — enough for the audio element to accept. */
const SILENT_MP3 = Buffer.from(
  'SUQzBAAAAAAAI1RTU0UAAAAPAAADTGF2ZjU4Ljc2LjEwMAAAAAAAAAAAAAAA//tQxAADB8AhSmxhIIEVCSiJrDCQBTcu3UrAIwUdkRgQbFAZC1CQEwTJ9mjRvBA4UOLD8nKVOWfh+UlK3z/177OXrfOdKl7pyn3Xf//WreyTRUoAWgBgkOAGbZHBgG1OF6zM82DWbZaUmMBptgQhGjsyYqc9ae9XFz280948NMBWInljyzsNRFLPWdnZGWrddDsjK1unuSrVN9jJsK8KuQtQCtMBjCEtImISdNKJOopIpBFpNSMbIHCSRpRR5iakjTiyzLhchUUBwCgyKiweBv/7UsQbAAeIGUjqvkQAAANIAAAABEZzv/7UsQbAAeIGUjqvkQAAANIAAAABBqZzv',
  'base64',
)

async function stubTts(page: Page) {
  if (LIVE) return
  await page.route('**/api/tts', (route) =>
    route.fulfill({
      status: 200,
      contentType: 'audio/mpeg',
      body: SILENT_MP3,
    }),
  )
}

/** Switch the open chat to another language, as the language picker does. */
async function openChatIn(page: Page, lang: string, langName: string, langNative: string) {
  await page.goto(`/chat?${new URLSearchParams({ lang, langName, langNative, roman: '0' })}`)
}

const listenButton = (page: Page) => page.getByRole('log').getByRole('button').first()

test.describe('Listen sends the patient’s language for every supported locale', () => {
  test.describe.configure({ mode: 'serial' })
  test(`all ${LANGUAGES.length} locales${LIVE ? ' (live Fish)' : ''}`, async ({ page }) => {
    test.setTimeout(LIVE ? 30 * 60_000 : 6 * 60_000)
    await installAIMocks(page)
    await stubTts(page)
    await startGuestSession(page)

    const mismatches: string[] = []
    for (const lang of LANGUAGES) {
      await openChatIn(page, lang.code, lang.en, lang.native)
      const listen = listenButton(page)
      await expect(listen).toBeVisible({ timeout: 30_000 })

      const [request, response] = await Promise.all([
        page.waitForRequest((r) => r.url().endsWith('/api/tts')),
        page.waitForResponse((r) => r.url().endsWith('/api/tts'), { timeout: 60_000 }),
        listen.click(),
      ])
      const sent = JSON.parse(request.postData() ?? '{}') as { langCode?: string; voiceId?: string }
      const routedTo = response.headers()['x-keiro-voice-locale']

      if (sent.langCode !== lang.code) mismatches.push(`${lang.code}: UI sent ${sent.langCode}`)
      if ('voiceId' in sent) mismatches.push(`${lang.code}: client tried to choose a voice`)
      if (response.status() !== 200) mismatches.push(`${lang.code}: HTTP ${response.status()}`)
      // Only meaningful against the real route (the stub cannot route anything).
      if (LIVE) {
        if (routedTo !== lang.code) mismatches.push(`${lang.code}: server routed to ${routedTo}`)
        if (!(response.headers()['content-type'] ?? '').includes('audio/mpeg')) mismatches.push(`${lang.code}: not audio`)
      }
    }
    expect(mismatches).toEqual([])
  })

  test('repeat taps while preparing send one request, and the button says it is busy', async ({ page }) => {
    await installAIMocks(page)
    let ttsRequests = 0
    let release!: () => void
    const gate = new Promise<void>((r) => (release = r))
    await page.route('**/api/tts', async (route) => {
      ttsRequests += 1
      await gate
      await route.fulfill({ status: 200, contentType: 'audio/mpeg', body: SILENT_MP3 })
    })
    await startGuestSession(page)
    await openChatIn(page, 'ta-IN', 'Tamil', 'தமிழ்')

    const listen = listenButton(page)
    try {
      await listen.click()
      await expect(listen).toHaveAttribute('aria-busy', 'true')
      await expect(listen).toHaveAttribute('aria-disabled', 'true')
      // Playwright won't click an aria-disabled control, but an impatient patient
      // can still tap it — so dispatch the taps the way a finger would.
      await listen.dispatchEvent('click')
      await listen.dispatchEvent('click')
    } finally {
      release()
    }
    await expect(listen).not.toHaveAttribute('aria-busy', 'true')
    expect(ttsRequests).toBe(1)
  })

  test('a failed voice request offers Try again, and retry recovers', async ({ page }) => {
    await installAIMocks(page)
    // No device voices either, so the failure is surfaced rather than masked.
    await page.addInitScript(() => {
      window.speechSynthesis.getVoices = () => []
    })
    let fail = true
    await page.route('**/api/tts', (route) =>
      fail ? route.abort('failed') : route.fulfill({ status: 200, contentType: 'audio/mpeg', body: SILENT_MP3 }),
    )
    await startGuestSession(page)
    await openChatIn(page, 'da-DK', 'Danish', 'Dansk')

    const listen = listenButton(page)
    await listen.click()
    const status = page.getByRole('log').getByRole('status').first()
    await expect(status).not.toBeEmpty({ timeout: 15_000 })
    await expect(listen).not.toHaveAttribute('aria-busy', 'true')

    fail = false
    const retried = page.waitForRequest((r) => r.url().endsWith('/api/tts'))
    await listen.click()
    expect(JSON.parse((await retried).postData() ?? '{}').langCode).toBe('da-DK')
  })
})
