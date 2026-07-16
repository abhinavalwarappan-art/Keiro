/* One drawn icon family for the marketing site.

   The site used typed glyphs (✓ ✕ ▼ ☰ ●) as icons — five characters at five
   optical weights from whatever font was nearest. These replace them with one
   set of marks drawn on the same grid as the ArrowLink arrow that already
   ships in Sections.tsx: 16-unit viewBox, 1.5 stroke, round caps, currentColor.
   Purely presentational; every caller passes aria-hidden context.

   No icon package: six glyphs do not justify a dependency, and matching the
   arrow the site already draws keeps the whole family to ONE stroke logic. */

type IconProps = { size?: number; strokeWidth?: number; className?: string }

function base(size: number) {
  return {
    width: size,
    height: size,
    viewBox: '0 0 16 16',
    fill: 'none' as const,
    'aria-hidden': true as const,
  }
}

const stroke = {
  stroke: 'currentColor',
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
}

export function IconCheck({ size = 12, strokeWidth = 1.5, className }: IconProps) {
  return (
    <svg {...base(size)} className={className}>
      <path d="M3 8.5l3.2 3L13 4.5" {...stroke} strokeWidth={strokeWidth} />
    </svg>
  )
}

export function IconX({ size = 12, strokeWidth = 1.5, className }: IconProps) {
  return (
    <svg {...base(size)} className={className}>
      <path d="M4 4l8 8M12 4l-8 8" {...stroke} strokeWidth={strokeWidth} />
    </svg>
  )
}

/* Rotated 45° by callers to become a close mark — the disclosure affordance. */
export function IconPlus({ size = 16, strokeWidth = 1.5, className }: IconProps) {
  return (
    <svg {...base(size)} className={className}>
      <path d="M8 2.5v11M2.5 8h11" {...stroke} strokeWidth={strokeWidth} />
    </svg>
  )
}

export function IconChevronDown({ size = 12, strokeWidth = 1.5, className }: IconProps) {
  return (
    <svg {...base(size)} className={className}>
      <path d="M3.5 6l4.5 4.5L12.5 6" {...stroke} strokeWidth={strokeWidth} />
    </svg>
  )
}

export function IconMenu({ size = 18, strokeWidth = 1.5, className }: IconProps) {
  return (
    <svg {...base(size)} className={className}>
      <path d="M2.5 5h11M2.5 11h11" {...stroke} strokeWidth={strokeWidth} />
    </svg>
  )
}

export function IconMic({ size = 18, strokeWidth = 1.5, className }: IconProps) {
  return (
    <svg {...base(size)} className={className}>
      <rect x="6" y="1.75" width="4" height="7.5" rx="2" {...stroke} strokeWidth={strokeWidth} />
      <path d="M3.5 7.5a4.5 4.5 0 009 0M8 12v2.25" {...stroke} strokeWidth={strokeWidth} />
    </svg>
  )
}

/* ── KaiMark — Kai's face as a chat avatar ───────────────────────────────────
   The full mascot SVG is a 300×400 illustration; scaled into a 22px chat
   avatar it turns to mush. This is the same head — same geometry, same fills
   (#2E9E5B body, #0D0D0D visor, #0B8FAC eyes) — redrawn on a 24-unit grid so
   it stays crisp at message-row size. A rendering refinement of the mascot,
   not a replacement: this is how Kai signs a message. */

export function KaiMark({ size = 22, className }: { size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      className={className}
    >
      {/* ears */}
      <rect x="0.5" y="9" width="2.6" height="6" rx="1.3" fill="#269152" />
      <rect x="20.9" y="9" width="2.6" height="6" rx="1.3" fill="#269152" />
      {/* head */}
      <rect x="2.4" y="3.5" width="19.2" height="17" rx="7.2" fill="#2E9E5B" />
      {/* visor */}
      <rect x="4.6" y="7.4" width="14.8" height="9.2" rx="3.4" fill="#0D0D0D" />
      {/* eyes */}
      <rect x="6.6" y="9.2" width="4.4" height="5.6" rx="1.5" fill="#0B8FAC" />
      <rect x="13" y="9.2" width="4.4" height="5.6" rx="1.5" fill="#0B8FAC" />
      {/* glints */}
      <rect x="7.4" y="10" width="1.4" height="2" rx="0.6" fill="#7EEAF5" opacity="0.55" />
      <rect x="13.8" y="10" width="1.4" height="2" rx="0.6" fill="#7EEAF5" opacity="0.55" />
    </svg>
  )
}
