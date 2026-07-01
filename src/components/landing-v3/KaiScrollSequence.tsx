'use client'

/* ============== KAI — SCROLL-SCRUBBED 3D RENDER (Serve Robotics rig) ==========
   The premium "3D scroll" look is NOT achievable by moving a flat SVG. Serve
   bakes a real 3D robot (lighting, shadows, reflections, rotation) into a render
   and scrubs it on scroll. This is that engine: a pre-rendered image sequence of
   Kai, drawn frame-by-frame onto a <canvas>, indexed by a scroll MotionValue.

   No WebGL, no Three.js — just one canvas and N decoded frames. Drives perfectly
   off the existing Lenis + Framer scroll loop.

   ASSET CONTRACT (drop into public/kai/scroll/):
     - kai_0001.webp … kai_<frameCount>.webp  (zero-padded, 1-based)
     - transparent background, Kai centred, consistent camera across frames
   ========================================================================== */

import { useCallback, useEffect, useRef } from 'react'
import { useMotionValueEvent, type MotionValue } from 'framer-motion'

type Props = {
  /** 0 → first frame, 1 → last frame. Usually a section's scrollYProgress. */
  progress: MotionValue<number>
  /** Number of frames in the sequence. */
  frameCount: number
  /** URL prefix before the index, e.g. '/kai/scroll/kai_'. */
  basePath: string
  /** File extension without the dot. */
  ext?: string
  /** Zero-pad width of the frame index. */
  pad?: number
  className?: string
}

export function KaiScrollSequence({
  progress,
  frameCount,
  basePath,
  ext = 'webp',
  pad = 4,
  className,
}: Props) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const framesRef = useRef<HTMLImageElement[]>([])
  const currentRef = useRef(-1)

  const draw = useCallback((index: number) => {
    const canvas = canvasRef.current
    const img = framesRef.current[index]
    if (!canvas || !img || !img.complete || img.naturalWidth === 0) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Cap DPR at 2 — past that the extra pixels cost more than they show.
    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    const cw = canvas.clientWidth
    const ch = canvas.clientHeight

    // Guard against zero-size canvas (e.g. hidden / display:none)
    if (cw === 0 || ch === 0) return

    if (canvas.width !== Math.round(cw * dpr) || canvas.height !== Math.round(ch * dpr)) {
      canvas.width = Math.round(cw * dpr)
      canvas.height = Math.round(ch * dpr)
    }

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    ctx.clearRect(0, 0, cw, ch)

    // contain (letterbox), centred — frames keep their aspect at any size.
    const imgRatio = img.naturalWidth / img.naturalHeight
    const boxRatio = cw / ch
    let dw: number
    let dh: number
    if (imgRatio > boxRatio) {
      dw = cw
      dh = cw / imgRatio
    } else {
      dh = ch
      dw = ch * imgRatio
    }
    ctx.drawImage(img, (cw - dw) / 2, (ch - dh) / 2, dw, dh)
    currentRef.current = index
  }, [])

  // Preload every frame; paint the first as soon as it decodes.
  useEffect(() => {
    if (frameCount <= 0) return

    const frames: HTMLImageElement[] = []
    const aborted = { current: false }

    for (let i = 0; i < frameCount; i += 1) {
      const img = new Image()
      // Hint to the browser that these are display assets, not data.
      img.decoding = 'async'
      img.src = `${basePath}${String(i + 1).padStart(pad, '0')}.${ext}`
      frames.push(img)
    }
    framesRef.current = frames
    currentRef.current = -1

    const first = frames[0]
    if (first) {
      const onLoad = () => {
        if (!aborted.current) draw(0)
      }
      if (first.complete) {
        onLoad()
      } else {
        first.addEventListener('load', onLoad, { once: true })
      }
    }

    return () => {
      aborted.current = true
      // Abort pending loads by clearing src so stale onload callbacks
      // referencing the old framesRef entries do not fire after unmount.
      for (const img of frames) {
        img.src = ''
      }
      framesRef.current = []
    }
  }, [basePath, ext, pad, frameCount, draw])

  // Scrub: map scroll progress → nearest frame. Bails silently if that frame
  // hasn't decoded yet, so it simply repaints on the next scroll tick.
  useMotionValueEvent(progress, 'change', (p) => {
    const clamped = Math.max(0, Math.min(1, p))
    const index = Math.round(clamped * (frameCount - 1))
    if (index !== currentRef.current) draw(index)
  })

  // Repaint the current frame through viewport / DPR changes.
  useEffect(() => {
    const onResize = () => draw(currentRef.current < 0 ? 0 : currentRef.current)
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [draw])

  return <canvas ref={canvasRef} className={className} aria-hidden />
}