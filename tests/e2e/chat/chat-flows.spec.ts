import {
  test,
  expect,
  installAIMocks,
  mockChat,
  mockReport,
  mockTranslate,
  startGuestSession,
  sendChatMessage,
} from '../fixtures/keiro'

// ─────────────────────────────────────────────────────────────────────────────
// Helpers (inlined — no fixture change needed)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Wait for the Kai reply stream to finish by polling until the last message in
 * the conversation log stops being an empty-content bubble.  We cannot use a
 * fixed `waitForTimeout`; instead we wait for a text node to appear inside the
 * log that matches the expected partial text.
 */
async function waitForKaiReply(page: import('@playwright/test').Page, partialText: string) {
  await expect(page.getByRole('log', { name: /conversation with kai/i })
    .getByText(partialText, { exact: false })).toBeVisible()
}

// ─────────────────────────────────────────────────────────────────────────────
// Connection error (500)
// ─────────────────────────────────────────────────────────────────────────────

test.describe('connection error (500)', () => {
  test('shows "Having trouble connecting" alert and Retry button; drops optimistic bubble', async ({ page }) => {
    // Translate & report mocks keep other routes clean; only chat is a 500.
    await mockChat(page, { status: 500 })
    await mockReport(page)
    await mockTranslate(page)
    await startGuestSession(page)

    const log = page.getByRole('log', { name: /conversation with kai/i })

    await sendChatMessage(page, 'My stomach hurts')

    // The optimistic user bubble must be dropped on failure.
    await expect(log.getByText('My stomach hurts')).toBeHidden()

    // The connection-error banner (div[role=alert] with bg-error-subtle) must appear.
    // Note: ChatInput also emits a separate role="alert" ("Message failed to send")
    // at the same time, so we target the banner by its unique text rather than via
    // the shared appAlert() helper (which would fail strict-mode with 2 matches).
    const errorBanner = page.locator('[role="alert"]').filter({ hasText: /having trouble connecting/i })
    await expect(errorBanner).toBeVisible()

    // A Retry button must be inside that banner.
    await expect(errorBanner.getByRole('button', { name: /retry/i })).toBeVisible()
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// Rate-limit (429)
// ─────────────────────────────────────────────────────────────────────────────

test.describe('rate-limit (429)', () => {
  test('shows the rate-limit warning banner', async ({ page }) => {
    await mockChat(page, { status: 429 })
    await mockReport(page)
    await mockTranslate(page)
    await startGuestSession(page)

    await sendChatMessage(page, 'I have a headache')

    // Same situation as the 500 test: ChatInput's inline error also has role="alert",
    // so we filter to the rate-limit banner by its unique text.
    const banner = page.locator('[role="alert"]').filter({ hasText: /you've sent a lot of messages/i })
    await expect(banner).toBeVisible()
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// Severity quick-reply
// ─────────────────────────────────────────────────────────────────────────────

test.describe('severity quick-reply', () => {
  test('SeverityPicker renders after a "scale of 1" reply and selection sends a follow-up', async ({ page }) => {
    // First call returns a severity-triggering reply; subsequent calls (from picker
    // selection) return the default PREPARE_REPORT_REPLY so the test ends cleanly.
    let callCount = 0
    await page.route('**/api/chat', async (route) => {
      callCount++
      if (callCount === 1) {
        const body = `data: ${JSON.stringify({ text: 'On a scale of 1 to 10, how bad is the pain?' })}\ndata: [DONE]\n`
        await route.fulfill({
          status: 200,
          headers: { 'content-type': 'text/event-stream', 'cache-control': 'no-cache' },
          body,
        })
      } else {
        const body = `data: ${JSON.stringify({ text: 'Thank you for sharing that. Shall I prepare your report now?' })}\ndata: [DONE]\n`
        await route.fulfill({
          status: 200,
          headers: { 'content-type': 'text/event-stream', 'cache-control': 'no-cache' },
          body,
        })
      }
    })
    await mockReport(page)
    await mockTranslate(page)
    await startGuestSession(page)

    await sendChatMessage(page, 'I have back pain')

    // Wait for the severity reply to stream in.
    await waitForKaiReply(page, 'scale of 1 to 10')

    // SeverityPicker should now be visible in the input area.
    // Buttons render the label text ("1–3", "4–6", "7–8", "9–10").
    const inputArea = page.locator('.mx-auto.w-full.max-w-2xl').last()
    const severityBtn = inputArea.getByRole('button', { name: /1.{1,2}3/i }).first()
    await expect(severityBtn).toBeVisible()

    // Selecting an option should send a follow-up message (chat input fires again).
    await severityBtn.click()

    // The selected value should appear as a user bubble in the log.
    const log = page.getByRole('log', { name: /conversation with kai/i })
    await expect(log.getByText('1\u20133')).toBeVisible()
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// Yes/No quick-reply
// ─────────────────────────────────────────────────────────────────────────────

test.describe('yes/no quick-reply', () => {
  test('YesNoPicker renders after a "do you have" reply', async ({ page }) => {
    const body = `data: ${JSON.stringify({ text: 'Do you have a fever right now?' })}\ndata: [DONE]\n`
    await page.route('**/api/chat', async (route) => {
      await route.fulfill({
        status: 200,
        headers: { 'content-type': 'text/event-stream', 'cache-control': 'no-cache' },
        body,
      })
    })
    await mockReport(page)
    await mockTranslate(page)
    await startGuestSession(page)

    await sendChatMessage(page, 'I feel unwell')

    await waitForKaiReply(page, 'Do you have a fever')

    // Both Yes and No buttons must be visible.
    const inputArea = page.locator('.mx-auto.w-full.max-w-2xl').last()
    await expect(inputArea.getByRole('button', { name: 'Yes', exact: true })).toBeVisible()
    await expect(inputArea.getByRole('button', { name: 'No', exact: true })).toBeVisible()
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// Multi-turn conversation
// ─────────────────────────────────────────────────────────────────────────────

test.describe('multi-turn conversation', () => {
  test('two user messages and two Kai replies appear in the log', async ({ page }) => {
    let callCount = 0
    await page.route('**/api/chat', async (route) => {
      callCount++
      const reply = callCount === 1
        ? 'Tell me more about the pain location.'
        : 'Thank you for sharing that. Shall I prepare your report now?'
      const body = `data: ${JSON.stringify({ text: reply })}\ndata: [DONE]\n`
      await route.fulfill({
        status: 200,
        headers: { 'content-type': 'text/event-stream', 'cache-control': 'no-cache' },
        body,
      })
    })
    await mockReport(page)
    await mockTranslate(page)
    await startGuestSession(page)

    const log = page.getByRole('log', { name: /conversation with kai/i })

    // First turn
    await sendChatMessage(page, 'I have a headache')
    await expect(log.getByText('I have a headache')).toBeVisible()
    await waitForKaiReply(page, 'Tell me more about the pain location')

    // Second turn
    await sendChatMessage(page, 'It is in my temples')
    await expect(log.getByText('It is in my temples')).toBeVisible()
    await waitForKaiReply(page, 'Shall I prepare your report now')

    // Both user bubbles must coexist in the log.
    await expect(log.getByText('I have a headache')).toBeVisible()
    await expect(log.getByText('It is in my temples')).toBeVisible()
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// End session
// ─────────────────────────────────────────────────────────────────────────────

test.describe('end session', () => {
  test('clicking End redirects to /?ended=1', async ({ page }) => {
    await installAIMocks(page)
    await startGuestSession(page)

    // The TopBar renders: aria-label="End session and clear data"
    await page.getByRole('button', { name: /end session and clear data/i }).click()

    await page.waitForURL('**/?ended=1', { timeout: 10_000 })
    await expect(page).toHaveURL(/\?ended=1/)
  })
})