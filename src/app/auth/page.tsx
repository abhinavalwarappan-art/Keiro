'use client'

import { useMemo, useState, Suspense } from 'react'
import AuthLoading from './loading'
import { ErrorBoundary } from '@/components/ErrorBoundary'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import Kai from '@/components/kai/Kai'
import { createClient } from '@/lib/supabase/client'
import { trackSignIn } from '@/lib/analytics'
import { useTranslations, type TranslateFn } from '@/i18n/useTranslations'

const supabaseConfigured =
  typeof process.env.NEXT_PUBLIC_SUPABASE_URL === 'string' &&
  process.env.NEXT_PUBLIC_SUPABASE_URL.length > 0 &&
  !process.env.NEXT_PUBLIC_SUPABASE_URL.includes('placeholder')

/**
 * Render the legal sentence, splicing the Terms and Privacy links into the
 * translated template at its {terms} / {privacy} placeholders so word order
 * stays correct in every language.
 */
function LegalLine({ t }: { t: TranslateFn }) {
  const links: Record<string, React.ReactNode> = {
    '{terms}': (
      <Link key="terms" href="/terms" className="underline hover:text-text-secondary">
        {t('intake.termsOfService')}
      </Link>
    ),
    '{privacy}': (
      <Link key="privacy" href="/privacy" className="underline hover:text-text-secondary">
        {t('intake.privacyPolicy')}
      </Link>
    ),
  }

  return (
    <>
      {t('auth.legal')
        .split(/(\{terms\}|\{privacy\})/)
        .map((part, i) => <span key={i}>{links[part] ?? part}</span>)}
    </>
  )
}

function AuthContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const langCode = searchParams.get('lang') || 'en-US'
  const langName = searchParams.get('langName') || 'English'
  const langNative = searchParams.get('langNative') || 'English'
  const roman = searchParams.get('roman') === '1'
  const hospital = searchParams.get('hospital') || ''
  const sessionEnded = searchParams.get('ended') === '1'

  const t = useTranslations(langCode)
  const supabase = useMemo(() => createClient(), [])

  const buildChatUrl = () => {
    // When the proxy redirected here from a protected page, return the user there
    const next = searchParams.get('next')
    if (next && /^\/[^/]/.test(next)) return next
    const p = new URLSearchParams({ lang: langCode, langName, langNative, roman: roman ? '1' : '0' })
    if (hospital) p.set('hospital', hospital)
    return `/chat?${p.toString()}`
  }

  const goToChat = () => router.push(buildChatUrl())

  const handleStart = async () => {
    setLoading(true)
    setError('')
    try {
      // Establish an anonymous session behind the scenes so the report and
      // chat history can be saved — no email, phone, or Google needed.
      if (supabaseConfigured) {
        const { error: startError } = await supabase.auth.signInAnonymously()
        if (startError) throw startError
        trackSignIn('guest')
        await new Promise((resolve) => setTimeout(resolve, 300))
      }
      goToChat()
    } catch (e: unknown) {
      if (!supabaseConfigured) {
        goToChat()
        return
      }
      setError(e instanceof Error ? e.message : t('auth.errStart'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex h-dvh min-h-0 w-full flex-col bg-transparent">
      <header className="z-10 flex shrink-0 items-center gap-3 px-4 py-3">
        <button
          type="button"
          onClick={() => router.back()}
          className="flex size-9 min-h-[44px] min-w-[44px] items-center justify-center rounded-md text-text-secondary transition-colors duration-150 hover:bg-sunken hover:text-text-primary"
          aria-label={t('common.goBack')}
        >
          <ArrowLeft size={17} aria-hidden />
        </button>
        <span className="flex-1" />
        <span className="text-base font-medium text-text-secondary">
          {langNative}
        </span>
      </header>

      {/* main#main-content on every page: skip-link target + landmark navigation */}
      <main
        id="main-content"
        data-lenis-prevent
        className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-6 py-8 pb-10"
      >
        <div className="mx-auto w-full max-w-sm">
          {sessionEnded && (
            <div
              className="mb-4 rounded-lg border border-border-subtle bg-surface px-4 py-3 text-center text-sm text-text-secondary"
              role="status"
            >
              {t('auth.sessionEnded')}
            </div>
          )}

          {error && (
            <div
              className="mb-4 rounded-lg border border-error/20 bg-error-subtle px-4 py-3 text-center text-sm text-error-text"
              role="alert"
            >
              {error}
            </div>
          )}

          <div className="mb-6 flex flex-col items-center gap-2">
            <Kai size="sm" state="idle" interactive={false} />
            <p className="text-sm font-medium text-text-tertiary">
              {t('auth.kaiIntro')}
            </p>
          </div>

          <h2 className="mb-3 text-balance text-center text-[2rem] font-semibold leading-[1.1] tracking-[-0.035em] text-text-primary">
            {t('auth.title')}
          </h2>
          <p className="mb-3 text-pretty text-center text-lg leading-relaxed text-text-secondary">
            {t('auth.subtitle')}
          </p>
          <p className="mb-8 text-pretty text-center text-base leading-relaxed text-text-secondary">
            {t('auth.privacy')}
          </p>

          {/* data-testid is the E2E suite's handle on the guest-auth entry point. The
              visible label is t('auth.start') — it changes with copy AND with the
              patient's language, so matching on its text silently killed every chat
              spec once. Keep this attribute stable; rename the copy freely. */}
          <button
            type="button"
            data-testid="guest-start"
            onClick={handleStart}
            disabled={loading}
            className="min-h-[60px] w-full rounded-full bg-brand-ink px-6 py-3 text-lg font-semibold text-white transition-[background-color,transform] duration-100 hover:bg-brand-ink-hover active:scale-[0.97] disabled:opacity-50"
          >
            {loading ? t('auth.starting') : t('auth.start')}
          </button>

          <p className="mt-6 text-center text-sm text-text-tertiary">
            <LegalLine t={t} />
          </p>
        </div>
      </main>
    </div>
  )
}

export default function AuthPage() {
  return (
    <ErrorBoundary>
      <Suspense fallback={<AuthLoading />}>
        <AuthContent />
      </Suspense>
    </ErrorBoundary>
  )
}
