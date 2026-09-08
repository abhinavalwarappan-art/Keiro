import type { ReactNode } from 'react'
export const EASE_OUT_QUART = [0.25, 1, 0.5, 1] as const
export const DURATION_MOVE = 0
export function Reveal({ children, className, as: Tag = 'div' }: {
  children: ReactNode; className?: string; as?: 'div' | 'li'; variant?: 'up' | 'left' | 'right' | 'fade'; delay?: number
}) { return <Tag className={className}>{children}</Tag> }
