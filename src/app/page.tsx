'use client'

/* ============================================================================
   Keiro landing page (v3 — teal / biometric)
   ----------------------------------------------------------------------------
   Stack: Next.js + Tailwind + Framer Motion only (no GSAP / Three.js / WebGL).
   Motion: Framer Motion for reveals + the scroll-driven flow; CSS keyframes for
   bob / shimmer / marquee / waveform / grain (see landing-v3/landing.css).
   Reduced motion: <MotionConfig reducedMotion="user"> + a @media guard in CSS.
   Scroll stays native (sticky + useScroll, no hijacking).
   All visuals are scoped under `.lx` so the warm-stone app tokens are untouched.
   ========================================================================== */

import { Suspense } from 'react'
import { MotionConfig } from 'framer-motion'
import { useSearchParams } from 'next/navigation'
import { ErrorBoundary } from '@/components/ErrorBoundary'

import '@/components/landing-v3/landing.css'
import { Nav } from '@/components/landing-v3/Nav'
import { Hero } from '@/components/landing-v3/Hero'
import { KaiJourney } from '@/components/landing-v3/KaiJourney'
import { Flow } from '@/components/landing-v3/Flow'
import { LanguagesGrid } from '@/components/landing-v3/LanguagesGrid'
import { LandingScrollReset } from '@/components/landing-v3/LandingScrollReset'
import { HowKaiWorks } from '@/components/landing-v3/HowKaiWorks'
import { Footer } from '@/components/landing-v3/Footer'

function LandingChrome() {
  const searchParams = useSearchParams()
  const hasSessionEnded = searchParams.get('ended') === '1'

  return (
    <>
      {hasSessionEnded && (
        <div
          className="fixed inset-x-0 top-0 z-[70] border-b border-white/10 bg-[var(--kx-bg)]/90 px-4 py-3 text-center text-sm font-medium text-white backdrop-blur"
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
      {/* respect the OS reduced-motion setting across every Framer animation */}
      <MotionConfig reducedMotion="user">
        <div
          id="main-content"
          className="lx font-body relative min-h-screen overflow-x-clip bg-[var(--kx-bg)] text-white"
        >
          {/* GLOBAL — static grain texture (scoped to the landing root) */}
          <div className="lx-noise" aria-hidden="true" />

          <Suspense>
            <LandingChrome />
          </Suspense>

          <LandingScrollReset />

          <main>
            <Hero />
            <KaiJourney />
            <Flow />
            <LanguagesGrid />
            <HowKaiWorks />
          </main>
          <Footer />
        </div>
      </MotionConfig>
    </ErrorBoundary>
  )
}