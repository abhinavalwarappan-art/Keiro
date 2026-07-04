'use client'

export const dynamic = 'force-dynamic'

import { useState, useEffect, useRef, Suspense, useCallback, useMemo } from 'react'
import { ErrorBoundary } from '@/components/ErrorBoundary'
import { motion } from 'framer-motion'
import { useRouter, useSearchParams } from 'next/navigation'
import { Download, ArrowLeft, AlertTriangle, CheckCircle, ExternalLink, Printer, Stethoscope, Link2, QrCode, Copy } from 'lucide-react'
import Kai from '@/components/kai/Kai'
import { LiveConsultMode } from '@/components/consult/LiveConsultMode'
import { pageVariants } from '@/lib/motion'
import { createClient } from '@/lib/supabase/client'
import { Report, ReportData, PatientProfile, ConsultMessage } from '@/types'
import { speakText } from '@/lib/speech'
import { PATIENT_PROFILE_SESSION_KEY } from '@/lib/chatSession'
import { formatPatientSex } from '@/lib/patientProfile'

const COMPLETION_MESSAGES: Record<string, string> = {
  ta: 'உங்கள் அறிக்கை தயாரானது. இதை உங்கள் மருத்துவரிடம் காட்டுங்கள்.',
  hi: 'आपकी रिपोर्ट तैयार है। कृपया इसे अपने डॉक्टर को दिखाएं।',
  es: 'Su informe está listo. Por favor muéstreselo a su médico.',
  ar: 'تقريرك جاهز. أرجو إظهاره لطبيبك.',
  zh: '您的报告已准备好。请将其出示给您的医生。',
  fr: 'Votre rapport est prêt. Veuillez le montrer à votre médecin.',
  vi: 'Báo cáo của bạn đã sẵn sàng. Vui lòng cho bác sĩ xem.',
  ko: '보고서가 준비되었습니다. 의사에게 보여주세요.',
  pt: 'Seu relatório está pronto. Por favor, mostre ao seu médico.',
  ru: 'Ваш отчёт готов. Пожалуйста, покажите его врачу.',
  ja: 'レポートができました。医師にお見せください。',
  de: 'Ihr Bericht ist fertig. Bitte zeigen Sie ihn Ihrem Arzt.',
  it: 'Il suo rapporto è pronto. Per favore lo mostri al suo medico.',
  tr: 'Raporunuz hazır. Lütfen doktorunuza gösterin.',
  pl: 'Twój raport jest gotowy. Proszę pokazać go lekarzowi.',
  uk: 'Ваш звіт готовий. Будь ласка, покажіть його лікарю.',
  bn: 'আপনার রিপোর্ট প্রস্তুত। অনুগ্রহ করে এটি আপনার ডাক্তারকে দেখান।',
  ml: 'നിങ്ങളുടെ റിപ്പോർട്ട് തയ്യാറാണ്. ദയവായി ഇത് നിങ്ങളുടെ ഡോക്ടര്‍ക്ക് കാണിക്കുക.',
  nl: 'Uw rapport is klaar. Toon het alstublieft aan uw arts.',
  el: 'Η αναφορά σας είναι έτοιμη. Παρακαλώ δείξτε την στον γιατρό σας.',
  cs: 'Vaše zpráva je připravena. Ukažte ji prosím svému lékaři.',
  ro: 'Raportul dvs. este gata. Vă rugăm să îl arătați medicului.',
  sv: 'Din rapport är klar. Visa den för din läkare.',
  da: 'Din rapport er klar. Vis den venligst til din læge.',
  fi: 'Raporttisi on valmis. Näytä se lääkärillesi.',
  no: 'Rapporten din er klar. Vis den til legen din.',
  hu: 'A jelentése elkészült. Kérjük, mutassa meg orvosának.',
  bg: 'Вашият доклад е готов. Моля, покажете го на лекаря си.',
  'zh-TW': '您的報告已準備好。請將其出示給您的醫生。',
  sk: 'Vaša správa je pripravená. Ukážte ju prosím svojmu lekárovi.',
  sl: 'Vaše poročilo je pripravljeno. Prosimo, pokažite ga zdravniku.',
  et: 'Teie aruanne on valmis. Palun näidake seda arstile.',
  lv: 'Jūsu pārskats ir gatavs. Lūdzu, parādiet to savam ārstam.',
  lt: 'Jūsų ataskaita paruošta. Prašome parodyti ją gydytojui.',
  id: 'Laporan Anda sudah siap. Silakan tunjukkan kepada dokter Anda.',
  sw: 'Ripoti yako iko tayari. Tafadhali ionyeshe kwa daktari wako.',
  en: 'Your report is ready. Please show this to your doctor.',
}

