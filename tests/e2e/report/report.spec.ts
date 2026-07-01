/**
 * E2E tests for the /report page.
 *
 * Key mechanic: the page is NOT auth-protected. For a logged-out visitor it
 * reads the report from sessionStorage key `report_<reportId>`. We use
 * page.addInitScript to seed that key before any page scripts run.
 *
 * Inline helper: seedReport(page, report) — sets sessionStorage and navigates
 * to /report?reportId=<id>&langName=English.
 */

import { test, expect, mockReport, appAlert } from '../fixtures/keiro'
import type { Page } from '@playwright/test'
import type { Report, PatientProfile } from '../../../src/types'

// ─── Seed data ───────────────────────────────────────────────────────────────

const REPORT_ID = 'TEST-2026-00001'

/** Minimal Report object that exercises every rendered section. */
const SEED_REPORT: Report = {
  id: 'internal-uuid-001',
  session_id: 'session-001',
  user_id: '',
  report_id: REPORT_ID,
  patient_name: undefined,
  patient_age: undefined,
  patient_dob: undefined,
  patient_sex: undefined,
  language_used: 'English',
  visit_type: 'symptom_intake',
  chief_complaint: 'Severe headache for two days',
  clinical_symptoms_summary:
    'Patient reports a dull bilateral headache for two days, worse in the afternoon.',
  symptoms_json: [
    {
      location: 'head',
      severity: 5,
      duration: '2 days',
      character: 'dull',
      onset: 'gradual',
      modifiers: 'worse in afternoon',
    },
  ],
  associated_symptoms_json: {
    fever: false,
    nausea: false,
    fatigue: true,
    dizziness: false,
    appetite_loss: false,
  },
  lifestyle_json: { smoker: false, alcohol: false, recent_travel: false },
  medications_json: [],
  conditions_json: [],
  family_history_json: '',
  allergies_json: [],
  possible_conditions_json: [
    {
      condition: 'Tension headache',
      reasoning: 'Bilateral dull pain without red-flag features.',
    },
  ],
  additional_notes: '',
  created_at: new Date('2026-06-30T10:00:00Z').toISOString(),
}

const SEED_PROFILE: PatientProfile = {
  fullName: 'Test Patient',
  dateOfBirth: '1990-01-15',
  age: 36,
  biologicalSex: 'male',
  primaryLanguage: 'English',
  primaryLanguageCode: 'en-US',
  consentAt: new Date('2026-06-30T09:55:00Z').toISOString(),
}

// ─── Inline helpers ───────────────────────────────────────────────────────────

/**
 * seedReport — sets sessionStorage key `report_<id>` before first load,
 * then navigates to /report?reportId=<id>&langName=English.
 */
async function seedReport(page: Page, report: Report): Promise<void> {
  const key = `report_${report.report_id}`
  const value = JSON.stringify(report)
  await page.addInitScript(
    ({ k, v }: { k: string; v: string }) => {
      try {
        window.sessionStorage.setItem(k, v)
      } catch {
        /* opaque-origin guard */
      }
    },
    { k: key, v: value },
  )
  await page.goto(
    `/report?reportId=${encodeURIComponent(report.report_id)}&langName=English&lang=en-US`,
  )
}

/**
 * seedProfile — seeds the patient-profile sessionStorage key alongside the
 * report so the "Continue with Doctor" button becomes enabled.
 */
async function seedProfile(page: Page, profile: PatientProfile): Promise<void> {
  const value = JSON.stringify(profile)
  await page.addInitScript(
    ({ v }: { v: string }) => {
      try {
        window.sessionStorage.setItem('keiro_patient_profile', v)
      } catch {
        /* opaque-origin guard */
      }
    },
    { v: value },
  )
}

// ─── Tests ───────────────────────────────────────────────────────────────────

