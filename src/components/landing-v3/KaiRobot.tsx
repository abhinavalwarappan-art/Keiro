/* Kai — the mascot (kept per brand constraint: green body, medical cross on
   chest, square eyes). Enhancements only: CSS floating bob + CSS eye-glow pulse.
   Pure SVG/CSS, no Framer Motion, so it never re-renders. */

const ACCENT = '#00c896'

export function KaiRobot({
  size = 380,
  float = true,
  eyesOn = true,
}: {
  size?: number
  float?: boolean
  /** When false, the eyes sit dim/dormant; flip to true for the "power on" beat. */
  eyesOn?: boolean
}) {
  const eyeFill = eyesOn ? ACCENT : '#0b2a20'
  return (
    <div
      className={`relative mx-auto${float ? ' lx-bob' : ''}`}
      style={{ width: size, maxWidth: '100%' }}
      role="img"
      aria-label="Kai, your friendly robot assistant"
    >
      <svg viewBox="0 0 300 400" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* shadow */}
        <ellipse cx="150" cy="372" rx="58" ry="13" fill={ACCENT} opacity="0.16" />
        <ellipse cx="150" cy="372" rx="34" ry="7" fill={ACCENT} opacity="0.18" />

        {/* arms */}
        <path
          d="M88 200C67 202 53 224 57 249C59 263 69 271 80 269C91 267 96 257 94 246C92 234 86 228 88 216V200Z"
          fill="#1f8f62"
        />
        <path d="M82 207C71 214 64 229 65 243" stroke="#5ff0bf" strokeWidth="3" strokeLinecap="round" opacity="0.5" />
        <path
          d="M212 200C233 202 247 224 243 249C241 263 231 271 220 269C209 267 204 257 206 246C208 234 214 228 212 216V200Z"
          fill="#1f8f62"
        />
        <path d="M218 207C229 214 236 229 235 243" stroke="#5ff0bf" strokeWidth="3" strokeLinecap="round" opacity="0.5" />

        {/* body + medical cross */}
        <rect x="82" y="186" width="136" height="150" rx="42" fill="#1f8f62" />
        <rect x="96" y="197" width="54" height="128" rx="27" fill="#5ff0bf" opacity="0.14" />
        <rect x="138" y="224" width="24" height="60" rx="6" fill="white" />
        <rect x="120" y="242" width="60" height="24" rx="6" fill="white" />
        <rect x="128" y="169" width="44" height="28" rx="10" fill="#17764f" />

        {/* head */}
        <rect x="70" y="78" width="160" height="114" rx="54" fill="#1f8f62" />
        <ellipse cx="118" cy="96" rx="28" ry="16" fill="#5ff0bf" opacity="0.18" />
        <rect x="60" y="111" width="18" height="32" rx="9" fill="#17764f" />
        <rect x="222" y="111" width="18" height="32" rx="9" fill="#17764f" />

        {/* face screen + square eyes (CSS glow pulse when powered) */}
        <rect x="88" y="106" width="124" height="58" rx="20" fill="#0d1117" />
        <g className={eyesOn ? 'lx-eye-glow' : undefined}>
          <rect x="100" y="118" width="34" height="36" rx="8" fill={eyeFill} />
          <rect x="166" y="118" width="34" height="36" rx="8" fill={eyeFill} />
          {eyesOn && (
            <>
              <rect x="106" y="124" width="10" height="14" rx="3" fill="white" opacity="0.45" />
              <rect x="172" y="124" width="10" height="14" rx="3" fill="white" opacity="0.45" />
            </>
          )}
          <rect x="94" y="111" width="112" height="48" rx="16" stroke={eyeFill} strokeWidth="2" opacity="0.35" />
        </g>
        <path d="M100 328Q100 346 150 348Q200 346 200 328" fill="#17764f" />
      </svg>
    </div>
  )
}

/* Kai's FACE — the Keiro logo mark (head only: ears, screen + glowing
   square eyes). Used as the hero's opening element. Pure SVG so it scales
   crisply at any size; the eye-glow pulse is the same CSS used on the full
   robot. The whole mark lives inside a compact viewBox so it centres cleanly. */
export function KaiFace({ size = 320, className = '' }: { size?: number; className?: string }) {
  return (
    <svg
      width={size}
      viewBox="40 70 220 130"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={{ maxWidth: '100%', height: 'auto', overflow: 'visible' }}
      role="img"
      aria-label="Kai — the Keiro assistant"
    >
      {/* head */}
      <rect x="70" y="78" width="160" height="114" rx="54" fill="#1f8f62" />
      <ellipse cx="118" cy="96" rx="28" ry="16" fill="#5ff0bf" opacity="0.18" />

      {/* ears */}
      <rect x="60" y="111" width="18" height="32" rx="9" fill="#17764f" />
      <rect x="222" y="111" width="18" height="32" rx="9" fill="#17764f" />

      {/* face screen + square eyes (CSS glow pulse) */}
      <rect x="88" y="106" width="124" height="58" rx="20" fill="#0d1117" />
      <g className="lx-eye-glow">
        <rect x="100" y="118" width="34" height="36" rx="8" fill={ACCENT} />
        <rect x="166" y="118" width="34" height="36" rx="8" fill={ACCENT} />
        <rect x="106" y="124" width="10" height="14" rx="3" fill="white" opacity="0.45" />
        <rect x="172" y="124" width="10" height="14" rx="3" fill="white" opacity="0.45" />
        <rect x="94" y="111" width="112" height="48" rx="16" stroke={ACCENT} strokeWidth="2" opacity="0.35" />
      </g>
    </svg>
  )
}

/* Compact Kai used inside chat bubbles */
export function KaiMiniIcon() {
  return (
    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#10251f] ring-1 ring-[#00c896]/30">
      <svg viewBox="0 0 48 48" className="h-6 w-6" fill="none" aria-hidden>
        <rect x="10" y="8" width="28" height="22" rx="10" fill="#1f8f62" />
        <rect x="14" y="15" width="20" height="10" rx="4" fill="#0d1117" />
        <rect x="17" y="17" width="5" height="6" rx="2" fill={ACCENT} />
        <rect x="26" y="17" width="5" height="6" rx="2" fill={ACCENT} />
        <rect x="18" y="31" width="12" height="12" rx="5" fill="#1f8f62" />
        <rect x="22" y="34" width="4" height="6" rx="1" fill="white" />
        <rect x="20" y="36" width="8" height="3" rx="1" fill="white" />
      </svg>
    </div>
  )
}

/* Teal audio waveform — pure CSS, each bar has its own delay/duration (set
   inline, deterministic from index so SSR + client match) so it looks like a
   live signal rather than a synced loop. */
export function Waveform({ count = 28, className = '' }: { count?: number; className?: string }) {
  const bars = Array.from({ length: count })

  return (
    <div className={`flex h-12 items-end justify-center gap-[3px] ${className}`} aria-hidden>
      {bars.map((_, i) => {
        const baseHeight = 8 + ((i * 37) % 26) // 8–33px silhouette
        const delay = ((i * 53) % 100) / 100 // 0–0.99s
        const duration = 0.9 + ((i * 29) % 60) / 100 // 0.9–1.49s
        return (
          <span
            key={i}
            className="lx-wave-bar w-[3px] rounded-full bg-[var(--kx-accent)]"
            style={{
              height: `${baseHeight}px`,
              animationDelay: `${delay}s`,
              animationDuration: `${duration}s`,
            }}
          />
        )
      })}
    </div>
  )
}