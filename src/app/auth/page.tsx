'use client'

import { useMemo, useState, Suspense } from 'react'
import { ErrorBoundary } from '@/components/ErrorBoundary'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Mail, Phone } from 'lucide-react'
import Kai from '@/components/kai/Kai'
import { EmailAuthForm } from '@/components/auth/EmailAuthForm'
import { createClient } from '@/lib/supabase/client'
import { trackSignIn } from '@/lib/analytics'

const supabaseConfigured =
  typeof process.env.NEXT_PUBLIC_SUPABASE_URL === 'string' &&
  process.env.NEXT_PUBLIC_SUPABASE_URL.length > 0 &&
  !process.env.NEXT_PUBLIC_SUPABASE_URL.includes('placeholder')

function AuthContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [step, setStep] = useState<'method' | 'phone' | 'otp' | 'email'>('method')
  const [phone, setPhone] = useState('')
  const [otp, setOtp] = useState(['', '', '', '', '', ''])
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

  const normalisePhone = (raw: string) => (raw.startsWith('+') ? raw : `+1${raw}`)

  const handlePhoneSubmit = async () => {
    setLoading(true)
    setError('')
    try {
      const { error: otpError } = await supabase.auth.signInWithOtp({
        phone: normalisePhone(phone),
      })
      if (otpError) throw otpError
      setStep('otp')
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to send code')
    } finally {
      setLoading(false)
    }
  }

  const handleOtpSubmit = async () => {
    setLoading(true)
    setError('')
    try {
      const token = otp.join('')
      const { error: verifyError } = await supabase.auth.verifyOtp({
        phone: normalisePhone(phone),
        token,
        type: 'sms',
      })
      if (verifyError) throw verifyError
      trackSignIn('phone')
      goToChat()
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Invalid code')
    } finally {
      setLoading(false)
    }
  }

  const handleGuest = async () => {
    setLoading(true)
    setError('')
    try {
      if (supabaseConfigured) {
        const { error: guestError } = await supabase.auth.signInAnonymously()
        if (guestError) throw guestError
        trackSignIn('guest')
        await new Promise((resolve) => setTimeout(resolve, 300))
      }
      goToChat()
    } catch (e: unknown) {
      if (!supabaseConfigured) {
        goToChat()
        return
      }
      setError(e instanceof Error ? e.message : 'Could not start guest session')
    } finally {
      setLoading(false)
    }
  }

  const handleGoogle = async () => {
    setLoading(true)
    setError('')
    const next = encodeURIComponent(buildChatUrl())
    const { error: oauthError } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback?next=${next}`,
        queryParams: { access_type: 'offline', prompt: 'consent' },
      },
    })
    if (oauthError) {
      setError(oauthError.message)
      setLoading(false)
    }
  }

  const handleOtpChange = (index: number, value: string) => {
    if (!/^\d?$/.test(value)) return
    const next = [...otp]
    next[index] = value
    setOtp(next)
    if (value && index < 5) {
      document.getElementById(`otp-${index + 1}`)?.focus()
    }
  }

  // 2FA paste support: distribute a pasted code across all six boxes
  const handleOtpPaste = (e: React.ClipboardEvent) => {
    const digits = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6)
    if (digits.length < 2) return
    e.preventDefault()
    const next = [...otp]
    digits.split('').forEach((d, i) => { next[i] = d })
    setOtp(next)
    document.getElementById(`otp-${Math.min(digits.length, 5)}`)?.focus()
  }

  return (
    <div className="flex h-dvh min-h-0 w-full flex-col bg-transparent">
      <div className="z-10 flex shrink-0 items-center gap-3 px-4 py-3">
        <button
          type="button"
          onClick={() => (step === 'method' ? router.back() : setStep('method'))}
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

        {step === 'method' && (
          <div>
            <h2 className="mb-2 text-center text-2xl font-semibold tracking-tight text-text-primary">
              Create your free account
            </h2>
            <p className="mb-6 text-center text-sm text-text-secondary">
              Save your report and chat history — or skip sign-in and start now.
            </p>

            {/* Primary path — always visible */}
            <button
              type="button"
              onClick={goToChat}
              disabled={loading}
              className="mb-4 min-h-[48px] w-full rounded-md bg-brand-ink px-5 py-3 text-base font-medium text-white shadow-xs transition-colors duration-150 hover:bg-brand-ink-hover active:scale-[0.98] disabled:opacity-50"
            >
              Continue to chat →
            </button>

            <div className="flex flex-col gap-2.5">
              <button
                type="button"
                onClick={() => setStep('phone')}
                className="flex min-h-[48px] w-full items-center justify-center gap-2.5 rounded-md border border-border-subtle bg-surface px-5 py-3 text-sm font-medium text-text-primary transition-colors duration-150 hover:border-border-default hover:bg-sunken active:scale-[0.98]"
              >
                <Phone size={17} className="text-text-tertiary" aria-hidden />
                Continue with phone
              </button>

              <button
                type="button"
                onClick={handleGoogle}
                disabled={loading}
                className="flex min-h-[48px] w-full items-center justify-center gap-2.5 rounded-md border border-border-subtle bg-surface px-5 py-3 text-sm font-medium text-text-primary transition-colors duration-150 hover:border-border-default hover:bg-sunken active:scale-[0.98] disabled:opacity-50"
              >
                <svg width="19" height="19" viewBox="0 0 24 24" aria-hidden>
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                Continue with Google
              </button>

              <button
                type="button"
                onClick={() => setStep('email')}
                disabled={loading}
                className="flex min-h-[48px] w-full items-center justify-center gap-2.5 rounded-md border border-border-subtle bg-surface px-5 py-3 text-sm font-medium text-text-primary transition-colors duration-150 hover:border-border-default hover:bg-sunken active:scale-[0.98] disabled:opacity-50"
              >
                <Mail size={17} className="text-text-tertiary" aria-hidden />
                Continue with email
              </button>

              <div className="my-1 flex items-center gap-3">
                <div className="h-px flex-1 bg-border-subtle" />
                <span className="text-xs font-medium text-text-tertiary">or</span>
                <div className="h-px flex-1 bg-border-subtle" />
              </div>

              <button
                type="button"
                onClick={handleGuest}
                disabled={loading}
                className="min-h-[48px] w-full rounded-md px-5 py-3 text-sm font-medium text-text-secondary transition-colors duration-150 hover:bg-sunken hover:text-text-primary active:scale-[0.98] disabled:opacity-50"
              >
                {loading ? 'Starting…' : 'Start without an account'}
              </button>

              <p className="mt-1 text-center text-xs text-text-tertiary">
                Your report won&apos;t be saved, but you can still download it as a PDF.
              </p>
            </div>
          </div>
        )}

        {step === 'phone' && (
          <div>
            <h2 className="mb-2 text-center text-2xl font-semibold tracking-tight text-text-primary">
              Enter your phone
            </h2>
            <p className="mb-8 text-center text-sm text-text-secondary">
              We&apos;ll send you a 6-digit code
            </p>

            <div className="mb-5 flex gap-2">
              <div className="flex shrink-0 items-center rounded-md border border-border-subtle bg-sunken px-4 text-base font-medium text-text-secondary">
                +1
              </div>
              <input
                type="tel"
                autoComplete="tel-national"
                inputMode="numeric"
                value={phone}
                onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                onKeyDown={(e) => { if (e.key === 'Enter' && phone.length >= 10) handlePhoneSubmit() }}
                placeholder="(555) 000-0000"
                className="min-h-[48px] flex-1 rounded-md border border-border-subtle bg-surface px-4 text-base font-medium text-text-primary transition-[border-color,box-shadow] duration-150 placeholder:text-text-placeholder focus:border-brand-strong focus:outline-none focus:ring-2 focus:ring-brand-strong/25"
                maxLength={10}
                aria-label="Phone number"
              />
            </div>

            <button
              type="button"
              onClick={handlePhoneSubmit}
              disabled={phone.length < 10 || loading}
              className="mb-3 min-h-[48px] w-full rounded-md bg-brand-ink py-3 text-base font-medium text-white shadow-xs transition-colors duration-150 hover:bg-brand-ink-hover active:scale-[0.98] disabled:bg-sunken disabled:text-text-placeholder disabled:shadow-none"
            >
              {loading ? 'Sending…' : 'Send code →'}
            </button>
          </div>
        )}

        {step === 'otp' && (
          <div>
            <h2 className="mb-2 text-center text-2xl font-semibold tracking-tight text-text-primary">
              Enter the code
            </h2>
            <p className="mb-8 text-center text-sm text-text-secondary">
              Sent to +1{phone}
            </p>

            <div className="mb-6 flex justify-center gap-2">
              {otp.map((digit, i) => (
                <input
                  key={i}
                  id={`otp-${i}`}
                  type="tel"
                  inputMode="numeric"
                  autoComplete={i === 0 ? 'one-time-code' : 'off'}
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleOtpChange(i, e.target.value)}
                  onPaste={handleOtpPaste}
                  onKeyDown={(e) => {
                    if (e.key === 'Backspace' && !otp[i] && i > 0) {
                      document.getElementById(`otp-${i - 1}`)?.focus()
                    }
                  }}
                  className={`size-12 rounded-md border text-center text-xl font-semibold text-text-primary transition-[border-color,box-shadow] duration-150 focus:outline-none focus:ring-2 focus:ring-brand-strong/25 ${digit ? 'border-brand-strong bg-brand-subtle' : 'border-border-subtle bg-surface'}`}
                  aria-label={`Digit ${i + 1}`}
                />
              ))}
            </div>

            <button
              type="button"
              onClick={handleOtpSubmit}
              disabled={otp.some((d) => !d) || loading}
              className="min-h-[48px] w-full rounded-md bg-brand-ink py-3 text-base font-medium text-white shadow-xs transition-colors duration-150 hover:bg-brand-ink-hover active:scale-[0.98] disabled:bg-sunken disabled:text-text-placeholder disabled:shadow-none"
            >
              {loading ? 'Verifying…' : 'Verify →'}
            </button>
          </div>
        )}

        {step === 'email' && (
          <EmailAuthForm onSuccess={goToChat} />
        )}

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