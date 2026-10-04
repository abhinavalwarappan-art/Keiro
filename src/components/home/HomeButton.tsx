'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowRight } from 'lucide-react'
import type { ReactNode } from 'react'

/** The page's one filled action. Press is a critically damped spring that
 *  starts on pointer-down (Motion drops it under reduced motion). */
export function HomeButton({ href, children }: { href: string; children: ReactNode }) {
  return (
    <motion.span
      className="inline-block"
      whileTap={{ scale: 0.96 }}
      transition={{ type: 'spring', stiffness: 700, damping: 45 }}
    >
      <Link href={href} className="lx-focus hm-btn">
        {children}
        <ArrowRight size={18} className="hm-btn-arrow" aria-hidden />
      </Link>
    </motion.span>
  )
}
