// API key loaded from environment — never hardcode
import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { createClient } from '@/lib/supabase/server'
import { checkRateLimit, checkIpRateLimit } from '@/lib/rateLimit'
import { getClientIp, hashIp } from '@/lib/clientIp'
import { buildKaiSystemPrompt, buildOpeningUserPrompt, buildConsultSystemPrompt, buildConsultUserPrompt } from '@/lib/claude'
import { isAllowedChatLanguage } from '@/lib/languages'
import { logger } from '@/lib/logger'
import type { PatientProfile } from '@/types'

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

const EMERGENCY_KEYWORDS = [
  // English
  'chest pain', 'chest pressure', 'can\'t breathe', 'cannot breathe',
  'difficulty breathing', 'shortness of breath', 'stroke', 'face drooping',
  'arm weakness', 'slurred speech', 'allergic reaction', 'anaphylaxis',
  'uncontrolled bleeding', 'unconscious', 'suicidal', 'self-harm',
  'worst pain of my life', 'worst pain ever', 'heart attack',
  // Hindi
  'सीने में दर्द', 'सांस नहीं आ रही', 'सांस लेने में तकलीफ',
  'दिल का दौरा', 'बेहोश', 'खून बह रहा है', 'आत्महत्या',
  'सबसे बुरा दर्द', 'स्ट्रोक', 'एलर्जी',
  // Tamil
  'மூச்சுத் திணறல்', 'மார்பு வலி', 'மாரடைப்பு',
  'மயக்கம்', 'ரத்தம் வருகிறது', 'சுவாசிக்க முடியவில்லை',
  'மிகவும் கடுமையான வலி', 'பக்கவாதம்',
  // Spanish
  'dolor en el pecho', 'no puedo respirar', 'dificultad para respirar',
  'ataque al corazón', 'derrame cerebral', 'pérdida de conciencia',
  'reacción alérgica', 'suicidio', 'sangrado', 'el peor dolor',
  // Arabic
  'ألم في الصدر', 'لا أستطيع التنفس', 'صعوبة في التنفس',
  'نوبة قلبية', 'سكتة دماغية', 'فقدان الوعي', 'حساسية شديدة',
  'أسوأ ألم', 'انتحار', 'نزيف',
  // Mandarin/Chinese
  '胸痛', '呼吸困难', '不能呼吸', '心脏病发作',
  '中风', '失去意识', '过敏反应', '最严重的疼痛', '自杀',
  // Vietnamese
  'đau ngực', 'khó thở', 'không thở được', 'đau tim',
  'đột quỵ', 'mất ý thức', 'dị ứng nặng', 'tự tử',
  // Korean
  '가슴 통증', '숨을 쉴 수 없어요', '호흡 곤란', '심장 마비',
  '뇌졸중', '의식 잃음', '심한 알레르기', '자살',
  // Tagalog
  'sakit sa dibdib', 'hindi makahinga', 'mahirap huminga',
  'atake sa puso', 'stroke', 'nawalan ng malay', 'matinding sakit',
  // Portuguese
  'dor no peito', 'não consigo respirar', 'dificuldade para respirar',
  'ataque cardíaco', 'derrame', 'perda de consciência', 'suicídio',
]

