'use client'

/* ============================================================================
   Keiro landing page

   Motion policy: no scroll-position-linked animation anywhere. Reveals are
   `whileInView` with `once: true`; ambient motion (marquee, Kai's breathing) is
   CSS keyframes; the step disclosures animate grid-template-rows. All of it is
   disabled under prefers-reduced-motion.

   Section spine — deliberately no archetype twice in a row, and the ground
   changes underneath most of them:
     hero -> marquee -> thesis(mint) -> expandable steps(cream)
          -> split/mascot(mint) -> glass cards(DEEP) -> clinics(cream) -> cta(mint)
   ========================================================================== */

import { Suspense } from 'react'
import { MotionConfig } from 'framer-motion'
import { useSearchParams } from 'next/navigation'
import { ErrorBoundary } from '@/components/ErrorBoundary'

import '@/components/landing-v3/landing.css'
import { fraunces } from '@/components/landing-v3/fonts'
import { Nav } from '@/components/landing-v3/Nav'
import { Hero } from '@/components/landing-v3/Hero'
import {
  LanguageStrip,
  WhyBand,
  StepsBand,
  MeetKaiBand,
  TrustBand,
  ClinicsStrip,
  HomeCta,
} from '@/components/landing-v3/HomeSections'
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
            <LanguageStrip />
            <WhyBand />
            <StepsBand />
            <MeetKaiBand />
            <TrustBand />
            <ClinicsStrip />
            <HomeCta />
          </main>

          <Footer />
        </div>
      </MotionConfig>
    </ErrorBoundary>
  )
}
