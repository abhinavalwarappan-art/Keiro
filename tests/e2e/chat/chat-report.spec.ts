import {
  test,
  expect,
  installAIMocks,
  mockChat,
  startGuestSession,
  sendChatMessage,
} from '../fixtures/keiro'

/**
 * Canonical journey — validates the hybrid setup in one path:
 *   real anonymous Supabase auth (shared storageState) → seeded patient profile →
 *   mocked SSE chat → mocked report → navigation to /report.
 *
 * The patient-intake gate is bypassed by seeding the profile (see startGuestSession):
 * the real intake writes to the Supabase `sessions` table, which currently fails
 * (missing columns), so it can't complete in an E2E run.
 */

test.describe('guest chat → report', () => {
  test('completes a guest session and navigates to the report', async ({ page }) => {
    await installAIMocks(page)
    await startGuestSession(page, { lang: 'en-US', langName: 'English' }, { fullName: 'Test Patient' })

    const log = page.getByRole('log', { name: /conversation with kai/i })
    await expect(log).toBeVisible()

    // Send a symptom message; the mocked reply offers a report.
    await sendChatMessage(page, 'I have had a headache for two days')
    await expect(log.getByText('I have had a headache for two days')).toBeVisible()
    await expect(page.getByText(/shall i prepare your report/i)).toBeVisible()

    // Accept → mocked /api/report → the app pushes to the report page.
    await page.getByRole('button', { name: /yes, prepare my report/i }).click()
    await page.waitForURL('**/report**')
    await expect(page).toHaveURL(/\/report/)
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
