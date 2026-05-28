'use client'

export const dynamic = 'force-dynamic'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Trash2 } from 'lucide-react'
import Kai from '@/components/kai/Kai'
import ReportCard from '@/components/report/ReportCard'
import { createClient } from '@/lib/supabase/client'
import { Report } from '@/types'

export default function HistoryPage() {
  const router = useRouter()
  const [reports, setReports] = useState<Report[]>([])
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState<string | null>(null)
  const supabase = createClient()

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase
        .from('reports')
        .select('*')
        .order('created_at', { ascending: false })
      if (data) setReports(data)
      setLoading(false)
    }
    load()
  }, []) // eslint-disable-line

  const handleDelete = async (id: string) => {
    setDeleting(id)
    await supabase.from('reports').delete().eq('id', id)
    setReports(prev => prev.filter(r => r.id !== id))
    setDeleting(null)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col min-h-screen"
      style={{ maxWidth: 430, margin: '0 auto', background: '#f8fffe' }}
    >
      <div className="flex items-center gap-3 px-4 py-3" style={{ background: 'white', borderBottom: '1px solid #c5edd8' }}>
        <button onClick={() => router.back()} className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: '#f8fffe' }}>
          <ArrowLeft size={16} style={{ color: '#1a3d2b' }} />
        </button>
        <h1 className="font-bold text-base" style={{ color: '#0f2419' }}>Past Visits</h1>
      </div>

      <div className="flex-1 p-4">
        {loading ? (
          <div className="flex justify-center pt-12">
            <motion.div
              className="w-8 h-8 rounded-full border-4 border-t-transparent"
              style={{ borderColor: '#c5edd8', borderTopColor: '#2da866' }}
              animate={{ rotate: 360 }}
              transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
            />
          </div>
        ) : reports.length === 0 ? (
          <div className="flex flex-col items-center justify-center pt-16 text-center">
            <Kai size="md" state="idle" interactive={false} />
            <p className="mt-4 font-semibold" style={{ color: '#0f2419' }}>No visits yet</p>
            <p className="text-sm mt-1" style={{ color: '#3B6D11' }}>Your past reports will appear here</p>
            <motion.button
              onClick={() => router.push('/onboarding')}
              className="mt-6 px-6 py-3 rounded-xl text-sm font-semibold text-white"
              style={{ background: '#1a3d2b' }}
              whileTap={{ scale: 0.97 }}
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
                  transition={{ delay: i * 0.06 }}
                  className="relative"
                >
                  <ReportCard
                    report={report}
                    onClick={() => router.push(`/report?reportId=${report.report_id}&langName=${report.language_used}`)}
                  />
                  <button
                    onClick={() => handleDelete(report.id)}
                    disabled={deleting === report.id}
                    className="absolute top-3 right-3 w-8 h-8 rounded-lg flex items-center justify-center transition-all"
                    style={{ background: deleting === report.id ? '#fee' : '#fff5f5' }}
                  >
                    <Trash2 size={13} style={{ color: '#A32D2D' }} />
                  </button>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </motion.div>
  )
}
