'use client'

import { motion, useInView } from 'framer-motion'
import { useRef } from 'react'
import Kai from '@/components/kai/Kai'
import { easeOutExpo } from '@/lib/motion'

const POINTS = [
  'Speaks 25+ languages fluently',
  'Adapts to your pace, never rushes you',
  'Escalates emergencies instantly — without you having to ask',
  'Only stores the final report — never your conversation',
]

export default function MeetKai() {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, amount: 0.1 })

  return (
    <section className="bg-white py-24 md:py-32 px-4 md:px-8">
      <div ref={ref} className="max-w-[1400px] mx-auto grid lg:grid-cols-12 gap-16 items-center">
        <motion.div
          initial={{ opacity: 0, x: -24 }}
          animate={inView ? { opacity: 1, x: 0 } : {}}
          transition={{ duration: 0.6, ease: easeOutExpo }}
          className="lg:col-span-6 relative h-[450px] md:h-[560px] flex items-center justify-center bg-keiro-surface rounded-[40px] overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-keiro-light/20 to-transparent" />
          <div className="relative animate-float scale-110 md:scale-125">
            <Kai size="xl" state="idle" interactive={false} />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 24 }}
          animate={inView ? { opacity: 1, x: 0 } : {}}
          transition={{ duration: 0.6, ease: easeOutExpo, delay: 0.1 }}
          className="lg:col-span-6"
        >
          <div className="text-[11px] uppercase tracking-widest text-keiro-muted mb-4">— Meet Kai</div>
          <h2 className="font-display text-[clamp(36px,5vw,72px)] leading-[1] tracking-tight text-[#0a1f12] mb-8">
            A patient,<br />
            <span className="italic text-keiro-mid font-normal">multilingual</span>
            <br />
            assistant.
          </h2>
          <p className="text-[17px] text-keiro-muted leading-[1.7] mb-8">
            Kai isn&apos;t a doctor. Kai is a calm, careful presence that asks the right questions in your language. Never rushes. Never diagnoses. Just listens, confirms, and helps you tell your story to your doctor exactly the way you want.
          </p>
          <div className="space-y-4 border-t border-keiro-border pt-8">
            {POINTS.map((point) => (
              <div key={point} className="flex items-start gap-3 text-[15px]">
                <span className="text-keiro-mid mt-0.5">→</span>
                <span className="text-[#0a1f12]">{point}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  )
}
