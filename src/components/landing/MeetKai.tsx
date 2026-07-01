'use client'

import { motion, useInView } from 'framer-motion'
import { useRef } from 'react'
import Kai from '@/components/kai/Kai'
import { easeOutExpo } from '@/lib/motion'
import { RetroGrid } from '@/components/ui/retro-grid'
import { VoiceChat } from '@/components/ui/ia-siri-chat'
import { FeatureHighlightCard } from '@/components/ui/feature-highlight-card'
import { Globe, ShieldCheck, Zap, HeartPulse } from 'lucide-react'

const POINTS = [
  { icon: <Globe size={24} />,       label: 'Speaks 25+ languages fluently',  sub: 'Medical terminology in every language' },
  { icon: <Zap size={24} />,         label: 'Adapts to your pace',             sub: 'Never rushes. Never intimidates.' },
  { icon: <HeartPulse size={24} />,  label: 'Emergency escalation',            sub: 'Detects danger and acts instantly' },
  { icon: <ShieldCheck size={24} />, label: 'Privacy first',                   sub: 'Only the final report is stored — never your conversation' },
]

export default function MeetKai() {
  const headerRef = useRef(null)
  const headerInView = useInView(headerRef, { once: true, margin: '-60px' })

  return (
    <section id="meet-kai" className="relative bg-canvas py-28 md:py-36 px-6 md:px-12 overflow-hidden">
      <RetroGrid cellSize={48} lineColor="rgba(28,25,23,0.04)" fadeFromColor="#FAFAF9" />
      <div className="relative z-10 max-w-[1200px] mx-auto">

        {/* Label */}
        <motion.div
          ref={headerRef}
          initial={{ opacity: 0, y: 16 }}
          animate={headerInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, ease: easeOutExpo }}
          className="flex items-center gap-4 mb-14"
        >
        </motion.div>

        <div className="grid lg:grid-cols-[1fr_480px] gap-16 lg:gap-24 items-center">

          {/* Left — copy, always visible */}
          <div>
            <motion.h2
              initial={{ opacity: 0, y: 24 }}
              animate={headerInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, ease: easeOutExpo, delay: 0.07 }}
              className="font-display leading-[0.95] tracking-[-0.035em] text-text-primary mb-10"
              style={{ fontSize: 'clamp(36px,5vw,64px)' }}
            >
              A patient,<br />
              <span className="font-light text-brand-ink">multilingual</span>
              <br />assistant.
            </motion.h2>

            <p className="text-lg text-text-secondary leading-relaxed mb-12 max-w-[500px]">
              Kai isn&apos;t a doctor. Kai is a calm, careful presence that asks the right questions in your language. Never rushes. Never diagnoses. Just listens and helps you tell your story exactly the way you want.
            </p>

            {/* Feature cards — animated on scroll */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {POINTS.map((point, i) => (
                <FeatureHighlightCard
                  key={point.label}
                  icon={point.icon}
                  title={point.label}
                  description={point.sub}
                  index={i}
                />
              ))}
            </div>
          </div>

          {/* Right — Kai visual + voice demo */}
          <div
            className="relative flex min-h-[500px] flex-col items-center justify-center gap-0 overflow-hidden rounded-xl pb-4"
            style={{ background: '#13110F' }}
          >
            <div
              className="absolute inset-0 pointer-events-none"
              style={{ background: 'radial-gradient(ellipse at 50% 55%, rgba(20,184,166,0.16) 0%, transparent 68%)' }}
              aria-hidden="true"
            />

            {/* Kai avatar */}
            <div className="relative animate-float scale-110 mt-8 z-10">
              <Kai size="xl" state="idle" interactive={false} />
            </div>

            {/* Ground glow */}
            <div className="mt-1 h-3 w-28 rounded-full opacity-20 blur-xl" style={{ background: '#2DD4BF' }} aria-hidden="true" />

            {/* Siri-style voice orb demo */}
            <div className="relative z-10 w-full px-6 mt-4 pb-6">
              <VoiceChat
                demoMode
                label="Voice-first intake"
                className="py-2"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}