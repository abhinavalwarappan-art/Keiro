'use client'

import { useState, useEffect, Suspense } from 'react'
import ConfirmLoading from './loading'
import { ErrorBoundary } from '@/components/ErrorBoundary'
import { motion } from 'framer-motion'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import Kai from '@/components/kai/Kai'
import RomanizationToggle from '@/components/language/RomanizationToggle'
import { Language, resolveLanguage, getOpeningMessage, getLanguageDisplayLines } from '@/lib/languages'
import { pageVariants } from '@/lib/motion'
import { trackLanguageSelected, trackOnboardingCompleted } from '@/lib/analytics'
import { useTranslations } from '@/i18n/useTranslations'

const LANG_DRAFT_KEY = 'keiro_onboarding_lang'

function ConfirmContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [selected, setSelected] = useState<Language | null>(null)
  const [romanization, setRomanization] = useState(false)
  const hospitalSlug = searchParams.get('hospital')
  const t = useTranslations(searchParams.get('lang') ?? 'en-US')

  useEffect(() => {
    const paramCode = searchParams.get('lang')
    if (!paramCode) {
      router.replace('/onboarding')
      return
    }

    const lang = resolveLanguage(paramCode)
    if (!lang) {
      router.replace('/onboarding')
      return
    }

    setSelected(lang)
    trackLanguageSelected(lang.code)
    try {
      localStorage.setItem(LANG_DRAFT_KEY, JSON.stringify(lang))
    } catch {
      // localStorage unavailable
    }
    // Default to native script — romanization is opt-in on this screen only
    setRomanization(false)
  }, [searchParams, router])

  const handleContinue = () => {
    if (!selected) return
    trackOnboardingCompleted(selected.code, romanization)
    try {
      localStorage.setItem('keiro-roman', romanization ? '1' : '0')
      localStorage.removeItem(LANG_DRAFT_KEY)
    } catch {
      // localStorage unavailable
    }
    const params = new URLSearchParams()
    params.set('lang', selected.code)
    params.set('langName', selected.en)
    params.set('langNative', selected.native)
    params.set('roman', romanization ? '1' : '0')
    if (hospitalSlug) params.set('hospital', hospitalSlug)
    router.push(`/auth?${params.toString()}`)
  }

  const greeting = selected
    ? getOpeningMessage(selected.code, romanization)?.split('.')[0] ?? `Hi, I'm Kai.`
    : "Hi, I'm Kai."

  const displayLines = selected ? getLanguageDisplayLines(selected) : []
  const primaryLine = displayLines.find((line) => line.role === 'english') ?? displayLines[0]

  const allLanguagesHref = hospitalSlug
    ? `/onboarding?fresh=1&hospital=${encodeURIComponent(hospitalSlug)}`
    : '/onboarding?fresh=1'

  if (!selected) {
    return (
      <div className="flex h-dvh items-center justify-center bg-white">
        <div className="skeleton h-12 w-48 rounded-lg" />
      </div>
    )
  }

  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      className="mx-auto flex h-dvh min-h-0 w-full max-w-lg flex-col overflow-hidden bg-canvas"
    >
      <header className="shrink-0 px-5 pt-5">
        {/* data-testid: this label is localized to the SELECTED language, so for
            lang=es-ES it renders "← Todos los idiomas", never "All languages". */}
        <Link
          href={allLanguagesHref}
          data-testid="confirm-all-languages"
          className="inline-flex min-h-11 items-center text-base font-medium text-text-secondary transition-colors hover:text-text-primary"
        >
          ← {t('confirm.allLanguages')}
        </Link>
      </header>

      <section className="flex min-h-0 flex-1 flex-col items-center justify-center px-7 text-center">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: 'spring', stiffness: 220, damping: 28 }}
          className="flex flex-col items-center"
        >
          <Kai size="md" state="waving" interactive={false} />
          <h1 className="mt-6 text-balance text-[2.5rem] font-semibold leading-[1.05] tracking-[-0.04em] text-text-primary">
            {greeting}
          </h1>
          <p
            className="mt-4 text-xl font-medium text-brand-ink"
            style={{ direction: selected.rtl ? 'rtl' : 'ltr' }}
          >
            {displayLines
              .filter((line) => romanization || line.role !== 'roman')
              .map((line) => line.text)
              .join(' · ')}
          </p>
          <p className="mt-6 max-w-xs text-pretty text-lg leading-relaxed text-text-secondary">
            {t('confirm.pitch')}
          </p>
        </motion.div>
      </section>

      <footer className="shrink-0 px-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] pt-3">
        <div className="mb-3 flex justify-center">
          <RomanizationToggle enabled={romanization} onToggle={() => setRomanization((p) => !p)} />
        </div>
        {/* data-testid: the label is t('confirm.continueIn', { language }) and interpolates
            the language's NATIVE name ("Continue in Español", not "Continue in Spanish"),
            so it is unmatchable by an English display-text locator. Keep this stable. */}
        <motion.button
          onClick={handleContinue}
          data-testid="confirm-continue"
          className="flex min-h-[60px] w-full items-center justify-center gap-2.5 rounded-full bg-brand-ink py-3 text-lg font-semibold tracking-[-0.01em] text-white transition-colors duration-150 hover:bg-brand-ink-hover"
          whileTap={{ scale: 0.97 }}
          transition={{ type: 'spring', stiffness: 700, damping: 45 }}
        >
          {t('confirm.continueIn', { language: primaryLine?.text ?? selected.en })}
          <svg width="20" height="20" viewBox="0 0 18 18" fill="none" aria-hidden className="rtl:-scale-x-100">
            <path
              d="M3.5 9h11M10 4.5l4.5 4.5-4.5 4.5"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </motion.button>
      </footer>
    </motion.div>
  )
}

export default function OnboardingConfirmPage() {
  return (
    <ErrorBoundary>
      <Suspense fallback={<ConfirmLoading />}>
        <ConfirmContent />
      </Suspense>
    </ErrorBoundary>
  )
}