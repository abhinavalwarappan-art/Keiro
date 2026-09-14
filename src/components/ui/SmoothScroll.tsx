'use client'

import { useEffect } from 'react'
import { cancelFrame, frame } from 'framer-motion'
import Lenis from 'lenis'

let lenis: Lenis | null = null

/**
 * Smooth-scroll to a target through Lenis so programmatic jumps stay in sync
 * with the wheel smoothing. Falls back to native scroll before Lenis mounts or
 * when reduced motion has disabled it.
 */
export function smoothScrollTo(
  target: number | string | HTMLElement,
  options?: { offset?: number },
) {
  if (lenis) {
    lenis.scrollTo(target, { offset: options?.offset ?? 0 })
    return
  }

  if (typeof target === 'number') {
    window.scrollTo({ top: target, behavior: 'smooth' })
    return
  }
  const el = typeof target === 'string' ? document.querySelector(target) : target
  el?.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

export function SmoothScroll() {
  useEffect(() => {
    // Reduced-motion users get native scrolling — no JS interpolation at all.
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    const lenisInstance = new Lenis({
      lerp: 0.1, // responsive without the floaty feel of duration easing
      smoothWheel: true,
      anchors: true, // route #hash links through Lenis automatically
      autoRaf: false, // we drive raf from Framer Motion's loop (single rAF)
    })

    lenis = lenisInstance

    // Share ONE frame loop with Framer Motion so scroll-linked animations
    // (useScroll / useTransform) read the same scroll position Lenis sets.
    const update = (data: { timestamp: number }) => {
      lenisInstance.raf(data.timestamp)
    }
    frame.update(update, true)

    return () => {
      cancelFrame(update)
      lenisInstance.destroy()
      lenis = null
    }
  }, [])

  return null
}