'use client'

import { Suspense } from 'react'
import { MotionConfig } from 'framer-motion'
import { useSearchParams } from 'next/navigation'
import { ErrorBoundary } from '@/components/ErrorBoundary'

import '@/components/landing-v3/landing.css'
import { literata, sourceSans } from '@/components/landing-v3/fonts'
import { Nav } from '@/components/landing-v3/Nav'
import { Hero } from '@/components/landing-v3/Hero'
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
          data-flow="home"
          className={`lx ${literata.variable} ${sourceSans.variable} relative min-h-screen overflow-x-clip`}
        >


          <Suspense>
            <LandingChrome />
          </Suspense>

          <LandingScrollReset />

          <main id="main-content" tabIndex={-1} className="relative z-[1]">
            <Hero />
            <section className="keiro-next" aria-labelledby="next-title">
              <h2 id="next-title">From your words to your doctor’s notes</h2>
              <ol>
                <li><h3>Talk or type, at your pace</h3><p>Choose the language you feel most comfortable using. Tell Kai what has been bothering you.</p></li>
                <li><h3>Put it into words together</h3><p>Kai asks questions to help you describe your symptoms and writes a summary in clear English.</p></li>
                <li><h3>Read it, then show your doctor</h3><p>Check that the summary says what you mean. You can bring it to your appointment.</p></li>
              </ol>
            </section>
          </main>

          <Footer />
        </div>
      </MotionConfig>
    </ErrorBoundary>
  )
}
