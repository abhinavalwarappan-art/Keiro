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
    <motion.button
      type="button"
      onClick={onClick}
      className="w-full cursor-pointer rounded-lg border border-border-subtle bg-surface p-4 text-left transition-[border-color,box-shadow] duration-150 hover:border-border-default hover:shadow-xs active:scale-[0.995]"
      whileTap={{ scale: 0.995 }}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="flex items-start gap-3">
        <div className="flex size-10 shrink-0 items-center justify-center rounded-md bg-brand-subtle">
          <FileText size={17} className="text-brand-ink" aria-hidden />
        </div>
        <div className="min-w-0 flex-1">
          <div className="mb-1 flex items-center gap-2">
            <span className="rounded-sm bg-sunken px-2 py-0.5 font-mono text-xs font-medium text-text-secondary">
              {report.report_id}
            </span>
          </div>
          <p className="truncate text-sm font-medium text-text-primary">
            {report.chief_complaint || 'Medical intake'}
          </p>
          <p className="mt-1 text-xs font-medium text-brand-ink">
            Open full doctor PDF
          </p>
          <div className="mt-1.5 flex items-center gap-3">
            <div className="flex items-center gap-1">
              <Calendar size={11} className="text-text-tertiary" aria-hidden />
              <span className="text-xs text-text-tertiary">{date}</span>
            </div>
            {report.language_used && (
              <div className="flex items-center gap-1">
                <Globe size={11} className="text-text-tertiary" aria-hidden />
                <span className="text-xs text-text-tertiary">{report.language_used}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.button>
  )
}