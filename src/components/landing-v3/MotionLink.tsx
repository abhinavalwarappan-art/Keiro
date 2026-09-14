'use client'

/* Primary / ghost CTA.
   Primary sits on --lx-ink (11.8:1 against white) rather than --lx-green, which
   only reaches 3.1:1 on this cream ground and would fail AA for button text.
   min-h-12 keeps every target above the 44px floor on a phone. */

import Link from 'next/link'
import { motion } from 'framer-motion'
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
    <motion.div
      className="inline-block"
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: 'spring', stiffness: 400, damping: 22 }}
    >
      <Link
        href={href}
        {...externalProps}
        className={[
          'lx-focus lx-btn inline-flex min-h-12 items-center justify-center rounded-full px-6 text-base font-semibold',
          isPrimary ? 'lx-btn-primary' : 'lx-btn-ghost',
        ].join(' ')}
      >
        {children}
      </Link>
    </motion.div>
  )
}
