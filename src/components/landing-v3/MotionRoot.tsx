'use client'

/* Framer's reduced-motion bridge. Kept as a leaf client component so SiteShell
   (and the pages inside it) can stay server-rendered. */

import { MotionConfig } from 'framer-motion'
import type { ReactNode } from 'react'

export function MotionRoot({ children }: { children: ReactNode }) {
  return <MotionConfig reducedMotion="user">{children}</MotionConfig>
}
