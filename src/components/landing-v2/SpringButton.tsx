'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { type ReactNode } from 'react'

// Created once — recreating per render would remount the node on every update.
const MotionLink = motion.create(Link)

type Variant = 'primary' | 'ghost'

type SpringButtonProps = {
  children: ReactNode
  href?: string
  onClick?: () => void
  variant?: Variant
  type?: 'button' | 'submit'
  className?: string
  'aria-label'?: string
}

const base =
  'group relative inline-flex items-center justify-center gap-2 rounded-full px-7 py-3.5 text-[0.95rem] font-medium tracking-tight transition-colors duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2'

const variants: Record<Variant, string> = {
  primary:
    'text-[#1a1206] [background:linear-gradient(180deg,var(--amber-soft),var(--amber))] shadow-[0_10px_40px_-12px_var(--amber-glow)] hover:shadow-[0_16px_50px_-12px_var(--amber-glow)] focus-visible:outline-[var(--amber)]',
  ghost:
    'text-[var(--fg)] border border-[var(--line-strong)] bg-white/[0.02] hover:bg-white/[0.05] hover:border-[var(--line-strong)] focus-visible:outline-[var(--fg-3)]',
}

// Soft spring — pronounced but never bouncy enough to feel cheap.
const hover = { scale: 1.035, y: -2 }
const tap = { scale: 0.975 }
const spring = { type: 'spring' as const, stiffness: 420, damping: 26, mass: 0.7 }

export function SpringButton({
  children,
  href,
  onClick,
  variant = 'primary',
  type = 'button',
  className = '',
  'aria-label': ariaLabel,
}: SpringButtonProps) {
  const cls = `${base} ${variants[variant]} ${className}`.trimEnd()
  const inner = <span className="relative z-10 inline-flex items-center gap-2">{children}</span>

  if (href) {
    return (
      <MotionLink
        href={href}
        aria-label={ariaLabel}
        className={cls}
        whileHover={hover}
        whileTap={tap}
        transition={spring}
        onClick={onClick}
      >
        {inner}
      </MotionLink>
    )
  }

  return (
    <motion.button
      type={type}
      onClick={onClick}
      aria-label={ariaLabel}
      className={cls}
      whileHover={hover}
      whileTap={tap}
      transition={spring}
    >
      {inner}
    </motion.button>
  )
}