/* Shared chrome for every informational page (/about, /how-it-works, …).

   Server component on purpose: these pages are content, so only the leaves that
   genuinely need interactivity (Nav's dropdown, Reveal's whileInView, the
   contact form) ship JS. The landing page keeps its own root because it also
   renders the ?ended=1 session banner off useSearchParams. */

import type { ReactNode } from 'react'

import './landing.css'
import { fraunces } from './fonts'
import { MotionRoot } from './MotionRoot'
import { Nav } from './Nav'
import { Footer } from './Footer'

export function SiteShell({ children }: { children: ReactNode }) {
  return (
    <MotionRoot>
      <div className={`lx ${fraunces.variable} font-body relative min-h-screen overflow-x-clip`}>
        <div className="lx-grain" aria-hidden="true" />
        <Nav />
        <main id="main-content" className="relative z-[1]">
          {children}
        </main>
        <Footer />
      </div>
    </MotionRoot>
  )
}