function containsEmergencyKeyword(text: string): boolean {
  const lower = text.toLowerCase()
  return EMERGENCY_KEYWORDS.some(kw => lower.includes(kw))
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      logger.warn('auth_failure', '/api/chat')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const ipHash = await hashIp(getClientIp(request))
    const [userLimit, ipLimit] = await Promise.all([
      checkRateLimit(user.id, 'chat', supabase),
      checkIpRateLimit(ipHash, 'chat', supabase),
    ])
    if (!userLimit.allowed || !ipLimit.allowed) {
      logger.warn('rate_limit_hit', '/api/chat', user.id)
      return NextResponse.json(
        { error: 'Please wait a moment before continuing.' },
        { status: 429 }
      )
    }

    let body: unknown
    try {
      body = await request.json()
    } catch {
      return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
    }

    if (typeof body !== 'object' || body === null) {
      return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
    }

    const { messages, language, romanization, isOpening, patientProfile, mode, consultSide, consultText, patientLanguageCode } = body as Record<string, unknown>

    // Live consult mode — single-turn translation, non-streaming
    if (mode === 'consult') {
      if (!consultText || typeof consultText !== 'string' || consultText.trim().length === 0 || consultText.length > 2000) {
        return NextResponse.json({ error: 'Invalid consult message' }, { status: 400 })
      }
      if (consultSide !== 'doctor' && consultSide !== 'patient') {
        return NextResponse.json({ error: 'Invalid consult side' }, { status: 400 })
      }

      const sanitizedLanguage = typeof language === 'string'
        ? language.replace(/[\n\r\t]/g, '').replace(/[^\w\s\u0080-\uFFFF]/g, '').trim().slice(0, 50)
        : ''
      if (!sanitizedLanguage || !isAllowedChatLanguage(sanitizedLanguage)) {
        return NextResponse.json({ error: 'Invalid language' }, { status: 400 })
      }

      const langCode = typeof patientLanguageCode === 'string'
        ? patientLanguageCode.replace(/[^a-zA-Z0-9\-]/g, '').slice(0, 20)
        : 'en-US'

      const systemPrompt = buildConsultSystemPrompt(sanitizedLanguage, langCode, romanization === true)
      const userPrompt = buildConsultUserPrompt(consultSide as 'doctor' | 'patient', consultText, langCode)

      const response = await anthropic.messages.create({
        model: 'claude-haiku-4-5',
        max_tokens: 500,
        temperature: 0.3,
        system: systemPrompt,
        messages: [{ role: 'user', content: userPrompt }],
      })

      const content = response.content[0]
      if (content.type !== 'text') {
        return NextResponse.json({ error: 'Unexpected response' }, { status: 500 })
      }

      const jsonMatch = content.text.match(/\{[\s\S]*\}/)
      if (!jsonMatch) {
        return NextResponse.json({ translation: content.text.trim() })
      }

      try {
        const parsed = JSON.parse(jsonMatch[0]) as { translation?: string }
        return NextResponse.json({ translation: parsed.translation || content.text.trim() })
      } catch {
        return NextResponse.json({ translation: content.text.trim() })
      }
    }

    // Sanitize language — prevent prompt injection via language parameter
    const sanitizedLanguage = typeof language === 'string'
      ? language.replace(/[\n\r\t]/g, '').replace(/[^\w\s\u0080-\uFFFF]/g, '').trim().slice(0, 50)
      : ''
    if (!sanitizedLanguage || !isAllowedChatLanguage(sanitizedLanguage)) {
      return NextResponse.json({ error: 'Invalid language' }, { status: 400 })
    }

    // Prevent prompt stuffing — cap each message at 2000 chars
    if (messages && Array.isArray(messages)) {
      for (const msg of messages) {
        if (typeof msg !== 'object' || msg === null) {
          return NextResponse.json({ error: 'Invalid message format' }, { status: 400 })
        }
        if (typeof (msg as Record<string, unknown>).role !== 'string') {
          return NextResponse.json({ error: 'Invalid message format' }, { status: 400 })
        }
        if (typeof (msg as Record<string, unknown>).content === 'string' && ((msg as Record<string, unknown>).content as string).length > 2000) {
          return NextResponse.json({ error: 'Message too long' }, { status: 400 })
        }
      }
      if (messages.length > 50) {
        return NextResponse.json({ error: 'Too many messages' }, { status: 400 })
      }
    }

    if (!isOpening && (!messages || !Array.isArray(messages) || messages.length === 0)) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const lastMessage = Array.isArray(messages) ? messages[messages.length - 1] : undefined
    const userText = (lastMessage && typeof lastMessage === 'object' && lastMessage !== null)
      ? String((lastMessage as Record<string, unknown>).content || '')
      : ''

    if (!isOpening && containsEmergencyKeyword(userText)) {
      return NextResponse.json({ emergency: true })
    }

    const systemPrompt = buildKaiSystemPrompt(
      sanitizedLanguage,
      romanization === true,
      (patientProfile !== undefined && patientProfile !== null && typeof patientProfile === 'object') ? (patientProfile as PatientProfile) : null,
    )

    const apiMessages = isOpening
      ? [{ role: 'user' as const, content: buildOpeningUserPrompt(sanitizedLanguage, romanization === true, (patientProfile !== undefined && patientProfile !== null && typeof patientProfile === 'object') ? (patientProfile as PatientProfile) : null) }]
      : (messages as Array<Record<string, unknown>>).map((m) => ({
          role: (m.role === 'kai' ? 'assistant' : 'user') as 'user' | 'assistant',
          content: String(m.content),
        }))

    // Log message count only — never log message content or patient input
    logger.info('message_sent', '/api/chat', user.id, { messageCount: Array.isArray(messages) ? messages.length : 0 })

    const stream = await anthropic.messages.stream({
      model: 'claude-haiku-4-5',
      max_tokens: 1000,
      temperature: 0.7,
      system: systemPrompt,
      messages: apiMessages,
    })

    const encoder = new TextEncoder()
    const readable = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of stream) {
            if (chunk.type === 'content_block_delta' && chunk.delta.type === 'text_delta') {
              const text = chunk.delta.text

              if (text.includes('"emergency": true') || text.includes('"emergency":true')) {
                controller.enqueue(encoder.encode(`data: ${JSON.stringify({ emergency: true })}\n\n`))
                controller.close()
                return
              }

              controller.enqueue(encoder.encode(`data: ${JSON.stringify({ text })}\n\n`))
            }
          }
          controller.enqueue(encoder.encode('data: [DONE]\n\n'))
          controller.close()
        } catch (err) {
          controller.error(err)
        }
      },
    })

    return new NextResponse(readable, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    })
  } catch (err) {
    logger.error('api_error', '/api/chat', undefined, {
      message: err instanceof Error ? err.message : 'unknown',
    })
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}