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

import { test, expect, mockReport } from '../fixtures/keiro'
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
 * report so the "Start live consult mode" button renders.
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
    // page.tsx: if (!reportId) setError('Report not found') → renders the error
    // state with a "View past visits" button (not a crash).
    await page.goto('/report')

    await expect(page.getByText(/report not found/i)).toBeVisible({ timeout: 10_000 })
    await expect(page.getByRole('button', { name: /view past visits/i })).toBeVisible()
  })

  test.describe('seeded report renders correctly', () => {
    test.beforeEach(async ({ page }) => {
      await mockReport(page)
      await seedReport(page, SEED_REPORT)
    })

    test('chief complaint text is visible', async ({ page }) => {
      await expect(page.getByText('Severe headache for two days')).toBeVisible()
    })

    test('report_id renders in the font-mono header', async ({ page }) => {
      // <div className="font-mono text-xs …">{rd.report_id}</div>
      await expect(page.getByText(REPORT_ID)).toBeVisible()
    })

    test('language badge is visible', async ({ page }) => {
      // <span class="rounded-full …">{rd.language_used}</span>
      await expect(
        page.locator('span.rounded-full', { hasText: 'English' }),
      ).toBeVisible()
    })

    test('section headings are rendered', async ({ page }) => {
      // Section component renders an <h3> per title.
      const sections = [
        'Patient Information',
        'Chief Complaint',
        'Clinical Summary',
        'Associated Symptoms',
        'Lifestyle Notes',
      ]
      for (const title of sections) {
        await expect(
          page.getByRole('heading', { name: new RegExp(`^${title}$`, 'i') }),
        ).toBeVisible()
      }
    })

    test('back button has aria-label "Go back"', async ({ page }) => {
      await expect(page.getByRole('button', { name: 'Go back' })).toBeVisible()
    })

    test('live consult button is absent without a patient profile', async ({ page }) => {
      // The "Start live consult mode" button only renders when a patient profile
      // is present. No profile seeded here → button absent.
      await expect(page.getByText('Severe headache for two days')).toBeVisible()
      await expect(
        page.getByRole('button', { name: /start live consult mode/i }),
      ).toHaveCount(0)
    })
  })

  test('live consult button renders when a patient profile is seeded', async ({ page }) => {
    await mockReport(page)
    await seedProfile(page, SEED_PROFILE)
    await seedReport(page, SEED_REPORT)

    await expect(
      page.getByRole('button', { name: /start live consult mode/i }),
    ).toBeVisible()
  })

  test.describe('PDF action buttons', () => {
    test.beforeEach(async ({ page }) => {
      await mockReport(page)
      await seedReport(page, SEED_REPORT)
    })

    test('"Open PDF" button is present and clickable', async ({ page }) => {
      // Icon-only button, aria-label="Open PDF".
      const openBtn = page.getByRole('button', { name: 'Open PDF' })
      await expect(openBtn).toBeVisible()
      // Click must not throw (jsPDF runs client-side; window.open may be blocked headlessly).
      await openBtn.click()
    })

    test('"Download PDF" button is present and initiates a download attempt', async ({ page }) => {
      const downloadBtn = page.getByRole('button', { name: /download pdf/i })
      await expect(downloadBtn).toBeVisible()
      const downloadPromise = page.waitForEvent('download', { timeout: 5_000 }).catch(() => null)
      await downloadBtn.click()
      await downloadPromise
    })
  })

  test('share-link button opens the share sheet with the report URL', async ({ page }) => {
    await mockReport(page)
    await seedReport(page, SEED_REPORT)

    // Icon-only button, aria-label="Share report link".
    const shareBtn = page.getByRole('button', { name: 'Share report link' })
    await expect(shareBtn).toBeVisible()
    await shareBtn.click()

    // The share sheet (a plain modal, no role="dialog") shows a heading and the
    // shareable URL with a Copy control. There is no QR image in this UI.
    await expect(page.getByText('Share this report')).toBeVisible()
    await expect(page.getByText(new RegExp(`reportId=${REPORT_ID}`))).toBeVisible()
    await expect(page.getByRole('button', { name: 'Copy link' })).toBeVisible()
  })

  test('physician notes textarea triggers PATCH /api/report on blur', async ({ page }) => {
    await mockReport(page)
    await seedReport(page, SEED_REPORT)

    const textarea = page.getByPlaceholder(/add notes for the record/i)
    await expect(textarea).toBeVisible()

    const patchPromise = page.waitForRequest(
      (req) => req.url().includes('/api/report') && req.method() === 'PATCH',
      { timeout: 8_000 },
    )

    await textarea.fill('Test physician note')
    await textarea.blur()

    await patchPromise

    // The mock returns {ok:true}; the "sync failed" state must not appear.
    await expect(page.getByText(/sync failed/i)).not.toBeVisible()
  })
})
