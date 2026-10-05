'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ErrorBoundary } from '@/components/ErrorBoundary'
import AppLanguagePicker from '@/components/language/AppLanguagePicker'

const ONBOARDING_LANG_KEY = 'keiro_onboarding_lang'

/** Read a query parameter at event/effect time — never during render. */
function queryParam(name: string): string | null {
  return new URLSearchParams(window.location.search).get(name)
}

/**
 * The patient's first screen (often opened from a clinic QR code on a phone).
 *
 * It deliberately does NOT read the URL during render. `useSearchParams` would
 * opt the whole page out of prerendering, so the HTML held only a skeleton and
 * the 45-language list appeared after the JavaScript downloaded — ~6s on a slow
 * clinic connection. Now the list is in the HTML. Deep links (`?lang=`) are
 * redirected to the confirm step by the proxy before this page ever renders.
 */
function OnboardingContent() {
  const router = useRouter()

  useEffect(() => {
    if (queryParam('fresh') !== '1') return
    try {
      localStorage.removeItem(ONBOARDING_LANG_KEY)
    } catch {
      // localStorage may be unavailable in some environments
    }
  }, [])

  return (
    <AppLanguagePicker
      onSelect={(lang) => {
        const params = new URLSearchParams()
        params.set('lang', lang.code)
        const hospitalSlug = queryParam('hospital')
        if (hospitalSlug) params.set('hospital', hospitalSlug)
        router.push(`/onboarding/confirm?${params.toString()}`)
      }}
    />
  )
}

export default function OnboardingPage() {
  return (
    <ErrorBoundary>
      <OnboardingContent />
    </ErrorBoundary>
  )
}
