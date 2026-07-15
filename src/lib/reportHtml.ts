import { ReportData } from '@/types'

/**
 * Build the doctor-facing report as a self-contained HTML document, to be rendered
 * to PDF by headless Chromium (see renderReportPdf).
 *
 * Why HTML instead of jsPDF: jsPDF has no text-shaping engine and its built-in fonts
 * are Latin-1, so any non-Latin patient name or free-text (CJK, Arabic, Devanagari,
 * Cyrillic) came out as mojibake. Chromium uses a real text stack (HarfBuzz), so the
 * same content renders correctly for every script, including RTL, as long as a font
 * covering that script is available to the browser.
 *
 * The report body is intentionally English (Kai summarizes into English for the
 * clinician); the non-Latin vector is verbatim patient text — chiefly the name, and
 * any free-text the patient typed (allergies, known conditions). Those values are
 * wrapped in `dir="auto"` so the browser bidi algorithm lays them out correctly, and
 * HTML-escaped so a value like `<b>` or `&` can never break the markup or inject nodes.
 */

export interface ReportPatientInfo {
  name?: string
  age?: number
  dob?: string
  sex?: string
  language: string
  visitType: string
  knownConditions?: string
}

const ESCAPE_MAP: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;',
}

/** Escape a dynamic value for safe interpolation into HTML text or an attribute. */
function esc(value: unknown): string {
  return String(value ?? '').replace(/[&<>"']/g, ch => ESCAPE_MAP[ch])
}

/** A value cell that may hold patient text in any script/direction. */
function userText(value: string | undefined | null, fallback = '—'): string {
  const v = (value ?? '').trim()
  if (!v) return `<span class="muted">${esc(fallback)}</span>`
  return `<span dir="auto">${esc(v)}</span>`
}

export function buildReportHtml(
  reportData: ReportData,
  reportId: string,
  patientInfo: ReportPatientInfo,
  hospitalName?: string,
  physicianNotes?: string,
): string {
  const generatedDate = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
  const generatedFull = new Date().toLocaleString()

  const row = (label: string, value: string | undefined | null, fallback = '—') =>
    `<div class="row"><div class="row-label">${esc(label)}</div><div class="row-value">${userText(value, fallback)}</div></div>`

  const section = (title: string, body: string) =>
    `<section class="block"><h2 class="section-head">${esc(title)}</h2>${body}</section>`

  // Patient summary
  const summary = [
    row('Name', patientInfo.name, 'Not provided'),
    row('Date of Birth', patientInfo.dob, 'Not provided'),
    row('Age', patientInfo.age ? `${patientInfo.age} years` : '', 'Not provided'),
    row('Sex', patientInfo.sex, 'Not provided'),
    patientInfo.knownConditions ? row('Known Conditions', patientInfo.knownConditions) : '',
    row('Patient Language', patientInfo.language),
    row('Report Language', 'English'),
    row('Visit Type', patientInfo.visitType),
    row('Report Generated', generatedFull),
  ].join('')

  // Symptoms
  const symptomsBody = reportData.symptoms?.length
    ? reportData.symptoms
        .map((s, i) => {
          const rows = [
            s.location ? row('Location', s.location) : '',
            s.severity ? row('Severity', `${esc(String(s.severity))}/10`) : '',
            s.duration ? row('Duration', s.duration) : '',
            s.character ? row('Character', s.character) : '',
            s.onset ? row('Onset', s.onset) : '',
            s.modifiers ? row('Modifiers', s.modifiers) : '',
          ].join('')
          return `<div class="sub"><h3 class="sub-head">Symptom ${i + 1}</h3>${rows}</div>`
        })
        .join('')
    : ''

  // Associated symptoms
  let associatedBody = ''
  if (reportData.associated_symptoms) {
    const as = reportData.associated_symptoms
    const present: string[] = []
    const absent: string[] = []
    const flag = (v: boolean | undefined, label: string) => {
      if (v !== undefined) (v ? present : absent).push(label)
    }
    flag(as.fever, 'Fever')
    flag(as.nausea, 'Nausea/Vomiting')
    flag(as.fatigue, 'Fatigue')
    flag(as.dizziness, 'Dizziness')
    flag(as.appetite_loss, 'Appetite Loss')
    associatedBody =
      (present.length ? row('Present', present.join(', ')) : '') +
      (absent.length ? row('Denied', absent.join(', ')) : '')
  }

  // Lifestyle
  let lifestyleBody = ''
  if (reportData.lifestyle) {
    const ls = reportData.lifestyle
    const yn = (v: boolean | undefined, label: string) =>
      v !== undefined ? row(label, v ? 'Yes' : 'No') : ''
    lifestyleBody = yn(ls.smoker, 'Tobacco Use') + yn(ls.alcohol, 'Alcohol Use') + yn(ls.recent_travel, 'Recent Travel')
  }

  // Medications
  const medsBody = reportData.medications?.length
    ? reportData.medications
        .map(m => row(m.name || '—', `${m.dosage || '—'} · ${m.frequency || '—'}`))
        .join('')
    : ''

  // Possible differentials
  const differentialsBody = reportData.possible_conditions?.length
    ? `<p class="ref-note">For physician reference only — not a diagnosis</p>` +
      reportData.possible_conditions
        .map((pc, i) => `<div class="sub"><h3 class="sub-head">${i + 1}. ${esc(pc.condition)}</h3><p class="para">${userText(pc.reasoning)}</p></div>`)
        .join('')
    : ''

  const body = [
    section('Patient Summary', summary),
    section('Chief Complaint', `<p class="para">${userText(reportData.chief_complaint)}</p>`),
    reportData.clinical_symptoms_summary && reportData.clinical_symptoms_summary !== 'Not reported'
      ? section('Clinical Symptom Summary', `<p class="para">${userText(reportData.clinical_symptoms_summary)}</p>`)
      : '',
    symptomsBody ? section('Symptoms — Detailed', symptomsBody) : '',
    associatedBody ? section('Associated Symptoms', associatedBody) : '',
    lifestyleBody ? section('Lifestyle Notes', lifestyleBody) : '',
    medsBody ? section('Current Medications', medsBody) : '',
    section(
      'Known Conditions & History',
      row('Conditions', reportData.conditions?.length ? reportData.conditions.join(', ') : '', 'None reported') +
        (reportData.history ? row('History', reportData.history) : ''),
    ),
    reportData.family_history ? section('Family History', `<p class="para">${userText(reportData.family_history)}</p>`) : '',
    section('Allergies', `<p class="para">${userText(reportData.allergies?.length ? reportData.allergies.join(', ') : '', 'No known allergies')}</p>`),
    differentialsBody ? section('Possible Differentials — Physician Reference', `<div class="ref-box">${differentialsBody}</div>`) : '',
  ].join('')

  const footerHospital = hospitalName ? ` · ${esc(hospitalName)}` : ''

  // Self-contained: all CSS inline, no external requests (works under a strict CSP and
  // offline in the render sandbox). `dir="auto"` cells above carry RTL/LTR correctly.
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<style>
  :root { --green: #1a3d2b; --ink: #0f2419; --muted: #64826e; --amber: #f4a535; --surface: #edfaf4; }
  * { box-sizing: border-box; }
  @page { size: A4; margin: 14mm 14mm 18mm; }
  html { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
  body {
    margin: 0; color: var(--ink);
    font-family: "Noto Sans", "Noto Sans CJK SC", "Noto Sans Arabic", "Noto Sans Devanagari", "Noto Sans Hebrew",
      -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif;
    font-size: 11px; line-height: 1.5;
  }
  .header { background: var(--green); color: #fff; padding: 12px 16px; display: flex; justify-content: space-between; align-items: flex-start; }
  .header h1 { margin: 0; font-size: 16px; letter-spacing: .02em; }
  .header .sub { font-size: 8.5px; opacity: .9; margin-top: 2px; }
  .header .meta { text-align: right; font-size: 8.5px; opacity: .95; }
  .body { padding: 14px 2px; }
  .block { margin-bottom: 12px; break-inside: avoid; }
  .section-head { background: var(--green); color: #fff; font-size: 9px; text-transform: uppercase; letter-spacing: .04em; margin: 0 0 6px; padding: 4px 8px; border-radius: 2px; }
  .row { display: flex; gap: 10px; padding: 1.5px 0; }
  .row-label { width: 130px; flex: none; color: var(--muted); font-weight: 600; }
  .row-value { flex: 1; }
  .para { margin: 0; }
  .sub { margin: 4px 0 8px; }
  .sub-head { color: var(--green); font-size: 10px; margin: 0 0 3px; }
  .muted { color: var(--muted); }
  .ref-box { border: 1px solid var(--amber); background: #fff8e1; border-radius: 3px; padding: 8px 10px; }
  .ref-note { color: #78500a; font-style: italic; margin: 0 0 6px; font-size: 9px; }
  .disclaimer { border: 1px solid var(--amber); background: #fff5dc; border-radius: 4px; padding: 10px 12px; color: #78500a; margin-top: 6px; }
  .disclaimer strong { display: block; margin-bottom: 4px; letter-spacing: .03em; }
  .notes-page { break-before: page; }
  .notes-lines { border: 1px solid var(--surface); background: var(--surface); height: 70mm; border-radius: 3px; }
  .footer { color: var(--muted); font-size: 8px; text-align: center; margin-top: 10px; }
</style>
</head>
<body>
  <div class="header">
    <div>
      <h1>KEIRO HEALTH REPORT</h1>
      <div class="sub">Generated by Kai — AI-assisted intake for clinician review</div>
    </div>
    <div class="meta">${esc(generatedDate)}<br>Report ID: ${esc(reportId)}</div>
  </div>
  <div class="body">
    ${body}
    <div class="disclaimer">
      <strong>AI-GENERATED INTAKE SUMMARY</strong>
      This report was generated from a patient conversation to assist communication only.
      It does not constitute medical advice, clinical assessment, or diagnosis.
      All information must be verified directly with the patient by a licensed physician.
      Keiro is not a medical provider.
    </div>
    <section class="block notes-page">
      <h2 class="section-head">Physician Notes</h2>
      ${physicianNotes?.trim() ? `<p class="para">${userText(physicianNotes)}</p>` : `<div class="notes-lines"></div>`}
    </section>
    <div class="footer">Generated by Kai for Keiro — Not a medical diagnosis — Report ID: ${esc(reportId)}${footerHospital}</div>
  </div>
</body>
</html>`
}
