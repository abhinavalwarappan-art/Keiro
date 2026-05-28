'use client'

import { useEffect, useRef } from 'react'

export type KaiState = 'idle' | 'talking' | 'waving' | 'happy' | 'thinking' | 'listening'
export type KaiSize = 'sm' | 'md' | 'lg' | 'xl'

interface KaiProps {
  state?: KaiState
  size?: KaiSize
  interactive?: boolean
  className?: string
  onReady?: () => void
}

const SIZE_MAP: Record<KaiSize, { width: number; height: number }> = {
  sm: { width: 80, height: 100 },
  md: { width: 140, height: 175 },
  lg: { width: 220, height: 275 },
  xl: { width: 320, height: 400 },
}

export default function Kai({
  state = 'idle',
  size = 'lg',
  interactive = true,
  className = '',
  onReady,
}: KaiProps) {
  const svgRef = useRef<SVGSVGElement>(null)
  const rafRef = useRef<number>(0)
  const tRef = useRef(0)

  const mx = useRef(0)
  const my = useRef(0)
  const tlx = useRef(0)
  const tly = useRef(0)
  const clx = useRef(0)
  const cly = useRef(0)

  const waveT = useRef(0)
  const talkT = useRef(0)
  const happyT = useRef(0)
  const thinkT = useRef(0)
  const blinkT = useRef(0)
  const jumpT = useRef(0)

  const waving = useRef(false)
  const talking = useRef(false)
  const happy = useRef(false)
  const thinking = useRef(false)
  const blinking = useRef(false)
  const jumping = useRef(false)

  const lastBlink = useRef(Date.now())
  const nextBlink = useRef(3500)

  const { width, height } = SIZE_MAP[size]

  useEffect(() => {
    waving.current = state === 'waving'
    talking.current = state === 'talking' || state === 'listening'
    happy.current = state === 'happy'
    thinking.current = state === 'thinking'
    if (state === 'happy') {
      jumping.current = true
      jumpT.current = 0
    }
    if (state === 'waving') waveT.current = 0
    if (state === 'talking' || state === 'listening') talkT.current = 0
    if (state === 'thinking') thinkT.current = 0
  }, [state])

  useEffect(() => {
    if (!interactive) return
    const onMove = (e: MouseEvent) => {
      mx.current = e.clientX
      my.current = e.clientY
    }
    const onClick = () => {
      if (!jumping.current) {
        jumping.current = true
        jumpT.current = 0
      }
    }
    window.addEventListener('mousemove', onMove)
    const svg = svgRef.current
    svg?.addEventListener('click', onClick)
    return () => {
      window.removeEventListener('mousemove', onMove)
      svg?.removeEventListener('click', onClick)
    }
  }, [interactive])

  useEffect(() => {
    onReady?.()

    const loop = (ts: number) => {
      tRef.current = ts * 0.001
      const t = tRef.current

      const svg = svgRef.current
      if (!svg) {
        rafRef.current = requestAnimationFrame(loop)
        return
      }

      const svgRect = svg.getBoundingClientRect()
      const cx = svgRect.left + svgRect.width * 0.5
      const cy = svgRect.top + svgRect.height * 0.34
      if (interactive) {
        tlx.current = Math.max(-1, Math.min(1, (mx.current - cx) / 360))
        tly.current = Math.max(-0.5, Math.min(0.5, (my.current - cy) / 360))
      }
      clx.current += (tlx.current - clx.current) * 0.05
      cly.current += (tly.current - cly.current) * 0.05

      const fy = Math.sin(t * 0.75) * 7
      const fx = Math.sin(t * 0.45) * 1.5
      const br = 1 + Math.sin(t * 0.9) * 0.013

      let jy = 0
      let jSX = 1
      let jSY = 1
      if (jumping.current) {
        jumpT.current += 0.09
        jy = -Math.sin(jumpT.current * Math.PI) * 30 * Math.max(0, 1 - jumpT.current / 3.5)
        jSX = 1 + Math.sin(jumpT.current * Math.PI) * 0.06
        jSY = 1 - Math.sin(jumpT.current * Math.PI) * 0.07
        if (jumpT.current > 3.5) jumping.current = false
      }

      const gHead = svg.getElementById('k-head')
      const gTorso = svg.getElementById('k-torso')
      const gLegs = svg.getElementById('k-legs')
      const gArmL = svg.getElementById('k-arm-l')
      const gArmR = svg.getElementById('k-arm-r')
      const lEyeBg = svg.getElementById('k-le-bg') as SVGCircleElement | null
      const lEye = svg.getElementById('k-le') as SVGCircleElement | null
      const lEyeS = svg.getElementById('k-le-s') as SVGCircleElement | null
      const rEyeBg = svg.getElementById('k-re-bg') as SVGCircleElement | null
      const rEye = svg.getElementById('k-re') as SVGCircleElement | null
      const rEyeS = svg.getElementById('k-re-s') as SVGCircleElement | null
      const kMouth = svg.getElementById('k-mouth') as SVGPathElement | null

      if (!gHead || !gTorso) {
        rafRef.current = requestAnimationFrame(loop)
        return
      }

      ;(gTorso as SVGGElement).style.transform =
        `translate(${fx * 0.3}px, ${fy + jy}px) scale(${br * jSX}, ${br * jSY})`
      ;(gTorso as SVGGElement).style.transformOrigin = '140px 258px'

      if (gLegs) {
        ;(gLegs as SVGGElement).style.transform = `translate(${fx * 0.2}px, ${fy * 0.85 + jy}px)`
      }

      const hl = clx.current * 12
      const hb = Math.sin(t * 0.75 + 0.3) * 3
      const hr = clx.current * 7
      ;(gHead as SVGGElement).style.transform =
        `translate(${hl + fx * 0.6}px, ${hb + fy * 0.28 + jy * 0.16}px) rotate(${hr}deg)`
      ;(gHead as SVGGElement).style.transformOrigin = '140px 138px'

      let alr = Math.sin(t * 0.65) * 5 + clx.current * -12
      let arr = -Math.sin(t * 0.65) * 5 + clx.current * 12

      if (waving.current) {
        waveT.current += 0.08
        arr = -(Math.abs(Math.sin(waveT.current * 2.5)) * 58) * Math.max(0, 1 - waveT.current / 10) - 14
        if (waveT.current > 10) waving.current = false
      }
      if (happy.current && happyT.current < 9) {
        happyT.current += 0.09
        alr = -Math.abs(Math.sin(happyT.current * 2.8)) * 50 - 16
        arr = -Math.abs(Math.sin(happyT.current * 2.8 + 0.5)) * 50 - 16
        if (happyT.current >= 9) {
          happy.current = false
          happyT.current = 0
        }
      }

      if (gArmL) {
        ;(gArmL as SVGGElement).style.transform =
          `translate(${fx * 0.2}px, ${fy * 0.65 + jy * 0.75}px) rotate(${alr}deg)`
        ;(gArmL as SVGGElement).style.transformOrigin = '68px 220px'
      }
      if (gArmR) {
        ;(gArmR as SVGGElement).style.transform =
          `translate(${fx * 0.2}px, ${fy * 0.65 + jy * 0.75}px) rotate(${arr}deg)`
        ;(gArmR as SVGGElement).style.transformOrigin = '212px 220px'
      }

      const ox = interactive
        ? Math.cos(Math.atan2(my.current - cy, mx.current - cx)) *
          Math.min(Math.sqrt((mx.current - cx) ** 2 + (my.current - cy) ** 2) / 120, 3.2)
        : 0
      const oy = interactive
        ? Math.sin(Math.atan2(my.current - cy, mx.current - cx)) *
          Math.min(Math.sqrt((mx.current - cx) ** 2 + (my.current - cy) ** 2) / 120, 3.2)
        : 0

      const now = Date.now()
      let er = 1
      if (now - lastBlink.current > nextBlink.current) {
        blinking.current = true
        blinkT.current = 0
        lastBlink.current = now
        nextBlink.current = 2800 + Math.random() * 3500
      }
      if (blinking.current) {
        blinkT.current += 0.22
        er = Math.abs(Math.cos(blinkT.current * 3.5))
        if (blinkT.current > 1.4) {
          blinking.current = false
          er = 1
        }
      }

      let ex2 = 0
      let ey2 = 0
      if (thinking.current) {
        thinkT.current += 0.035
        ex2 = Math.sin(thinkT.current * 3) * 2.5
        ey2 = Math.cos(thinkT.current * 2) * 1.2
      }

      const eyes = [
        { bg: lEyeBg, el: lEye, sh: lEyeS, bx: 116, by: 144 },
        { bg: rEyeBg, el: rEye, sh: rEyeS, bx: 164, by: 144 },
      ]
      eyes.forEach((eye) => {
        if (!eye.el || !eye.bg || !eye.sh) return
        const nx = eye.bx + ox + ex2
        const ny = eye.by + oy + ey2
        eye.bg.setAttribute('cx', String(nx))
        eye.bg.setAttribute('cy', String(ny))
        eye.el.setAttribute('cx', String(nx))
        eye.el.setAttribute('cy', String(ny))
        eye.el.setAttribute('r', '9')
        eye.el.setAttribute('ry', String(9 * er))
        eye.sh.setAttribute('cx', String(nx - 4))
        eye.sh.setAttribute('cy', String(ny - 4))
        eye.sh.setAttribute('ry', String(3.5 * er))
      })

      if (kMouth) {
        if (talking.current) {
          talkT.current += 0.13
          const o = Math.abs(Math.sin(talkT.current * 4)) * 7
          kMouth.setAttribute('d', `M120 166 Q140 ${178 + o} 160 166`)
        } else if (state === 'happy') {
          kMouth.setAttribute('d', 'M112 164 Q140 186 168 164')
        } else if (state === 'thinking') {
          kMouth.setAttribute('d', 'M128 174 Q140 174 152 174')
        } else {
          kMouth.setAttribute('d', 'M120 166 Q140 178 160 166')
        }
      }

      rafRef.current = requestAnimationFrame(loop)
    }

    rafRef.current = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(rafRef.current)
  }, [interactive, state, onReady])

  return (
    <svg
      ref={svgRef}
      width={width}
      height={height}
      viewBox="0 0 280 380"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`overflow-visible select-none ${interactive ? 'cursor-none' : ''} ${className}`}
      aria-label="Kai, your medical assistant"
      role="img"
    >
      <defs>
        <radialGradient id="k-hg" cx="32%" cy="20%" r="68%">
          <stop offset="0%" stopColor="#f8fefb" />
          <stop offset="35%" stopColor="#dff4eb" />
          <stop offset="100%" stopColor="#72d49e" />
        </radialGradient>
        <radialGradient id="k-bg" cx="30%" cy="20%" r="72%">
          <stop offset="0%" stopColor="#f4fdf8" />
          <stop offset="40%" stopColor="#d8f2e4" />
          <stop offset="100%" stopColor="#6dcf9a" />
        </radialGradient>
        <radialGradient id="k-ag" cx="28%" cy="18%" r="76%">
          <stop offset="0%" stopColor="#f2fcf7" />
          <stop offset="40%" stopColor="#d4f0e4" />
          <stop offset="100%" stopColor="#68cc96" />
        </radialGradient>
        <radialGradient id="k-lg" cx="28%" cy="18%" r="74%">
          <stop offset="0%" stopColor="#f0faf6" />
          <stop offset="40%" stopColor="#d0eee0" />
          <stop offset="100%" stopColor="#64ca92" />
        </radialGradient>
        <radialGradient id="k-eg" cx="25%" cy="25%" r="70%">
          <stop offset="0%" stopColor="#ccfff0" />
          <stop offset="48%" stopColor="#5DCAA5" />
          <stop offset="100%" stopColor="#178f68" />
        </radialGradient>
        <filter id="k-fs" x="-25%" y="-15%" width="150%" height="150%">
          <feDropShadow dx="0" dy="6" stdDeviation="12" floodColor="#2da866" floodOpacity="0.1" />
        </filter>
        <filter id="k-feg" x="-80%" y="-80%" width="260%" height="260%">
          <feGaussianBlur stdDeviation="3.5" result="b" />
          <feMerge>
            <feMergeNode in="b" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <filter id="k-fth" x="-120%" y="-100%" width="340%" height="300%">
          <feGaussianBlur stdDeviation="5" />
        </filter>
      </defs>

      <g id="k-legs">
        <ellipse cx="112" cy="330" rx="28" ry="32" fill="url(#k-lg)" filter="url(#k-fs)" />
        <ellipse cx="101" cy="313" rx="10" ry="14" fill="white" fillOpacity="0.32" />
        <ellipse cx="112" cy="357" rx="24" ry="10" fill="url(#k-lg)" />
        <ellipse cx="168" cy="330" rx="28" ry="32" fill="url(#k-lg)" filter="url(#k-fs)" />
        <ellipse cx="157" cy="313" rx="10" ry="14" fill="white" fillOpacity="0.32" />
        <ellipse cx="168" cy="357" rx="24" ry="10" fill="url(#k-lg)" />
      </g>

      <g id="k-torso">
        <ellipse cx="140" cy="245" rx="92" ry="80" fill="url(#k-bg)" filter="url(#k-fs)" />
        <ellipse cx="98" cy="202" rx="42" ry="23" fill="white" fillOpacity="0.28" transform="rotate(-28 98 202)" />
        <path d="M130 230 Q118 215 112 203 Q108 194 112 186" stroke="#0d1f14" strokeWidth="5" strokeLinecap="round" fill="none" />
        <path d="M150 230 Q162 215 168 203 Q172 194 168 186" stroke="#0d1f14" strokeWidth="5" strokeLinecap="round" fill="none" />
        <path d="M130 230 Q140 237 150 230" stroke="#0d1f14" strokeWidth="5" strokeLinecap="round" fill="none" />
        <path d="M140 237 Q140 252 148 261" stroke="#0d1f14" strokeWidth="5" strokeLinecap="round" fill="none" />
        <ellipse cx="140" cy="245" rx="92" ry="80" fill="url(#k-bg)" />
        <ellipse cx="98" cy="202" rx="42" ry="23" fill="white" fillOpacity="0.28" transform="rotate(-28 98 202)" />
        <path d="M112 186 Q108 196 110 208 Q112 218 118 226 Q124 233 130 235" stroke="#0d1f14" strokeWidth="5" strokeLinecap="round" fill="none" />
        <path d="M112 186 Q108 196 110 208 Q112 218 118 226 Q124 233 130 235" stroke="#2a5c40" strokeWidth="2" strokeLinecap="round" fill="none" opacity="0.45" />
        <path d="M168 186 Q172 196 170 208 Q168 218 162 226 Q156 233 150 235" stroke="#0d1f14" strokeWidth="5" strokeLinecap="round" fill="none" />
        <path d="M168 186 Q172 196 170 208 Q168 218 162 226 Q156 233 150 235" stroke="#2a5c40" strokeWidth="2" strokeLinecap="round" fill="none" opacity="0.45" />
        <path d="M130 235 Q140 241 150 235" stroke="#0d1f14" strokeWidth="5" strokeLinecap="round" fill="none" />
        <path d="M140 241 Q142 251 148 259" stroke="#0d1f14" strokeWidth="5" strokeLinecap="round" fill="none" />
        <circle cx="152" cy="264" r="14" fill="#0a1a10" />
        <circle cx="152" cy="264" r="10" fill="#1a3d2b" />
        <circle cx="152" cy="264" r="6" fill="#2a6040" />
        <circle cx="152" cy="264" r="3" fill="#5DCAA5" fillOpacity="0.9" />
        <circle cx="152" cy="264" r="1.5" fill="white" fillOpacity="0.7" />
        <circle cx="112" cy="186" r="5" fill="#0a1a10" />
        <circle cx="112" cy="186" r="2.5" fill="#2a5c40" />
        <circle cx="168" cy="186" r="5" fill="#0a1a10" />
        <circle cx="168" cy="186" r="2.5" fill="#2a5c40" />
        <ellipse cx="140" cy="323" rx="26" ry="7" fill="#5DCAA5" fillOpacity="0.4" filter="url(#k-fth)" />
        <ellipse cx="140" cy="323" rx="14" ry="3.5" fill="#aaffee" fillOpacity="0.6" />
      </g>

      <g id="k-arm-l">
        <path
          d="M62 205 Q40 215 28 240 Q18 263 20 288 Q22 310 36 316 Q50 322 62 306 Q74 292 72 266 Q72 238 78 217 Q72 204 62 205Z"
          fill="url(#k-ag)"
          filter="url(#k-fs)"
        />
        <ellipse cx="34" cy="240" rx="10" ry="23" fill="white" fillOpacity="0.28" transform="rotate(-5 34 240)" />
      </g>

      <g id="k-arm-r">
        <path
          d="M218 205 Q240 215 252 240 Q262 263 260 288 Q258 310 244 316 Q230 322 218 306 Q206 292 208 266 Q208 238 202 217 Q208 204 218 205Z"
          fill="url(#k-ag)"
          filter="url(#k-fs)"
        />
        <ellipse cx="246" cy="240" rx="10" ry="23" fill="white" fillOpacity="0.28" transform="rotate(5 246 240)" />
      </g>

      <g id="k-head">
        <ellipse cx="140" cy="125" rx="70" ry="65" fill="url(#k-hg)" filter="url(#k-fs)" />
        <ellipse cx="108" cy="86" rx="30" ry="16" fill="white" fillOpacity="0.32" transform="rotate(-24 108 86)" />
        <ellipse cx="172" cy="82" rx="11" ry="6" fill="white" fillOpacity="0.15" transform="rotate(10 172 82)" />

        <g filter="url(#k-feg)">
          <circle id="k-le-bg" cx="116" cy="131" r="13" fill="#071410" />
          <circle id="k-le" cx="116" cy="131" r="9" fill="url(#k-eg)" />
          <circle id="k-le-s" cx="112" cy="127" r="3.5" fill="white" fillOpacity="0.8" />
        </g>

        <g filter="url(#k-feg)">
          <circle id="k-re-bg" cx="164" cy="131" r="13" fill="#071410" />
          <circle id="k-re" cx="164" cy="131" r="9" fill="url(#k-eg)" />
          <circle id="k-re-s" cx="160" cy="127" r="3.5" fill="white" fillOpacity="0.8" />
        </g>

        <path
          id="k-mouth"
          d="M120 153 Q140 165 160 153"
          stroke="#4ac285"
          strokeWidth="2.5"
          strokeLinecap="round"
          fill="none"
          opacity="0.55"
        />

        <path d="M112 186 Q112 182 116 178" stroke="#0d1f14" strokeWidth="5" strokeLinecap="round" fill="none" />
        <path d="M168 186 Q168 182 164 178" stroke="#0d1f14" strokeWidth="5" strokeLinecap="round" fill="none" />
      </g>
    </svg>
  )
}
