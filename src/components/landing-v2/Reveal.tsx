'use client'

import { useRef, useLayoutEffect, type ReactNode } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger)
}

type RevealProps = {
  children: ReactNode
  /** Stagger between direct children, in seconds. */
  stagger?: number
  /** Distance travelled on enter, in px. */
  y?: number
  /** Delay before the first child animates. */
  delay?: number
  className?: string
}

/**
 * Wraps a block whose descendants should reveal with a staggered upward
 * fade as the block scrolls into view. Descendants opt in by carrying the
 * `.kx-reveal` class (their hidden base state lives in landing.css).
 */
export function Reveal({
  children,
  stagger = 0.09,
  y = 28,
  delay = 0,
  className,
}: RevealProps) {
  const scope = useRef<HTMLDivElement>(null)

  useLayoutEffect(() => {
    const el = scope.current
    if (!el) return

    const ctx = gsap.context(() => {
      const targets = gsap.utils.toArray<HTMLElement>('.kx-reveal', el)
      if (targets.length === 0) return

      gsap.fromTo(
        targets,
        { opacity: 0, y },
        {
          opacity: 1,
          y: 0,
          duration: 0.85,
          ease: 'power3.out',
          stagger,
          delay,
          scrollTrigger: { trigger: el, start: 'top 82%', once: true },
        },
      )
    }, el)

    // Positions settle after fonts/layout; recalc once mounted.
    ScrollTrigger.refresh()

    return () => ctx.revert()
  }, [stagger, y, delay])

  return (
    <div ref={scope} className={className}>
      {children}
    </div>
  )
}