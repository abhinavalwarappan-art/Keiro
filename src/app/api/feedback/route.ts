import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { checkRateLimit } from '@/lib/rateLimit'
import { logger } from '@/lib/logger'

const resend = new Resend(process.env.RESEND_API_KEY)
const FROM_EMAIL = process.env.FEEDBACK_FROM_EMAIL ?? 'Keiro Feedback <onboarding@resend.dev>'
const TO_EMAIL = process.env.FEEDBACK_TO_EMAIL ?? 'keirohealthcare@gmail.com'

const feedbackSchema = z.object({
  type: z.enum(['bug', 'feature', 'general']),
  message: z.string().trim().min(1).max(4000),
  pageUrl: z.string().trim().max(500).default('/settings'),
})

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
}

export async function POST(request: NextRequest) {
  try {
    const origin = request.headers.get('origin')
    if (origin !== null && origin !== request.nextUrl.origin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      logger.warn('auth_failure', '/api/feedback')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const parsed = feedbackSchema.safeParse(await request.json().catch(() => null))
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid feedback' }, { status: 400 })
    }

    const limit = await checkRateLimit(user.id, 'feedback', supabase)
    if (!limit.allowed) {
      logger.warn('rate_limit_hit', '/api/feedback', user.id)
      return NextResponse.json(
        { error: 'Too many feedback submissions. Please try again later.' },
        { status: 429 }
      )
    }

    const { type, message, pageUrl } = parsed.data
    const { error: insertError } = await supabase.from('feedback').insert({
      user_id: user.id,
      type,
      message,
      page_url: pageUrl,
    })
    if (insertError) {
      logger.error('db_insert_error', '/api/feedback', user.id, { message: insertError.message })
      return NextResponse.json({ error: 'Could not save feedback' }, { status: 500 })
    }

    const { error: emailError } = await resend.emails.send({
      from: FROM_EMAIL,
      to: TO_EMAIL,
      subject: `Keiro feedback: ${type}`,
      html: `
        <h2>New Keiro feedback</h2>
        <p><strong>Type:</strong> ${escapeHtml(type)}</p>
        <p><strong>Page:</strong> ${escapeHtml(pageUrl)}</p>
        <p>${escapeHtml(message).replace(/\n/g, '<br>')}</p>
      `,
    })
    if (emailError) {
      logger.error('email_send_failed', '/api/feedback', user.id, { message: emailError.message })
      return NextResponse.json({ success: true, notificationSent: false }, { status: 202 })
    }

    logger.info('feedback_submitted', '/api/feedback', user.id, { type })
    return NextResponse.json({ success: true, notificationSent: true }, { status: 201 })
  } catch (err) {
    logger.error('api_error', '/api/feedback', undefined, {
      message: err instanceof Error ? err.message : 'unknown',
    })
    return NextResponse.json({ error: 'Could not submit feedback' }, { status: 500 })
  }
}
