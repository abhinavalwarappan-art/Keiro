'use client'

import { useEffect, Suspense } from 'react'
import { usePathname, useSearchParams } from 'next/navigation'
import { initAnalytics, trackPageview, hasAnalyticsConsent } from '@/lib/analytics'

function PageviewTracker() {
  const pathname = usePathname()
  const searchParams = useSearchParams()

  useEffect(() => {
    if (!pathname) return
    // Pageviews exclude query strings — they can contain language/hospital
    // params we don't need and keeps URLs uniform in analytics.
    trackPageview(pathname)
  }, [pathname, searchParams])

  return null
}

/**
 * Initializes PostHog only when the user has accepted analytics cookies.
 * The CookieConsent banner calls initAnalytics()/shutdownAnalytics() on
 * choice; this provider handles the returning-visitor case.
 */
export function PostHogProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    if (hasAnalyticsConsent()) initAnalytics()
  }, [])

  return (
    <>
      <Suspense>
        <PageviewTracker />
      </Suspense>
      {children}
    </>
  )
}