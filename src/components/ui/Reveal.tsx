'use client'

import { useInView } from 'react-intersection-observer'

export function Reveal({
  children,
  delay = 0,
  className = '',
}: {
  children: React.ReactNode
  delay?: number
  className?: string
}) {
  const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.1 })
  return (
    <div
      ref={ref}
      className={`reveal ${inView ? 'in-view' : ''} ${className}`.trim()}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  )
}