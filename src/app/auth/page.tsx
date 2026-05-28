'use client'

import { useState, Suspense } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Phone, Mail } from 'lucide-react'
import Kai from '@/components/kai/Kai'
import { pageVariants } from '@/lib/motion'
import { createClient } from '@/lib/supabase/client'

function AuthContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [step, setStep] = useState<'method' | 'phone' | 'otp'>('method')
  const [phone, setPhone] = useState('')
  const [otp, setOtp] = useState(['', '', '', '', '', ''])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const langCode = searchParams.get('lang') || 'en-US'
  const langName = searchParams.get('langName') || 'English'
  const langNative = searchParams.get('langNative') || 'English'
  const roman = searchParams.get('roman') === '1'
  const hospital = searchParams.get('hospital') || ''

  const supabase = createClient()

  const buildChatUrl = () => {
    const p = new URLSearchParams({ lang: langCode, langName, langNative, roman: roman ? '1' : '0' })
    if (hospital) p.set('hospital', hospital)
    return `/chat?${p.toString()}`
  }

  const handlePhoneSubmit = async () => {
    setLoading(true)
    setError('')
    try {
      const { error } = await supabase.auth.signInWithOtp({ phone: phone.startsWith('+') ? phone : `+1${phone}` })
      if (error) throw error
      setStep('otp')
    } catch (e: any) {
      setError(e.message || 'Failed to send code')
    }
    setLoading(false)
  }

  const handleOtpSubmit = async () => {
    setLoading(true)
    setError('')
    try {
      const token = otp.join('')
      const { error } = await supabase.auth.verifyOtp({
        phone: phone.startsWith('+') ? phone : `+1${phone}`,
        token,
        type: 'sms',
      })
      if (error) throw error
      router.push(buildChatUrl())
    } catch (e: any) {
      setError(e.message || 'Invalid code')
    }
    setLoading(false)
  }

  const handleGuest = async () => {
    setLoading(true)
    try {
      await supabase.auth.signInAnonymously()
      router.push(buildChatUrl())
    } catch {
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

  return (
    <div className="flex flex-col min-h-screen" style={{ background: '#f8fffe', maxWidth: 430, margin: '0 auto' }}>
      <div className="px-4 py-3 flex items-center gap-2" style={{ background: 'white', borderBottom: '1px solid #c5edd8' }}>
        <button onClick={() => step === 'method' ? router.back() : setStep('method')} className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: '#f8fffe' }}>
          <ArrowLeft size={16} style={{ color: '#1a3d2b' }} />
        </button>
        <span className="text-sm font-semibold" style={{ color: '#0f2419' }}>Sign in to save your reports</span>
        <div className="ml-auto px-2 py-0.5 rounded-full text-xs font-medium" style={{ background: '#edfaf4', color: '#2da866' }}>
          {langNative}
        </div>
      </div>

      <motion.div
        variants={pageVariants}
        initial="initial"
        animate="animate"
        className="flex-1 px-6 py-8"
      >
        <div className="flex flex-col items-center mb-6 gap-3">
          <div className="animate-float">
            <Kai size="sm" state="idle" interactive={false} />
          </div>
          <p className="text-xs text-keiro-muted bg-white border border-keiro-border rounded-full px-3 py-1">Hi! I&apos;m Kai.</p>
        </div>

        <AnimatePresence mode="wait">
          {step === 'method' && (
            <motion.div key="method" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <h2 className="text-xl font-bold text-center mb-2" style={{ color: '#0f2419' }}>Create your free account</h2>
              <p className="text-sm text-center mb-8" style={{ color: '#3B6D11' }}>Save your report and chat history.</p>

              <div className="flex flex-col gap-3">
                <motion.button
                  onClick={() => setStep('phone')}
                  className="flex items-center gap-3 w-full px-5 py-4 rounded-2xl font-semibold"
                  style={{ background: '#1a3d2b', color: 'white' }}
                  whileTap={{ scale: 0.97 }}
                >
                  <Phone size={18} /> Continue with phone
                </motion.button>

                <div className="flex items-center gap-3">
                  <div className="flex-1 h-px" style={{ background: '#c5edd8' }} />
                  <span className="text-xs" style={{ color: '#3B6D11' }}>or</span>
                  <div className="flex-1 h-px" style={{ background: '#c5edd8' }} />
                </div>

                <motion.button
                  onClick={handleGuest}
                  disabled={loading}
                  className="w-full px-5 py-4 rounded-2xl font-semibold text-sm"
                  style={{ background: '#f8fffe', border: '1.5px solid #c5edd8', color: '#1a3d2b' }}
                  whileTap={{ scale: 0.97 }}
                >
                  {loading ? 'Loading...' : 'Continue without account'}
                </motion.button>
                <p className="text-xs text-center" style={{ color: '#3B6D11' }}>Your report won&apos;t be saved.</p>
              </div>
            </motion.div>
          )}

          {step === 'phone' && (
            <motion.div key="phone" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <h2 className="text-xl font-bold text-center mb-2" style={{ color: '#0f2419' }}>Enter your phone number</h2>
              <p className="text-sm text-center mb-8" style={{ color: '#3B6D11' }}>We&apos;ll send you a 6-digit code</p>

              <div className="flex gap-2 mb-4">
                <div className="flex items-center px-3 py-3.5 rounded-xl" style={{ background: '#f8fffe', border: '1.5px solid #c5edd8', color: '#3B6D11', fontSize: 14 }}>+1</div>
                <input
                  type="tel"
                  value={phone}
                  onChange={e => setPhone(e.target.value.replace(/\D/g, ''))}
                  placeholder="(555) 000-0000"
                  className="flex-1 px-4 py-3.5 rounded-xl text-sm"
                  style={{ background: '#f8fffe', border: '1.5px solid #c5edd8', color: '#0f2419' }}
                  maxLength={10}
                />
              </div>

              {error && <p className="text-xs mb-3 text-center" style={{ color: '#A32D2D' }}>{error}</p>}

              <motion.button
                onClick={handlePhoneSubmit}
                disabled={phone.length < 10 || loading}
                className="w-full py-4 rounded-2xl font-semibold text-white"
                style={{ background: phone.length >= 10 ? '#1a3d2b' : '#c5edd8', color: phone.length >= 10 ? 'white' : '#3B6D11' }}
                whileTap={phone.length >= 10 ? { scale: 0.97 } : {}}
              >
                {loading ? 'Sending...' : 'Send code →'}
              </motion.button>
            </motion.div>
          )}

          {step === 'otp' && (
            <motion.div key="otp" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <h2 className="text-xl font-bold text-center mb-2" style={{ color: '#0f2419' }}>Enter the code</h2>
              <p className="text-sm text-center mb-8" style={{ color: '#3B6D11' }}>Sent to +1{phone}</p>

              <div className="flex gap-2 justify-center mb-6">
                {otp.map((digit, i) => (
                  <input
                    key={i}
                    id={`otp-${i}`}
                    type="tel"
                    maxLength={1}
                    value={digit}
                    onChange={e => handleOtpChange(i, e.target.value)}
                    className="w-12 h-14 rounded-xl text-center text-xl font-bold"
                    style={{
                      border: `2px solid ${digit ? '#2da866' : '#c5edd8'}`,
                      background: digit ? '#d4f5e5' : '#f8fffe',
                      color: '#0f2419',
                    }}
                  />
                ))}
              </div>

              {error && <p className="text-xs mb-3 text-center" style={{ color: '#A32D2D' }}>{error}</p>}

              <motion.button
                onClick={handleOtpSubmit}
                disabled={otp.some(d => !d) || loading}
                className="w-full py-4 rounded-2xl font-semibold text-white"
                style={{ background: otp.every(d => d) ? '#1a3d2b' : '#c5edd8', color: otp.every(d => d) ? 'white' : '#3B6D11' }}
                whileTap={otp.every(d => d) ? { scale: 0.97 } : {}}
              >
                {loading ? 'Verifying...' : 'Verify →'}
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>

        <p className="text-xs text-center mt-6" style={{ color: '#3B6D11' }}>
          By continuing you agree to our{' '}
          <Link href="/terms" className="underline">Terms</Link>{' '}
          and{' '}
          <Link href="/privacy" className="underline">Privacy Policy</Link>
        </p>
      </motion.div>
    </div>
  )
}

export default function AuthPage() {
  return (
    <Suspense>
      <AuthContent />
    </Suspense>
  )
}
