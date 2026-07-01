'use client'

import { useEffect, useRef } from 'react'
import { cn } from '@/lib/utils'

interface Star {
  x: number
  y: number
  z: number
  size: number
  brightness: number
  twinklePhase: number
  twinkleSpeed: number
  hue: number
  /** 0 = hidden against the black, 1 = fully popped out near the cursor */
  reveal: number
}

interface StarrySkyBackgroundProps {
  className?: string
  /** Star density multiplier — default 1 */
  density?: number
  /** Twinkle + cursor-driven star light-up. Off = static star field. */
  interactive?: boolean
}

function createStar(width: number, height: number): Star {
  return {
    x: Math.random() * width,
    y: Math.random() * height,
    z: 0.15 + Math.random() * 0.85,
    size: 0.4 + Math.random() * 2.2,
    brightness: 0.35 + Math.random() * 0.65,
    twinklePhase: Math.random() * Math.PI * 2,
    twinkleSpeed: 0.004 + Math.random() * 0.012,
    hue: pickStarHue(),
    reveal: 0,
  }
}

/** How far from the cursor a star can be and still light up (px). */
const REVEAL_RADIUS = 210
const MIN_STAR_COUNT = 500
const MAX_STAR_COUNT = 2200
const STAR_AREA_DIVISOR = 900
const MAX_DPR = 2

function pickStarHue(): number {
  const roll = Math.random()
  if (roll < 0.55) return 48 + Math.random() * 18 // warm gold
  if (roll < 0.82) return 170 + Math.random() * 25 // teal accent
  return 0 // pure white
}

