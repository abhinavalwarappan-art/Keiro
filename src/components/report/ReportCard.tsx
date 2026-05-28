'use client'

import { motion } from 'framer-motion'
import { FileText, Calendar, Globe } from 'lucide-react'
import { Report } from '@/types'

interface ReportCardProps {
  report: Report
  onClick?: () => void
}

export default function ReportCard({ report, onClick }: ReportCardProps) {
  const date = new Date(report.created_at).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric'
  })

  return (
    <motion.div
      onClick={onClick}
      className="rounded-2xl p-4 cursor-pointer"
      style={{ background: 'white', border: '1.5px solid #c5edd8' }}
      whileTap={{ scale: 0.98 }}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: '#edfaf4' }}>
          <FileText size={18} style={{ color: '#2da866' }} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-mono font-medium px-2 py-0.5 rounded-lg" style={{ background: '#edfaf4', color: '#1a3d2b' }}>
              {report.report_id}
            </span>
          </div>
          <p className="text-sm font-medium truncate" style={{ color: '#0f2419' }}>
            {report.chief_complaint || 'Medical intake'}
          </p>
          <div className="flex items-center gap-3 mt-1.5">
            <div className="flex items-center gap-1">
              <Calendar size={11} style={{ color: '#3B6D11' }} />
              <span className="text-xs" style={{ color: '#3B6D11' }}>{date}</span>
            </div>
            <div className="flex items-center gap-1">
              <Globe size={11} style={{ color: '#3B6D11' }} />
              <span className="text-xs" style={{ color: '#3B6D11' }}>{report.language_used}</span>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
