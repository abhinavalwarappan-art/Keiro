'use client'

import { useState, useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import { easeOutExpo } from '@/lib/motion'
import { RetroGrid } from '@/components/ui/retro-grid'

const ITEMS = [
  { label: 'Custom QR code',    desc: 'Branded for your facility, deployed in minutes' },
  { label: 'No software install', desc: 'Patients use it on their own phones, browser-based' },
  { label: 'Free during pilot', desc: "No contracts, no cost. We're onboarding partners across DFW right now." },
]

export default function ForHospitals() {
  const [contactForm, setContactForm] = useState({ clinicName: '', contactName: '', email: '', phone: '' })
  const [submitted, setSubmitted] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [focused, setFocused] = useState<string | null>(null)
  const headerRef = useRef(null)
  const headerInView = useInView(headerRef, { once: true, margin: '-60px' })

  const handleContact = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setError(null)
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(contactForm),
      })
      if (!res.ok) {
        throw new Error('Submission failed. Please try again.')
      }
      setSubmitted(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  const inputStyle = (field: string) => ({
    width: '100%',
    height: 48,
    padding: '0 16px',
    borderRadius: 8,
    fontSize: 16,
    color: 'var(--text-primary)',
    background: 'var(--surface)',
    border: `1px solid ${focused === field ? 'var(--brand-strong)' : 'var(--border-subtle)'}`,
    boxShadow: focused === field ? '0 0 0 3px rgb(13 148 136 / 0.15)' : 'none',
    outline: 'none',
    transition: 'border-color 0.15s, box-shadow 0.15s',
    fontFamily: 'inherit',
  })

  return (
    <section id="hospitals" className="relative overflow-hidden bg-sunken px-6 py-28 md:px-12 md:py-36">
      <RetroGrid lineColor="rgba(28,25,23,0.04)" fadeFromColor="#F5F5F4" />
      <div className="relative z-10 max-w-[1200px] mx-auto">

        {/* Label */}
        <div ref={headerRef}>
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={headerInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, ease: easeOutExpo }}
            className="flex items-center gap-4 mb-14"
          >
          </motion.div>
        </div>

        <div className="grid lg:grid-cols-[1fr_480px] gap-16 lg:gap-20">

          {/* Left — always visible */}
          <div>
            <h2 className="font-display leading-[0.95] tracking-[-0.035em] text-text-primary mb-10"
              style={{ fontSize: 'clamp(36px,5vw,64px)' }}>
              Bring Keiro to<br />
              <span className="font-light text-brand-ink">your waiting room.</span>
            </h2>

            <p className="text-lg text-text-secondary leading-relaxed mb-14 max-w-[500px]">
              Free for hospitals and clinics. Give every patient a QR code at reception — they walk in, scan, speak their language, and arrive at intake already prepared.
            </p>

            {/* Features — always visible */}
            <div className="space-y-0">
              {ITEMS.map((item, i) => (
                <div
                  key={item.label}
                  className="flex items-start gap-6 border-t border-border-subtle py-6"
                >
                  <span className="mt-0.5 flex-shrink-0 font-display text-[13px] font-semibold tabular-nums text-text-tertiary"
                    style={{ minWidth: 28 }}>
                    0{i + 1}
                  </span>
                  <div>
                    <div className="text-base font-semibold text-text-primary">{item.label}</div>
                    <div className="mt-0.5 text-sm text-text-secondary">{item.desc}</div>
                  </div>
                </div>
              ))}
              <div className="border-t border-border-subtle" />
            </div>
          </div>

          {/* Right — contact form */}
          <div>
            <div className="rounded-xl border border-border-subtle bg-surface p-8 shadow-sm md:p-10">
              <p className="mb-3 text-xs font-medium uppercase tracking-wide text-text-tertiary">
                Request a demo
              </p>
              <h3 className="mb-2 font-display text-2xl font-semibold leading-tight tracking-tight text-text-primary">
                Let&apos;s get Keiro in your waiting room.
              </h3>
              <p className="mb-8 text-sm text-text-secondary">No sales calls. No contracts. Just helping patients.</p>

              {submitted ? (
                <div className="rounded-lg bg-brand-subtle py-12 text-center">
                  <div className="mx-auto mb-4 flex size-14 items-center justify-center rounded-full bg-brand-ink">
                    <svg width="24" height="20" viewBox="0 0 24 20" fill="none" aria-hidden>
                      <path d="M2 10l7 7L22 2" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                  <p className="text-base font-semibold text-brand-ink">Thanks! We&apos;ll be in touch shortly.</p>
                </div>
              ) : (
                <form onSubmit={handleContact} className="space-y-4">
                  {[
                    { key: 'clinicName',   label: 'Clinic name',    type: 'text'  },
                    { key: 'contactName',  label: 'Contact name',   type: 'text'  },
                    { key: 'email',        label: 'Email',          type: 'email' },
                    { key: 'phone',        label: 'Phone number',   type: 'tel'   },
                  ].map(field => (
                    <div key={field.key}>
                      <label
                        className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-text-secondary"
                        htmlFor={`field-${field.key}`}
                      >
                        {field.label}
                      </label>
                      <input
                        id={`field-${field.key}`}
                        type={field.type}
                        required
                        value={contactForm[field.key as keyof typeof contactForm]}
                        onChange={e => setContactForm(p => ({ ...p, [field.key]: e.target.value }))}
                        style={inputStyle(field.key)}
                        onFocus={() => setFocused(field.key)}
                        onBlur={() => setFocused(null)}
                        disabled={submitting}
                      />
                    </div>
                  ))}
                  {error && (
                    <p className="text-sm text-red-600" role="alert">{error}</p>
                  )}
                  <button
                    type="submit"
                    disabled={submitting}
                    className="group flex h-12 w-full items-center justify-center gap-2 rounded-md bg-brand-ink text-sm font-medium text-white shadow-xs transition-colors duration-150 hover:bg-brand-ink-hover disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {submitting ? 'Sending…' : 'Request a demo'}
                    {!submitting && (
                      <span className="group-hover:translate-x-1 transition-transform duration-200">→</span>
                    )}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}