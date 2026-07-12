'use client'

import { Suspense, useEffect } from 'react'
import OnboardingLoading from './loading'
import { useRouter, useSearchParams } from 'next/navigation'
import { ErrorBoundary } from '@/components/ErrorBoundary'
import AppLanguagePicker from '@/components/language/AppLanguagePicker'
import { resolveLanguage } from '@/lib/languages'

const ONBOARDING_LANG_KEY = 'keiro_onboarding_lang'

function OnboardingContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const hospitalSlug = searchParams.get('hospital')
  const langParam = searchParams.get('lang')

  useEffect(() => {
    if (searchParams.get('fresh') === '1') {
      try {
        localStorage.removeItem(ONBOARDING_LANG_KEY)
      } catch {
        // localStorage may be unavailable in some environments
      }
    }
  }, [searchParams])

  // Deep links with ?lang= skip the list and go straight to confirm.
  useEffect(() => {
    if (!langParam || !resolveLanguage(langParam)) return
    const params = new URLSearchParams()
    params.set('lang', langParam)
    if (hospitalSlug) params.set('hospital', hospitalSlug)
    router.replace(`/onboarding/confirm?${params.toString()}`)
  }, [langParam, hospitalSlug, router])

  if (langParam && resolveLanguage(langParam)) {
    return null
  }

  return (
    <AppLanguagePicker
      onSelect={(lang) => {
        const params = new URLSearchParams()
        params.set('lang', lang.code)
        if (hospitalSlug) params.set('hospital', hospitalSlug)
        router.push(`/onboarding/confirm?${params.toString()}`)
      }}
    />
  )
}

export default function OnboardingPage() {
  return (
    <ErrorBoundary>
      <Suspense fallback={<OnboardingLoading />}>
        <OnboardingContent />
      </Suspense>
    </ErrorBoundary>
  )
}