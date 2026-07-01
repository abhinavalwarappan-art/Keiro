'use client'

import { useState, type FormEvent } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { ArrowRight, Check } from 'lucide-react'

type Status = 'idle' | 'loading' | 'success' | 'error'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export function Waitlist() {
  const reduce = useReducedMotion()
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<Status>('idle')
  const [message, setMessage] = useState('')
  const [trap, setTrap] = useState('') // honeypot — humans never fill this

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (trap) return // bot
    if (!EMAIL_RE.test(email)) {
      setStatus('error')
      setMessage('That email doesn\u2019t look right.')
      return
    }

    setStatus('loading')
    setMessage('')
    try {
      const res = await fetch('/api/waitlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as { error?: string }
        throw new Error(data.error ?? 'Something went wrong.')
      }
      setStatus('success')
    } catch (err) {
      setStatus('error')
      setMessage(err instanceof Error ? err.message : 'Something went wrong.')
    }
  }

  return (
    <section id="waitlist" className="relative overflow-hidden border-t border-[var(--line)] py-28 md:py-40">
      {/* big amber bloom rising from the bottom */}
      <motion.div
        aria-hidden
        className="pointer-events-none absolute bottom-[-30%] left-1/2 h-[70vh] w-[70vh] -translate-x-1/2 rounded-full"
        style={{ background: 'radial-gradient(circle, rgba(232,160,69,0.22), transparent 65%)' }}
        animate={reduce ? {} : { opacity: [0.6, 1, 0.6] }}
        transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}
      />

      <div className="relative mx-auto max-w-[820px] px-6 text-center md:px-10">
        <span className="kx-mono text-[0.72rem] uppercase tracking-[0.22em] text-[var(--amber)]">
          Early access
        </span>
        <h2 className="kx-serif mx-auto mt-6 max-w-[16ch] text-[clamp(2.8rem,1.6rem+5vw,5.2rem)] text-[var(--fg)]">
          Be understood at your next visit.
        </h2>
        <p className="mx-auto mt-6 max-w-[34rem] text-[1.075rem] leading-relaxed text-[var(--fg-2)]">
          We&apos;re onboarding patients and clinics in waves. Leave your email and
          you&apos;ll be among the first to talk to Kai.
        </p>

        {status === 'success' ? (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="kx-glass kx-glass-amber mx-auto mt-12 flex max-w-[30rem] items-center justify-center gap-3 rounded-full px-7 py-4"
          >
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[var(--amber)] text-[#1a1206]">
              <Check className="h-4 w-4" strokeWidth={3} />
            </span>
            <span className="text-[1rem] text-[var(--fg)]">
              You&apos;re on the list. We&apos;ll be in touch.
            </span>
          </motion.div>
        ) : (
          <form
            onSubmit={handleSubmit}
            className="mx-auto mt-12 flex max-w-[34rem] flex-col items-stretch gap-3 sm:flex-row"
            noValidate
          >
            {/* honeypot */}
            <input
              type="text"
              name="company"
              tabIndex={-1}
              autoComplete="off"
              value={trap}
              onChange={(e) => setTrap(e.target.value)}
              className="absolute left-[-9999px] h-0 w-0 opacity-0"
              aria-hidden
            />

            <label htmlFor="wl-email" className="sr-only">
              Email address
            </label>
            <input
              id="wl-email"
              type="email"
              inputMode="email"
              autoComplete="email"
              placeholder="you@email.com"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value)
                if (status === 'error') setStatus('idle')
              }}
              disabled={status === 'loading'}
              className="kx-glass h-[3.4rem] flex-1 rounded-full px-6 text-[1rem] text-[var(--fg)] placeholder:text-[var(--fg-3)] focus:border-[rgba(232,160,69,0.4)] focus:outline-none"
            />

            <motion.button
              type="submit"
              disabled={status === 'loading'}
              whileHover={reduce ? undefined : { scale: 1.035, y: -2 }}
              whileTap={reduce ? undefined : { scale: 0.975 }}
              transition={{ type: 'spring', stiffness: 420, damping: 26, mass: 0.7 }}
              className="inline-flex h-[3.4rem] items-center justify-center gap-2 rounded-full px-7 text-[0.95rem] font-medium text-[#1a1206] shadow-[0_10px_40px_-12px_var(--amber-glow)] disabled:opacity-60 [background:linear-gradient(180deg,var(--amber-soft),var(--amber))]"
            >
              {status === 'loading' ? 'Adding you\u2026' : 'Get early access'}
              {status !== 'loading' && <ArrowRight className="h-4 w-4" strokeWidth={2.2} />}
            </motion.button>
          </form>
        )}

        {status === 'error' && (
          <p role="alert" className="mt-4 text-[0.9rem] text-[#f0a3a3]">
            {message}
          </p>
        )}

        <p className="kx-mono mt-7 text-[0.7rem] uppercase tracking-[0.14em] text-[var(--fg-3)]">
          No spam · unsubscribe anytime · free for patients, always
        </p>
      </div>
    </section>
  )
}