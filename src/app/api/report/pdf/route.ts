import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { checkRateLimit, checkIpRateLimit } from '@/lib/rateLimit'
import { getClientIp, hashIp } from '@/lib/clientIp'
import { logger } from '@/lib/logger'
import { buildReportHtml } from '@/lib/reportHtml'
import { renderReportPdf } from '@/lib/renderReportPdf'
import type { ReportData } from '@/types'

// Headless Chromium needs the Node runtime (not edge). PDF rendering can outrun the
// default cap on a cold start, so give it room.
export const runtime = 'nodejs'
export const maxDuration = 60

// The report is the user's own, already-rendered on the page; we validate the shape so a
// malformed payload can't crash the renderer. All values are HTML-escaped downstream.
const symptomSchema = z.object({
  location: z.string().catch(''),
  severity: z.coerce.number().catch(0),
  duration: z.string().catch(''),
  character: z.string().catch(''),
  onset: z.string().catch(''),
  modifiers: z.string().catch(''),
}).partial()

const reportDataSchema = z.object({
  chief_complaint: z.string().catch(''),
  clinical_symptoms_summary: z.string().optional(),
  symptoms: z.array(symptomSchema).catch([]),
  associated_symptoms: z.object({
    fever: z.boolean(), nausea: z.boolean(), fatigue: z.boolean(), dizziness: z.boolean(), appetite_loss: z.boolean(),
  }).partial().catch({}),
  medications: z.array(z.object({ name: z.string(), dosage: z.string(), frequency: z.string() }).partial()).catch([]),
  allergies: z.array(z.string()).catch([]),
  conditions: z.array(z.string()).catch([]),
  history: z.string().catch(''),
  lifestyle: z.object({ smoker: z.boolean(), alcohol: z.boolean(), recent_travel: z.boolean() }).partial().catch({}),
  family_history: z.string().catch(''),
  additional_notes: z.string().catch(''),
  possible_conditions: z.array(z.object({ condition: z.string(), reasoning: z.string() }).partial()).catch([]),
}).passthrough()

const bodySchema = z.object({
  reportId: z.string().min(1).max(200),
  reportData: reportDataSchema,
  patientInfo: z.object({
    name: z.string().max(300).optional(),
    age: z.number().optional(),
    dob: z.string().max(100).optional(),
    sex: z.string().max(100).optional(),
    language: z.string().max(100).default(''),
    visitType: z.string().max(200).default('Symptom Intake'),
    knownConditions: z.string().max(2000).optional(),
  }),
  hospitalName: z.string().max(300).optional(),
  physicianNotes: z.string().max(20000).optional(),
})

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const ipHash = await hashIp(getClientIp(request))
    const [userLimit, ipLimit] = await Promise.all([
      checkRateLimit(user.id, 'report_pdf', supabase),
      checkIpRateLimit(ipHash, 'report_pdf', supabase),
    ])
    if (!userLimit.allowed || !ipLimit.allowed) {
      return NextResponse.json({ error: 'Too many PDF requests. Please try again later.' }, { status: 429 })
    }

    const json = await request.json().catch(() => null)
    const parsed = bodySchema.safeParse(json)
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
    }
    const { reportId, reportData, patientInfo, hospitalName, physicianNotes } = parsed.data

    const html = buildReportHtml(reportData as ReportData, reportId, patientInfo, hospitalName, physicianNotes)
    const pdf = await renderReportPdf(html)

    return new NextResponse(pdf as unknown as BodyInit, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `inline; filename="Keiro-Report-${reportId}.pdf"`,
        'Cache-Control': 'no-store',
      },
    })
  } catch (err) {
    logger.error('report_pdf_failed', '/api/report/pdf', null, {
      error: err instanceof Error ? err.message : String(err),
    })
    return NextResponse.json({ error: 'PDF generation failed' }, { status: 500 })
  }
}