export function StarrySkyBackground({
  className,
  density = 1,
  interactive = false,
}: StarrySkyBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const starsRef = useRef<Star[]>([])
  const mouseRef = useRef({ x: -9999, y: -9999, px: -9999, py: -9999, active: false })
  const frameRef = useRef(0)
  const timeRef = useRef(0)
  const reducedMotionRef = useRef(false)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d', { alpha: true })
    if (!ctx) return

    const ac = new AbortController()
    const listenerOpts = { passive: true, signal: ac.signal } as const

    reducedMotionRef.current = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    const getCanvasSize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, MAX_DPR)
      const w = canvas.width / dpr
      const h = canvas.height / dpr
      return { w, h, dpr }
    }

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, MAX_DPR)
      const parent = canvas.parentElement
      const w = parent ? parent.clientWidth : window.innerWidth
      const h = parent ? parent.clientHeight : window.innerHeight
      canvas.width = w * dpr
      canvas.height = h * dpr
      canvas.style.width = `${w}px`
      canvas.style.height = `${h}px`
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)

      const count = Math.floor((w * h) / STAR_AREA_DIVISOR) * density
      starsRef.current = Array.from(
        { length: Math.min(MAX_STAR_COUNT, Math.max(MIN_STAR_COUNT, count)) },
        () => createStar(w, h),
      )
    }

    // Pure black canvas — the page sits on #000, so a transparent clear reads
    // as fully black. Stars only become visible where the cursor reveals them.
    const paintBackdrop = (w: number, h: number) => {
      ctx.clearRect(0, 0, w, h)
    }

    const renderStar = (star: Star, brightness: number, size: number) => {
      const alpha = brightness * (0.25 + star.z * 0.75)
      if (alpha < 0.04) return

      const sat = star.hue === 0 ? 0 : 72 + star.z * 18
      const light = 80 + brightness * 20
      const tint = (a: number) =>
        star.hue === 0
          ? `rgba(255, 255, 255, ${a})`
          : `hsla(${star.hue}, ${sat}%, ${light}%, ${a})`

      // soft bloom halo around every star for depth
      const haloR = size * (brightness > 0.7 ? 4.5 : 2.6)
      const halo = ctx.createRadialGradient(star.x, star.y, 0, star.x, star.y, haloR)
      halo.addColorStop(0, tint(alpha * 0.6))
      halo.addColorStop(0.35, tint(alpha * 0.16))
      halo.addColorStop(1, 'rgba(0, 0, 0, 0)')
      ctx.fillStyle = halo
      ctx.beginPath()
      ctx.arc(star.x, star.y, haloR, 0, Math.PI * 2)
      ctx.fill()

      // diffraction spikes — only the brightest stars earn them
      if (size > 1.6 && brightness > 0.72) {
        const len = size * (4 + brightness * 6)
        const spike = (horizontal: boolean) => {
          const g = horizontal
            ? ctx.createLinearGradient(star.x - len, star.y, star.x + len, star.y)
            : ctx.createLinearGradient(star.x, star.y - len, star.x, star.y + len)
          g.addColorStop(0, 'rgba(0, 0, 0, 0)')
          g.addColorStop(0.5, tint(alpha * 0.55))
          g.addColorStop(1, 'rgba(0, 0, 0, 0)')
          ctx.fillStyle = g
          if (horizontal) ctx.fillRect(star.x - len, star.y - 0.5, len * 2, 1)
          else ctx.fillRect(star.x - 0.5, star.y - len, 1, len * 2)
        }
        spike(true)
        spike(false)
      }

      // crisp core
      ctx.beginPath()
      ctx.fillStyle = tint(alpha)
      ctx.arc(star.x, star.y, size, 0, Math.PI * 2)
      ctx.fill()

      // bright white pip keeps the centre sharp instead of fuzzy
      if (brightness > 0.6) {
        ctx.beginPath()
        ctx.fillStyle = `rgba(255, 255, 255, ${alpha * 0.85})`
        ctx.arc(star.x, star.y, Math.max(0.5, size * 0.42), 0, Math.PI * 2)
        ctx.fill()
      }
    }

    const drawStarInteractive = (star: Star, t: number) => {
      const mouse = mouseRef.current

      // Target reveal = how close the cursor is, with a sharp center falloff.
      let target = 0
      if (mouse.active) {
        const dx = star.x - mouse.x
        const dy = star.y - mouse.y
        const influence = Math.max(0, 1 - Math.hypot(dx, dy) / REVEAL_RADIUS)
        target = influence * influence
      }

      // Pop out fast as the cursor arrives, close back up slowly as it leaves —
      // so the trail you traced lingers a beat before fading to black again.
      const ease = target > star.reveal ? 0.24 : 0.05
      star.reveal += (target - star.reveal) * ease
      if (star.reveal < 0.015) return

      const twinkle = 0.72 + 0.28 * Math.sin(t * star.twinkleSpeed + star.twinklePhase)
      const brightness = Math.min(1, star.brightness * twinkle) * star.reveal
      const size = star.size * (0.6 + star.z * 0.5) * (0.45 + star.reveal * 0.85)

      renderStar(star, brightness, size)
    }

    const drawCursorGlow = (w: number, h: number) => {
      const mouse = mouseRef.current
      if (!mouse.active) return

      // cool, faint wash that reinforces the star light-up — no warm/yellow tint
      const glow = ctx.createRadialGradient(mouse.x, mouse.y, 0, mouse.x, mouse.y, 170)
      glow.addColorStop(0, 'rgba(205, 235, 255, 0.10)')
      glow.addColorStop(0.4, 'rgba(45, 212, 191, 0.06)')
      glow.addColorStop(1, 'rgba(0, 0, 0, 0)')
      ctx.fillStyle = glow
      ctx.fillRect(0, 0, w, h)
    }

    // Non-interactive sections stay fully black — no star field to reveal.
    const paintStatic = () => {
      const { w, h } = getCanvasSize()
      paintBackdrop(w, h)
    }

    const onMove = (e: PointerEvent) => {
      try {
        const rect = canvas.getBoundingClientRect()
        const mx = e.clientX - rect.left
        const my = e.clientY - rect.top
        const inBounds =
          mx >= 0 && my >= 0 && mx <= rect.width && my <= rect.height && rect.height > 0

        if (!inBounds) {
          mouseRef.current.active = false
          return
        }

        const prev = mouseRef.current
        mouseRef.current = { x: mx, y: my, px: prev.x, py: prev.y, active: true }
      } catch {
        // Stale HMR listener — swallow so the dev overlay never trips.
      }
    }

    const onLeave = () => {
      mouseRef.current.active = false
    }

    const animate = () => {
      const { w, h } = getCanvasSize()
      timeRef.current += reducedMotionRef.current ? 0 : 1

      paintBackdrop(w, h)

      const t = timeRef.current
      const stars = starsRef.current

      // Sort by z ascending (back to front) — avoid re-sorting every frame
      // by sorting only on resize; stars do not change z at runtime.
      for (const star of stars) drawStarInteractive(star, t)

      drawCursorGlow(w, h)

      frameRef.current = requestAnimationFrame(animate)
    }

    const dispose = () => {
      ac.abort()
      cancelAnimationFrame(frameRef.current)
    }

    const handleResize = () => {
      resize()
      if (!interactive) paintStatic()
    }

    resize()
    // Sort once after initial population so back-to-front order is maintained
    // without paying the O(n log n) cost every animation frame.
    starsRef.current.sort((a, b) => a.z - b.z)

    if (interactive) {
      window.addEventListener('resize', handleResize, listenerOpts)
      window.addEventListener('pointermove', onMove, listenerOpts)
      window.addEventListener('pointerleave', onLeave, listenerOpts)
      animate()
    } else {
      paintStatic()
      window.addEventListener('resize', handleResize, listenerOpts)
    }

    return () => {
      dispose()
    }
  }, [density, interactive])

  return (
    <canvas
      ref={canvasRef}
      className={cn('pointer-events-none absolute inset-0 h-full w-full', className)}
      aria-hidden
    />
  )
}