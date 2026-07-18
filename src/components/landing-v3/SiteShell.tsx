/* Shared chrome for every informational page (/about, /how-it-works, …).

   Server component on purpose: these pages are content, so only the leaves that
   genuinely need interactivity (Nav's dropdown, Reveal's whileInView, the
   contact form) ship JS. The landing page keeps its own root because it also
   renders the ?ended=1 session banner off useSearchParams. */

import type { ReactNode } from 'react'

import './landing.css'
import { bricolage, plexSans, plexMono } from './fonts'
import { MotionRoot } from './MotionRoot'
import { Nav } from './Nav'
import { Footer } from './Footer'

/* `flow` survives from v3 as an API-compatible page marker. The nine gradient
   palettes it used to select are retired (see DESIGN.md §3); it now only
   stamps a data attribute, which nothing styles. Pages keep passing it so the
   shell's signature is stable. */
export type FlowTheme =
  | 'home'
  | 'mission'
  | 'access'
  | 'privacy'
  | 'clinics'
  | 'languages'
  | 'kai'
  | 'how'
  | 'contact'

export function SiteShell({ children, flow }: { children: ReactNode; flow: FlowTheme }) {
  return (
    <MotionRoot>
      {/* No `font-body` here — `.lx` owns the family (see landing.css). A
          Tailwind font utility sits later in the cascade and would win. */}
      <div
        data-flow={flow}
        className={`lx ${bricolage.variable} ${plexSans.variable} ${plexMono.variable} relative min-h-screen overflow-x-clip`}
      >
        <Nav />
        <main id="main-content" className="relative z-[1]">
          {children}
        </main>
        <Footer />
      </div>
    </MotionRoot>
  )
}
