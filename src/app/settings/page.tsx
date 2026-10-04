'use client'

export const dynamic = 'force-dynamic'

import { useState, useEffect, useMemo, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useRouter } from 'next/navigation'
import {
  ArrowLeft, Globe, Type, LogOut, Trash2, ChevronRight,
  Download, BarChart3, MessageSquarePlus,
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { Profile } from '@/types'
import { getLanguageByCode } from '@/lib/languages'
import {
  ANALYTICS_CONSENT_KEY, hasAnalyticsConsent, initAnalytics, shutdownAnalytics, trackFeedbackSubmitted,
} from '@/lib/analytics'

// Design-system tokens (see /DESIGN_SYSTEM.md) — kept as a map because this
// page styles through inline `style`; values resolve to globals.css vars.
const C = {
  bg: 'var(--canvas)',
  surface: 'var(--surface)',
  border: 'var(--border-subtle)',
  borderSoft: 'var(--border-subtle)',
  tintBg: 'var(--brand-subtle)',
  ink: 'var(--text-primary)',
  inkSoft: 'var(--text-secondary)',
  brand: 'var(--brand-ink)',
  brandDeep: 'var(--brand-ink-active)',
  dangerInk: 'var(--error-text)',
  dangerBg: 'var(--error-subtle)',
  dangerBorder: 'rgb(220 38 38 / 0.2)',
}

type FeedbackType = 'bug' | 'feature' | 'general'

function SectionCard({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="overflow-hidden rounded-lg border border-border-subtle bg-surface">
      <div className="border-b border-border-subtle bg-canvas px-4 py-2.5">
        <span className="text-sm font-semibold text-text-secondary">
          {label}
        </span>
      </div>
      {children}
    </div>
  )
}

function RowIcon({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex size-9 shrink-0 items-center justify-center rounded-md bg-brand-subtle">
      {children}
    </div>
  )
}

export default function SettingsPage() {
  const router = useRouter()
  const supabase = useMemo(() => createClient(), [])
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [exporting, setExporting] = useState(false)
  const [analyticsOn, setAnalyticsOn] = useState(false)
  const [showFeedback, setShowFeedback] = useState(false)
  const [feedbackType, setFeedbackType] = useState<FeedbackType>('general')
  const [feedbackText, setFeedbackText] = useState('')
  const [feedbackState, setFeedbackState] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle')

  useEffect(() => {
    let cancelled = false
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        if (!cancelled) setLoading(false)
        return
      }
      const { data } = await supabase
        .from('profiles')
        .select('id, language_code, romanization_enabled')
        .eq('id', user.id)
        .single()
      if (!cancelled) {
        if (data) setProfile(data as Profile)
        setLoading(false)
      }
    }
    load()
    return () => { cancelled = true }
  }, [supabase])

  useEffect(() => {
    const timer = setTimeout(
      () => setAnalyticsOn(hasAnalyticsConsent()),
      0
    )
    return () => clearTimeout(timer)
  }, [])

  const handleRomanizationToggle = async () => {
    if (!profile) return
    const next = !profile.romanization_enabled
    const { error } = await supabase
      .from('profiles')
      .update({ romanization_enabled: next })
      .eq('id', profile.id)
    if (!error) {
      setProfile(p => p ? { ...p, romanization_enabled: next } : p)
    }
  }

  const handleAnalyticsToggle = () => {
    const next = !analyticsOn
    setAnalyticsOn(next)
    try {
      localStorage.setItem(ANALYTICS_CONSENT_KEY, next ? 'accepted' : 'declined')
    } catch {
      // storage may be blocked; the in-memory toggle + init/shutdown below still apply
    }
    if (next) initAnalytics()
    else shutdownAnalytics()
  }

  // GDPR data portability: everything the account holds, as one JSON file
  const handleDownloadData = useCallback(async () => {
    setExporting(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const [profileRes, reportsRes, consentsRes] = await Promise.all([
        supabase.from('profiles').select('*').eq('id', user.id).single(),
        supabase.from('reports').select('*').eq('user_id', user.id),
        supabase.from('consents').select('*').eq('user_id', user.id),
      ])
      const exportPayload = {
        exported_at: new Date().toISOString(),
        account: { id: user.id, email: user.email, phone: user.phone, created_at: user.created_at },
        profile: profileRes.data ?? null,
        reports: reportsRes.data ?? [],
        consents: consentsRes.data ?? [],
        note: 'Chat conversations are never stored and therefore cannot be exported.',
      }
      const blob = new Blob([JSON.stringify(exportPayload, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `keiro-data-export-${new Date().toISOString().slice(0, 10)}.json`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    } finally {
      setExporting(false)
    }
  }, [supabase])

  const handleDeleteAllData = async () => {
    if (!profile) return
    setDeleting(true)
    try {
      const { error: reportsError } = await supabase
        .from('reports')
        .delete()
        .eq('user_id', profile.id)
      if (reportsError) throw reportsError

      const { error: sessionsError } = await supabase
        .from('sessions')
        .delete()
        .eq('user_id', profile.id)
      if (sessionsError) throw sessionsError

      const { error: profileError } = await supabase
        .from('profiles')
        .delete()
        .eq('id', profile.id)
      if (profileError) throw profileError

      await supabase.auth.signOut()
      router.push('/')
    } catch {
      setDeleting(false)
      setShowDeleteConfirm(false)
    }
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/')
  }

  const handleSendFeedback = async () => {
    const trimmed = feedbackText.trim()
    if (trimmed.length === 0) return
    setFeedbackState('sending')
    const response = await fetch('/api/feedback', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: feedbackType,
        message: trimmed.slice(0, 4000),
        pageUrl: '/settings',
      }),
    }).catch(() => null)
    if (!response?.ok) {
      setFeedbackState('error')
      return
    }
    trackFeedbackSubmitted(feedbackType)
    setFeedbackState('sent')
    setFeedbackText('')
    setTimeout(() => {
      setShowFeedback(false)
      setFeedbackState('idle')
    }, 1500)
  }

  const lang = profile ? getLanguageByCode(profile.language_code) : null

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex min-h-dvh flex-col bg-transparent"
    >
      <header className="sticky top-0 z-10 flex min-h-14 items-center gap-3 border-b border-border-subtle bg-surface px-4">
        <button
          onClick={() => router.back()}
          className="flex size-9 min-h-[44px] min-w-[44px] items-center justify-center rounded-md text-text-secondary transition-colors duration-150 hover:bg-sunken hover:text-text-primary"
          aria-label="Go back"
        >
          <ArrowLeft size={17} aria-hidden />
        </button>
        <h1 className="text-base font-semibold text-text-primary">Settings</h1>
      </header>

      {/* <main>, not a div with the id: the skip link needs the id AND
          screen-reader users need the main landmark (was landmark-one-main). */}
      <main id="main-content" className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-4 p-4 pb-10">
        {loading ? (
          <>
            <div className="skeleton h-24 rounded-lg" />
            <div className="skeleton h-24 rounded-lg" />
            <div className="skeleton h-36 rounded-lg" />
          </>
        ) : (
          <>
            <SectionCard label="Language">
              <motion.button
                onClick={() => router.push('/onboarding?fresh=1')}
                className="w-full flex items-center gap-3 px-4 py-4 min-h-[60px]"
                whileTap={{ scale: 0.98 }}
              >
                <RowIcon><Globe size={16} style={{ color: C.brand }} /></RowIcon>
                <div className="flex-1 text-left">
                  <div className="text-[14px] font-medium" style={{ color: C.ink }}>
                    {lang ? `${lang.flag} ${lang.en}` : 'Not set'}
                  </div>
                  {lang && <div className="text-[12px]" style={{ color: C.inkSoft }}>{lang.native}</div>}
                </div>
                <ChevronRight size={16} style={{ color: C.inkSoft }} />
              </motion.button>
            </SectionCard>

            {profile && (
              <SectionCard label="Display">
                <div className="flex items-center gap-3 px-4 py-4 min-h-[60px]">
                  <RowIcon><Type size={16} style={{ color: C.brand }} /></RowIcon>
                  <div className="flex-1">
                    <div className="text-[14px] font-medium" style={{ color: C.ink }}>Show romanized text</div>
                    <div className="text-[12px]" style={{ color: C.inkSoft }}>Phonetic spelling below native script</div>
                  </div>
                  <button
                    role="switch"
                    aria-checked={profile.romanization_enabled}
                    aria-label="Show romanized text"
                    onClick={handleRomanizationToggle}
                    className="w-12 h-7 rounded-full relative flex-shrink-0 after:absolute after:-inset-2"
                    style={{ background: profile.romanization_enabled ? C.brand : C.border, transition: 'background 0.2s' }}
                  >
                    <motion.span
                      className="absolute top-1 left-1 w-5 h-5 rounded-full bg-white shadow"
                      animate={{ x: profile.romanization_enabled ? 22 : 0 }}
                      transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                    />
                  </button>
                </div>
              </SectionCard>
            )}

            <SectionCard label="Data & Privacy">
              <div className="flex items-center gap-3 px-4 py-4 min-h-[60px]" style={{ borderBottom: `1px solid ${C.borderSoft}` }}>
                <RowIcon><BarChart3 size={16} style={{ color: C.brand }} /></RowIcon>
                <div className="flex-1">
                  <div className="text-[14px] font-medium" style={{ color: C.ink }}>Anonymous analytics</div>
                  <div className="text-[12px]" style={{ color: C.inkSoft }}>Usage stats only — never health data</div>
                </div>
                <button
                  role="switch"
                  aria-checked={analyticsOn}
                  aria-label="Anonymous analytics"
                  onClick={handleAnalyticsToggle}
                  className="w-12 h-7 rounded-full relative flex-shrink-0 after:absolute after:-inset-2"
                  style={{ background: analyticsOn ? C.brand : C.border, transition: 'background 0.2s' }}
                >
                  <motion.span
                    className="absolute top-1 left-1 w-5 h-5 rounded-full bg-white shadow"
                    animate={{ x: analyticsOn ? 22 : 0 }}
                    transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                  />
                </button>
              </div>
              <button
                onClick={handleDownloadData}
                disabled={exporting}
                className="w-full flex items-center gap-3 px-4 py-4 min-h-[60px] disabled:opacity-60"
              >
                <RowIcon><Download size={16} style={{ color: C.brand }} /></RowIcon>
                <div className="flex-1 text-left">
                  <div className="text-[14px] font-medium" style={{ color: C.ink }}>Download my data</div>
                  <div className="text-[12px]" style={{ color: C.inkSoft }}>Export account, reports & consents as JSON</div>
                </div>
                <ChevronRight size={16} style={{ color: C.inkSoft }} />
              </button>
            </SectionCard>

            <SectionCard label="Feedback">
              <button
                onClick={() => setShowFeedback(true)}
                className="w-full flex items-center gap-3 px-4 py-4 min-h-[60px]"
              >
                <RowIcon><MessageSquarePlus size={16} style={{ color: C.brand }} /></RowIcon>
                <div className="flex-1 text-left">
                  <div className="text-[14px] font-medium" style={{ color: C.ink }}>Send feedback</div>
                  <div className="text-[12px]" style={{ color: C.inkSoft }}>Report a bug or request a feature</div>
                </div>
                <ChevronRight size={16} style={{ color: C.inkSoft }} />
              </button>
            </SectionCard>

            <SectionCard label="Legal">
              {[
                { label: 'Terms of Service', href: '/terms' },
                { label: 'Privacy Policy', href: '/privacy' },
              ].map(item => (
                <motion.button
                  key={item.label}
                  onClick={() => router.push(item.href)}
                  className="w-full flex items-center justify-between px-4 py-4 min-h-[60px] border-b border-border-subtle last:border-0"
                  whileTap={{ scale: 0.98 }}
                >
                  <span className="text-[14px]" style={{ color: C.ink }}>{item.label}</span>
                  <ChevronRight size={15} style={{ color: C.inkSoft }} />
                </motion.button>
              ))}
            </SectionCard>

            <div className="flex flex-col gap-2 mt-2">
              <motion.button
                onClick={handleSignOut}
                className="flex items-center justify-center gap-2 w-full py-3.5 min-h-[44px] rounded-lg font-semibold text-[14px]"
                style={{ background: C.bg, border: `1px solid ${C.border}`, color: C.brandDeep }}
                whileTap={{ scale: 0.97 }}
              >
                <LogOut size={15} /> Sign out
              </motion.button>

              <motion.button
                onClick={() => setShowDeleteConfirm(true)}
                className="flex items-center justify-center gap-2 w-full py-3.5 min-h-[44px] rounded-lg font-semibold text-[14px]"
                style={{ background: C.dangerBg, border: `1px solid ${C.dangerBorder}`, color: C.dangerInk }}
                whileTap={{ scale: 0.97 }}
              >
                <Trash2 size={15} /> Delete all my data
              </motion.button>
            </div>
          </>
        )}
      </main>

      <AnimatePresence>
        {showFeedback && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-end justify-center p-4"
            style={{ background: 'rgba(0,0,0,0.5)' }}
            onClick={() => setShowFeedback(false)}
          >
            <motion.div
              role="dialog"
              aria-modal="true"
              aria-labelledby="feedback-dialog-title"
              initial={{ y: 40, scale: 0.95 }}
              animate={{ y: 0, scale: 1 }}
              exit={{ y: 40, scale: 0.95 }}
              onClick={e => e.stopPropagation()}
              className="w-full max-w-sm rounded-lg p-6"
              style={{ background: C.surface }}
            >
              <h3 id="feedback-dialog-title" className="font-bold text-lg mb-3" style={{ color: C.ink }}>Send feedback</h3>
              <div className="flex gap-2 mb-3">
                {(['bug', 'feature', 'general'] as FeedbackType[]).map(type => (
                  <button
                    key={type}
                    onClick={() => setFeedbackType(type)}
                    className="flex-1 py-2 rounded-md text-[13px] font-medium capitalize"
                    style={{
                      background: feedbackType === type ? C.tintBg : C.bg,
                      border: `1px solid ${feedbackType === type ? C.brand : C.border}`,
                      color: feedbackType === type ? C.brandDeep : C.inkSoft,
                    }}
                  >
                    {type}
                  </button>
                ))}
              </div>
              <textarea
                value={feedbackText}
                onChange={e => setFeedbackText(e.target.value)}
                placeholder="Tell us what's on your mind…"
                rows={4}
                maxLength={4000}
                className="w-full rounded-md p-3 text-[14px] resize-none"
                style={{ background: C.bg, border: `1px solid ${C.border}`, color: C.ink }}
              />
              <div className="flex gap-3 mt-4">
                <button
                  onClick={() => setShowFeedback(false)}
                  className="flex-1 py-3 rounded-lg font-semibold text-[14px]"
                  style={{ background: C.bg, border: `1px solid ${C.border}`, color: C.brandDeep }}
                >
                  Cancel
                </button>
                <motion.button
                  onClick={handleSendFeedback}
                  disabled={feedbackState === 'sending' || feedbackText.trim().length === 0}
                  className="flex-1 py-3 rounded-lg font-semibold text-[14px] text-white disabled:opacity-60"
                  style={{ background: C.brand }}
                  whileTap={{ scale: 0.97 }}
                >
                  {feedbackState === 'sending'
                    ? 'Sending…'
                    : feedbackState === 'sent'
                      ? 'Sent!'
                      : feedbackState === 'error'
                        ? 'Try again'
                        : 'Send'}
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showDeleteConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-end justify-center p-4"
            style={{ background: 'rgba(0,0,0,0.5)' }}
            onClick={() => setShowDeleteConfirm(false)}
          >
            <motion.div
              initial={{ y: 40, scale: 0.95 }}
              animate={{ y: 0, scale: 1 }}
              exit={{ y: 40, scale: 0.95 }}
              onClick={e => e.stopPropagation()}
              className="w-full max-w-sm rounded-lg p-6"
              style={{ background: C.surface }}
            >
              <h3 className="font-bold text-lg mb-2" style={{ color: C.ink }}>Delete all data?</h3>
              <p className="text-sm mb-6" style={{ color: C.inkSoft }}>
                This will permanently delete your account, all reports, and all data. This action cannot be undone.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="flex-1 py-3 rounded-lg font-semibold text-[14px]"
                  style={{ background: C.bg, border: `1px solid ${C.border}`, color: C.brandDeep }}
                >
                  Cancel
                </button>
                <motion.button
                  onClick={handleDeleteAllData}
                  disabled={deleting}
                  className="flex-1 py-3 rounded-lg font-semibold text-[14px] text-white disabled:opacity-60"
                  style={{ background: C.dangerInk }}
                  whileTap={{ scale: 0.97 }}
                >
                  {deleting ? 'Deleting…' : 'Delete everything'}
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
