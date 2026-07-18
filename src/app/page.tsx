'use client'

/* ============================================================================
   Keiro landing page — THE SPLIT LEDGER (DESIGN.md §7.1)

   Motion policy: no scroll-position-linked animation anywhere. Reveals are
   `whileInView` with `once: true`; the hero artifact is IntersectionObserver-
   gated; disclosures animate grid-template-rows. All of it is disabled under
   prefers-reduced-motion.

   The page keeps its own root (rather than SiteShell) because it reads the
   ?ended=1 session banner off useSearchParams, which SiteShell's server
   component cannot do.
   ========================================================================== */

import { Suspense } from 'react'
import { MotionConfig } from 'framer-motion'
import { useSearchParams } from 'next/navigation'
import { ErrorBoundary } from '@/components/ErrorBoundary'

import '@/components/landing-v3/landing.css'
import { bricolage, plexSans, plexMono } from '@/components/landing-v3/fonts'
import { Nav } from '@/components/landing-v3/Nav'
import { Hero } from '@/components/landing-v3/Hero'
import {
  SpecimenBand,
  WhyBand,
  MethodBand,
  MeetKaiBand,
  TrustBand,
  ClinicsRow,
} from '@/components/landing-v3/HomeSections'
import { CtaBand } from '@/components/landing-v3/PageBits'
import { Footer } from '@/components/landing-v3/Footer'
import { LandingScrollReset } from '@/components/landing-v3/LandingScrollReset'

function LandingChrome() {
  const searchParams = useSearchParams()
  const hasSessionEnded = searchParams.get('ended') === '1'

  return (
    <>
      {hasSessionEnded && (
        <div
          className="sticky top-0 z-[70] bg-[var(--lx-ink)] px-4 py-3 text-center text-sm font-medium text-[var(--lx-paper)]"
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
          data-flow="home"
          className={`lx ${bricolage.variable} ${plexSans.variable} ${plexMono.variable} relative min-h-screen overflow-x-clip`}
        >
          <Suspense>
            <LandingChrome />
          </Suspense>

          <LandingScrollReset />

          <main className="relative z-[1]">
            <Hero />
            <SpecimenBand />
            <WhyBand />
            <MethodBand />
            <MeetKaiBand />
            <TrustBand />
            <ClinicsRow />
            <CtaBand
              title="Whenever you’re ready. There’s no rush."
              body="Free. No account. Nothing to fill in first."
            />
          </main>

          <Footer />
        </div>
      </MotionConfig>
    </ErrorBoundary>
  )
}
