// API key loaded from environment — never hardcode
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { checkRateLimit, checkIpRateLimit } from '@/lib/rateLimit'
import { getClientIp, hashIp } from '@/lib/clientIp'
import { isAllowedChatLanguage } from '@/lib/languages'
import { describeLifestyle, parsePatientProfile } from '@/lib/patientProfile'
import { geminiChat } from '@/lib/gemini'
import { logger } from '@/lib/logger'
import { UpstreamError } from '@/lib/upstream'

// The heaviest call in the app: a full 2000-token clinical summary over the whole
// conversation. It routinely outruns Vercel's default cap, which would kill the
// function mid-generation and lose the report the patient just spent 10 minutes on.
export const maxDuration = 60

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
  // TODO(reliability): this `.catch([])` is SILENT DATA LOSS on a clinical field.
  // If Gemini's output shape drifts — e.g. it returns medications as a flat string
  // array `["Paracetamol"]` instead of `[{name, dosage, frequency}]` — every element
  // fails the inner object parse, the array-level .catch swallows it, and the report
  // reaches the physician with medications: [] and no error anywhere. A doctor then
  // reads "no medications" for a patient who reported taking some.
  // Observed: gemini-3.1-flash-lite returns the correct object shape when the full
  // REPORT_SCHEMA is in the prompt, but flat strings when the shape is underspecified,
  // so this is one prompt edit away from firing. Same risk applies to `symptoms` and
  // `possible_conditions` below. Fix: parse leniently (coerce strings -> {name}) and
  // log a warning on shape mismatch instead of discarding, rather than failing closed
  // to an empty array. Deferred to a dedicated reliability pass.
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

    let body: { messages?: unknown; language?: unknown; sessionId?: unknown; patientProfile?: unknown }
    try {
      body = await request.json()
    } catch {
      return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
    }
    const { messages, language, sessionId } = body

    // Validated, not cast — these fields land in the model prompt and the DB.
    const patientProfile = parsePatientProfile(body.patientProfile)

    // Guard the conversation payload before it reaches Gemini / .map()
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

    // Smoker / alcohol / recent-travel are now ticked on the intake form (with
    // frequency / travel follow-ups), so read them straight off the profile
    // rather than hoping the chat surfaced them.
    const lifestyleFlags = patientProfile && typeof patientProfile === 'object'
      && patientProfile.lifestyle && typeof patientProfile.lifestyle === 'object'
      ? describeLifestyle(patientProfile.lifestyle)
      : null

    const patientContext = patientProfile && typeof patientProfile === 'object'
      ? `
Patient profile (include in report context):
- Name: ${String(patientProfile.fullName || 'Not provided').slice(0, 100)}
- DOB: ${String(patientProfile.dateOfBirth || 'Not provided').slice(0, 20)}
- Age: ${patientProfile.age ?? 'derive from DOB'}
- Sex: ${String(patientProfile.biologicalSex || 'Not provided')}
- Known conditions/allergies: ${String(patientProfile.chronicConditions || 'None reported').slice(0, 500)}
- Lifestyle (patient-reported): ${lifestyleFlags ? (lifestyleFlags.length ? lifestyleFlags.join(', ') : 'none reported') : 'Not collected'}
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

    const text = await geminiChat({
      system: systemPrompt,
      messages: [
        ...messages.map((m: { role: string; content: string }) => ({
          role: (m.role === 'kai' ? 'assistant' : 'user') as 'user' | 'assistant',
          content: m.content,
        })),
        { role: 'user' as const, content: reportPrompt },
      ],
      maxTokens: 2000,
    })

    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      throw new Error('No JSON found in response')
    }

    const reportData = reportDataSchema.parse(JSON.parse(jsonMatch[0]))
    const reportId = generateReportId()

    const profile = patientProfile && typeof patientProfile === 'object' ? patientProfile : null

    // Trust the patient's ticked lifestyle answers over anything the model inferred.
    const report = lifestyleFlags
      ? {
          ...reportData,
          lifestyle: {
            smoker: Boolean(profile?.lifestyle?.smoker),
            alcohol: Boolean(profile?.lifestyle?.alcohol),
            recent_travel: Boolean(profile?.lifestyle?.recentTravel),
          },
        }
      : reportData

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
      chief_complaint: report.chief_complaint,
      clinical_symptoms_summary: report.clinical_symptoms_summary,
      symptoms_json: report.symptoms,
      associated_symptoms_json: report.associated_symptoms,
      lifestyle_json: report.lifestyle,
      medications_json: report.medications,
      conditions_json: report.conditions,
      family_history_json: report.family_history || report.history || null,
      allergies_json: report.allergies,
      possible_conditions_json: report.possible_conditions,
      additional_notes: report.additional_notes,
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
      reportData: report,
      savedToDb: !insertError,
      patientProfile: profile,
    })
  } catch (err) {
    // Never log err.message for upstream faults — Gemini's error body echoes the
    // conversation we sent it, which is patient health information.
    if (err instanceof UpstreamError) {
      logger.error('upstream_error', '/api/report', undefined, {
        provider: err.provider,
        kind: err.kind,
        upstreamStatus: err.status,
      })
      return NextResponse.json({ error: 'Report generation failed' }, { status: err.clientStatus })
    }
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
      logger.warn('auth_failure', '/api/report:PATCH')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const ipHash = await hashIp(getClientIp(request))
    const [userLimit, ipLimit] = await Promise.all([
      checkRateLimit(user.id, 'report_patch', supabase),
      checkIpRateLimit(ipHash, 'report_patch', supabase),
    ])
    if (!userLimit.allowed || !ipLimit.allowed) {
      logger.warn('rate_limit_hit', '/api/report:PATCH', user.id)
      return NextResponse.json(
        { error: 'Please wait a moment before continuing.' },
        { status: 429 }
      )
    }

    let body: { reportId?: unknown; physicianNotes?: unknown; consultTranscript?: unknown }
    try {
      body = await request.json()
    } catch {
      return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
    }
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
      logger.error('db_update_error', '/api/report:PATCH', user.id, { message: error.message })
      return NextResponse.json({ error: 'Update failed' }, { status: 500 })
    }

    logger.info('report_updated', '/api/report:PATCH', user.id, {
      fields: Object.keys(updates),
    })

    return NextResponse.json({ ok: true })
  } catch (err) {
    // Was a bare `catch {}`. This handler persists physician notes and the consult
    // transcript, so a silent failure loses clinician work with no trace at all.
    logger.error('api_error', '/api/report:PATCH', undefined, {
      message: err instanceof Error ? err.message : 'unknown',
    })
    return NextResponse.json({ error: 'Update failed' }, { status: 500 })
  }
}