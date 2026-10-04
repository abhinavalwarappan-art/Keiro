'use client'

export const dynamic = 'force-dynamic'

import { useState, useEffect, useCallback } from 'react'
import { ErrorBoundary } from '@/components/ErrorBoundary'
import { motion, AnimatePresence } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Trash2 } from 'lucide-react'
import Kai from '@/components/kai/Kai'
import ReportCard from '@/components/report/ReportCard'
import { createClient } from '@/lib/supabase/client'
import { Report } from '@/types'
import { Skeleton, SkeletonText } from '@/components/ui/Skeleton'

function HistoryInner() {
  const router = useRouter()
  const [reports, setReports] = useState<Report[]>([])
  const [loading, setLoading] = useState(true)
  const [fetchError, setFetchError] = useState(false)
  const [deleting, setDeleting] = useState<string | null>(null)
  // Deleting a medical report is permanent, so the trash button only asks; the
  // inline row underneath is what actually deletes.
  const [confirmingId, setConfirmingId] = useState<string | null>(null)
  const [deleteFailedId, setDeleteFailedId] = useState<string | null>(null)
  const supabase = createClient()

  const load = useCallback(async () => {
    setLoading(true)
    setFetchError(false)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.replace('/auth?redirect=/history')
        return
      }
      const { data, error } = await supabase
        .from('reports')
        .select('id, report_id, chief_complaint, language_used, created_at')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(50)
      if (error) throw error
      setReports((data ?? []) as Report[])
    } catch {
      setFetchError(true)
    } finally {
      setLoading(false)
    }
  }, [router, supabase])

  useEffect(() => { load() }, [load])

  const handleDelete = async (id: string) => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    setDeleting(id)
    setDeleteFailedId(null)
    try {
      const { error } = await supabase
        .from('reports')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id)
      if (error) throw error
      setReports(prev => prev.filter(r => r.id !== id))
      setConfirmingId(null)
    } catch {
      // Leave the item in place and say so, so the patient can retry.
      setDeleteFailedId(id)
    } finally {
      setDeleting(null)
    }
  }

  const handleReportClick = (report: Report) => {
    const params = new URLSearchParams({
      reportId: report.report_id,
      langName: report.language_used,
    })
    router.push(`/report?${params.toString()}`)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex min-h-screen flex-col bg-transparent"
    >
      <header className="sticky top-0 z-10 flex min-h-14 items-center gap-3 border-b border-border-subtle bg-surface px-4">
        <button
          onClick={() => router.back()}
          className="flex size-9 min-h-[44px] min-w-[44px] items-center justify-center rounded-md text-text-secondary transition-colors duration-150 hover:bg-sunken hover:text-text-primary"
          aria-label="Go back"
        >
          <ArrowLeft size={16} aria-hidden />
        </button>
        <h1 className="text-base font-semibold text-text-primary">Past visits</h1>
      </header>

      {/* main#main-content on every page: skip-link target + landmark navigation */}
      <main id="main-content" className="mx-auto w-full max-w-2xl flex-1 px-4 py-6">
        {loading ? (
          /* Mirrors the loaded report rows exactly — no layout shift */
          <div className="flex flex-col gap-3">
            {[0, 1, 2, 3].map(i => (
              <div key={i} className="flex items-start gap-3 rounded-lg border border-border-subtle bg-surface p-4">
                <Skeleton className="size-10 shrink-0 rounded-md" />
                <div className="flex-1 space-y-2">
                  <SkeletonText className="h-3 w-24" />
                  <SkeletonText className="h-4 w-2/3" />
                  <SkeletonText className="h-3 w-1/3" />
                </div>
              </div>
            ))}
          </div>
        ) : fetchError ? (
          <div className="flex flex-col items-center justify-center pt-16 text-center">
            <Kai size="md" state="idle" interactive={false} />
            <p className="mt-4 text-base font-semibold text-text-primary">Having trouble connecting</p>
            <p className="mt-1 text-sm text-text-secondary">Check your connection and try again</p>
            <motion.button
              onClick={load}
              className="mt-6 min-h-[44px] rounded-md bg-brand-ink px-6 py-2.5 text-sm font-medium text-white shadow-xs transition-colors duration-150 hover:bg-brand-ink-hover"
              whileTap={{ scale: 0.98 }}
            >
              Retry
            </motion.button>
          </div>
        ) : reports.length === 0 ? (
          <div className="flex flex-col items-center justify-center pt-16 text-center">
            <Kai size="md" state="idle" interactive={false} />
            <p className="mt-4 text-base font-semibold text-text-primary">No visits yet</p>
            <p className="mt-1 text-sm text-text-secondary">Your past reports will appear here</p>
            <motion.button
              onClick={() => router.push('/onboarding?fresh=1')}
              className="mt-6 min-h-[44px] rounded-md bg-brand-ink px-6 py-2.5 text-sm font-medium text-white shadow-xs transition-colors duration-150 hover:bg-brand-ink-hover"
              whileTap={{ scale: 0.98 }}
            >
              Start a new visit
            </motion.button>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            <AnimatePresence>
              {reports.map((report, i) => (
                <motion.div
                  key={report.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ delay: i * 0.05 }}
                  className="relative"
                >
                  <ReportCard
                    report={report}
                    onClick={() => handleReportClick(report)}
                  />
                  <button
                    onClick={() => setConfirmingId(confirmingId === report.id ? null : report.id)}
                    aria-expanded={confirmingId === report.id}
                    className="absolute right-2 top-2 flex size-11 items-center justify-center rounded-full text-text-tertiary transition-colors duration-150 hover:bg-error-subtle hover:text-error active:scale-95"
                    aria-label="Delete report"
                  >
                    <Trash2 size={16} aria-hidden />
                  </button>
                  {confirmingId === report.id && (
                    <div
                      role="group"
                      aria-label="Confirm delete"
                      className="mt-2 flex flex-wrap items-center justify-between gap-3 rounded-[1.25rem] bg-error-subtle px-4 py-3"
                    >
                      <p className="text-base text-error-text" role={deleteFailedId === report.id ? 'alert' : undefined}>
                        {deleteFailedId === report.id
                          ? 'Couldn’t delete. Check your connection and try again.'
                          : 'Delete this report? This can’t be undone.'}
                      </p>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => setConfirmingId(null)}
                          className="min-h-11 rounded-full px-4 text-base font-semibold text-text-primary hover:bg-surface"
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(report.id)}
                          aria-busy={deleting === report.id || undefined}
                          disabled={deleting === report.id}
                          className="min-h-11 rounded-full bg-error px-4 text-base font-semibold text-white disabled:opacity-60"
                        >
                          {deleting === report.id ? 'Deleting…' : 'Delete'}
                        </button>
                      </div>
                    </div>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </main>
    </motion.div>
  )
}

export default function HistoryPage() {
  return (
    <ErrorBoundary>
      <HistoryInner />
    </ErrorBoundary>
  )
}