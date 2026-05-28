import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { createClient } from '@/lib/supabase/server'
import { checkRateLimit } from '@/lib/rateLimit'
import { buildKaiSystemPrompt } from '@/lib/claude'

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

function generateReportId(): string {
  const year = new Date().getFullYear()
  const rand = String(Math.floor(10000 + Math.random() * 90000))
  return `KR-${year}-${rand}`
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { allowed } = await checkRateLimit(user.id, 'report', supabase)
    if (!allowed) {
      return NextResponse.json({ error: 'Too many requests' }, { status: 429 })
    }

    const { messages, language, languageCode, sessionId } = await request.json()

    const systemPrompt = buildKaiSystemPrompt(language, false)
    const reportPrompt = 'Based on our conversation, please generate the complete patient intake report in the JSON format specified in your instructions. Return ONLY the JSON, no other text.'

    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-5',
      max_tokens: 2000,
      system: systemPrompt,
      messages: [
        ...messages.map((m: { role: string; content: string }) => ({
          role: m.role === 'kai' ? 'assistant' : 'user',
          content: m.content,
        })),
        { role: 'user', content: reportPrompt },
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

    const reportData = JSON.parse(jsonMatch[0])
    const reportId = generateReportId()

    const { error } = await supabase.from('reports').insert({
      session_id: sessionId || null,
      user_id: user.id,
      report_id: reportId,
      language_used: language,
      visit_type: 'symptom_intake',
      chief_complaint: reportData.chief_complaint,
      symptoms_json: reportData.symptoms,
      associated_symptoms_json: reportData.associated_symptoms,
      lifestyle_json: reportData.lifestyle,
      medications_json: reportData.medications,
      conditions_json: reportData.conditions,
      family_history_json: reportData.family_history,
      allergies_json: reportData.allergies,
      possible_conditions_json: reportData.possible_conditions,
      additional_notes: reportData.additional_notes,
    })

    if (error && process.env.NODE_ENV !== 'production') {
      console.error('Supabase insert error:', error)
    }

    return NextResponse.json({ reportId, reportData })
  } catch (err) {
    if (process.env.NODE_ENV !== 'production') console.error(err)
    return NextResponse.json({ error: 'Report generation failed' }, { status: 500 })
  }
}
