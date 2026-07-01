'use client'

/* Scroll cue — the classic "mouse" scroll hint, but the travelling dot is a
   mini Kai descending through the capsule. Sits at the foot of the hero and
   fades out the moment the user starts scrolling (opacity driven by the hero).
   Pure SVG/CSS for the Kai + bounce; only the fade is Framer. */

import { motion, type MotionValue } from 'framer-motion'
import { KaiFace } from './KaiRobot'

export function ScrollCue({ opacity }: { opacity: MotionValue<number> }) {
  return (
    <motion.div
      className="pointer-events-none absolute bottom-9 left-1/2 z-20 flex -translate-x-1/2 flex-col items-center gap-3"
      style={{ opacity }}
      aria-hidden="true"
    >
      {/* capsule (mouse body) with the mini Kai travelling down inside it */}
      <div className="relative flex h-[58px] w-[36px] items-start justify-center overflow-hidden rounded-full border border-[var(--kx-accent)]/40 bg-[var(--kx-accent)]/[0.05] pt-2.5 shadow-[0_0_22px_-6px_var(--kx-accent)]">
        <span className="lx-scroll-kai inline-flex">
          <KaiFace size={30} />
        </span>
      </div>
      {/* track line trailing below, echoing the scroll path */}
      <span className="h-9 w-px bg-gradient-to-b from-[var(--kx-accent)]/45 to-transparent" />
    </motion.div>
  )
}