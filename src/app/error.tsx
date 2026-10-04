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
      <div className="mx-auto w-full max-w-md">
        <h1 className="text-balance text-[2rem] font-semibold leading-[1.1] tracking-[-0.035em] text-text-primary">
          Something didn&apos;t load.
        </h1>
        <p className="mb-8 mt-4 text-pretty text-lg leading-relaxed text-text-secondary">
          Nothing you said was lost or shared. Try again — if it keeps happening, check your
          connection or go back to the start.
        </p>

        {process.env.NODE_ENV === 'development' && error.message && (
          <pre className="mb-6 overflow-x-auto rounded-md border border-error/20 bg-error-subtle p-3 text-left font-mono text-xs text-error-text">
            {error.message}
          </pre>
        )}

        <div className="mx-auto flex w-full max-w-[20rem] flex-col gap-2">
          <button
            onClick={reset}
            type="button"
            className="min-h-14 w-full rounded-full bg-brand-ink px-6 text-lg font-semibold text-white transition-[background-color,transform] duration-150 hover:bg-brand-ink-hover active:scale-[0.97]"
          >
            Try again
          </button>
          <Link
            href="/"
            className="flex min-h-12 w-full items-center justify-center rounded-full text-base font-semibold text-brand-ink transition-colors duration-150 hover:bg-brand-subtle"
          >
            Back to the start
          </Link>
        </div>
      </div>
    </main>
  )
}