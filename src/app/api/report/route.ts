// API key loaded from environment — never hardcode
import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { checkRateLimit, checkIpRateLimit } from '@/lib/rateLimit'
import { getClientIp, hashIp } from '@/lib/clientIp'
import { isAllowedChatLanguage } from '@/lib/languages'
import { logger } from '@/lib/logger'

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

const REPORT_SCHEMA = `{
  "chief_complaint": "short English summary of the main reason for visit",
  "clinical_symptoms_summary": "bullet-style clinical English summary of all reported symptoms — use medical terminology, not patient verbatim quotes",
  "symptoms": [{"location": "", "severity": 0, "duration": "", "character": "", "onset": "", "modifiers": ""}],
  "associated_symptoms": {"fever": false, "nausea": false, "fatigue": false, "dizziness": false, "appetite_loss": false},
  "medications": [{"name": "", "dosage": "", "frequency": ""}],
  "allergies": ["string"],
  "conditions": ["string"],
  "history": "string",
  "lifestyle": {"smoker": false, "alcohol": false, "recent_travel": false},
  "family_history": "string",
  "lmp": null,
  "additional_notes": "string",
  "possible_conditions": [
    {"condition": "", "reasoning": "brief reasoning considering patient age, sex, and symptom pattern"}
  ]
}`

const reportDataSchema = z.object({
  chief_complaint: z.string().trim().default('Not reported').catch('Not reported'),
  clinical_symptoms_summary: z.string().trim().default('Not reported').catch('Not reported'),
  symptoms: z.array(z.object({
    location: z.string().trim().default('Not reported').catch('Not reported'),
    severity: z.coerce.number().min(0).max(10).default(0).catch(0),
    duration: z.string().trim().default('Not reported').catch('Not reported'),
    character: z.string().trim().default('Not reported').catch('Not reported'),
    onset: z.string().trim().default('Not reported').catch('Not reported'),
    modifiers: z.string().trim().default('Not reported').catch('Not reported'),
  })).default([]).catch([]),
  associated_symptoms: z.object({
    fever: z.boolean().default(false).catch(false),
    nausea: z.boolean().default(false).catch(false),
    fatigue: z.boolean().default(false).catch(false),
    dizziness: z.boolean().default(false).catch(false),
    appetite_loss: z.boolean().default(false).catch(false),
  }).default({ fever: false, nausea: false, fatigue: false, dizziness: false, appetite_loss: false }).catch({
    fever: false,
    nausea: false,
    fatigue: false,
    dizziness: false,
    appetite_loss: false,
  }),
  medications: z.array(z.object({
    name: z.string().trim().default('Not reported').catch('Not reported'),
    dosage: z.string().trim().default('Not reported').catch('Not reported'),
    frequency: z.string().trim().default('Not reported').catch('Not reported'),
  })).default([]).catch([]),
  allergies: z.array(z.string().trim()).default([]).catch([]),
  conditions: z.array(z.string().trim()).default([]).catch([]),
  history: z.string().trim().default('Not reported').catch('Not reported'),
  lifestyle: z.object({
    smoker: z.boolean().default(false).catch(false),
    alcohol: z.boolean().default(false).catch(false),
    recent_travel: z.boolean().default(false).catch(false),
  }).default({ smoker: false, alcohol: false, recent_travel: false }).catch({
    smoker: false,
    alcohol: false,
    recent_travel: false,
  }),
  family_history: z.string().trim().default('Not reported').catch('Not reported'),
  lmp: z.string().nullable().default(null).catch(null),
  additional_notes: z.string().trim().default('Not reported').catch('Not reported'),
  possible_conditions: z.array(z.object({
    condition: z.string().trim().default('Not reported').catch('Not reported'),
    reasoning: z.string().trim().default('Not reported').catch('Not reported'),
  })).default([]).catch([]).transform(items => items.slice(0, 4)),
})

