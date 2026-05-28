'use client'

export const dynamic = 'force-dynamic'

import { useState, useEffect, Suspense } from 'react'
import { motion } from 'framer-motion'
import { useRouter, useSearchParams } from 'next/navigation'
import { Download, Share2, Eye, Mail, ArrowLeft, AlertTriangle, CheckCircle } from 'lucide-react'
import Kai from '@/components/kai/Kai'
import { pageVariants } from '@/lib/motion'
import { createClient } from '@/lib/supabase/client'
import { Report, ReportData } from '@/types'
import { generateReportPDF } from '@/lib/pdf'

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-6">
      <div className="px-4 py-2 mb-3 rounded-lg" style={{ background: '#1a3d2b' }}>
        <h3 className="text-xs font-bold uppercase tracking-wider text-white">{title}</h3>
      </div>
      <div className="px-1">{children}</div>
    </div>
  )
}

function Row({ label, value }: { label: string; value?: string | null }) {
  if (!value) return null
  return (
    <div className="flex gap-3 py-2 border-b" style={{ borderColor: '#edfaf4' }}>
      <span className="text-xs font-medium w-32 flex-shrink-0" style={{ color: '#3B6D11' }}>{label}</span>
      <span className="text-sm" style={{ color: '#0f2419' }}>{value}</span>
    </div>
  )
}

function ReportContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [report, setReport] = useState<Report | null>(null)
  const [loading, setLoading] = useState(true)
  const [showFullScreen, setShowFullScreen] = useState(false)

  const reportId = searchParams.get('reportId')
  const langName = searchParams.get('langName') || 'English'

  const supabase = createClient()

  useEffect(() => {
    if (!reportId) return
    const load = async () => {
      const { data } = await supabase.from('reports').select('*').eq('report_id', reportId).single()
      if (data) setReport(data)
      setLoading(false)
    }
    load()
  }, [reportId]) // eslint-disable-line

  const handleDownload = () => {
    if (!report) return
    const reportData: ReportData = {
      chief_complaint: report.chief_complaint,
      symptoms: report.symptoms_json || [],
      associated_symptoms: report.associated_symptoms_json || { fever: false, nausea: false, fatigue: false, dizziness: false, appetite_loss: false },
      medications: report.medications_json || [],
      allergies: report.allergies_json || [],
      conditions: report.conditions_json || [],
      history: '',
      lifestyle: report.lifestyle_json || { smoker: false, alcohol: false, recent_travel: false },
      family_history: report.family_history_json || '',
      possible_conditions: report.possible_conditions_json || [],
      additional_notes: report.additional_notes || '',
    }

    const pdf = generateReportPDF(
      reportData,
      report.report_id,
      {
        name: report.patient_name,
        age: report.patient_age,
        sex: report.patient_sex,
        language: report.language_used,
        visitType: report.visit_type || 'Symptom Intake',
      }
    )
    pdf.save(`Keiro-Report-${report.report_id}.pdf`)
  }

  const handleShare = async () => {
    if (!report) return
    if (navigator.share) {
      await navigator.share({
        title: `Keiro Report ${report.report_id}`,
        text: `Chief Complaint: ${report.chief_complaint}`,
      })
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <motion.div
          className="w-10 h-10 rounded-full border-4 border-t-transparent"
          style={{ borderColor: '#c5edd8', borderTopColor: '#2da866' }}
          animate={{ rotate: 360 }}
          transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
        />
      </div>
    )
  }

  if (!report) {
    return (
      <div className="flex flex-col items-center justify-center h-screen px-6 text-center">
        <p style={{ color: '#3B6D11' }}>Report not found</p>
        <button onClick={() => router.push('/history')} className="mt-4 text-sm underline" style={{ color: '#2da866' }}>
          View history
        </button>
      </div>
    )
  }

  const rd = report

  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      className="flex flex-col min-h-screen max-w-[430px] mx-auto bg-off-white"
    >
      <div className="flex items-start gap-3 px-4 py-4 bg-white border-b border-keiro-border">
        <Kai size="sm" state="happy" interactive={false} />
        <p className="text-sm text-keiro-muted leading-relaxed pt-1">
          Your report is ready. Download it and show it to your doctor.
        </p>
      </div>

      {/* Header */}
      <div className="px-4 py-4 flex items-center gap-3" style={{ background: '#1a3d2b' }}>
        <button onClick={() => router.back()} className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.15)' }}>
          <ArrowLeft size={16} color="white" />
        </button>
        <div className="flex-1">
          <div className="text-xs text-white opacity-70 font-mono">{rd.report_id}</div>
          <div className="text-sm font-bold text-white">Medical Intake Report</div>
        </div>
        <div className="text-xs px-2 py-1 rounded-full font-medium" style={{ background: '#F4A535', color: '#1a3d2b' }}>
          {rd.language_used}
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-2 p-4">
        <motion.button
          onClick={handleDownload}
          className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-sm text-white"
          style={{ background: '#1a3d2b' }}
          whileTap={{ scale: 0.97 }}
        >
          <Download size={14} /> Download PDF
        </motion.button>
        <motion.button
          onClick={handleShare}
          className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-semibold text-sm"
          style={{ background: '#edfaf4', border: '1.5px solid #c5edd8', color: '#1a3d2b' }}
          whileTap={{ scale: 0.97 }}
        >
          <Share2 size={14} />
        </motion.button>
        <motion.button
          onClick={() => setShowFullScreen(true)}
          className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-semibold text-sm"
          style={{ background: '#edfaf4', border: '1.5px solid #c5edd8', color: '#1a3d2b' }}
          whileTap={{ scale: 0.97 }}
        >
          <Eye size={14} />
        </motion.button>
      </div>

      {/* Report body */}
      <div className="flex-1 px-4 pb-8 overflow-y-auto">
        <Section title="Patient Information">
          <Row label="Name" value={rd.patient_name || 'Not provided'} />
          <Row label="Age" value={rd.patient_age ? `${rd.patient_age} years` : 'Not provided'} />
          <Row label="Sex" value={rd.patient_sex || 'Not provided'} />
          <Row label="Language" value={rd.language_used} />
          <Row label="Visit Type" value={rd.visit_type} />
          <Row label="Date" value={new Date(rd.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })} />
        </Section>

        <Section title="Chief Complaint">
          <p className="text-sm leading-relaxed" style={{ color: '#0f2419' }}>{rd.chief_complaint}</p>
        </Section>

        {rd.symptoms_json?.length > 0 && (
          <Section title="Symptoms — Detailed">
            {rd.symptoms_json.map((s, i) => (
              <div key={i} className="mb-3 p-3 rounded-xl" style={{ background: 'white', border: '1px solid #edfaf4' }}>
                <Row label="Location" value={s.location} />
                <Row label="Severity" value={s.severity ? `${s.severity}/10` : undefined} />
                <Row label="Duration" value={s.duration} />
                <Row label="Character" value={s.character} />
                <Row label="Onset" value={s.onset} />
                <Row label="Modifiers" value={s.modifiers} />
              </div>
            ))}
          </Section>
        )}

        {rd.associated_symptoms_json && (
          <Section title="Associated Symptoms">
            {Object.entries(rd.associated_symptoms_json).map(([key, val]) => (
              <div key={key} className="flex items-center gap-2 py-1.5 border-b" style={{ borderColor: '#edfaf4' }}>
                <CheckCircle size={13} style={{ color: val ? '#2da866' : '#c5edd8' }} />
                <span className="text-sm capitalize" style={{ color: val ? '#0f2419' : '#3B6D11' }}>
                  {key.replace(/_/g, ' ')}
                </span>
                <span className="ml-auto text-xs font-medium" style={{ color: val ? '#2da866' : '#3B6D11' }}>
                  {val ? 'Yes' : 'No'}
                </span>
              </div>
            ))}
          </Section>
        )}

        {rd.lifestyle_json && (
          <Section title="Lifestyle Notes">
            {Object.entries(rd.lifestyle_json).map(([key, val]) => (
              <Row key={key} label={key.replace(/_/g, ' ')} value={val ? 'Yes' : 'No'} />
            ))}
          </Section>
        )}

        {rd.medications_json?.length > 0 && (
          <Section title="Current Medications">
            {rd.medications_json.map((m, i) => (
              <Row key={i} label={m.name} value={`${m.dosage} — ${m.frequency}`} />
            ))}
          </Section>
        )}

        <Section title="Known Conditions & History">
          <Row label="Conditions" value={rd.conditions_json?.join(', ') || 'None reported'} />
        </Section>

        <Section title="Family History">
          <p className="text-sm" style={{ color: '#0f2419' }}>{rd.family_history_json || 'None reported'}</p>
        </Section>

        <Section title="Allergies">
          <p className="text-sm" style={{ color: '#0f2419' }}>{rd.allergies_json?.join(', ') || 'No known allergies'}</p>
        </Section>

        {rd.possible_conditions_json?.length > 0 && (
          <Section title="Possible Conditions — AI Clinical Estimate">
            <div className="p-3 rounded-xl mb-3 flex items-start gap-2" style={{ background: '#FFF8E6', border: '1.5px solid #F4A535' }}>
              <AlertTriangle size={14} style={{ color: '#F4A535', marginTop: 2, flexShrink: 0 }} />
              <p className="text-xs" style={{ color: '#92620A' }}>For physician reference only — not a diagnosis</p>
            </div>
            {rd.possible_conditions_json.map((pc, i) => (
              <div key={i} className="mb-3 p-3 rounded-xl" style={{ background: 'white', border: '1px solid #edfaf4' }}>
                <div className="text-sm font-semibold mb-1" style={{ color: '#1a3d2b' }}>{pc.condition}</div>
                {pc.reasoning && (
                  <div className="text-xs leading-relaxed" style={{ color: '#3B6D11' }}>
                    {pc.reasoning.replace(/\d+%/g, '').trim()}
                  </div>
                )}
              </div>
            ))}
          </Section>
        )}

        {/* Disclaimer */}
        <div className="p-4 rounded-2xl" style={{ background: '#FFF8E6', border: '2px solid #F4A535' }}>
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle size={16} style={{ color: '#F4A535' }} />
            <span className="text-xs font-bold uppercase tracking-wider" style={{ color: '#92620A' }}>AI-Generated Intake Summary</span>
          </div>
          <p className="text-xs leading-relaxed" style={{ color: '#92620A' }}>
            This report was generated from a patient conversation to assist communication only. It does not constitute medical advice, clinical assessment, or diagnosis. All information must be verified directly with the patient by a licensed physician. Keiro is not a medical provider.
          </p>
        </div>

        {/* Doctor notes */}
        <div className="mt-6">
          <div className="px-4 py-2 mb-3 rounded-lg" style={{ background: '#edfaf4' }}>
            <h3 className="text-xs font-bold uppercase tracking-wider" style={{ color: '#1a3d2b' }}>Physician Notes</h3>
          </div>
          <div className="h-32 rounded-xl border-2 border-dashed" style={{ borderColor: '#c5edd8' }} />
        </div>
      </div>

      {/* Full screen modal */}
      {showFullScreen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 z-50 flex flex-col"
          style={{ background: 'white' }}
        >
          <div className="flex items-center justify-between px-4 py-3" style={{ background: '#1a3d2b' }}>
            <span className="text-white font-semibold text-sm">Show this to your doctor</span>
            <button onClick={() => setShowFullScreen(false)} className="text-white opacity-70 text-lg">✕</button>
          </div>
          <div className="flex-1 overflow-y-auto p-6">
            <h2 className="text-2xl font-bold mb-1" style={{ color: '#1a3d2b' }}>Chief Complaint</h2>
            <p className="text-lg mb-6">{rd.chief_complaint}</p>
            <div className="text-xs px-3 py-2 rounded-lg" style={{ background: '#edfaf4', color: '#3B6D11' }}>
              Report ID: {rd.report_id} · Generated by Keiro
            </div>
          </div>
        </motion.div>
      )}
    </motion.div>
  )
}

export default function ReportPage() {
  return (
    <Suspense>
      <ReportContent />
    </Suspense>
  )
}
