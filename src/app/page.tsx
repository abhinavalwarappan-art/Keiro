'use client'

/* ============================================================================
   Keiro home — "quiet product".
   Narrative: what it does -> watch it happen -> how simple -> language coverage
   -> why it's safe -> start. White ground, one deep pine, no scroll-driven or
   fade-up reveals; the only motion is the live translation demo and press/hover
   feedback. All of it respects prefers-reduced-motion.
   ============================================================================ */

import { Suspense } from 'react'
import { MotionConfig } from 'framer-motion'
import { useSearchParams } from 'next/navigation'
import { ErrorBoundary } from '@/components/ErrorBoundary'

import '@/components/landing-v3/landing.css'
import '@/components/home/home.css'
import { geistSans, literata, sourceSans, splineMono } from '@/components/landing-v3/fonts'
import { Nav } from '@/components/landing-v3/Nav'
import { HomeHero, Steps, LanguageWall, Trust, FinalCta } from '@/components/home/HomeSections'
import { Footer } from '@/components/landing-v3/Footer'

/* Only this banner reads the URL. It sits in its own Suspense boundary so the
   nav and hero stay in the prerendered HTML — when the whole chrome waited on
   useSearchParams, the nav didn't exist until JavaScript arrived and then
   pushed the page down (a visible jump on slow connections). The banner scrolls
   away with the page; the nav is the only sticky bar. */
function SessionEndedBanner() {
  const searchParams = useSearchParams()
  if (searchParams.get('ended') !== '1') return null
  return (
    <div
      className="relative z-[70] bg-[var(--lx-ink)] px-4 py-3 text-center text-sm font-medium text-white"
      role="status"
      aria-live="polite"
    >
      Your session has ended.
    </div>
  )
}

export default function LandingPage() {
  return (
    <ErrorBoundary>
      <MotionConfig reducedMotion="user">
        <div
          id="main-content"
          data-flow="home"
          className={`lx hm ${geistSans.variable} ${literata.variable} ${sourceSans.variable} ${splineMono.variable} relative min-h-svh overflow-x-clip`}
        >
          <Suspense fallback={null}>
            <SessionEndedBanner />
          </Suspense>
          <Nav />

          <main className="relative z-[1]">
            <HomeHero />
            <Steps />
            <LanguageWall />
            <Trust />
            <FinalCta />
          </main>

          <Footer />
        </div>
      </MotionConfig>
    </ErrorBoundary>
  )
}
