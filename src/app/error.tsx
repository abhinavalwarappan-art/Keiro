'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import * as Sentry from '@sentry/nextjs'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    Sentry.captureException(error)
  }, [error])

  return (
    <main className="flex min-h-dvh flex-col items-center justify-center bg-transparent px-6 text-center">
      <div className="mx-auto w-full max-w-sm">
        <h1 className="mb-2 text-2xl font-semibold tracking-tight text-text-primary">
          Something went wrong
        </h1>
        <p className="mb-6 text-sm leading-relaxed text-text-secondary">
          Don&apos;t worry — nothing you typed was lost or shared. Try again, or go back home.
        </p>

        {process.env.NODE_ENV === 'development' && error.message && (
          <pre className="mb-6 overflow-x-auto rounded-md border border-error/20 bg-error-subtle p-3 text-left font-mono text-xs text-error-text">
            {error.message}
          </pre>
        )}

        <div className="mx-auto flex w-full max-w-[280px] flex-col gap-2">
          <button
            onClick={reset}
            type="button"
            className="min-h-[48px] w-full rounded-md bg-brand-ink py-3 text-base font-medium text-white shadow-xs transition-colors duration-150 hover:bg-brand-ink-hover active:scale-[0.98]"
          >
            Try again
          </button>
          <Link
            href="/"
            className="flex min-h-[44px] w-full items-center justify-center rounded-md py-2.5 text-sm font-medium text-text-secondary transition-colors duration-150 hover:bg-sunken hover:text-text-primary"
          >
            Go home
          </Link>
        </div>
      </div>
    </main>
  )
}