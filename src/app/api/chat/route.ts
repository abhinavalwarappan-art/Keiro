import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { createClient } from '@/lib/supabase/server'
import { checkRateLimit } from '@/lib/rateLimit'
import { buildKaiSystemPrompt } from '@/lib/claude'

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

const EMERGENCY_KEYWORDS = [
  'chest pain', 'can\'t breathe', 'cannot breathe', 'difficulty breathing',
  'stroke', 'face drooping', 'arm weakness', 'slurred speech',
  'allergic reaction', 'anaphylaxis', 'bleeding', 'unconscious',
  'suicidal', 'self-harm', 'worst pain', 'worst of my life',
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
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { allowed } = await checkRateLimit(user.id, 'chat', supabase)
    if (!allowed) {
      return NextResponse.json({ error: 'Too many requests' }, { status: 429 })
    }

    const body = await request.json()
    const { messages, language, languageCode, romanization } = body

    if (!messages || !language) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const lastMessage = messages[messages.length - 1]
    const userText = lastMessage?.content || ''

    if (containsEmergencyKeyword(userText)) {
      return NextResponse.json({ emergency: true })
    }

    const systemPrompt = buildKaiSystemPrompt(language, romanization || false)

    const stream = await anthropic.messages.stream({
      model: 'claude-sonnet-4-5',
      max_tokens: 1000,
      temperature: 0.7,
      system: systemPrompt,
      messages: messages.map((m: { role: string; content: string }) => ({
        role: m.role === 'kai' ? 'assistant' : 'user',
        content: m.content,
      })),
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
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
