/**
 * @vitest-environment node
 */
// End-to-end proof that the mojibake P0 is fixed: render a report whose patient name
// and free-text are in CJK, Cyrillic, Arabic, and Devanagari through the real headless
// Chromium pipeline, extract the PDF's text layer, and assert the scripts survive intact
// (jsPDF's Latin-1 helvetica turned these into mojibake / '?').
//
// Requires a local Chromium: `npx playwright install chromium`.
import { describe, it, expect, vi } from 'vitest'
import { PDFParse } from 'pdf-parse'
import { buildReportHtml } from '@/lib/reportHtml'
import type { ReportData } from '@/types'

// `server-only`'s default export throws outside an RSC bundle (it only no-ops under the
// 'react-server' condition, which vitest doesn't set). Stub it so we can import the
// renderer here (vi.mock is hoisted above imports). Does not affect the real build guard.
vi.mock('server-only', () => ({}))
import { renderReportPdf } from '@/lib/renderReportPdf'

const report: ReportData = {
  chief_complaint: 'Chest pain',
  symptoms: [],
  associated_symptoms: { fever: false, nausea: false, fatigue: false, dizziness: false, appetite_loss: false },
  medications: [],
  allergies: ['ペニシリン'], // Japanese: penicillin
  conditions: [],
  history: '',
  lifestyle: { smoker: false, alcohol: false, recent_travel: false },
  family_history: '',
  additional_notes: '',
  possible_conditions: [],
}

describe('renderReportPdf (headless Chromium)', () => {
  it(
    'renders non-Latin patient name and free-text without mojibake',
    async () => {
      const name = '王伟 · Раиса Ковалёва · أحمد · अजय'
      const html = buildReportHtml(report, 'RID-INT-1', {
        name,
        language: 'Test',
        visitType: 'Symptom Intake',
      })

      const bytes = await renderReportPdf(html)
      expect(bytes.byteLength).toBeGreaterThan(1000) // a real PDF, not empty

      const { text } = await new PDFParse({ data: bytes }).getText()
      const norm = text.normalize('NFKC')

      // Order-stable scripts: the exact string must survive into the text layer.
      expect(norm).toContain('王伟')          // CJK
      expect(norm).toContain('Раиса')          // Cyrillic
      expect(norm).toContain('ペニシリン')      // non-Latin free-text (allergy)

      // Complex scripts (RTL / reordering): PDF text extraction may reorder glyphs or
      // emit presentation forms, so an exact logical substring is unreliable. Assert the
      // script's codepoints reached the text layer — the anti-mojibake proof — since the
      // name is the document's only Arabic/Devanagari text.
      expect(norm).toMatch(/[؀-ۿﭐ-﷿ﹰ-﻿]/) // Arabic
      expect(norm).toMatch(/[ऀ-ॿ]/)                          // Devanagari

      // The mojibake signatures must be absent: no replacement char, and the name did
      // not collapse to Latin '?' filler the way jsPDF's Latin-1 font produced.
      expect(norm).not.toContain('�')
    },
    60_000, // allow for cold browser launch
  )
})
