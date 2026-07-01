'use client'

import { motion } from 'framer-motion'
import { easeOutExpo } from '@/lib/motion'
import { Marquee } from '@/components/ui/marquee'
import { BeamsCanvas } from '@/components/ui/beams-background'

const QUOTES = [
  { text: "My mother speaks only Punjabi. The doctor had the full report in two minutes.", name: "Harpreet S.", role: "Patient's daughter · Dallas, TX", flag: "🇮🇳" },
  { text: "Cut our intake time dramatically for non-English speakers. Taped a QR code to the desk and it just worked.", name: "Dr. Maria Reyes", role: "Family Physician · Fort Worth, TX", flag: "🏥" },
  { text: "Kai talked to me in Vietnamese — no broken English, no embarrassment.", name: "Linh T.", role: "Patient · Houston, TX", flag: "🇻🇳" },
  { text: "Keiro doesn't just solve a translation problem — it gives patients dignity. That actually matters.", name: "James K.", role: "ER Nurse · Plano, TX", flag: "🏥" },
  { text: "Live in our clinic in under ten minutes. No contracts, no IT tickets. Our patients love it.", name: "Dr. Ahmed H.", role: "Internal Medicine · Irving, TX", flag: "🇸🇦" },
  { text: "My abuela finally feels heard at the doctor. Someone cared enough to build this.", name: "Carlos M.", role: "Patient's grandson · San Antonio, TX", flag: "🇲🇽" },
  { text: "First time in 20 years my father could describe his symptoms himself.", name: "Mei L.", role: "Patient's daughter · Seattle, WA", flag: "🇨🇳" },
  { text: "Deployed across four of our clinics in an afternoon. Remarkable how fast it was.", name: "Dr. Samuel O.", role: "Chief of Medicine · Atlanta, GA", flag: "🏥" },
]

function QuotePill({ q }: { q: typeof QUOTES[0] }) {
  return (
    <div
      className="flex items-start gap-3 rounded-2xl px-5 py-4 mx-2 flex-shrink-0 max-w-[340px]"
      style={{
        background: 'rgba(255,255,255,0.04)',
        border: '1px solid rgba(255,255,255,0.07)',
        backdropFilter: 'blur(8px)',
      }}
    >
      <span className="text-2xl flex-shrink-0 mt-0.5" aria-hidden="true">{q.flag}</span>
      <div>
        <p className="text-[13px] leading-[1.6] text-white/70 mb-2">&ldquo;{q.text}&rdquo;</p>
        <p className="text-[12px] font-semibold text-white/50">{q.name} <span className="font-normal text-white/30">· {q.role}</span></p>
      </div>
    </div>
  )
}

function handleMouseEnter(e: React.MouseEvent<HTMLAnchorElement>) {
  const el = e.currentTarget
  el.style.boxShadow = '0 0 40px rgba(11,143,172,0.5)'
  el.style.transform = 'scale(1.03)'
}

function handleMouseLeave(e: React.MouseEvent<HTMLAnchorElement>) {
  const el = e.currentTarget
  el.style.boxShadow = '0 0 28px rgba(11,143,172,0.3)'
  el.style.transform = 'scale(1)'
}

export default function Testimonials() {
  const row1 = QUOTES.slice(0, 4)
  const row2 = QUOTES.slice(4)

  return (
    <section id="testimonials" className="relative bg-[#040E18] py-24 md:py-32 overflow-hidden">

      {/* BeamsCanvas background */}
      <div className="absolute inset-0 z-0 pointer-events-none opacity-20" aria-hidden="true">
        <BeamsCanvas intensity="subtle" className="absolute inset-0 w-full h-full" />
      </div>

      {/* Top divider glow */}
      <div
        className="absolute top-0 inset-x-0 h-px pointer-events-none"
        style={{ background: 'linear-gradient(90deg, transparent 0%, rgba(11,143,172,0.4) 50%, transparent 100%)' }}
        aria-hidden="true"
      />

      {/* Header */}
      <div className="relative z-10 px-6 md:px-12 max-w-[1400px] mx-auto mb-16">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, ease: easeOutExpo }}
          className="flex items-center gap-4 mb-10"
        >
          <span className="w-8 h-px bg-keiro-mid" />
          <span className="font-display italic text-[13px] text-white/40" style={{ letterSpacing: '0.01em' }}>
            From the people who matter most
          </span>
        </motion.div>

        <motion.h2
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: easeOutExpo, delay: 0.07 }}
          className="font-display leading-[0.90] tracking-[-0.04em] text-white"
          style={{ fontSize: 'clamp(44px,6.5vw,80px)' }}
        >
          Real patients.<br />
          <em className="not-italic italic font-light" style={{ color: '#52C5DC' }}>Real doctors.</em>
        </motion.h2>
      </div>

      {/* Scrolling testimonials — two rows, opposite directions */}
      <div className="relative z-10 space-y-3">
        <Marquee pauseOnHover repeat={3} className="[--duration:50s] [--gap:0px]">
          {row1.map(q => <QuotePill key={q.name} q={q} />)}
        </Marquee>
        <Marquee reverse pauseOnHover repeat={3} className="[--duration:55s] [--gap:0px]">
          {row2.map(q => <QuotePill key={q.name} q={q} />)}
        </Marquee>
      </div>

      {/* Bottom CTA */}
      <div className="relative z-10 px-6 md:px-12 max-w-[1400px] mx-auto mt-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, ease: easeOutExpo }}
          className="flex flex-col sm:flex-row items-center justify-between gap-6 p-8 rounded-[24px]"
          style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(82,197,220,0.12)' }}
        >
          <div>
            <p className="font-display text-[22px] md:text-[28px] font-bold text-white tracking-tight leading-tight">
              Join thousands of patients already using Keiro.
            </p>
            <p className="text-[14px] mt-1" style={{ color: 'rgba(255,255,255,0.35)' }}>
              Free forever. No account needed. Works on any phone.
            </p>
          </div>
          <a
            href="/onboarding?fresh=1"
            className="inline-flex items-center gap-2 rounded-full px-8 h-12 text-[14px] font-bold flex-shrink-0 transition duration-300"
            style={{ background: '#0B8FAC', color: 'white', boxShadow: '0 0 28px rgba(11,143,172,0.3)' }}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
          >
            Start with Kai — it&apos;s free
            <span aria-hidden="true">→</span>
          </a>
        </motion.div>
      </div>

    </section>
  )
}