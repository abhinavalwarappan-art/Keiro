'use client'

/* Shared scroll-into-view reveal.

   Retuned to Stripe's motion tokens. Two things were wrong with the old numbers,
   and both are the difference between "animated" and "engineered":

   1. TRAVEL. 40px of rise is a long way. Big soft movements read as a marketing
      site trying to be pleasing; short, fast, confident ones read as an interface.
      Stripe's content settles in ~8–12px. Ours is 14.

   2. DURATION AND CURVE. 700ms on an easeOutExpo is a swoop. Stripe moves things
      in 300ms on easeOutQuart — cubic-bezier(.25, 1, .5, 1) — which arrives almost
      immediately and stops dead rather than drifting to a halt. The whole site
      feels quicker for it, without anything actually being faster.

   `once: true` so content never re-hides. Under <MotionConfig reducedMotion="user">
   Framer drops the transform and fades only, so the reduced-motion path is free. */

import { motion, type Variants } from 'framer-motion'
import type { ReactNode } from 'react'

type RevealVariant = 'up' | 'left' | 'right' | 'fade'

const VARIANTS: Record<RevealVariant, Variants> = {
  up: { hidden: { y: 14, opacity: 0 }, show: { y: 0, opacity: 1 } },
  left: { hidden: { x: -14, opacity: 0 }, show: { x: 0, opacity: 1 } },
  right: { hidden: { x: 14, opacity: 0 }, show: { x: 0, opacity: 1 } },
  fade: { hidden: { opacity: 0 }, show: { opacity: 1 } },
}

/* easeOutQuart. Stripe's movement curve, verbatim. */
export const EASE_OUT_QUART = [0.25, 1, 0.5, 1] as const
export const DURATION_MOVE = 0.34

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
      /* Fires a little earlier than before (-8% vs -12%): content that pops in
         after you have already looked at the empty space reads as a slow page. */
      viewport={{ once: true, margin: '-8% 0px' }}
      transition={{ duration: DURATION_MOVE, ease: EASE_OUT_QUART, delay }}
    >
      {children}
    </Tag>
  )
}