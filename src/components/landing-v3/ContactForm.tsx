'use client'

/* Contact form, wired to the existing POST /api/contact.

   That route accepts exactly { clinicName, contactName, email, phone } and
   nothing else — there is no message field, and the route is out of scope to
   change. So this form asks who you are and gets you a reply; it deliberately
   does NOT render a message box it would have to silently drop.

   `topic` is folded into clinicName so the notification email's subject line
   ("Demo Request: Press — <org>") still says who is writing. */

import { useState } from 'react'

const TOPICS = [
  'A clinic or hospital',
  'Press',
  'An investor',
  'A competition judge',
  'Something else',
] as const

type Status = 'idle' | 'sending' | 'sent' | 'error'

export function ContactForm() {
  const [topic, setTopic] = useState<string>(TOPICS[0])
  const [organization, setOrganization] = useState('')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [status, setStatus] = useState<Status>('idle')
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setStatus('sending')
    setError('')

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clinicName: `${topic}: ${organization}`,
          contactName: name,
          email,
          phone,
        }),
      })

      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        setError(
          res.status === 429
            ? 'That is a few messages in a short time. Please try again in a little while.'
            : (data.error as string) || 'Something went wrong. Please try again.'
        )
        setStatus('error')
        return
      }

      setStatus('sent')
    } catch {
      setError('We could not reach the server. Please check your connection and try again.')
      setStatus('error')
    }
  }

  if (status === 'sent') {
    return (
      <div
        className="mt-8 rounded-[16px] border border-[var(--lx-line)] bg-[var(--lx-mint)] p-6 sm:p-8"
        role="status"
        aria-live="polite"
      >
        <h3 className="lx-heading text-xl text-[var(--lx-ink)]">
          Thank you. We have it.
        </h3>
        <p className="mt-3 leading-[1.8] text-[var(--lx-body)]">
          A real person reads these. We will write back to{' '}
          <span className="font-semibold">{email}</span>, usually within a few days.
        </p>
      </div>
    )
  }

  const field =
    'lx-focus mt-2 block min-h-12 w-full rounded-[12px] border border-[var(--lx-line)] bg-[var(--lx-paper)] px-4 text-base text-[var(--lx-body)] placeholder:text-[var(--lx-muted)]/70'
  const label = 'block font-semibold text-[var(--lx-ink)]'

  return (
    <form onSubmit={handleSubmit} className="mt-8 grid gap-5 sm:grid-cols-2">
      <div className="sm:col-span-2">
        <label htmlFor="topic" className={label}>
          I am…
        </label>
        <select
          id="topic"
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          className={field}
        >
          {TOPICS.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
      </div>

      <div className="sm:col-span-2">
        <label htmlFor="organization" className={label}>
          Who you&apos;re with
        </label>
        <input
          id="organization"
          required
          maxLength={150}
          value={organization}
          onChange={(e) => setOrganization(e.target.value)}
          placeholder="Clinic, publication, firm, or just “on my own”"
          className={field}
        />
      </div>

      <div>
        <label htmlFor="name" className={label}>
          Your name
        </label>
        <input
          id="name"
          required
          maxLength={200}
          value={name}
          onChange={(e) => setName(e.target.value)}
          className={field}
        />
      </div>

      <div>
        <label htmlFor="email" className={label}>
          Email
        </label>
        <input
          id="email"
          type="email"
          required
          maxLength={200}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className={field}
        />
      </div>

      <div className="sm:col-span-2">
        <label htmlFor="phone" className={label}>
          Phone <span className="font-normal text-[var(--lx-muted)]">(optional)</span>
        </label>
        <input
          id="phone"
          type="tel"
          maxLength={30}
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          className={field}
        />
      </div>

      {error && (
        <p className="text-[var(--lx-ink)] sm:col-span-2" role="alert">
          {error}
        </p>
      )}

      <div className="sm:col-span-2">
        <button
          type="submit"
          disabled={status === 'sending'}
          className="lx-focus inline-flex min-h-12 items-center justify-center rounded-full bg-[var(--lx-ink)] px-6 font-semibold text-[var(--lx-cream)] transition-colors duration-200 hover:bg-[var(--lx-ink-deep)] disabled:opacity-60"
        >
          {status === 'sending' ? 'Sending…' : 'Send'}
        </button>
        <p className="mt-3 text-sm leading-relaxed text-[var(--lx-muted)]">
          We will only use this to reply to you.
        </p>
      </div>
    </form>
  )
}
