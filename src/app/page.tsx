'use client'

/* ============================================================================
   Keiro landing page
   ----------------------------------------------------------------------------
   Stack: Next.js + Tailwind + Framer Motion. No GSAP (never installed), no
   WebGL, no scroll-position-linked motion of any kind.

   Motion policy: every reveal is `whileInView` with `once: true` (see Reveal),
   so nothing re-triggers on scroll-back and nothing is tied to scroll offset —
   the old useScroll/useTransform rigs broke at different scroll speeds and on
   short viewports. Ambient motion is CSS keyframes only.

   Reduced motion: <MotionConfig reducedMotion="user"> plus a @media guard in
   landing.css.

   All visuals are scoped under `.lx` so the app's own tokens stay untouched.
   ========================================================================== */

import { Suspense } from 'react'
import { MotionConfig } from 'framer-motion'
import { useSearchParams } from 'next/navigation'
import { ErrorBoundary } from '@/components/ErrorBoundary'

import '@/components/landing-v3/landing.css'
import { fraunces } from '@/components/landing-v3/fonts'
import { Nav } from '@/components/landing-v3/Nav'
import { Hero } from '@/components/landing-v3/Hero'
import { TrustLine } from '@/components/landing-v3/TrustLine'
import { MeetKai } from '@/components/landing-v3/MeetKai'
import { HowItWorks } from '@/components/landing-v3/HowItWorks'
import { LanguagesGrid } from '@/components/landing-v3/LanguagesGrid'
import { ForClinics } from '@/components/landing-v3/ForClinics'
import { Footer } from '@/components/landing-v3/Footer'
import { LandingScrollReset } from '@/components/landing-v3/LandingScrollReset'

function LandingChrome() {
  const searchParams = useSearchParams()
  const hasSessionEnded = searchParams.get('ended') === '1'

  return (
    <>
      {hasSessionEnded && (
        <div
          className="sticky top-0 z-[70] bg-[var(--lx-ink)] px-4 py-3 text-center text-sm font-medium text-white"
          role="status"
          aria-live="polite"
        >
          Your session has ended.
        </div>
      )}
      <Nav hasSessionBanner={hasSessionEnded} />
    </>
  )
}

export default function LandingPage() {
  return (
    <ErrorBoundary>
      <MotionConfig reducedMotion="user">
        <div
          id="main-content"
          className={`lx ${fraunces.variable} font-body relative min-h-screen overflow-x-clip`}
        >
          <div className="lx-grain" aria-hidden="true" />

          <Suspense>
            <LandingChrome />
          </Suspense>

          <LandingScrollReset />

          <main className="relative z-[1]">
            <Hero />
            <TrustLine />
            <MeetKai />
            <HowItWorks />
            <LanguagesGrid />
            <ForClinics />
          </main>

          <Footer />
        </div>
      </MotionConfig>
    </ErrorBoundary>
  )
}
