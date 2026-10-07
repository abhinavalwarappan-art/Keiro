/* Shared chrome for every informational page (/about, /languages, …).

   Server component on purpose: these pages are content, so only the leaves that
   genuinely need interactivity (Nav's dropdown, Reveal's whileInView, the
   contact form) ship JS. The landing page keeps its own root because it also
   renders the ?ended=1 session banner off useSearchParams. */

import type { ReactNode } from 'react'

import './landing.css'
import '@/components/home/home.css'
import { geistSans, literata, sourceSans, splineMono } from './fonts'
import { MotionRoot } from './MotionRoot'
import { Nav } from './Nav'
import { Footer } from './Footer'

/* `flow` names the page's gradient palette (see landing.css). Every page gets its
   own light — same green family, different temperature — so arriving on a new
   page feels like a different room of the same building. */
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
      {/* No `font-body` here — `.lx` owns the family now (see landing.css). A
          Tailwind font utility sits later in the cascade and would win. */}
      <div
        data-flow={flow}
        className={`lx hm ${geistSans.variable} ${literata.variable} ${sourceSans.variable} ${splineMono.variable} relative min-h-svh overflow-x-clip`}
      >
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
