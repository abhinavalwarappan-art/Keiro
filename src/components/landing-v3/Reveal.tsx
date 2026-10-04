/* Reveal — historically a scroll-into-view fade-up. The redesign removes
   scroll-triggered fade-ups site-wide (content is simply there when you arrive),
   so this is now a plain wrapper. It keeps its props and the `as="li"` escape
   hatch so call sites didn't need to change: the wrapper must BE the <li> when it
   sits directly inside a <ul>/<ol>, or the list markup is invalid. */

import type { ReactNode } from 'react'

/* Retained for modules that import the Stripe-derived motion tokens. */
export const EASE_OUT_QUART = [0.25, 1, 0.5, 1] as const
export const DURATION_MOVE = 0.34

type RevealProps = {
  children: ReactNode
  /** Accepted for call-site compatibility; no longer animates. */
  variant?: 'up' | 'left' | 'right' | 'fade'
  /** Accepted for call-site compatibility; no longer animates. */
  delay?: number
  className?: string
  as?: 'div' | 'li'
}

export function Reveal({ children, className, as = 'div' }: RevealProps) {
  const Tag = as
  return <Tag className={className}>{children}</Tag>
}
