'use client'

import { useState } from 'react'
import { motion, useInView } from 'framer-motion'
import { useRef } from 'react'
import { easeOutExpo } from '@/lib/motion'

const ITEMS = [
  { label: 'Custom QR code', desc: 'Branded for your facility, deployed in minutes' },
  { label: 'No software install', desc: 'Patients use it on their own phones, browser-based' },
  { label: 'Free during pilot', desc: "No contracts, no cost. We're onboarding partners across DFW right now." },
]

export default function ForHospitals() {
  const [contactForm, setContactForm] = useState({ name: '', email: '', hospital: '', message: '' })
  const [submitted, setSubmitted] = useState(false)
  const ref = useRef(null)
  const inView = useInView(ref, { once: true })

  const handleContact = async (e: React.FormEvent) => {
    e.preventDefault()
    await fetch('/api/contact', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(contactForm),
    })
    setSubmitted(true)
  }

  return (
    <section id="hospitals" className="bg-[#fafaf7] py-24 md:py-32 px-4 md:px-8">
      <div ref={ref} className="max-w-[1400px] mx-auto grid lg:grid-cols-12 gap-16">
        <motion.div
          initial={{ opacity: 0, y: 32 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, ease: easeOutExpo }}
          className="lg:col-span-6"
        >
          <div className="text-[11px] uppercase tracking-widest text-keiro-muted mb-4">— For providers</div>
          <h2 className="font-display text-[clamp(36px,5.5vw,80px)] leading-[1] tracking-tight text-[#0a1f12] mb-8">
            Bring Keiro to<br />
            <span className="italic text-keiro-mid font-normal">your waiting room.</span>
          </h2>
          <p className="text-[17px] text-keiro-muted leading-[1.7] mb-12">
            Free for hospitals and clinics. Give every patient a QR code at reception — they walk in, scan, speak their language, and arrive at intake already prepared. Less waiting. Better care.
          </p>
          <div className="space-y-6">
            {ITEMS.map((item) => (
              <div key={item.label} className="border-l-2 border-keiro-mid pl-6">
                <div className="font-display text-[24px] text-[#0a1f12] mb-1">{item.label}</div>
                <div className="text-[14px] text-keiro-muted">{item.desc}</div>
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 32 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, ease: easeOutExpo, delay: 0.12 }}
          className="lg:col-span-5 lg:col-start-8"
        >
          <div className="bg-white rounded-[32px] p-8 md:p-10 border border-keiro-border shadow-[var(--shadow-lg)]">
            <div className="text-[11px] uppercase tracking-widest text-keiro-muted mb-2">Request a demo</div>
            <h3 className="font-display text-[28px] md:text-[32px] text-[#0a1f12] mb-2 leading-tight">
              Let&apos;s get Keiro in your waiting room.
            </h3>
            <p className="text-[13px] text-keiro-muted mb-8">No sales calls. No contracts. Just helping patients.</p>

            {submitted ? (
              <div className="text-center py-10 rounded-2xl bg-keiro-surface border border-keiro-border">
                <div className="text-4xl mb-3">✓</div>
                <p className="font-medium text-keiro-dark">Thanks! We&apos;ll be in touch shortly.</p>
              </div>
            ) : (
              <form onSubmit={handleContact} className="space-y-5">
                {[
                  { key: 'name', label: 'Your name', type: 'text' },
                  { key: 'email', label: 'Work email', type: 'email' },
                  { key: 'hospital', label: 'Hospital or clinic', type: 'text' },
                ].map((field) => (
                  <div key={field.key}>
                    <label className="text-[12px] text-keiro-muted block mb-2">{field.label}</label>
                    <input
                      type={field.type}
                      required
                      value={contactForm[field.key as keyof typeof contactForm]}
                      onChange={(e) => setContactForm((p) => ({ ...p, [field.key]: e.target.value }))}
                      className="w-full h-12 px-4 rounded-xl border border-keiro-border bg-[#fafaf7] focus:bg-white focus:border-keiro-mid focus:ring-4 focus:ring-keiro-mid/10 outline-none transition"
                    />
                  </div>
                ))}
                <div>
                  <label className="text-[12px] text-keiro-muted block mb-2">Tell us about your patients</label>
                  <textarea
                    rows={3}
                    value={contactForm.message}
                    onChange={(e) => setContactForm((p) => ({ ...p, message: e.target.value }))}
                    className="w-full p-4 rounded-xl border border-keiro-border bg-[#fafaf7] focus:bg-white focus:border-keiro-mid focus:ring-4 focus:ring-keiro-mid/10 outline-none transition resize-none"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full h-14 bg-[#0a1f12] text-white rounded-xl font-medium hover:bg-keiro-dark transition flex items-center justify-center gap-2 group"
                >
                  Request a demo
                  <span className="group-hover:translate-x-1 transition">→</span>
                </button>
              </form>
            )}
          </div>
        </motion.div>
      </div>
    </section>
  )
}