function generateReportId(): string {
  const year = new Date().getFullYear()
  const array = new Uint32Array(1)
  crypto.getRandomValues(array)
  const rand = String((array[0] % 90000) + 10000).padStart(5, '0')
  return `KR-${year}-${rand}`
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      logger.warn('auth_failure', '/api/report')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const ipHash = await hashIp(getClientIp(request))
    const [userLimit, ipLimit] = await Promise.all([
      checkRateLimit(user.id, 'report', supabase),
      checkIpRateLimit(ipHash, 'report', supabase),
    ])
    if (!userLimit.allowed || !ipLimit.allowed) {
      logger.warn('rate_limit_hit', '/api/report', user.id)
      return NextResponse.json(
        { error: 'Please wait a moment before continuing.' },
        { status: 429 }
      )
    }

    const { messages, language, sessionId, patientProfile } = await request.json()

    // Guard the conversation payload before it reaches Claude / .map()
    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json({ error: 'No conversation to summarize' }, { status: 400 })
    }
    if (messages.length > 100) {
      return NextResponse.json({ error: 'Too many messages' }, { status: 400 })
    }
    for (const msg of messages) {
      if (typeof msg?.content === 'string' && msg.content.length > 4000) {
        return NextResponse.json({ error: 'Message too long' }, { status: 400 })
      }
    }

    // Sanitize language — prevent prompt injection via language parameter
    const sanitizedLanguage = typeof language === 'string'
      ? language.replace(/[\n\r\t]/g, '').replace(/[^\w\s\u0080-\uFFFF]/g, '').trim().slice(0, 50)
      : ''
    if (!sanitizedLanguage || !isAllowedChatLanguage(sanitizedLanguage)) {
      return NextResponse.json({ error: 'Invalid language' }, { status: 400 })
    }

    const patientContext = patientProfile && typeof patientProfile === 'object'
      ? `
Patient profile (include in report context):
- Name: ${String(patientProfile.fullName || 'Not provided').slice(0, 100)}
- DOB: ${String(patientProfile.dateOfBirth || 'Not provided').slice(0, 20)}
- Age: ${patientProfile.age ?? 'derive from DOB'}
- Sex: ${String(patientProfile.biologicalSex || 'Not provided')}
- Known conditions/allergies: ${String(patientProfile.chronicConditions || 'None reported').slice(0, 500)}
`
      : ''

    const systemPrompt = `You are Kai's physician-facing medical intake summarizer for Keiro.
You convert a patient conversation into a concise English intake report for US doctors.
${patientContext}
The patient may have spoken ${sanitizedLanguage}. Translate all patient-provided content into clear clinical English.
Express symptoms in clinical language (e.g. "substernal chest pain" not "it hurts in my chest").
Include possible differentials that account for patient age, sex, and symptom pattern.
Return ONLY valid JSON. Do not include markdown, code fences, or explanatory text.
Do not diagnose or recommend treatment. Possible conditions are only conditions that can commonly present with the reported symptoms, for physician reference.
Use "Not reported" for unknown free-text fields, empty arrays for unknown lists, and false for unreported boolean symptoms.
Maximum 4 possible conditions.`
    const reportPrompt = `Generate the complete patient intake report in English using exactly this JSON shape:
${REPORT_SCHEMA}`

    const response = await anthropic.messages.create({
      model: 'claude-haiku-4-5',
      max_tokens: 2000,
      system: systemPrompt,
      messages: [
        ...messages.map((m: { role: string; content: string }) => ({
          role: (m.role === 'kai' ? 'assistant' : 'user') as 'user' | 'assistant',
          content: m.content,
        })),
        { role: 'user' as const, content: reportPrompt },
      ],
    })

    const content = response.content[0]
    if (content.type !== 'text') {
      throw new Error('Unexpected response type')
    }

    const jsonMatch = content.text.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      throw new Error('No JSON found in response')
    }

    const reportData = reportDataSchema.parse(JSON.parse(jsonMatch[0]))
    const reportId = generateReportId()

    const profile = patientProfile && typeof patientProfile === 'object' ? patientProfile : null

    const { error: insertError } = await supabase.from('reports').insert({
      session_id: sessionId || null,
      user_id: user.id,
      report_id: reportId,
      patient_name: profile?.fullName ? String(profile.fullName).slice(0, 200) : null,
      patient_age: typeof profile?.age === 'number' ? profile.age : null,
      patient_dob: profile?.dateOfBirth ? String(profile.dateOfBirth).slice(0, 20) : null,
      patient_sex: profile?.biologicalSex ? String(profile.biologicalSex) : null,
      language_used: sanitizedLanguage,
      visit_type: 'symptom_intake',
      chief_complaint: reportData.chief_complaint,
      clinical_symptoms_summary: reportData.clinical_symptoms_summary,
      symptoms_json: reportData.symptoms,
      associated_symptoms_json: reportData.associated_symptoms,
      lifestyle_json: reportData.lifestyle,
      medications_json: reportData.medications,
      conditions_json: reportData.conditions,
      family_history_json: reportData.family_history || reportData.history || null,
      allergies_json: reportData.allergies,
      possible_conditions_json: reportData.possible_conditions,
      additional_notes: reportData.additional_notes,
    })

    if (insertError) {
      logger.error('db_insert_error', '/api/report', user.id, {
        message: insertError.message,
      })
    }

    logger.info('report_generated', '/api/report', user.id, {
      reportId,
      savedToDb: !insertError,
    })

    return NextResponse.json({
      reportId,
      reportData,
      savedToDb: !insertError,
      patientProfile: profile,
    })
  } catch (err) {
    logger.error('api_error', '/api/report', undefined, {
      message: err instanceof Error ? err.message : 'unknown',
    })
    return NextResponse.json({ error: 'Report generation failed' }, { status: 500 })
  }
}

const consultTranscriptItemSchema = z.object({
  id: z.string().optional(),
  side: z.enum(['doctor', 'patient']),
  original: z.string().max(2000),
  translation: z.string().max(2000),
  timestamp: z.string().optional(),
})
const consultTranscriptSchema = z.array(consultTranscriptItemSchema).max(200)

export async function PATCH(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const ipHash = await hashIp(getClientIp(request))
    const [userLimit, ipLimit] = await Promise.all([
      checkRateLimit(user.id, 'report_patch', supabase),
      checkIpRateLimit(ipHash, 'report_patch', supabase),
    ])
    if (!userLimit.allowed || !ipLimit.allowed) {
      return NextResponse.json(
        { error: 'Please wait a moment before continuing.' },
        { status: 429 }
      )
    }

    const body = await request.json()
    const { reportId, physicianNotes, consultTranscript } = body

    if (!reportId || typeof reportId !== 'string') {
      return NextResponse.json({ error: 'Missing reportId' }, { status: 400 })
    }

    const updates: Record<string, unknown> = {}
    if (typeof physicianNotes === 'string') {
      updates.physician_notes = physicianNotes.slice(0, 8000)
    }
    if (consultTranscript !== undefined) {
      const parsed = consultTranscriptSchema.safeParse(consultTranscript)
      if (!parsed.success) {
        return NextResponse.json({ error: 'Invalid transcript format' }, { status: 400 })
      }
      updates.consult_transcript_json = parsed.data
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ error: 'Nothing to update' }, { status: 400 })
    }

    const { error } = await supabase
      .from('reports')
      .update(updates)
      .eq('report_id', reportId)
      .eq('user_id', user.id)

    if (error) {
      return NextResponse.json({ error: 'Update failed' }, { status: 500 })
    }

    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: 'Update failed' }, { status: 500 })
  }
}