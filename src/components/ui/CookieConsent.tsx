'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { ANALYTICS_CONSENT_KEY, initAnalytics, shutdownAnalytics } from '@/lib/analytics'

export function CookieConsent() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    try {
      const stored = localStorage.getItem(ANALYTICS_CONSENT_KEY)
      if (stored) return
    } catch {
      // localStorage unavailable (e.g. private browsing restrictions)
      return
    }
    // Slight delay so the banner doesn't compete with page load
    const timer = setTimeout(() => setVisible(true), 600)
    return () => clearTimeout(timer)
  }, [])

  const handleAccept = () => {
    try {
      localStorage.setItem(ANALYTICS_CONSENT_KEY, 'accepted')
    } catch {
      // localStorage unavailable; proceed with in-session acceptance only
    }
    initAnalytics()
    setVisible(false)
  }

  const handleDecline = () => {
    try {
      localStorage.setItem(ANALYTICS_CONSENT_KEY, 'declined')
    } catch {
      // localStorage unavailable; proceed with in-session decline only
    }
    shutdownAnalytics()
    setVisible(false)
  }

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 24 }}
          transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
          role="dialog"
          aria-modal="false"
          aria-label="Cookie consent"
          className="fixed bottom-4 left-4 right-4 z-50 mx-auto flex max-w-[480px] flex-col gap-3 rounded-lg border border-border-subtle bg-surface px-5 py-4 shadow-md"
        >
          <p className="text-sm leading-relaxed text-text-secondary">
            Essential session cookies are always on. With your OK we also use
            anonymous usage analytics (no health data, ever) to improve Keiro.{' '}
            <Link
              href="/privacy"
              className="font-medium text-brand-ink underline underline-offset-2"
            >
              Privacy policy
            </Link>
          </p>

          <div className="flex gap-2">
            <button
              onClick={handleAccept}
              className="min-h-[44px] flex-1 rounded-md bg-brand-ink py-2.5 text-sm font-medium text-white transition-colors duration-150 hover:bg-brand-ink-hover"
            >
              Allow analytics
            </button>
            <button
              onClick={handleDecline}
              className="min-h-[44px] flex-1 rounded-md border border-border-subtle bg-surface py-2.5 text-sm font-medium text-text-secondary transition-colors duration-150 hover:bg-sunken hover:text-text-primary"
            >
              Essential only
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}