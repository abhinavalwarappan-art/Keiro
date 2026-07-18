/* Primary / ghost CTA.

   Rectangular (8px — the control radius; no pill buttons on this site, see
   DESIGN.md §4) and deliberately spring-free: the old Framer whileHover scale
   was the classic template CTA. Hover is a ground change, press is a 1px
   settle (both in landing.css), and the label can carry the arrow bus.

   Primary sits on --lx-ink (15.7:1 against paper) rather than any green —
   green fills fail AA for button text. min-h-12 keeps every target above the
   44px floor on a phone. Server-safe: no hooks, no 'use client'. */

import Link from 'next/link'
import type { ReactNode } from 'react'

type MotionLinkProps = {
  href: string
  children: ReactNode
  variant?: 'primary' | 'ghost'
  external?: boolean
}

export function MotionLink({ href, children, variant = 'primary', external = false }: MotionLinkProps) {
  const isPrimary = variant === 'primary'
  const externalProps = external ? { target: '_blank', rel: 'noopener noreferrer' } : {}

  return (
    <Link
      href={href}
      {...externalProps}
      className={[
        'lx-focus lx-btn inline-flex min-h-12 items-center justify-center gap-2 px-6 text-base font-semibold',
        isPrimary ? 'lx-btn-primary' : 'lx-btn-ghost',
      ].join(' ')}
    >
      {children}
    </Link>
  )
}