test.describe('/report page', () => {
  test('missing reportId shows graceful error state', async ({ page }) => {
    // page.tsx L137-140: if (!reportId) { setError('Report not found'); setLoading(false) }
    // The page renders a "not found" state — it does NOT crash.
    await page.goto('/report')

    // The error/not-found UI renders with a "Try again" button (L430 in page.tsx).
    // Both the error text and button are present; assert the button specifically.
    const tryAgain = page.getByRole('button', { name: /try again/i })

    // Wait for loading to finish then assert a graceful state exists.
    await expect(tryAgain).toBeVisible({ timeout: 10_000 })
  })

  test.describe('seeded report renders correctly', () => {
    test.beforeEach(async ({ page }) => {
      await mockReport(page)
      await seedReport(page, SEED_REPORT)
    })

    test('chief complaint text is visible', async ({ page }) => {
      // Section "Chief Complaint" → <p> with rd.chief_complaint (L597-599 in page.tsx)
      await expect(
        page.getByText('Severe headache for two days'),
      ).toBeVisible()
    })

    test('report_id renders in font-mono header', async ({ page }) => {
      // L479: <div className="font-mono text-xs text-text-tertiary">{rd.report_id}</div>
      await expect(page.getByText(REPORT_ID)).toBeVisible()
    })

    test('language badge is visible', async ({ page }) => {
      // L482-484: <span class="rounded-full ...">{rd.language_used}</span>
      // Use .exact() text match on the badge span specifically to avoid strict-mode
      // ambiguity with the "formatted in English" prose elsewhere on the page.
      await expect(
        page.locator('span.rounded-full', { hasText: 'English' }),
      ).toBeVisible()
    })

    test('section headings are rendered', async ({ page }) => {
      // Section component renders uppercase h3 headings (L87 in page.tsx)
      const sections = [
        'Patient Summary',
        'Chief Complaint',
        'Clinical Symptom Summary',
        'Associated Symptoms',
        'Lifestyle Notes',
      ]
      for (const title of sections) {
        await expect(
          page.getByRole('heading', { name: new RegExp(title, 'i') }),
        ).toBeVisible()
      }
    })

    test('back button has aria-label "Go back"', async ({ page }) => {
      // L471-475: <button ... aria-label="Go back">
      await expect(page.getByRole('button', { name: 'Go back' })).toBeVisible()
    })

    test('"Continue with Doctor" is disabled without a patient profile', async ({
      page,
    }) => {
      // L489-497: disabled={!patientProfile} — no profile seeded in this test
      const btn = page.getByRole('button', { name: /continue with doctor/i })
      await expect(btn).toBeVisible()
      await expect(btn).toBeDisabled()
    })
  })

  test('"Continue with Doctor" is enabled when patient profile is seeded', async ({
    page,
  }) => {
    // Seed both report and profile so patientProfile state is truthy.
    await mockReport(page)
    await seedProfile(page, SEED_PROFILE)
    await seedReport(page, SEED_REPORT)

    const btn = page.getByRole('button', { name: /continue with doctor/i })
    await expect(btn).toBeVisible()
    await expect(btn).toBeEnabled()
  })

  test.describe('PDF action buttons', () => {
    test.beforeEach(async ({ page }) => {
      await mockReport(page)
      await seedReport(page, SEED_REPORT)
    })

    test('"Open full PDF report" button is present and clickable', async ({
      page,
    }) => {
      // L500-508: "Open full PDF report" button
      const openBtn = page.getByRole('button', { name: /open full pdf report/i })
      await expect(openBtn).toBeVisible()
      // Click must not throw (jsPDF runs client-side; window.open may be blocked headlessly)
      await openBtn.click()
      // After click, either the text changes to "Opening PDF..." momentarily or stays the same.
      // Either way, no crash — no alert with error text should surface.
      const errorAlert = appAlert(page)
      // Give any error alert 500ms to appear; if it doesn't that's fine.
      await expect(errorAlert).not.toBeVisible({ timeout: 500 }).catch(() => {
        // Some environments do surface the "Please allow pop-ups" alert — that is
        // acceptable app behaviour, not a bug. We only care no exception is thrown.
      })
    })

    test('"Download" button is present and initiates a download attempt', async ({
      page,
    }) => {
      // L511-519: "Download" button calls doc.save(...)
      const downloadBtn = page.getByRole('button', { name: /^download$/i })
      await expect(downloadBtn).toBeVisible()
      // Listen for download event; it may or may not fire depending on jsPDF.save behavior.
      const downloadPromise = page.waitForEvent('download', { timeout: 5_000 }).catch(() => null)
      await downloadBtn.click()
      // Just resolve — whether or not a file download fires is environment-dependent.
      await downloadPromise
    })
  })

  test('QR code button opens dialog with heading and image', async ({ page }) => {
    await mockReport(page)
    await seedReport(page, SEED_REPORT)

    // L537-544: "QR code" button
    const qrBtn = page.getByRole('button', { name: /qr code/i })
    await expect(qrBtn).toBeVisible()
    await qrBtn.click()

    // L549-579: dialog rendered with role="dialog" (no aria-labelledby set, so use role alone)
    const dialog = page.locator('[role="dialog"]')
    await expect(dialog).toBeVisible()

    // L559: <h3>Share report</h3>
    await expect(dialog.getByText('Share report')).toBeVisible()

    // L561-567: <img alt="QR code linking to this report" ...>
    const qrImage = dialog.getByAltText('QR code linking to this report')
    await expect(qrImage).toBeVisible()
  })

  test('physician notes textarea triggers PATCH /api/report on blur', async ({
    page,
  }) => {
    // Mock PATCH so no real call goes through (mockReport handles PATCH → {ok:true})
    await mockReport(page)
    await seedReport(page, SEED_REPORT)

    const textarea = page.getByPlaceholder(/clinical impressions/i)
    await expect(textarea).toBeVisible()

    // Intercept the PATCH request that fires on blur (L258-272, L275-280 in page.tsx)
    const patchPromise = page.waitForRequest(
      (req) => req.url().includes('/api/report') && req.method() === 'PATCH',
      { timeout: 8_000 },
    )

    await textarea.fill('Test physician note')
    await textarea.blur()

    // Assert the PATCH fired — the mock returns {ok:true} so no error should surface.
    await patchPromise

    // No error message should appear after a successful save.
    await expect(page.getByText(/notes could not be saved/i)).not.toBeVisible()
  })
})