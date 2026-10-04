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
import type { Page, Route } from '@playwright/test'

// ─────────────────────────────────────────────────────────────────────────────
// Helpers (inlined — no fixture change needed)
// ─────────────────────────────────────────────────────────────────────────────

/** The conversation transcript is a role="log" live region labelled "Conversation with Kai". */
function chatLog(page: Page) {
  return page.getByRole('log', { name: /conversation with kai/i })
}

/** Wait until a text node matching `partialText` appears inside the conversation log. */
async function waitForKaiReply(page: Page, partialText: string) {
  await expect(chatLog(page).getByText(partialText, { exact: false })).toBeVisible()
}

// ─────────────────────────────────────────────────────────────────────────────
// Connection error (500)
// ─────────────────────────────────────────────────────────────────────────────

test.describe('connection error (500)', () => {
  test('shows the connection-error banner and keeps the user message', async ({ page }) => {
    // Every /api/chat call (opening + user) returns 500.
    await mockChat(page, { status: 500 })
    await mockReport(page)
    await mockTranslate(page)
    await startGuestSession(page)

    await sendChatMessage(page, 'My stomach hurts')

    // The app does NOT drop the optimistic bubble on failure — it stays so the
    // patient can see what they sent.
    await expect(chatLog(page).getByText('My stomach hurts')).toBeVisible()

    // The connection-error banner appears (this UI has no Retry button).
    await expect(page.getByText(/something went wrong reaching kai/i)).toBeVisible()
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

    await expect(page.getByText(/sending messages too quickly/i)).toBeVisible()
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// Severity quick-reply
// ─────────────────────────────────────────────────────────────────────────────

test.describe('severity quick-reply', () => {
  test('SeverityPicker renders after a "scale of 1" reply and a selection sends a follow-up', async ({ page }) => {
    // The opening message streams a neutral greeting; every user message gets a
    // reply carrying the invisible [[PICKER:SEVERITY]] signal (stripped from the
    // visible text) that drives the severity picker.
    await mockChat(page, { reply: 'On a scale of 1 to 10, how bad is the pain? [[PICKER:SEVERITY]]' })
    await mockReport(page)
    await mockTranslate(page)
    await startGuestSession(page)

    await sendChatMessage(page, 'I have back pain')
    await waitForKaiReply(page, 'scale of 1 to 10')

    // SeverityPicker is a role="group" (aria-label "Select severity level") with
    // buttons aria-labelled "Severity 1–3 – Mild", etc.
    const picker = page.getByRole('group', { name: /select severity level/i })
    const severityBtn = picker.getByRole('button', { name: /1.{1,2}3/i }).first()
    await expect(severityBtn).toBeVisible()

    // Selecting an option sends it as a follow-up message.
    await severityBtn.click()
    await expect(chatLog(page).getByText('1–3')).toBeVisible()
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// Yes/No quick-reply
// ─────────────────────────────────────────────────────────────────────────────

test.describe('yes/no quick-reply', () => {
  test('YesNoPicker renders after a "do you have" reply', async ({ page }) => {
    // Reply carries the invisible [[PICKER:YESNO]] signal that drives the Yes/No picker.
    await mockChat(page, { reply: 'Do you have a fever right now? [[PICKER:YESNO]]' })
    await mockReport(page)
    await mockTranslate(page)
    await startGuestSession(page)

    await sendChatMessage(page, 'I feel unwell')
    await waitForKaiReply(page, 'Do you have a fever')

    // YesNoPicker is a role="group" (aria-label "Yes or No") with Yes/No buttons.
    const picker = page.getByRole('group', { name: 'Yes or No' })
    await expect(picker.getByRole('button', { name: 'Yes', exact: true })).toBeVisible()
    await expect(picker.getByRole('button', { name: 'No', exact: true })).toBeVisible()
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// Multi-turn conversation
// ─────────────────────────────────────────────────────────────────────────────

test.describe('multi-turn conversation', () => {
  test('two user messages and two Kai replies appear in the log', async ({ page }) => {
    // Opening → greeting; first user message → follow-up; second → prepare-report.
    let userTurns = 0
    await page.route('**/api/chat', async (route: Route) => {
      const isOpening = route.request().postDataJSON()?.isOpening === true
      let reply: string
      if (isOpening) {
        reply = 'Hello, I am Kai. What is bothering you today?'
      } else {
        userTurns++
        reply = userTurns === 1
          ? 'Tell me more about the pain location.'
          : 'Thank you for sharing that. Shall I prepare your report now?'
      }
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

    const log = chatLog(page)

    await sendChatMessage(page, 'I have a headache')
    await expect(log.getByText('I have a headache')).toBeVisible()
    await waitForKaiReply(page, 'Tell me more about the pain location')

    await sendChatMessage(page, 'It is in my temples')
    await expect(log.getByText('It is in my temples')).toBeVisible()
    await waitForKaiReply(page, 'Shall I prepare your report now')

    // Both user bubbles coexist in the log.
    await expect(log.getByText('I have a headache')).toBeVisible()
    await expect(log.getByText('It is in my temples')).toBeVisible()
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// End session
// ─────────────────────────────────────────────────────────────────────────────

test.describe('end session', () => {
  test('End asks for confirmation, then signs out and redirects to /', async ({ page }) => {
    await installAIMocks(page)
    // Stub the Supabase logout endpoint so the button still clears the client
    // session and navigates, WITHOUT globally revoking the shared guest session
    // (which would break later tests reusing the same storageState).
    await page.route(/\/auth\/v1\/logout/, (route) =>
      route.fulfill({ status: 204, body: '' }),
    )
    await startGuestSession(page)

    // TopBar renders "End" (aria-label "End session and sign out"). Ending clears
    // the conversation, so it asks first; Escape / "Keep talking" back out.
    await page.getByRole('button', { name: /end session and sign out/i }).click()
    const dialog = page.getByRole('alertdialog', { name: /end this conversation/i })
    await expect(dialog).toBeVisible()
    await page.keyboard.press('Escape')
    await expect(dialog).toBeHidden()
    expect(new URL(page.url()).pathname).toBe('/chat')

    await page.getByRole('button', { name: /end session and sign out/i }).click()
    await page.getByRole('button', { name: /^end conversation$/i }).click()

    await page.waitForURL((url) => url.pathname === '/', { timeout: 10_000 })
    await expect(page).toHaveURL(/\/$/)
  })
})