function getLang(map: Record<string, string>, langCode: string): string {
  return map[langCode] ?? map[langCode.split('-')[0]] ?? map.en
}

function reportToReportData(rd: Report): ReportData {
  return {
    chief_complaint: rd.chief_complaint,
    clinical_symptoms_summary: rd.clinical_symptoms_summary,
    symptoms: rd.symptoms_json ?? [],
    associated_symptoms: rd.associated_symptoms_json ?? { fever: false, nausea: false, fatigue: false, dizziness: false, appetite_loss: false },
    medications: rd.medications_json ?? [],
    allergies: rd.allergies_json ?? [],
    conditions: rd.conditions_json ?? [],
    history: rd.family_history_json ?? '',
    lifestyle: rd.lifestyle_json ?? { smoker: false, alcohol: false, recent_travel: false },
    family_history: rd.family_history_json ?? '',
    lmp: null,
    additional_notes: rd.additional_notes ?? '',
    possible_conditions: rd.possible_conditions_json ?? [],
  }
}

/* Sections read like a printed lab report: small uppercase label over a
   hairline rule — no colored banners competing with the content. */
function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-8">
      <h3 className="mb-1 text-xs font-medium uppercase tracking-wide text-text-tertiary">{title}</h3>
      <div className="mb-3 h-px bg-border-subtle" />
      <div className="px-1">{children}</div>
    </div>
  )
}

function Row({ label, value }: { label: string; value?: string | null }) {
  if (!value) return null
  return (
    <div className="flex gap-3 border-b border-border-subtle/60 py-2.5">
      <span className="w-36 shrink-0 text-sm font-medium text-text-secondary">{label}</span>
      <span className="text-sm text-text-primary">{value}</span>
    </div>
  )
}

function SkeletonRow() {
  return (
    <div className="flex gap-3 border-b border-border-subtle/60 py-2.5">
      <div className="skeleton h-4 w-28 rounded-sm" />
      <div className="skeleton h-4 flex-1 rounded-sm" />
    </div>
  )
}

function ReportContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [report, setReport] = useState<Report | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [pdfAction, setPdfAction] = useState<'open' | 'download' | 'print' | null>(null)
  const [physicianNotes, setPhysicianNotes] = useState('')
  const [consultMode, setConsultMode] = useState(false)
  const [showQr, setShowQr] = useState(false)
  const [linkCopied, setLinkCopied] = useState(false)
  const [patientProfile, setPatientProfile] = useState<PatientProfile | null>(null)
  const [savingNotes, setSavingNotes] = useState(false)
  const [noteSaveError, setNoteSaveError] = useState(false)

  const reportId = searchParams.get('reportId')
  const langName = searchParams.get('langName') || 'English'
  const langCode = searchParams.get('lang') || 'en-US'
  const startConsult = searchParams.get('consult') === '1'

  const supabase = useMemo(() => createClient(), [])
  const spokeCompletionRef = useRef(false)

  const loadReport = useCallback(async () => {
    if (!reportId) {
      setError('Report not found')
      setLoading(false)
      return
    }
    setLoading(true)
    setError(null)

    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      if (userError) {
        // Non-fatal: fall through to sessionStorage
      }

      // Only hit the DB when authenticated; always scope by user_id to prevent cross-user access.
      // Unauthenticated users fall through to the sessionStorage cache below.
      const { data } = user
        ? await supabase
            .from('reports')
            .select('*')
            .eq('report_id', reportId)
            .eq('user_id', user.id)
            .single()
        : { data: null }

      if (data) {
        setReport(data)
        setPhysicianNotes(data.physician_notes ?? '')
        setLoading(false)
        return
      }
    } catch {
      // Fall through to sessionStorage
    }

    try {
      const cached = sessionStorage.getItem(`report_${reportId}`)
      if (cached) {
        const parsed = JSON.parse(cached)
        // A full stored Report carries report_id (+ *_json fields); the chat page
        // caches the flat reportData shape (chief_complaint, symptoms, …) with no
        // report_id, which must go through the mapping branch below.
        if (parsed.report_id) {
          setReport(parsed as Report)
          setPhysicianNotes((parsed as Report).physician_notes ?? '')
        } else {
          setReport({
            id: reportId,
            session_id: '',
            user_id: '',
            report_id: reportId,
            language_used: langName,
            visit_type: 'symptom_intake',
            chief_complaint: parsed.chief_complaint || '',
            symptoms_json: parsed.symptoms || [],
            associated_symptoms_json: parsed.associated_symptoms || {
              fever: false,
              nausea: false,
              fatigue: false,
              dizziness: false,
              appetite_loss: false,
            },
            lifestyle_json: parsed.lifestyle || { smoker: false, alcohol: false, recent_travel: false },
            medications_json: parsed.medications || [],
            conditions_json: parsed.conditions || [],
            family_history_json: parsed.family_history || '',
            allergies_json: parsed.allergies || [],
            possible_conditions_json: parsed.possible_conditions || [],
            additional_notes: parsed.additional_notes || '',
            created_at: new Date().toISOString(),
          })
        }
      } else {
        setError('Report not found')
      }
    } catch {
      setError('Could not load report')
    }

    setLoading(false)
  }, [reportId, langName, supabase])

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- Report data is loaded client-side from Supabase/sessionStorage after URL params are available.
    loadReport()
  }, [loadReport])

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem(PATIENT_PROFILE_SESSION_KEY)
      if (raw) {
        // eslint-disable-next-line react-hooks/set-state-in-effect -- Hydrate patient profile from sessionStorage on mount (client-only; avoids SSR/hydration mismatch).
        setPatientProfile(JSON.parse(raw) as PatientProfile)
        return
      }
    } catch {
      /* ignore */
    }
  }, [])

  useEffect(() => {
    if (patientProfile || !report) return
    if (report.patient_name && report.patient_dob && report.patient_sex) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- Derive profile from the asynchronously-loaded report once it arrives.
      setPatientProfile({
        fullName: report.patient_name,
        dateOfBirth: report.patient_dob,
        age: report.patient_age,
        biologicalSex: report.patient_sex as PatientProfile['biologicalSex'],
        primaryLanguage: report.language_used,
        primaryLanguageCode: langCode,
        consentAt: report.created_at,
      })
    }
  }, [report, patientProfile, langCode])

  useEffect(() => {
    if (startConsult && patientProfile && report && !loading) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- Enter consult mode once the report + profile finish loading.
      setConsultMode(true)
    }
  }, [startConsult, patientProfile, report, loading])

  const reportShareUrl = useMemo(() => {
    if (typeof window === 'undefined' || !reportId) return ''
    const params = new URLSearchParams({ reportId })
    if (langCode) params.set('lang', langCode)
    if (langName) params.set('langName', langName)
    return `${window.location.origin}/report?${params.toString()}`
  }, [reportId, langCode, langName])

  const persistReportUpdates = useCallback(async (updates: Partial<Report>) => {
    if (!report?.report_id) return
    const merged = { ...report, ...updates }
    setReport(merged)
    try {
      sessionStorage.setItem(`report_${report.report_id}`, JSON.stringify(merged))
    } catch {
      // sessionStorage may be unavailable (quota / private mode); the PATCH below persists to the DB
    }

    try {
      const res = await fetch('/api/report', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reportId: report.report_id,
          physicianNotes: updates.physician_notes,
          consultTranscript: updates.consult_transcript_json,
        }),
      })
      if (!res.ok) setNoteSaveError(true)
      else setNoteSaveError(false)
    } catch {
      setNoteSaveError(true)
    }
  }, [report])

  const savePhysicianNotes = useCallback(async () => {
    if (!report) return
    setSavingNotes(true)
    await persistReportUpdates({ physician_notes: physicianNotes })
    setSavingNotes(false)
  }, [report, physicianNotes, persistReportUpdates])

  const handlePdf = useCallback(
    async (action: 'open' | 'download' | 'print') => {
      if (!report) return
      setPdfAction(action)
      try {
        // Lazy-load jsPDF (~350kb) — it only needs to exist the moment a user
        // exports, so it stays out of the report page's initial bundle.
        const { generateReportPDF } = await import('@/lib/pdf')
        const pdf = generateReportPDF(
          reportToReportData(report),
          report.report_id,
          {
            name: report.patient_name,
            age: report.patient_age,
            dob: report.patient_dob,
            sex: report.patient_sex,
            language: report.language_used,
            visitType: report.visit_type || 'Symptom Intake',
          },
          undefined,
          physicianNotes || undefined,
        )
        if (action === 'download') {
          pdf.save(`Keiro-Report-${report.report_id}.pdf`)
        } else if (action === 'print') {
          pdf.autoPrint()
          pdf.output('dataurlnewwindow')
        } else {
          pdf.output('dataurlnewwindow')
        }
      } finally {
        setPdfAction(null)
      }
    },
    [report, physicianNotes],
  )

  const copyShareLink = useCallback(async () => {
    if (!reportShareUrl) return
    try {
      await navigator.clipboard.writeText(reportShareUrl)
      setLinkCopied(true)
      setTimeout(() => setLinkCopied(false), 2000)
    } catch {
      /* clipboard unavailable */
    }
  }, [reportShareUrl])

  const handleConsultEnd = useCallback(
    (transcript: ConsultMessage[], notes: string) => {
      setConsultMode(false)
      setPhysicianNotes(notes)
      void persistReportUpdates({ consult_transcript_json: transcript, physician_notes: notes })
    },
    [persistReportUpdates],
  )

  const roman = searchParams.get('roman') === '1'

  useEffect(() => {
    if (loading || !report || spokeCompletionRef.current) return
    spokeCompletionRef.current = true
    speakText(getLang(COMPLETION_MESSAGES, langCode), langCode)
  }, [loading, report, langCode])

  if (loading) {
    return (
      <div className="mx-auto w-full max-w-2xl flex-1 px-4 py-6">
        <div className="mb-8">
          <div className="skeleton mb-1 h-3 w-32 rounded-sm" />
          <div className="mb-3 h-px bg-border-subtle" />
          <SkeletonRow />
          <SkeletonRow />
          <SkeletonRow />
        </div>
        <div className="mb-8">
          <div className="skeleton mb-1 h-3 w-40 rounded-sm" />
          <div className="mb-3 h-px bg-border-subtle" />
          <SkeletonRow />
          <SkeletonRow />
        </div>
      </div>
    )
  }

  if (error || !report) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center px-6 text-center">
        <Kai size="md" state="idle" interactive={false} />
        <p className="mt-4 text-base font-semibold text-text-primary">{error || 'Report not found'}</p>
        <button
          onClick={() => router.push('/history')}
          className="mt-6 min-h-[44px] rounded-md bg-brand-ink px-6 py-2.5 text-sm font-medium text-white transition-colors duration-150 hover:bg-brand-ink-hover"
        >
          View past visits
        </button>
      </div>
    )
  }

  if (consultMode && patientProfile) {
    return (
      <LiveConsultMode
        report={report}
        patientProfile={patientProfile}
        langCode={langCode}
        langName={langName}
        roman={roman}
        onEnd={handleConsultEnd}
        onBack={() => setConsultMode(false)}
      />
    )
  }

  const rd = report
  const busy = pdfAction !== null

  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
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
        <div className="flex-1">
          <div className="font-mono text-xs text-text-tertiary">{rd.report_id}</div>
          <h1 className="text-base font-semibold text-text-primary">Medical intake report</h1>
        </div>
        <span className="rounded-full bg-brand-subtle px-2.5 py-1 text-xs font-medium text-brand-ink">
          {rd.language_used}
        </span>
      </header>

      <div className="mx-auto w-full max-w-2xl flex-1 px-4 py-6">
        <div className="mb-6 flex items-start gap-3">
          <Kai size="sm" state="happy" interactive={false} />
          <p className="pt-1 text-sm leading-relaxed text-text-secondary">
            {getLang(COMPLETION_MESSAGES, langCode)}
          </p>
        </div>

        {/* Actions */}
        <div className="mb-8 flex flex-wrap gap-2">
          <motion.button
            onClick={() => handlePdf('download')}
            disabled={busy}
            className="flex flex-1 items-center justify-center gap-2 rounded-md bg-brand-ink px-4 py-2.5 text-sm font-medium text-white transition-colors duration-150 hover:bg-brand-ink-hover disabled:opacity-50"
            whileTap={{ scale: 0.98 }}
          >
            <Download size={14} aria-hidden /> Download PDF
          </motion.button>
          <motion.button
            onClick={() => handlePdf('open')}
            disabled={busy}
            className="flex items-center justify-center gap-2 rounded-md border border-border-subtle bg-surface px-4 py-2.5 text-sm font-medium text-text-primary transition-colors duration-150 hover:bg-sunken disabled:opacity-50"
            whileTap={{ scale: 0.98 }}
            aria-label="Open PDF"
          >
            <ExternalLink size={14} aria-hidden />
          </motion.button>
          <motion.button
            onClick={() => handlePdf('print')}
            disabled={busy}
            className="flex items-center justify-center gap-2 rounded-md border border-border-subtle bg-surface px-4 py-2.5 text-sm font-medium text-text-primary transition-colors duration-150 hover:bg-sunken disabled:opacity-50"
            whileTap={{ scale: 0.98 }}
            aria-label="Print report"
          >
            <Printer size={14} aria-hidden />
          </motion.button>
          <motion.button
            onClick={() => setShowQr(true)}
            className="flex items-center justify-center gap-2 rounded-md border border-border-subtle bg-surface px-4 py-2.5 text-sm font-medium text-text-primary transition-colors duration-150 hover:bg-sunken"
            whileTap={{ scale: 0.98 }}
            aria-label="Share report link"
          >
            <Link2 size={14} aria-hidden />
          </motion.button>
        </div>

        {/* Live consult */}
        {patientProfile && (
          <motion.button
            onClick={() => setConsultMode(true)}
            className="mb-8 flex w-full items-center justify-center gap-2 rounded-md border border-brand-border bg-brand-subtle px-4 py-2.5 text-sm font-medium text-brand-ink transition-colors duration-150 hover:bg-brand-muted"
            whileTap={{ scale: 0.98 }}
          >
            <Stethoscope size={14} aria-hidden /> Start live consult mode
          </motion.button>
        )}

        <Section title="Patient Information">
          <Row label="Name" value={rd.patient_name || 'Not provided'} />
          <Row label="Age" value={rd.patient_age ? `${rd.patient_age} years` : 'Not provided'} />
          <Row
            label="Sex"
            value={rd.patient_sex ? formatPatientSex(rd.patient_sex as PatientProfile['biologicalSex']) : 'Not provided'}
          />
          <Row label="Language" value={rd.language_used} />
          <Row label="Visit Type" value={rd.visit_type} />
          <Row
            label="Date"
            value={new Date(rd.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
          />
        </Section>

        <Section title="Chief Complaint">
          <p className="text-sm leading-relaxed text-text-primary">{rd.chief_complaint}</p>
        </Section>

        {rd.clinical_symptoms_summary && (
          <Section title="Clinical Summary">
            <p className="text-sm leading-relaxed text-text-primary">{rd.clinical_symptoms_summary}</p>
          </Section>
        )}

        {rd.symptoms_json?.length > 0 && (
          <Section title="Symptoms — Detailed">
            {rd.symptoms_json.map((s, i) => (
              <div key={i} className="mb-3 rounded-md border border-border-subtle bg-surface p-3 last:mb-0">
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
              <div key={key} className="flex items-center gap-2 border-b border-border-subtle/60 py-2">
                <CheckCircle size={13} className={val ? 'text-success' : 'text-text-placeholder'} aria-hidden />
                <span className={`text-sm capitalize ${val ? 'text-text-primary' : 'text-text-secondary'}`}>
                  {key.replace(/_/g, ' ')}
                </span>
                <span className={`ml-auto text-xs font-medium ${val ? 'text-success' : 'text-text-tertiary'}`}>
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

        <Section title="Known Conditions">
          <Row label="Conditions" value={rd.conditions_json?.join(', ') || 'None reported'} />
        </Section>

        <Section title="Family History">
          <p className="text-sm text-text-primary">{rd.family_history_json || 'None reported'}</p>
        </Section>

        <Section title="Allergies">
          <p className="text-sm text-text-primary">{rd.allergies_json?.join(', ') || 'No known allergies'}</p>
        </Section>

        {rd.possible_conditions_json?.length > 0 && (
          <Section title="Possible Conditions — AI Clinical Estimate">
            <div className="mb-3 flex items-start gap-2 rounded-md border border-warning/40 bg-warning-subtle p-3">
              <AlertTriangle size={14} className="mt-0.5 shrink-0 text-warning" aria-hidden />
              <p className="text-xs text-warning-text">For physician reference only — not a diagnosis</p>
            </div>
            {rd.possible_conditions_json.map((pc, i) => (
              <div key={i} className="mb-3 rounded-md border border-border-subtle bg-surface p-3 last:mb-0">
                <div className="mb-1 text-sm font-semibold text-text-primary">{pc.condition}</div>
                {pc.reasoning && (
                  <div className="text-xs leading-relaxed text-text-secondary">
                    {pc.reasoning.replace(/\d+%/g, '').trim()}
                  </div>
                )}
              </div>
            ))}
          </Section>
        )}

        {/* Disclaimer */}
        <div className="mb-8 rounded-md border border-warning/40 bg-warning-subtle p-4">
          <div className="mb-2 flex items-center gap-2">
            <AlertTriangle size={16} className="text-warning" aria-hidden />
            <span className="text-xs font-semibold uppercase tracking-wide text-warning-text">
              AI-generated intake summary
            </span>
          </div>
          <p className="text-xs leading-relaxed text-warning-text">
            This report was generated from a patient conversation to assist communication only. It does not constitute
            medical advice, clinical assessment, or diagnosis. All information must be verified directly with the patient
            by a licensed physician. Keiro is not a medical provider.
          </p>
        </div>

        {/* Physician notes */}
        <div>
          <h3 className="mb-1 text-xs font-medium uppercase tracking-wide text-text-tertiary">Physician Notes</h3>
          <div className="mb-3 h-px bg-border-subtle" />
          <textarea
            value={physicianNotes}
            onChange={(e) => setPhysicianNotes(e.target.value)}
            onBlur={() => void savePhysicianNotes()}
            placeholder="Add notes for the record…"
            rows={5}
            className="w-full resize-y rounded-md border border-border-subtle bg-surface p-3 text-sm text-text-primary outline-none transition-colors duration-150 placeholder:text-text-placeholder focus:border-brand-ink"
          />
          <div className="mt-2 flex items-center justify-between">
            <span className="text-xs text-text-tertiary">
              {savingNotes ? 'Saving…' : noteSaveError ? 'Saved locally — sync failed' : 'Saved automatically'}
            </span>
            <button
              onClick={() => void savePhysicianNotes()}
              disabled={savingNotes}
              className="rounded-md border border-border-subtle bg-surface px-3 py-1.5 text-xs font-medium text-text-primary transition-colors duration-150 hover:bg-sunken disabled:opacity-50"
            >
              Save notes
            </button>
          </div>
        </div>
      </div>

      {/* Share link modal */}
      {showQr && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-4 sm:items-center"
          onClick={() => setShowQr(false)}
        >
          <motion.div
            initial={{ y: 24, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="w-full max-w-sm rounded-lg border border-border-subtle bg-surface p-5"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-3 flex items-center gap-2">
              <QrCode size={16} className="text-brand-ink" aria-hidden />
              <span className="text-sm font-semibold text-text-primary">Share this report</span>
            </div>
            <p className="mb-3 text-xs text-text-secondary">
              Anyone with this link and access can open the report.
            </p>
            <div className="flex items-center gap-2 rounded-md border border-border-subtle bg-sunken px-3 py-2">
              <span className="flex-1 truncate font-mono text-xs text-text-secondary">{reportShareUrl}</span>
              <button
                onClick={() => void copyShareLink()}
                className="flex shrink-0 items-center gap-1 rounded-md bg-brand-ink px-2.5 py-1.5 text-xs font-medium text-white transition-colors duration-150 hover:bg-brand-ink-hover"
                aria-label="Copy link"
              >
                <Copy size={12} aria-hidden /> {linkCopied ? 'Copied' : 'Copy'}
              </button>
            </div>
            <button
              onClick={() => setShowQr(false)}
              className="mt-4 w-full rounded-md border border-border-subtle bg-surface px-4 py-2 text-sm font-medium text-text-primary transition-colors duration-150 hover:bg-sunken"
            >
              Close
            </button>
          </motion.div>
        </motion.div>
      )}
    </motion.div>
  )
}

export default function ReportPage() {
  return (
    <ErrorBoundary>
      <Suspense>
        <ReportContent />
      </Suspense>
    </ErrorBoundary>
  )
}