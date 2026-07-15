import { describe, it, expect } from 'vitest'
import { buildReportHtml, type ReportPatientInfo } from '@/lib/reportHtml'
import type { ReportData } from '@/types'

const baseReport: ReportData = {
  chief_complaint: 'Headache for three days',
  clinical_symptoms_summary: 'Throbbing frontal headache, worse in the morning.',
  symptoms: [{ location: 'Forehead', severity: 7, duration: '3 days', character: 'Throbbing', onset: 'Gradual', modifiers: 'Worse with light' }],
  associated_symptoms: { fever: true, nausea: false, fatigue: true, dizziness: false, appetite_loss: false },
  medications: [{ name: 'Paracetamol', dosage: '500mg', frequency: 'twice daily' }],
  allergies: ['Penicillin'],
  conditions: ['Hypertension'],
  history: 'No prior surgeries',
  lifestyle: { smoker: false, alcohol: false, recent_travel: true },
  family_history: 'Father had migraines',
  additional_notes: '',
  possible_conditions: [{ condition: 'Tension headache', reasoning: 'Consistent with bilateral pressure and stress.' }],
}

function htmlFor(name: string, extra?: Partial<ReportPatientInfo>, report: ReportData = baseReport, notes?: string) {
  const patient: ReportPatientInfo = { name, language: 'Test', visitType: 'Symptom Intake', ...extra }
  return buildReportHtml(report, 'RID-123', patient, undefined, notes)
}

describe('buildReportHtml', () => {
  // The core regression: non-Latin patient text must survive verbatim into the HTML
  // (jsPDF + Latin-1 helvetica turned these into mojibake). Chromium then shapes them.
  it.each([
    ['Chinese (CJK)', '王伟'],
    ['Arabic (RTL)', 'أحمد المصري'],
    ['Devanagari', 'अजय शर्मा'],
    ['Cyrillic', 'Раиса Ковалёва'],
    ['Korean', '김민준'],
  ])('preserves a %s patient name verbatim', (_label, name) => {
    const html = htmlFor(name)
    expect(html).toContain(name)
  })

  it('preserves non-Latin free-text (allergies, known conditions)', () => {
    const report: ReportData = { ...baseReport, allergies: ['ペニシリン', 'ブタクサ'] }
    const html = htmlFor('Yuki', { knownConditions: '高血圧' }, report)
    expect(html).toContain('ペニシリン')
    expect(html).toContain('高血圧')
  })

  it('wraps patient values in dir="auto" so RTL lays out correctly', () => {
    const html = htmlFor('أحمد')
    // The name cell must be a dir="auto" span so the browser bidi algorithm applies.
    expect(html).toMatch(/dir="auto"[^>]*>أحمد/)
  })

  it('HTML-escapes dynamic values so markup cannot be injected or broken', () => {
    const html = htmlFor('<script>alert(1)</script> & "co"')
    expect(html).not.toContain('<script>alert(1)</script>')
    expect(html).toContain('&lt;script&gt;alert(1)&lt;/script&gt;')
    expect(html).toContain('&amp;')
    expect(html).toContain('&quot;')
  })

  it('declares the embedded Unicode family with a system fallback chain', () => {
    const html = htmlFor('王伟')
    // 'NotoReport' is the embedded multi-script family (fonts injected at render time).
    expect(html).toMatch(/font-family:\s*"NotoReport"/)
    expect(html).toMatch(/sans-serif/)
  })

  it('renders a well-formed, self-contained document with no external requests', () => {
    const html = htmlFor('Alex Rivera', {}, baseReport, 'Follow up in two weeks.')
    expect(html.startsWith('<!doctype html>')).toBe(true)
    expect(html).toContain('KEIRO HEALTH REPORT')
    expect(html).toContain('Follow up in two weeks.')
    // No external asset references — everything is inline for CSP/offline rendering.
    expect(html).not.toMatch(/https?:\/\//)
    expect(html).not.toMatch(/<link\b|<script\b/)
  })

  it('falls back to placeholders for missing values without crashing', () => {
    const empty: ReportData = {
      chief_complaint: '', symptoms: [], associated_symptoms: { fever: false, nausea: false, fatigue: false, dizziness: false, appetite_loss: false },
      medications: [], allergies: [], conditions: [], history: '', lifestyle: { smoker: false, alcohol: false, recent_travel: false },
      family_history: '', additional_notes: '', possible_conditions: [],
    }
    const html = buildReportHtml(empty, 'RID-0', { language: 'Test', visitType: 'Intake' })
    expect(html).toContain('Not provided') // name fallback
    expect(html).toContain('No known allergies')
  })
})
