import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'
import { createClient } from '@/lib/supabase/server'
import { getClientIp, hashIp } from '@/lib/clientIp'
import { logger } from '@/lib/logger'

const resend = new Resend(process.env.RESEND_API_KEY)

const CONTACT_LIMIT = 5
const CONTACT_WINDOW_MS = 15 * 60 * 1000 // 15 minutes

const FROM_EMAIL = process.env.CONTACT_FROM_EMAIL ?? 'Keiro Contact <onboarding@resend.dev>'
const TO_EMAIL = process.env.CONTACT_TO_EMAIL ?? 'keiro.contact@gmail.com'

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

    const supabase = await createClient()

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

    // Rate limit only after input validation passes, so a typo'd submission
    // doesn't burn a slot. check_and_record_contact_attempt (migration 008) does
    // the count-check and the insert atomically under an advisory lock, so
    // concurrent submissions from one IP can't all read count=0 and slip through.
    //
    // It must be an RPC, not a direct table query: 008 revoked anon's SELECT and
    // INSERT on contact_attempts and granted EXECUTE on this SECURITY DEFINER
    // function instead. A direct .from('contact_attempts') call is denied for the
    // anonymous visitors this public form actually serves.
    const { data: allowed, error: rateLimitError } = await supabase.rpc(
      'check_and_record_contact_attempt',
      {
        p_ip_hash: ipHash,
        p_limit: CONTACT_LIMIT,
        p_window_ms: CONTACT_WINDOW_MS,
      }
    )

    if (rateLimitError) {
      logger.error('rate_limit_check_failed', '/api/contact', undefined, {
        message: rateLimitError.message,
      })
      return NextResponse.json({ error: 'Failed to send' }, { status: 500 })
    }

    if (!allowed) {
      logger.warn('rate_limit_hit', '/api/contact')
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        { status: 429 }
      )
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