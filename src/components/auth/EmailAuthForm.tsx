'use client'

import { useMemo, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

type Mode = 'signin' | 'signup' | 'forgot'

interface EmailAuthFormProps {
  onSuccess: () => void
}

/** Maps Supabase auth error codes/messages to patient-friendly copy. */
function friendlyAuthError(message: string): string {
  const m = message.toLowerCase()
  if (m.includes('invalid login credentials')) return 'Email or password is incorrect.'
  if (m.includes('already registered')) return 'An account with this email already exists. Try signing in.'
  if (m.includes('email not confirmed')) return 'Please confirm your email first — check your inbox for the link.'
  if (m.includes('rate limit')) return 'Too many attempts. Please wait a minute and try again.'
  if (m.includes('weak password') || m.includes('at least')) return 'Password needs at least 8 characters.'
  if (m.includes('valid email')) return "That doesn't look like a valid email address."
  return 'Something went wrong. Please try again.'
}

function passwordStrength(pw: string): { score: 0 | 1 | 2 | 3; label: string } {
  if (pw.length === 0) return { score: 0, label: '' }
  let score = 0
  if (pw.length >= 8) score++
  if (/[A-Z]/.test(pw) && /[a-z]/.test(pw)) score++
  if (/\d/.test(pw) || /[^A-Za-z0-9]/.test(pw)) score++
  const labels = ['Too short', 'Weak', 'Good', 'Strong'] as const
  return { score: score as 0 | 1 | 2 | 3, label: labels[score] }
}

const STRENGTH_COLORS = ['var(--error)', 'var(--warning)', 'var(--brand)', 'var(--success)']

const INPUT_CLASSES =
  'min-h-[48px] w-full rounded-md border border-border-subtle bg-surface px-4 text-base text-text-primary transition-[border-color,box-shadow] duration-150 placeholder:text-text-placeholder focus:border-brand-strong focus:outline-none focus:ring-2 focus:ring-brand-strong/25'

const LABEL_CLASSES = 'mb-1.5 block text-xs font-medium uppercase tracking-wide text-text-secondary'

export function EmailAuthForm({ onSuccess }: EmailAuthFormProps) {
  const supabase = useMemo(() => createClient(), [])
  const [mode, setMode] = useState<Mode>('signin')
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  // Once a confirmation/reset email is sent, lock the button so users can't spam it
  const [emailSent, setEmailSent] = useState(false)

  const strength = passwordStrength(password)
  const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
  const canSubmit =
    !loading &&
    !emailSent &&
    emailValid &&
    (mode === 'forgot' || password.length >= 8) &&
    (mode !== 'signup' || fullName.trim().length > 0)

  const switchMode = (next: Mode) => {
    setMode(next)
    setError('')
    setNotice('')
    setEmailSent(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!canSubmit) return
    setLoading(true)
    setError('')
    setNotice('')
    try {
      if (mode === 'signup') {
        const { data, error: err } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/auth/callback`,
            data: { full_name: fullName.trim() },
          },
        })
        if (err) throw err
        // When confirmation is required, no session is returned
        if (!data.session) {
          setNotice('Almost there — check your email and tap the confirmation link.')
          setEmailSent(true)
          return
        }
        onSuccess()
      } else if (mode === 'signin') {
        const { error: err } = await supabase.auth.signInWithPassword({ email, password })
        if (err) throw err
        onSuccess()
      } else {
        const { error: err } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/auth/callback?next=/auth/reset-password`,
        })
        if (err) throw err
        setNotice('If an account exists for that email, a reset link is on its way.')
        setEmailSent(true)
      }
    } catch (err: unknown) {
      setError(friendlyAuthError(err instanceof Error ? err.message : ''))
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate>
      {error && (
        <div
          className="mb-4 rounded-lg border border-error/20 bg-error-subtle px-4 py-3 text-center text-sm text-error-text"
          role="alert"
        >
          {error}
        </div>
      )}
      {notice && (
        <div
          className="mb-4 rounded-lg border border-brand-muted bg-brand-subtle px-4 py-3 text-center text-sm text-brand-ink"
          role="status"
        >
          {notice}
        </div>
      )}

      {mode === 'signup' && (
        <div className="mb-4">
          <label htmlFor="auth-name" className={LABEL_CLASSES}>
            Full name
          </label>
          <input
            id="auth-name"
            type="text"
            autoComplete="name"
            value={fullName}
            onChange={e => setFullName(e.target.value)}
            className={INPUT_CLASSES}
            maxLength={100}
          />
        </div>
      )}

      <div className="mb-4">
        <label htmlFor="auth-email" className={LABEL_CLASSES}>
          Email
        </label>
        <input
          id="auth-email"
          type="email"
          autoComplete="email"
          inputMode="email"
          spellCheck={false}
          value={email}
          onChange={e => { setEmail(e.target.value); setEmailSent(false) }}
          className={INPUT_CLASSES}
          maxLength={254}
        />
      </div>

      {mode !== 'forgot' && (
        <div className="mb-2">
          <label htmlFor="auth-password" className={LABEL_CLASSES}>
            Password
          </label>
          <input
            id="auth-password"
            type="password"
            autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
            value={password}
            onChange={e => setPassword(e.target.value)}
            className={INPUT_CLASSES}
            maxLength={72}
            aria-describedby={mode === 'signup' ? 'auth-password-strength' : undefined}
          />
          {mode === 'signup' && password.length > 0 && (
            <div id="auth-password-strength" className="mt-2 flex items-center gap-2" aria-live="polite">
              <div className="flex flex-1 gap-1">
                {[1, 2, 3].map(i => (
                  <div
                    key={i}
                    className="h-1 flex-1 rounded-full"
                    style={{ background: i <= strength.score ? STRENGTH_COLORS[strength.score] : 'var(--border-subtle)' }}
                  />
                ))}
              </div>
              <span className="text-xs font-medium text-text-tertiary">
                {strength.label}
              </span>
            </div>
          )}
        </div>
      )}

      {mode === 'signin' && (
        <button
          type="button"
          onClick={() => switchMode('forgot')}
          className="mb-4 min-h-[32px] rounded-sm text-xs font-medium text-brand-ink underline underline-offset-2 transition-colors duration-150 hover:text-brand-ink-hover"
        >
          Forgot password?
        </button>
      )}

      <button
        type="submit"
        disabled={!canSubmit}
        className="mb-3 mt-2 min-h-[48px] w-full rounded-md bg-brand-ink py-3 text-base font-medium text-white shadow-xs transition-colors duration-150 hover:bg-brand-ink-hover active:scale-[0.98] disabled:bg-sunken disabled:text-text-placeholder disabled:shadow-none"
      >
        {loading
          ? 'Working…'
          : emailSent
            ? 'Email sent — check your inbox'
            : mode === 'signup'
              ? 'Create account →'
              : mode === 'signin'
                ? 'Sign in →'
                : 'Send reset link →'}
      </button>

      <p className="text-center text-sm text-text-secondary">
        {mode === 'signup' ? (
          <>
            Already have an account?{' '}
            <button type="button" onClick={() => switchMode('signin')} className="font-medium text-brand-ink underline underline-offset-2">
              Sign in
            </button>
          </>
        ) : (
          <>
            New to Keiro?{' '}
            <button type="button" onClick={() => switchMode('signup')} className="font-medium text-brand-ink underline underline-offset-2">
              Create an account
            </button>
          </>
        )}
      </p>
    </form>
  )
}