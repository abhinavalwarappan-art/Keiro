'use client'

/* Shared scroll-into-view reveal.

   Short, confident travel: 12px rise, 480ms on the house curve — arrives
   almost immediately and stops dead rather than drifting to a halt. Big soft
   movements read as a marketing site trying to be pleasing; short fast ones
   read as an interface.

   `once: true` so content never re-hides. Under <MotionConfig reducedMotion="user">
   Framer drops the transform and fades only, so the reduced-motion path is free. */

import { motion, type Variants } from 'framer-motion'
import type { ReactNode } from 'react'

type RevealVariant = 'up' | 'left' | 'right' | 'fade'

const VARIANTS: Record<RevealVariant, Variants> = {
  up: { hidden: { y: 12, opacity: 0 }, show: { y: 0, opacity: 1 } },
  left: { hidden: { x: -12, opacity: 0 }, show: { x: 0, opacity: 1 } },
  right: { hidden: { x: 12, opacity: 0 }, show: { x: 0, opacity: 1 } },
  fade: { hidden: { opacity: 0 }, show: { opacity: 1 } },
}

/* The house curve — cubic-bezier(0.22, 1, 0.36, 1), matching --lx-ease. */
export const EASE_OUT_QUART = [0.22, 1, 0.36, 1] as const
export const DURATION_MOVE = 0.48

type RevealProps = {
  children: ReactNode
  variant?: RevealVariant
  delay?: number
  className?: string
  /* Render as a list item when the Reveal sits directly inside a <ul>/<ol>.
     A <ul> whose direct children are wrapper <div>s is invalid list markup
     (axe: `list`/`listitem`) — screen readers stop announcing "list, N items",
     and browser translation tools can mis-segment the content. The reveal
     wrapper must BE the <li>, never sit between the list and its items. */
  as?: 'div' | 'li'
}

export function Reveal({ children, variant = 'up', delay = 0, className, as = 'div' }: RevealProps) {
  const Tag = as === 'li' ? motion.li : motion.div
  return (
    <Tag
      className={className}
      variants={VARIANTS[variant]}
      initial="hidden"
      whileInView="show"
      /* Fires a little early: content that pops in after you have already
         looked at the empty space reads as a slow page. */
      viewport={{ once: true, margin: '-8% 0px' }}
      transition={{ duration: DURATION_MOVE, ease: EASE_OUT_QUART, delay }}
    >
      {children}
    </Tag>
  )
}
