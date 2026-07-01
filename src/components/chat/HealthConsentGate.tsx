'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

const HEALTH_CONSENT_KEY = 'keiro_health_consent'

/**
 * GDPR Art. 9 explicit-consent gate. Health data is special-category data, so
 * before the first conversation the user must affirmatively agree to its
 * processing — named data types, named purpose, separate from terms acceptance.
 * The choice is recorded locally and, for signed-in users, in the consents
 * audit table.
 */
export function HealthConsentGate() {
  const router = useRouter()
  const [visible, setVisible] = useState(false)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    try {
      const given = localStorage.getItem(HEALTH_CONSENT_KEY) === '1'
      if (given) return
    } catch {
      // localStorage may be unavailable (e.g. private browsing restrictions)
    }
    const timer = setTimeout(() => setVisible(true), 150)
    return () => clearTimeout(timer)
  }, [])

  const handleAgree = async () => {
    setLoading(true)
    try {
      localStorage.setItem(HEALTH_CONSENT_KEY, '1')
    } catch {
      // localStorage may be unavailable
    }
    setVisible(false)
    // Best-effort audit trail — guests may not have a session yet
    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const now = new Date().toISOString()
        await supabase
          .from('consents')
          .insert({ user_id: user.id, consent_type: 'health_data', granted: true, created_at: now })
        await supabase
          .from('profiles')
          .update({ data_processing_consent: true, consent_date: now })
          .eq('id', user.id)
      }
    } catch {
      // Consent UX must not break if the audit insert fails
    } finally {
      setLoading(false)
    }
  }

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          className="fixed inset-0 z-[60] flex items-end justify-center bg-black/40 p-4 backdrop-blur-sm sm:items-center"
          role="dialog"
          aria-modal="true"
          aria-labelledby="health-consent-title"
        >
          <motion.div
            initial={{ y: 24, scale: 0.97 }}
            animate={{ y: 0, scale: 1 }}
            exit={{ y: 24, opacity: 0 }}
            transition={{ ease: [0.16, 1, 0.3, 1], duration: 0.25 }}
            className="flex w-full max-w-md flex-col gap-4 rounded-lg bg-surface p-6 shadow-md"
          >
            <div className="flex flex-col gap-2">
              <h2 id="health-consent-title" className="text-lg font-semibold text-text-primary">
                Before we start
              </h2>
              <p className="text-sm leading-relaxed text-text-secondary">
                To help you, Kai will process the health details you share — your{' '}
                <strong className="font-medium text-text-primary">symptoms, medications, conditions, and allergies</strong> — to hold the
                conversation and prepare a report for your doctor.
              </p>
              <p className="text-sm leading-relaxed text-text-secondary">
                Your conversation is <strong className="font-medium text-text-primary">never stored</strong>. If you&apos;re signed in, only
                the finished report is saved to your account; you can delete it anytime. Guests:
                nothing is kept after you close the tab.
              </p>
              <p className="text-xs text-text-tertiary">
                Details in the{' '}
                <Link href="/privacy" className="font-medium text-brand-ink underline underline-offset-2">
                  privacy policy
                </Link>
                . You can withdraw consent anytime in Settings.
              </p>
            </div>

            <div className="flex flex-col gap-2">
              <button
                onClick={handleAgree}
                disabled={loading}
                className="min-h-[48px] w-full rounded-md bg-brand-ink py-3 text-base font-medium text-white transition-colors duration-150 hover:bg-brand-ink-hover active:scale-[0.99] disabled:opacity-60 disabled:cursor-not-allowed"
              >
                I agree — let&apos;s talk
              </button>
              <button
                onClick={() => router.push('/')}
                disabled={loading}
                className="min-h-[44px] w-full rounded-md py-2.5 text-sm font-medium text-text-secondary transition-colors duration-150 hover:bg-sunken hover:text-text-primary disabled:opacity-60 disabled:cursor-not-allowed"
              >
                Not now
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}