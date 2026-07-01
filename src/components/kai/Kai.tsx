'use client'

import { motion } from 'framer-motion'
import { useEffect, useRef } from 'react'

export type KaiSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl'
export type KaiState = 'idle' | 'talking' | 'waving' | 'happy' | 'thinking' | 'listening'

interface KaiProps {
  size?: KaiSize
  state?: KaiState
  interactive?: boolean
  animated?: boolean
  className?: string
}

const SIZE_MAP: Record<KaiSize, number> = {
  xs: 56,
  sm: 92,
  md: 145,
  lg: 215,
  xl: 300,
}

const ASPECT_RATIO = 400 / 300
const ANIMATION_KEYFRAMES: Keyframe[] = [
  { transform: 'translateY(0px)' },
  { transform: 'translateY(-18px)' },
  { transform: 'translateY(0px)' },
]
const ANIMATION_OPTIONS: KeyframeAnimationOptions = { duration: 400, easing: 'ease-out' }

export function Kai({
  size = 'md',
  // `state` is accepted for API parity with KaiAvatar but unused in this variant
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  state: _state = 'idle',
  interactive = false,
  animated = true,
  className = '',
}: KaiProps) {
  const width = SIZE_MAP[size]
  const height = Math.round(width * ASPECT_RATIO)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!interactive || !ref.current) return
    const el = ref.current
    const handleClick = () => {
      el.animate(ANIMATION_KEYFRAMES, ANIMATION_OPTIONS)
    }
    el.addEventListener('click', handleClick)
    return () => el.removeEventListener('click', handleClick)
  }, [interactive])

  const svg = <KaiSvg width={width} height={height} />

  return (
    <div
      ref={ref}
      className={className}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        width,
        height,
        cursor: interactive ? 'pointer' : 'default',
      }}
      aria-label="Kai, your medical assistant"
      role="img"
    >
      {animated ? (
        <motion.div
          animate={{ y: [0, -14, 0] }}
          transition={{
            duration: 3.2,
            ease: 'easeInOut',
            repeat: Infinity,
            repeatType: 'loop',
          }}
        >
          {svg}
        </motion.div>
      ) : (
        <div>{svg}</div>
      )}
    </div>
  )
}

function KaiSvg({ width, height }: { width: number; height: number }) {
  return (
    <svg
          width={width}
          height={height}
          viewBox="0 0 300 400"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* ── Glow disc underneath ── */}
          <ellipse cx="150" cy="378" rx="62" ry="14" fill="#0B8FAC" opacity="0.28" />
          <ellipse cx="150" cy="378" rx="38" ry="8" fill="#0B8FAC" opacity="0.22" />

          {/* ── Left arm ── */}
          <path
            d="M 88 198
               C 68 200, 52 222, 56 248
               C 58 262, 68 272, 80 270
               C 90 268, 96 258, 94 246
               C 92 234, 86 228, 88 216
               Z"
            fill="#2E9E5B"
          />
          <path
            d="M 82 204 C 70 210, 60 228, 64 244"
            stroke="#3DB870"
            strokeWidth="3"
            strokeLinecap="round"
            fill="none"
            opacity="0.5"
          />

          {/* ── Right arm ── */}
          <path
            d="M 212 198
               C 232 200, 248 222, 244 248
               C 242 262, 232 272, 220 270
               C 210 268, 204 258, 206 246
               C 208 234, 214 228, 212 216
               Z"
            fill="#2E9E5B"
          />
          <path
            d="M 218 204 C 230 210, 240 228, 236 244"
            stroke="#3DB870"
            strokeWidth="3"
            strokeLinecap="round"
            fill="none"
            opacity="0.5"
          />

          {/* ── Body ── */}
          <rect x="84" y="188" width="132" height="148" rx="40" ry="40" fill="#2E9E5B" />

          <rect
            x="96"
            y="196"
            width="52"
            height="130"
            rx="26"
            fill="#3DB870"
            opacity="0.18"
          />

          <rect x="138" y="224" width="24" height="60" rx="6" fill="white" />
          <rect x="120" y="242" width="60" height="24" rx="6" fill="white" />

          <rect x="128" y="170" width="44" height="28" rx="10" fill="#269152" />

          <rect x="72" y="80" width="156" height="110" rx="52" ry="52" fill="#2E9E5B" />

          <ellipse cx="118" cy="96" rx="28" ry="16" fill="#3DB870" opacity="0.22" />

          <rect x="62" y="110" width="18" height="32" rx="9" fill="#269152" />
          <rect x="220" y="110" width="18" height="32" rx="9" fill="#269152" />

          <rect x="88" y="106" width="124" height="58" rx="20" fill="#0D0D0D" />
          <rect x="94" y="111" width="52" height="18" rx="8" fill="white" opacity="0.06" />

          <rect x="100" y="118" width="34" height="36" rx="8" fill="#0B8FAC" />
          <rect x="106" y="124" width="10" height="14" rx="3" fill="#7EEAF5" opacity="0.55" />

          <rect x="166" y="118" width="34" height="36" rx="8" fill="#0B8FAC" />
          <rect x="172" y="124" width="10" height="14" rx="3" fill="#7EEAF5" opacity="0.55" />

          <path
            d="M 100 328 Q 100 346 150 348 Q 200 346 200 328"
            fill="#269152"
          />
    </svg>
  )
}

export default Kai