'use client'

import { useMemo, useState, Suspense } from 'react'
import { ErrorBoundary } from '@/components/ErrorBoundary'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import Kai from '@/components/kai/Kai'
import { createClient } from '@/lib/supabase/client'
import { trackSignIn } from '@/lib/analytics'

const supabaseConfigured =
  typeof process.env.NEXT_PUBLIC_SUPABASE_URL === 'string' &&
  process.env.NEXT_PUBLIC_SUPABASE_URL.length > 0 &&
  !process.env.NEXT_PUBLIC_SUPABASE_URL.includes('placeholder')

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
      setError(e instanceof Error ? e.message : 'Could not start your session')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex h-dvh min-h-0 w-full flex-col bg-transparent">
      <div className="z-10 flex shrink-0 items-center gap-3 px-4 py-3">
        <button
          type="button"
          onClick={() => router.back()}
          className="flex size-9 min-h-[44px] min-w-[44px] items-center justify-center rounded-md text-text-secondary transition-colors duration-150 hover:bg-sunken hover:text-text-primary"
          aria-label="Go back"
        >
          <ArrowLeft size={17} aria-hidden />
        </button>
        <span className="flex-1" />
        <span className="rounded-full border border-border-subtle bg-sunken px-2.5 py-1 text-xs font-medium text-text-secondary">
          {langNative}
        </span>
      </div>

      <div
        data-lenis-prevent
        className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-6 py-8 pb-10"
      >
        <div className="mx-auto w-full max-w-sm">
          {sessionEnded && (
            <div
              className="mb-4 rounded-lg border border-border-subtle bg-surface px-4 py-3 text-center text-sm text-text-secondary"
              role="status"
            >
              Your session has ended.
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
              Hi! I&apos;m Kai.
            </p>
          </div>

          <h2 className="mb-2 text-center text-2xl font-semibold tracking-tight text-text-primary">
            Ready when you are
          </h2>
          <p className="mb-6 text-center text-sm text-text-secondary">
            Tap start and I&apos;ll walk you through everything, one step at a time.
          </p>

          <button
            type="button"
            onClick={handleStart}
            disabled={loading}
            className="min-h-[48px] w-full rounded-md bg-brand-ink px-5 py-3 text-base font-medium text-white shadow-xs transition-colors duration-150 hover:bg-brand-ink-hover active:scale-[0.98] disabled:opacity-50"
          >
            {loading ? 'Starting…' : 'Start now →'}
          </button>

          <p className="mt-6 text-center text-xs text-text-tertiary">
            By continuing you agree to our{' '}
            <Link href="/terms" className="underline hover:text-text-secondary">
              Terms
            </Link>{' '}
            and{' '}
            <Link href="/privacy" className="underline hover:text-text-secondary">
              Privacy Policy
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default function AuthPage() {
  return (
    <ErrorBoundary>
      <Suspense>
        <AuthContent />
      </Suspense>
    </ErrorBoundary>
  )
}
