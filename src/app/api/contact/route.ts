import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'
import { createClient } from '@/lib/supabase/server'
import { logger } from '@/lib/logger'

const resend = new Resend(process.env.RESEND_API_KEY)

const CONTACT_LIMIT = 5
const CONTACT_WINDOW_MS = 15 * 60 * 1000 // 15 minutes

const FROM_EMAIL = process.env.CONTACT_FROM_EMAIL ?? 'Keiro Contact <onboarding@resend.dev>'
const TO_EMAIL = process.env.CONTACT_TO_EMAIL ?? 'keiro.contact@gmail.com'

function getClientIp(req: NextRequest): string {
  return (
    req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    req.headers.get('x-real-ip') ||
    'unknown'
  )
}

async function hashIp(ip: string): Promise<string> {
  const data = new TextEncoder().encode(ip)
  const buf = await crypto.subtle.digest('SHA-256', data)
  return Array.from(new Uint8Array(buf))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('')
    .slice(0, 32)
}

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

function sanitize(value: unknown): string {
  if (typeof value !== 'string') return ''
  // Strip HTML tags and null bytes
  return value.replace(/<[^>]*>/g, '').replace(/\0/g, '').trim()
}

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
    const ip = getClientIp(request)
    const ipHash = await hashIp(ip)
    const windowStart = new Date(Date.now() - CONTACT_WINDOW_MS).toISOString()

    const supabase = await createClient()
    const { count, error: countError } = await supabase
      .from('contact_attempts')
      .select('*', { count: 'exact', head: true })
      .eq('ip_hash', ipHash)
      .gte('created_at', windowStart)

    if (countError) {
      logger.error('rate_limit_check_failed', '/api/contact', undefined, {
        message: countError.message,
      })
      return NextResponse.json({ error: 'Failed to send' }, { status: 500 })
    }

    if ((count ?? 0) >= CONTACT_LIMIT) {
      logger.warn('rate_limit_hit', '/api/contact')
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
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

    const raw = body as Record<string, unknown>

    const clinicName = sanitize(raw.clinicName)
    const contactName = sanitize(raw.contactName)
    const email = sanitize(raw.email)
    const phone = sanitize(raw.phone)

    if (!contactName || !email || !clinicName) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    if (!isValidEmail(email)) {
      return NextResponse.json({ error: 'Invalid email address' }, { status: 400 })
    }

    if (clinicName.length > 200 || contactName.length > 200 || email.length > 200 || phone.length > 30) {
      return NextResponse.json({ error: 'One or more fields are too long' }, { status: 400 })
    }

    // Record the attempt only after input validation passes
    const { error: insertError } = await supabase
      .from('contact_attempts')
      .insert({ ip_hash: ipHash })

    if (insertError) {
      logger.error('contact_attempt_insert_failed', '/api/contact', undefined, {
        message: insertError.message,
      })
      return NextResponse.json({ error: 'Failed to send' }, { status: 500 })
    }

    const safeClinicName = escapeHtml(clinicName)
    const safeContactName = escapeHtml(contactName)
    const safeEmail = escapeHtml(email)
    const safePhone = escapeHtml(phone)

    const { error: emailError } = await resend.emails.send({
      from: FROM_EMAIL,
      to: TO_EMAIL,
      subject: `Demo Request: ${safeClinicName}`,
      html: `
        <h2>New Demo Request</h2>
        <p><strong>Clinic:</strong> ${safeClinicName}</p>
        <p><strong>Contact:</strong> ${safeContactName}</p>
        <p><strong>Email:</strong> ${safeEmail}</p>
        ${safePhone ? `<p><strong>Phone:</strong> ${safePhone}</p>` : ''}
      `,
    })

    if (emailError) {
      logger.error('email_send_failed', '/api/contact', undefined, {
        message: emailError.message,
      })
      return NextResponse.json({ error: 'Failed to send' }, { status: 500 })
    }

    // Log submission without including clinic name or email (potential PII)
    logger.info('contact_form_submitted', '/api/contact')

    return NextResponse.json({ success: true })
  } catch (err) {
    logger.error('api_error', '/api/contact', undefined, {
      message: err instanceof Error ? err.message : 'unknown',
    })
    return NextResponse.json({ error: 'Failed to send' }, { status: 500 })
  }
}