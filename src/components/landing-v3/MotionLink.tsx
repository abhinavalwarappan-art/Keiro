'use client'

/* Primary / ghost CTA.
   Primary sits on --lx-ink (11.8:1 against white) rather than --lx-green, which
   only reaches 3.1:1 on this cream ground and would fail AA for button text.
   min-h-[52px] keeps every target comfortably above the 44px floor on a phone.
   The press is a critically damped spring (no wobble) that starts on pointer-down;
   there is no hover scale because hover is sticky on touch. */

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
      className="block w-full sm:inline-block sm:w-auto"
      whileTap={{ scale: 0.97 }}
      transition={{ type: 'spring', stiffness: 700, damping: 45 }}
    >
      <Link
        href={href}
        {...externalProps}
        className={[
          'lx-focus lx-btn flex w-full min-h-[52px] items-center justify-center rounded-[14px] px-6 sm:inline-flex sm:w-auto text-base font-semibold',
          isPrimary ? 'lx-btn-primary' : 'lx-btn-ghost',
        ].join(' ')}
      >
        {children}
      </Link>
    </motion.div>
  )
}
