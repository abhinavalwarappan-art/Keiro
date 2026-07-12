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
  const secondaryLines = displayLines.filter((line) => line !== primaryLine)

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
      <header className="shrink-0 border-b border-border-subtle px-5 pb-3 pt-5">
        <div className="mb-3 flex items-center justify-between">
          <Link
            href={allLanguagesHref}
            className="text-xs font-medium text-text-tertiary transition-colors hover:text-text-secondary"
          >
            ← {t('confirm.allLanguages')}
          </Link>
          <span className="text-xs font-medium text-text-tertiary">{t('confirm.readyToStart')}</span>
        </div>

        <div className="flex items-center gap-3">
          <div className="shrink-0 origin-left scale-90">
            <Kai size="sm" state="waving" interactive={false} />
          </div>
          <div className="min-w-0 flex-1">
            <h1 className="text-xl font-semibold leading-tight tracking-tight text-text-primary">
              {greeting}.
            </h1>
            <p className="mt-0.5 text-sm leading-snug text-text-secondary">
              {t('confirm.chatIn')
                .split(/(\{language\})/)
                .map((part, i) =>
                  part === '{language}' ? (
                    <span key={i}>
                      <span className="font-medium text-text-primary">{primaryLine?.text}</span>
                      {secondaryLines.map((line) => (
                        <span key={`${line.role}-${line.text}`}>
                          {' · '}
                          <span style={{ direction: selected.rtl ? 'rtl' : 'ltr' }}>{line.text}</span>
                        </span>
                      ))}
                    </span>
                  ) : (
                    <span key={i}>{part}</span>
                  ),
                )}
            </p>
          </div>
        </div>

        <p className="mt-3 text-xs leading-relaxed text-text-tertiary">{t('confirm.pitch')}</p>

        <div className="mt-3 flex w-full items-center justify-between">
          <RomanizationToggle enabled={romanization} onToggle={() => setRomanization((p) => !p)} />
          <span className="text-xs font-medium text-text-tertiary">{t('confirm.languageCount')}</span>
        </div>
      </header>

      <section className="flex min-h-0 flex-1 flex-col items-center justify-center bg-surface px-6 py-5">
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
          className="w-full max-w-sm rounded-2xl border border-brand-border bg-brand-subtle p-6 text-center shadow-xs"
        >
          <span className="text-5xl leading-none">{selected.flag}</span>
          {displayLines
            .filter((line) => romanization || line.role !== 'roman')
            .map((line, index) =>
              line.role === 'roman' ? (
                <p key={`${line.role}-${line.text}`} className="mt-2 text-sm text-text-tertiary">
                  {line.text}
                </p>
              ) : (
                <h2
                  key={`${line.role}-${line.text}`}
                  className={
                    index === 0
                      ? 'mt-4 text-2xl font-semibold tracking-tight text-text-primary'
                      : 'mt-1 text-xl text-brand-ink'
                  }
                  style={line.role === 'native' ? { direction: selected.rtl ? 'rtl' : 'ltr' } : undefined}
                >
                  {line.text}
                </h2>
              ),
            )}
          <p className="mt-5 text-sm leading-relaxed text-text-secondary">
            {t('confirm.openChatIn', { language: primaryLine?.text ?? selected.en })}
          </p>
        </motion.div>
      </section>

      <footer className="z-20 shrink-0 border-t border-border-subtle bg-surface px-4 pb-5 pt-3">
        <motion.button
          onClick={handleContinue}
          className="flex min-h-[48px] w-full items-center justify-center gap-2 rounded-md bg-brand-ink py-3 text-base font-medium text-white shadow-xs transition-colors duration-150 hover:bg-brand-ink-hover"
          whileTap={{ scale: 0.98 }}
        >
          {t('confirm.continueIn', { language: primaryLine?.text ?? selected.en })}
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden>
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