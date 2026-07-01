'use client'

import { motion, useReducedMotion } from 'framer-motion'

type KaiOrbProps = {
  /** Rendered size in px (square). */
  size?: number
  className?: string
}

/**
 * Kai — not a robot, not a face. A precision medical instrument crossed
 * with a bioluminescent organism: calibrated rings on the outside, a living
 * aperture core that breathes, vitals orbiting it, an ECG pulse threading
 * through the centre. All soft geometry, all amber light.
 */
export function KaiOrb({ size = 440, className = '' }: KaiOrbProps) {
  const reduce = useReducedMotion()

  const breathe = reduce
    ? {}
    : { scale: [1, 1.045, 1] as number[] }
  const breatheTransition = { duration: 6, repeat: Infinity, ease: 'easeInOut' as const }

  const haloPulse = reduce
    ? {}
    : { opacity: [0.5, 0.85, 0.5] as number[], scale: [1, 1.07, 1] as number[] }
  const haloTransition = { duration: 6, repeat: Infinity, ease: 'easeInOut' as const }

  return (
    <div
      className={`relative ${className}`}
      style={{ width: size, height: size }}
      aria-hidden="true"
    >
      {/* Ambient halo — the bioluminescence bleeding into the dark */}
      <motion.div
        className="absolute inset-0 rounded-full"
        style={{
          background:
            'radial-gradient(circle at 50% 50%, rgba(232,160,69,0.42) 0%, rgba(232,160,69,0.14) 32%, transparent 64%)',
          filter: 'blur(8px)',
        }}
        animate={haloPulse}
        transition={haloTransition}
      />

      <svg
        viewBox="0 0 400 400"
        className="absolute inset-0 h-full w-full"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <radialGradient id="kx-core" cx="50%" cy="44%" r="58%">
            <stop offset="0%" stopColor="#fff6e8" />
            <stop offset="22%" stopColor="#f7d39a" />
            <stop offset="58%" stopColor="#e8a045" />
            <stop offset="100%" stopColor="#9a5e1f" />
          </radialGradient>
          <radialGradient id="kx-aperture" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#fff7ec" stopOpacity="0.95" />
            <stop offset="60%" stopColor="#e8a045" stopOpacity="0.35" />
            <stop offset="100%" stopColor="#e8a045" stopOpacity="0" />
          </radialGradient>
          <linearGradient id="kx-ring" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#f3c68d" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#e8a045" stopOpacity="0.25" />
          </linearGradient>
          <filter id="kx-soft" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="2.2" />
          </filter>
        </defs>

        {/* ── Outer calibration ring — instrument tick marks ── */}
        <g className="kx-spin-slow" style={{ transformOrigin: '200px 200px' }}>
          <circle cx="200" cy="200" r="184" stroke="var(--line-strong)" strokeWidth="1" />
          {Array.from({ length: 60 }).map((_, i) => {
            const major = i % 5 === 0
            const a = (i / 60) * Math.PI * 2
            const r1 = 184
            const r2 = major ? 172 : 178
            return (
              <line
                key={i}
                x1={200 + Math.cos(a) * r1}
                y1={200 + Math.sin(a) * r1}
                x2={200 + Math.cos(a) * r2}
                y2={200 + Math.sin(a) * r2}
                stroke={major ? 'var(--amber)' : 'var(--line-strong)'}
                strokeWidth={major ? 1.4 : 0.8}
                strokeOpacity={major ? 0.7 : 0.5}
              />
            )
          })}
        </g>

        {/* ── Mid ring — segmented arcs, counter-rotating ── */}
        <g className="kx-spin-mid" style={{ transformOrigin: '200px 200px' }}>
          <circle
            cx="200"
            cy="200"
            r="150"
            stroke="url(#kx-ring)"
            strokeWidth="1.5"
            strokeDasharray="2 10"
            strokeLinecap="round"
          />
          <circle
            cx="200"
            cy="200"
            r="138"
            stroke="var(--amber)"
            strokeWidth="2.5"
            strokeOpacity="0.55"
            strokeDasharray="60 360"
            strokeLinecap="round"
          />
        </g>

        {/* ── Inner instrument ring with vitals orbiting ── */}
        <g className="kx-orbit" style={{ transformOrigin: '200px 200px' }}>
          <circle
            cx="200"
            cy="200"
            r="116"
            stroke="var(--line-strong)"
            strokeWidth="1"
            strokeDasharray="1 7"
          />
          {[0, 120, 240].map((deg) => {
            const a = (deg / 360) * Math.PI * 2
            return (
              <circle
                key={deg}
                cx={200 + Math.cos(a) * 116}
                cy={200 + Math.sin(a) * 116}
                r={deg === 0 ? 4 : 2.4}
                fill="var(--amber)"
                filter="url(#kx-soft)"
              />
            )
          })}
        </g>

        {/* ── Living aperture core (breathes via Framer Motion) ── */}
        <motion.g
          animate={breathe}
          transition={breatheTransition}
          style={{ transformOrigin: '200px 200px' }}
        >
          {/* Aperture bloom */}
          <circle cx="200" cy="200" r="96" fill="url(#kx-aperture)" />

          {/* Soft-geometry core — superelliptic blob, not a circle, not a face */}
          <path
            d="M200 116
               C150 116 116 150 116 200
               C116 250 150 284 200 284
               C250 284 284 250 284 200
               C284 150 250 116 200 116 Z"
            fill="url(#kx-core)"
            opacity="0.95"
          />

          {/* Aperture blades — camera iris, slowly opening/closing feel */}
          <g className="kx-spin-fast" style={{ transformOrigin: '200px 200px' }} opacity="0.6">
            {Array.from({ length: 6 }).map((_, i) => {
              const a = (i / 6) * 360
              return (
                <path
                  key={i}
                  d="M200 200 L240 158 A60 60 0 0 1 254 210 Z"
                  fill="#fff6e8"
                  opacity="0.10"
                  transform={`rotate(${a} 200 200)`}
                />
              )
            })}
          </g>

          {/* Nucleus — the brightest point, hot white */}
          <circle cx="200" cy="194" r="22" fill="#fff8ee" />
          <circle cx="200" cy="194" r="34" fill="#fff8ee" opacity="0.25" filter="url(#kx-soft)" />
        </motion.g>

        {/* ── ECG pulse threading through the core ── */}
        <g opacity="0.85">
          <path
            className="kx-ecg-line"
            d="M70 232 L150 232 L166 232 L176 206 L188 256 L200 200 L212 244 L222 232 L250 232 L330 232"
            stroke="var(--amber-soft)"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />
        </g>
      </svg>
    </div>
  )
}