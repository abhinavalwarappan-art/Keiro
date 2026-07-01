'use client'

import posthog from 'posthog-js'

/**
 * Consent-gated PostHog wrapper.
 *
 * PostHog only initializes after the user accepts analytics in the cookie
 * banner (GDPR: analytics is non-essential, so it is opt-in). Until then every
 * track call is a no-op. No health data, message content, or report content is
 * ever sent — event payloads are limited to language codes, auth method names,
 * and counts.
 */

export const ANALYTICS_CONSENT_KEY = 'keiro_cookie_consent'

let initialized = false

export function hasAnalyticsConsent(): boolean {
  if (typeof window === 'undefined') return false
  try {
    return localStorage.getItem(ANALYTICS_CONSENT_KEY) === 'accepted'
  } catch {
    return false
  }
}

export function initAnalytics(): void {
  if (initialized || typeof window === 'undefined') return
  const key = process.env.NEXT_PUBLIC_POSTHOG_KEY
  if (!key || !hasAnalyticsConsent()) return

  posthog.init(key, {
    api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://us.i.posthog.com',
    capture_pageview: false, // captured manually on route change
    capture_pageleave: true,
    persistence: 'localStorage',
    autocapture: false, // intake answers must never be auto-captured
    disable_session_recording: true, // PHI on screen — never record
    disable_surveys: true, // unused — avoids an extra script load
  })
  initialized = true
}

export function shutdownAnalytics(): void {
  if (!initialized) return
  posthog.opt_out_capturing()
  initialized = false
}

function capture(event: string, properties?: Record<string, string | number | boolean>): void {
  if (!initialized) return
  posthog.capture(event, properties)
}

export function trackPageview(path: string): void {
  if (typeof window === 'undefined') return
  capture('$pageview', { $current_url: window.origin + path })
}

export function trackSignIn(method: 'email' | 'google' | 'phone' | 'guest'): void {
  capture('sign_in', { method })
}

export function trackSignUp(method: 'email' | 'google' | 'phone'): void {
  capture('sign_up', { method })
}

export function trackLanguageSelected(languageCode: string): void {
  capture('language_selected', { language: languageCode })
}

export function trackOnboardingCompleted(languageCode: string, romanization: boolean): void {
  capture('onboarding_completed', { language: languageCode, romanization })
}

export function trackConversationStarted(languageCode: string): void {
  capture('conversation_started', { language: languageCode })
}

export function trackAIQuerySent(languageCode: string, messageCount: number): void {
  capture('ai_query_sent', { language: languageCode, message_count: messageCount })
}

export function trackReportGenerated(languageCode: string): void {
  capture('report_generated', { language: languageCode })
}

export function trackEmergencyShown(): void {
  capture('emergency_screen_shown')
}

export function trackFeedbackSubmitted(type: string): void {
  capture('feedback_submitted', { type })
}