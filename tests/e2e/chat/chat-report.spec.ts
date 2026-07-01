import {
  test,
  expect,
  installAIMocks,
  mockChat,
  startGuestSession,
  sendChatMessage,
} from '../fixtures/keiro'

/**
 * Canonical journey — validates the whole hybrid setup in one path:
 *   real anonymous Supabase auth → patient-intake gate → mocked SSE chat → mocked report.
 */

test.describe('guest chat → report', () => {
  test('completes a guest session and prepares a report', async ({ page }) => {
    await installAIMocks(page)
    await startGuestSession(page, { lang: 'en-US', langName: 'English' }, { fullName: 'Test Patient' })

    // The opening greeting rendered in the conversation log.
    const log = page.getByRole('log', { name: /conversation with kai/i })
    await expect(log).toBeVisible()

    // Send a symptom message; the mocked stream offers a report.
    await sendChatMessage(page, 'I have had a headache for two days')
    await expect(page.getByText('I have had a headache for two days')).toBeVisible()
    await expect(page.getByText(/shall i prepare your report/i)).toBeVisible()

    // Accept → mocked /api/report → inline report card appears.
    await page.getByRole('button', { name: /yes, prepare the report/i }).click()
    await expect(page.getByText(/your doctor-ready report is ready/i)).toBeVisible()
    await expect(page.getByRole('button', { name: /continue with doctor/i })).toBeVisible()
  })

  test('an emergency reply routes the patient to the emergency screen', async ({ page }) => {
    await installAIMocks(page)
    await mockChat(page, { emergency: true })
    await startGuestSession(page)

    await sendChatMessage(page, "I have chest pain and can't breathe")
    await page.waitForURL('**/emergency**')
    await expect(page).toHaveURL(/\/emergency/)
  })
})