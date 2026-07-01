'use client'

import { useMemo, useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { ErrorBoundary } from '@/components/ErrorBoundary'
import Kai from '@/components/kai/Kai'
import { createClient } from '@/lib/supabase/client'

function ResetPasswordContent() {
  const router = useRouter()
  const supabase = useMemo(() => createClient(), [])
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [done, setDone] = useState(false)
  const redirectTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    return () => {
      if (redirectTimer.current) {
        clearTimeout(redirectTimer.current)
      }
    }
  }, [])

  const canSubmit = !loading && password.length >= 8 && password === confirm

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!canSubmit) return
    setLoading(true)
    setError('')
    try {
      const { error: err } = await supabase.auth.updateUser({ password })
      if (err) {
        setError(
          err.message.toLowerCase().includes('different from the old')
            ? 'New password must be different from your old one.'
            : 'Could not update password. The reset link may have expired — request a new one.'
        )
        return
      }
      setDone(true)
      redirectTimer.current = setTimeout(() => router.replace('/'), 2000)
    } finally {
      setLoading(false)
    }
  }

  return (
    <main
      id="main-content"
      className="flex flex-col min-h-dvh w-full px-6 py-10"
      style={{ background: 'var(--canvas)', maxWidth: 430, margin: '0 auto' }}
    >
      <div className="flex flex-col items-center gap-2 mb-8">
        <Kai size="sm" state="idle" interactive={false} />
        <h1 className="font-display text-[24px] font-bold text-center" style={{ color: 'var(--text-primary)' }}>
          Choose a new password
        </h1>
      </div>

      {done ? (
        <div
          className="px-4 py-4 rounded-2xl text-[15px] text-center"
          style={{ background: 'var(--brand-subtle)', border: '1px solid var(--border-subtle)', color: 'var(--brand-ink)' }}
          role="status"
        >
          Password updated. Taking you home…
        </div>
      ) : (
        <form onSubmit={handleSubmit} noValidate>
          {error && (
            <div
              className="px-4 py-3 rounded-xl text-[14px] text-center mb-4"
              style={{ background: 'var(--error-subtle)', border: '1px solid rgb(220 38 38 / 0.2)', color: 'var(--error)' }}
              role="alert"
            >
              {error}
            </div>
          )}

          <label htmlFor="new-password" className="block text-[13px] font-semibold mb-1.5" style={{ color: 'var(--text-secondary)' }}>
            New password (8+ characters)
          </label>
          <input
            id="new-password"
            type="password"
            autoComplete="new-password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            className="w-full px-4 py-4 rounded-2xl text-[16px] mb-4"
            style={{ background: 'var(--canvas)', border: '1.5px solid var(--border-subtle)', color: 'var(--text-primary)' }}
            maxLength={72}
          />

          <label htmlFor="confirm-password" className="block text-[13px] font-semibold mb-1.5" style={{ color: 'var(--text-secondary)' }}>
            Confirm password
          </label>
          <input
            id="confirm-password"
            type="password"
            autoComplete="new-password"
            value={confirm}
            onChange={e => setConfirm(e.target.value)}
            className="w-full px-4 py-4 rounded-2xl text-[16px]"
            style={{ background: 'var(--canvas)', border: '1.5px solid var(--border-subtle)', color: 'var(--text-primary)' }}
            maxLength={72}
          />
          {confirm.length > 0 && confirm !== password && (
            <p className="text-[13px] mt-1.5" style={{ color: 'var(--error)' }} role="alert">
              Passwords don&apos;t match yet.
            </p>
          )}

          <button
            type="submit"
            disabled={!canSubmit}
            className="w-full py-5 rounded-2xl font-bold text-[17px] min-h-[60px] mt-6 transition-transform active:scale-[0.98]"
            style={{
              background: canSubmit ? 'var(--brand-ink)' : 'var(--border-subtle)',
              color: canSubmit ? 'white' : 'var(--text-secondary)',
              boxShadow: canSubmit ? '0 4px 20px rgba(28,25,23,0.25)' : 'none',
            }}
          >
            {loading ? 'Updating…' : 'Update password'}
          </button>
        </form>
      )}
    </main>
  )
}

export default function ResetPasswordPage() {
  return (
    <ErrorBoundary>
      <ResetPasswordContent />
    </ErrorBoundary>
  )
}