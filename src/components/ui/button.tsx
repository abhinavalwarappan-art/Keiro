'use client'

import { motion, HTMLMotionProps } from 'framer-motion'
import { forwardRef } from 'react'

interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger'
  size?: 'sm' | 'md' | 'lg'
  loading?: boolean
  children: React.ReactNode
  onClick?: () => void
  disabled?: boolean
  type?: 'button' | 'submit' | 'reset'
  style?: React.CSSProperties
  className?: string
}

const VARIANTS = {
  primary: { background: '#1a3d2b', color: 'white', border: 'none' },
  secondary: { background: '#d4f5e5', color: '#1a3d2b', border: '1.5px solid #2da866' },
  ghost: { background: 'transparent', color: '#1a3d2b', border: '1.5px solid #c5edd8' },
  danger: { background: '#A32D2D', color: 'white', border: 'none' },
}

const SIZES = {
  sm: { padding: '8px 16px', fontSize: '13px', borderRadius: '10px' },
  md: { padding: '12px 24px', fontSize: '14px', borderRadius: '12px' },
  lg: { padding: '16px 32px', fontSize: '15px', borderRadius: '14px' },
}

export default function Button({ variant = 'primary', size = 'md', loading, children, disabled, style, className, ...props }: ButtonProps) {
  return (
    <motion.button
      whileTap={{ scale: disabled || loading ? 1 : 0.97 }}
      transition={{ duration: 0.1 }}
      disabled={disabled || loading}
      className={className}
      style={{
        ...VARIANTS[variant],
        ...SIZES[size],
        fontWeight: 600,
        cursor: disabled || loading ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.5 : 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        transition: 'opacity 0.15s, background 0.15s',
        ...style,
      } as React.CSSProperties}
      {...props}
    >
      {loading ? (
        <motion.div
          style={{ width: 16, height: 16, borderRadius: '50%', border: '2px solid currentColor', borderTopColor: 'transparent' }}
          animate={{ rotate: 360 }}
          transition={{ duration: 0.7, repeat: Infinity, ease: 'linear' }}
        />
      ) : children}
    </motion.button>
  )
}
