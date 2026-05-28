import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(request: NextRequest) {
  try {
    const { name, email, hospital, message } = await request.json()

    if (!name || !email || !hospital) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    await resend.emails.send({
      from: 'Keiro Contact <onboarding@resend.dev>',
      to: 'keiro.contact@gmail.com',
      subject: `Hospital Inquiry: ${hospital}`,
      html: `
        <h2>New Hospital Inquiry</h2>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Hospital:</strong> ${hospital}</p>
        ${message ? `<p><strong>Message:</strong> ${message}</p>` : ''}
      `,
    })

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Failed to send' }, { status: 500 })
  }
}
