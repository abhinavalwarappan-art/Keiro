'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ANALYTICS_CONSENT_KEY, initAnalytics, shutdownAnalytics } from '@/lib/analytics'
import { useSiteTranslations } from '@/i18n/useSiteTranslations'

/**
 * Screens where a patient is mid-task. A consent card there sits on top of the
 * mic, the language list, or the emergency call button — so it never appears.
 * Analytics simply stays off unless consent is given on a marketing page.
 */
const TASK_SCREENS = ['/onboarding', '/auth', '/chat', '/report', '/emergency', '/history', '/settings']

export function CookieConsent() {
  const { t } = useSiteTranslations()
  const pathname = usePathname()
  const [visible, setVisible] = useState(false)
  const onTaskScreen = TASK_SCREENS.some((p) => pathname === p || pathname?.startsWith(`${p}/`))

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
      {visible && !onTaskScreen && (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 16 }}
          transition={{ type: 'spring', stiffness: 420, damping: 38 }}
          role="dialog"
          aria-modal="false"
          aria-label={t('site.cookie.title')}
          className="fixed inset-x-3 bottom-[max(0.75rem,env(safe-area-inset-bottom))] z-50 mx-auto flex max-w-[34rem] flex-col gap-3 rounded-[1.25rem] border border-border-subtle bg-surface/95 p-4 shadow-[0_24px_60px_-24px_rgba(12,34,23,0.35)] backdrop-blur-xl sm:flex-row sm:items-center sm:gap-5 sm:py-3 sm:pl-5 sm:pr-3"
        >
          <p className="text-[0.9375rem] leading-relaxed text-text-secondary sm:flex-1">
            {t('site.cookie.body')}{' '}
            <Link
              href="/privacy"
              className="font-medium text-brand-ink underline underline-offset-2"
            >
              {t('site.footer.privacyPolicy')}
            </Link>
          </p>

          <div className="flex shrink-0 gap-2">
            <button
              onClick={handleAccept}
              className="min-h-11 flex-1 rounded-full bg-brand-ink px-5 text-[0.9375rem] font-semibold text-white transition-[background-color,transform] duration-150 hover:bg-brand-ink-hover active:scale-[0.97] sm:flex-none"
            >
              {t('site.cookie.allow')}
            </button>
            <button
              onClick={handleDecline}
              className="min-h-11 flex-1 rounded-full px-5 text-[0.9375rem] font-semibold text-text-secondary transition-[background-color,color,transform] duration-150 hover:bg-sunken hover:text-text-primary active:scale-[0.97] sm:flex-none"
            >
              {t('site.cookie.decline')}
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
