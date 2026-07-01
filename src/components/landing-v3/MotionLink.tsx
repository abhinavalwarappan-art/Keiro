'use client'

/* Primary / ghost CTA.
   - Framer Motion spring scale on hover + tap
   - Primary: CSS shimmer sweep on hover (.lx-shimmer) + --glow box-shadow (.lx-glow) */

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
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.97 }}
      transition={{ type: 'spring', stiffness: 400, damping: 20 }}
    >
      <Link
        href={href}
        {...externalProps}
        className={[
          'relative inline-flex h-12 items-center justify-center overflow-hidden rounded-[8px] px-6 text-sm font-semibold',
          isPrimary
            ? 'lx-shimmer-host lx-glow text-[#050705]'
            : 'border border-white/20 text-white transition-colors duration-200 hover:border-white/40',
        ].join(' ')}
        style={isPrimary ? { background: 'var(--kx-accent)' } : undefined}
      >
        {isPrimary && <span className="lx-shimmer" aria-hidden="true" />}
        <span className="relative z-10">{children}</span>
      </Link>
    </motion.div>
  )
}