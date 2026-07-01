'use client'

/* Shared scroll-into-view reveal — replaces the old GSAP ScrollTrigger reveals.
   `once: true` so content never re-hides; under <MotionConfig reducedMotion="user">
   the transform is skipped and only opacity fades (WCAG-friendly). */

import { motion, type Variants } from 'framer-motion'
import type { ReactNode } from 'react'

type RevealVariant = 'up' | 'left' | 'right' | 'fade'

const VARIANTS: Record<RevealVariant, Variants> = {
  up: { hidden: { y: 40, opacity: 0 }, show: { y: 0, opacity: 1 } },
  left: { hidden: { x: -36, opacity: 0 }, show: { x: 0, opacity: 1 } },
  right: { hidden: { x: 36, opacity: 0 }, show: { x: 0, opacity: 1 } },
  fade: { hidden: { opacity: 0 }, show: { opacity: 1 } },
}

type RevealProps = {
  children: ReactNode
  variant?: RevealVariant
  delay?: number
  className?: string
}

export function Reveal({ children, variant = 'up', delay = 0, className }: RevealProps) {
  return (
    <motion.div
      className={className}
      variants={VARIANTS[variant]}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: '-12% 0px' }}
      transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1], delay }}
    >
      {children}
    </motion.div>
  )
}