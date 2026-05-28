'use client'

import { motion, useInView } from 'framer-motion'
import { useRef } from 'react'
import { Globe, MessageCircle, FileText } from 'lucide-react'
import { CountUp } from './CountUp'
import { easeOutExpo } from '@/lib/motion'

const STEPS = [
  {
    num: '01',
    title: 'Choose your language',
    desc: 'Tap your flag. Everything switches to your language instantly. No English required from this point forward.',
    Icon: Globe,
  },
  {
    num: '02',
    title: 'Talk with Kai',
    desc: 'Speak naturally about your symptoms. Kai listens, asks the right questions, and never rushes you. Type or use your voice.',
    Icon: MessageCircle,
  },
  {
    num: '03',
    title: 'Hand your doctor the report',
    desc: 'Kai builds a clean English medical summary from your conversation. Download PDF, share by text, or show the screen.',
    Icon: FileText,
  },
]

const STATS = [
  { target: 67000000, suffix: '+', label: 'Americans with limited English', sub: 'A community we exist to serve', display: '67M+' },
  { target: 25, suffix: '+', label: 'Languages supported', sub: 'More added every month', display: '25+' },
  { target: 0, suffix: '', label: 'Cost to patients — forever', sub: "Healthcare access shouldn't be paywalled", display: '$0' },
]

function StepRow({ step, index }: { step: (typeof STEPS)[0]; index: number }) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })
  const Icon = step.Icon

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 32 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, ease: easeOutExpo, delay: index * 0.1 }}
      className="group grid lg:grid-cols-12 gap-8 items-center border-t border-keiro-border py-12 px-4 md:px-0 hover:border-l-4 hover:border-l-keiro-mid hover:bg-[#fafffe] transition-all"
    >
      <div className="lg:col-span-2">
        <span className="font-display text-[clamp(64px,8vw,96px)] text-keiro-surface leading-none select-none block">
          {step.num}
        </span>
      </div>
      <div className="lg:col-span-7">
        <h3 className="font-display text-[clamp(28px,4vw,40px)] tracking-tight text-[#0a1f12] mb-4">{step.title}</h3>
        <p className="text-[16px] text-keiro-muted leading-relaxed max-w-[520px]">{step.desc}</p>
      </div>
      <div className="lg:col-span-3 flex justify-start lg:justify-end">
        <div className="bg-keiro-surface rounded-2xl p-5 text-keiro-mid">
          <Icon size={36} strokeWidth={1.5} />
        </div>
      </div>
    </motion.div>
  )
}

export default function HowItWorks() {
  const headerRef = useRef(null)
  const headerInView = useInView(headerRef, { once: true })

  return (
    <section id="how" className="bg-white py-24 md:py-32 px-4 md:px-8">
      <div className="max-w-[1400px] mx-auto">
        <motion.div
          ref={headerRef}
          initial={{ opacity: 0, y: 32 }}
          animate={headerInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, ease: easeOutExpo }}
          className="mb-16 grid lg:grid-cols-12 gap-8 items-end"
        >
          <div className="lg:col-span-7">
            <div className="text-[11px] uppercase tracking-widest text-keiro-muted mb-4">— How it works</div>
            <h2 className="font-display text-[clamp(40px,7vw,72px)] leading-[0.95] tracking-tight text-[#0a1f12]">
              Three steps.<br />
              <span className="italic text-keiro-mid font-normal">No friction.</span>
            </h2>
          </div>
          <p className="lg:col-span-4 lg:col-start-9 text-[17px] text-keiro-muted leading-relaxed">
            From opening the app to handing your doctor a complete medical summary — under five minutes, in your own words.
          </p>
        </motion.div>

        {STEPS.map((step, i) => (
          <StepRow key={step.num} step={step} index={i} />
        ))}

        <div className="grid md:grid-cols-3 border-t border-keiro-border pt-16 mt-4">
          {STATS.map((stat, i) => (
            <div
              key={stat.label}
              className={`px-4 py-4 ${i > 0 ? 'md:border-l md:border-keiro-border' : ''}`}
            >
              <div className="font-display text-[clamp(56px,10vw,120px)] leading-none tracking-tight text-[#0a1f12] mb-4">
                <CountUp target={stat.target} suffix={stat.suffix} display={stat.display} />
              </div>
              <div className="text-[14px] font-medium text-keiro-text mb-1">{stat.label}</div>
              <div className="text-[13px] text-keiro-muted">{stat.sub}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
