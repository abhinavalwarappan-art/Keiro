'use client'

import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import { NumberTicker } from '@/components/ui/number-ticker'
import { Globe, Clock, DollarSign, Smartphone } from 'lucide-react'
import { easeOutExpo } from '@/lib/motion'

const CARDS = [
  {
    id: 'free',
    Icon: DollarSign,
    prefix: '$',
    value: 0,
    suffix: '',
    displayOverride: '$0',
    label: 'to patients, forever',
    sub: 'Healthcare access shouldn\'t be paywalled. Keiro is free. Full stop.',
    size: 'large',    // col-span-2, row-span-2
    accent: '#2DD4BF',
    glowColor: 'rgba(45,212,191,0.16)',
  },
  {
    id: 'americans',
    Icon: Globe,
    prefix: '',
    value: 67,
    suffix: 'M+',
    label: 'Americans with limited English',
    sub: 'A community facing healthcare alone. We exist to change that.',
    size: 'medium',   // col-span-2, row-span-1
    accent: '#5EEAD4',
    glowColor: 'rgba(94,234,212,0.12)',
  },
  {
    id: 'languages',
    Icon: Globe,
    prefix: '',
    value: 25,
    suffix: '+',
    label: 'languages',
    sub: 'More added every month.',
    size: 'small',    // col-span-1
    accent: '#34D399',
    glowColor: 'rgba(52,211,153,0.12)',
  },
  {
    id: 'speed',
    Icon: Clock,
    prefix: '< ',
    value: 2,
    suffix: ' min',
    displayOverride: '< 2 min',
    label: 'from conversation to report',
    sub: 'Ready to hand to your doctor.',
    size: 'small',    // col-span-1
    accent: '#FBBF24',
    glowColor: 'rgba(251,191,36,0.12)',
  },
  {
    id: 'noapp',
    Icon: Smartphone,
    prefix: '',
    value: 0,
    displayOverride: 'Zero',
    suffix: '',
    label: 'downloads required',
    sub: 'Works in any browser on any phone. Patients scan a QR code and start talking — no friction.',
    size: 'wide',     // col-span-2, row-span-1
    accent: '#2DD4BF',
    glowColor: 'rgba(45,212,191,0.12)',
  },
]

function BentoCard({ card, delay = 0 }: { card: typeof CARDS[0]; delay?: number }) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-60px' })

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 28, scale: 0.97 }}
      animate={inView ? { opacity: 1, y: 0, scale: 1 } : {}}
      transition={{ duration: 0.55, ease: easeOutExpo, delay }}
      whileHover={{ scale: 1.015 }}
      className="relative flex flex-col justify-between p-7 md:p-8 rounded-xl overflow-hidden group h-full transition duration-300"
      style={{
        background: 'rgba(255,255,255,0.03)',
        border: '1px solid rgba(255,255,255,0.07)',
      }}
    >
      {/* Hover glow */}
      <div
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none rounded-xl"
        style={{
          background: `radial-gradient(ellipse 80% 70% at 30% 40%, ${card.glowColor} 0%, transparent 65%)`,
        }}
        aria-hidden
      />

      {/* Top accent line */}
      <div
        className="absolute top-0 left-7 right-7 h-[1.5px] rounded-full opacity-60"
        style={{ background: `linear-gradient(90deg, ${card.accent} 0%, transparent 70%)` }}
        aria-hidden
      />

      {/* Icon chip */}
      <div
        className="relative z-10 inline-flex items-center justify-center w-10 h-10 rounded-xl mb-6 flex-shrink-0"
        style={{ background: `${card.accent}18`, border: `1px solid ${card.accent}30` }}
      >
        <card.Icon size={18} style={{ color: card.accent }} aria-hidden />
      </div>

      {/* Number */}
      <div className="relative z-10 flex-1">
        <div
          className="font-display font-bold leading-none tracking-[-0.04em] mb-3"
          style={{
            fontSize: card.size === 'large' ? 'clamp(72px,9vw,110px)' : 'clamp(44px,5vw,64px)',
            color: card.accent,
          }}
        >
          {card.displayOverride ? (
            <span>{card.displayOverride}</span>
          ) : (
            <>
              {card.prefix}
              <NumberTicker
                value={card.value}
                className="!text-inherit !tracking-inherit"
                style={{ color: 'inherit' }}
              />
              {card.suffix}
            </>
          )}
        </div>

        <p className="text-[16px] md:text-[17px] font-bold text-white mb-2 leading-tight">{card.label}</p>
        <p className="text-[13px] md:text-[14px] leading-relaxed" style={{ color: 'rgba(255,255,255,0.4)' }}>
          {card.sub}
        </p>
      </div>
    </motion.div>
  )
}

export default function ImpactBento() {
  const headerRef = useRef(null)
  const headerInView = useInView(headerRef, { once: true, margin: '-60px' })

  return (
    <section
      className="relative px-6 py-24 md:px-12 md:py-32"
      style={{ background: '#0C0A09' }}
    >
      {/* Subtle ambient glow */}
      <div
        className="absolute pointer-events-none inset-x-0 top-0 h-px"
        style={{ background: 'linear-gradient(90deg, transparent 0%, rgba(45,212,191,0.35) 50%, transparent 100%)' }}
        aria-hidden
      />

      <div className="max-w-[1200px] mx-auto">

        {/* Label */}
        <div ref={headerRef}>
          <motion.h2
            initial={{ opacity: 0, y: 24 }}
            animate={headerInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, ease: easeOutExpo, delay: 0.07 }}
            className="font-display leading-[0.95] tracking-[-0.035em] text-white mb-16"
            style={{ fontSize: 'clamp(36px,5vw,60px)' }}
          >
            Built for the patients<br />
            <span className="font-light" style={{ color: '#2DD4BF' }}>the system forgot.</span>
          </motion.h2>
        </div>

        {/* Bento grid — 4-col base */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 auto-rows-auto">

          {/* $0 — 2×2, large anchor */}
          <div className="col-span-2 row-span-2">
            <BentoCard card={CARDS[0]} delay={0} />
          </div>

          {/* 67M+ — 2×1 */}
          <div className="col-span-2">
            <BentoCard card={CARDS[1]} delay={0.06} />
          </div>

          {/* 25+ and < 2 min — side by side, 1×1 each */}
          <div className="col-span-1">
            <BentoCard card={CARDS[2]} delay={0.12} />
          </div>
          <div className="col-span-1">
            <BentoCard card={CARDS[3]} delay={0.18} />
          </div>

          {/* Zero downloads — full width bottom */}
          <div className="col-span-2 lg:col-span-4">
            <BentoCard card={CARDS[4]} delay={0.22} />
          </div>

        </div>
      </div>
    </section>
  )
}