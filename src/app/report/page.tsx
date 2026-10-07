'use client'

export const dynamic = 'force-dynamic'

import { useState, useEffect, Suspense, useCallback, useMemo } from 'react'
import ReportLoading from './loading'
import { ErrorBoundary } from '@/components/ErrorBoundary'
import { motion } from 'framer-motion'
import { useRouter, useSearchParams } from 'next/navigation'
import { Download, ArrowLeft, AlertTriangle, CheckCircle, ExternalLink, Printer, Stethoscope, Link2, Copy, Volume2, VolumeX, Loader2 } from 'lucide-react'
import Kai from '@/components/kai/Kai'
import { LiveConsultMode } from '@/components/consult/LiveConsultMode'
import { pageVariants } from '@/lib/motion'
import { createClient } from '@/lib/supabase/client'
import { Report, ReportData, PatientProfile, ConsultMessage } from '@/types'
import { stopSpeech, toggleSpeech } from '@/lib/speech'
import { useSpeech } from '@/hooks/useSpeech'
import { PATIENT_PROFILE_SESSION_KEY } from '@/lib/chatSession'
import { formatPatientSex } from '@/lib/patientProfile'
import { useTranslations } from '@/i18n/useTranslations'
import { logger } from '@/lib/logger'

/**
 * Shown the moment the report loads. It is NOT spoken automatically: a patient
 * reading this is often sitting in a waiting room, and their symptoms being read
 * out to the room is the last thing they want. Audio is opt-in via the Listen
 * button, matching how speech already works on every message in chat.
 *
 * Each string opens with thanks before the practical instruction.
 *
 * Translation note: these open with gratitude, never praise. "You did well" is a
 * register violation toward an elder in several of these languages (notably ja, ko,
 * hi, ta) and would read as condescending from a young-sounding assistant; thanks
 * carries warmth safely in all of them. The instruction sentence in each string is
 * the original verified translation and was left untouched.
 */
const COMPLETION_MESSAGES: Record<string, string> = {
  ta: 'எல்லாவற்றையும் பகிர்ந்து கொண்டதற்கு நன்றி. உங்கள் அறிக்கை தயாரானது. இதை உங்கள் மருத்துவரிடம் காட்டுங்கள்.',
  hi: 'सब कुछ बताने के लिए धन्यवाद। आपकी रिपोर्ट तैयार है। कृपया इसे अपने डॉक्टर को दिखाएं।',
  es: 'Gracias por contarme todo esto. Su informe está listo. Por favor muéstreselo a su médico.',
  ar: 'شكرًا لك على مشاركة كل هذا. تقريرك جاهز. أرجو إظهاره لطبيبك.',
  zh: '谢谢您告诉我这些。您的报告已准备好。请将其出示给您的医生。',
  fr: 'Merci de m’avoir tout expliqué. Votre rapport est prêt. Veuillez le montrer à votre médecin.',
  vi: 'Cảm ơn đã chia sẻ những điều này. Báo cáo của bạn đã sẵn sàng. Vui lòng cho bác sĩ xem.',
  ko: '말씀해 주셔서 감사합니다. 보고서가 준비되었습니다. 의사에게 보여주세요.',
  pt: 'Obrigado por me contar tudo isso. Seu relatório está pronto. Por favor, mostre ao seu médico.',
  ru: 'Спасибо, что рассказали мне всё это. Ваш отчёт готов. Пожалуйста, покажите его врачу.',
  ja: 'お話しくださり、ありがとうございました。レポートができました。医師にお見せください。',
  de: 'Danke, dass Sie mir das alles erzählt haben. Ihr Bericht ist fertig. Bitte zeigen Sie ihn Ihrem Arzt.',
  it: 'Grazie per avermi raccontato tutto questo. Il suo rapporto è pronto. Per favore lo mostri al suo medico.',
  tr: 'Bunları benimle paylaştığınız için teşekkür ederim. Raporunuz hazır. Lütfen doktorunuza gösterin.',
  pl: 'Dziękuję za podzielenie się tym wszystkim. Twój raport jest gotowy. Proszę pokazać go lekarzowi.',
  uk: 'Дякую, що поділилися всім цим. Ваш звіт готовий. Будь ласка, покажіть його лікарю.',
  bn: 'সব কিছু জানানোর জন্য ধন্যবাদ। আপনার রিপোর্ট প্রস্তুত। অনুগ্রহ করে এটি আপনার ডাক্তারকে দেখান।',
  ml: 'എല്ലാം പങ്കുവെച്ചതിന് നന്ദി. നിങ്ങളുടെ റിപ്പോർട്ട് തയ്യാറാണ്. ദയവായി ഇത് നിങ്ങളുടെ ഡോക്ടര്‍ക്ക് കാണിക്കുക.',
  nl: 'Dank u dat u me dit allemaal hebt verteld. Uw rapport is klaar. Toon het alstublieft aan uw arts.',
  el: 'Σας ευχαριστώ που μου τα είπατε όλα αυτά. Η αναφορά σας είναι έτοιμη. Παρακαλώ δείξτε την στον γιατρό σας.',
  cs: 'Děkuji vám za vaši otevřenost. Vaše zpráva je připravena. Ukažte ji prosím svému lékaři.',
  ro: 'Vă mulțumesc că mi-ați spus toate acestea. Raportul dvs. este gata. Vă rugăm să îl arătați medicului.',
  sv: 'Tack för att du berättade allt det här. Din rapport är klar. Visa den för din läkare.',
  da: 'Tak fordi du fortalte mig alt det. Din rapport er klar. Vis den venligst til din læge.',
  fi: 'Kiitos, että kerroit kaiken tämän. Raporttisi on valmis. Näytä se lääkärillesi.',
  no: 'Takk for at du fortalte meg alt dette. Rapporten din er klar. Vis den til legen din.',
  hu: 'Köszönöm, hogy mindezt elmondta. A jelentése elkészült. Kérjük, mutassa meg orvosának.',
  bg: 'Благодаря, че споделихте всичко това. Вашият доклад е готов. Моля, покажете го на лекаря си.',
  'zh-TW': '謝謝您告訴我這些。您的報告已準備好。請將其出示給您的醫生。',
  sk: 'Ďakujem, že ste sa o to všetko podelili. Vaša správa je pripravená. Ukážte ju prosím svojmu lekárovi.',
  sl: 'Hvala, ker ste mi vse to povedali. Vaše poročilo je pripravljeno. Prosimo, pokažite ga zdravniku.',
  et: 'Aitäh, et te seda kõike jagasite. Teie aruanne on valmis. Palun näidake seda arstile.',
  lv: 'Paldies, ka pastāstījāt man to visu. Jūsu pārskats ir gatavs. Lūdzu, parādiet to savam ārstam.',
  lt: 'Ačiū, kad viską man papasakojote. Jūsų ataskaita paruošta. Prašome parodyti ją gydytojui.',
  id: 'Terima kasih sudah menceritakan semuanya. Laporan Anda sudah siap. Silakan tunjukkan kepada dokter Anda.',
  sw: 'Asante kwa kunieleza yote haya. Ripoti yako iko tayari. Tafadhali ionyeshe kwa daktari wako.',
  en: 'Thank you for sharing all of that. Your report is ready. Please show this to your doctor.',
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
/** Stored enum → what a clinician reads. Unknown values are shown as-is, prettified. */
function formatVisitType(value: string | null | undefined): string {
  if (!value) return 'Not recorded'
  if (value === 'symptom_intake') return 'New symptoms'
  if (value === 'known_diagnosis') return 'Known condition'
  return value.replace(/_/g, ' ').replace(/^\w/, (c) => c.toUpperCase())
}

const LIFESTYLE_LABELS: Record<string, string> = {
  smoker: 'Smoking',
  alcohol: 'Alcohol',
  recent_travel: 'Recent travel',
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-8">
      <h3 className="mb-1 text-sm font-semibold text-text-secondary">{title}</h3>
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
  // Stored as a kind, not a translated string: `t` is a fresh closure on every
  // render, so calling it inside loadReport would force it into the dep array and
  // re-fire the load effect on every render. Translate at render time instead.
  const [error, setError] = useState<'notFound' | 'loadFailed' | null>(null)
  const [pdfAction, setPdfAction] = useState<'open' | 'download' | 'print' | null>(null)
  const [pdfError, setPdfError] = useState<'open' | 'download' | 'print' | null>(null)
  const [copyError, setCopyError] = useState(false)
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

  const t = useTranslations(langCode)
  const supabase = useMemo(() => createClient(), [])

  const loadReport = useCallback(async () => {
    if (!reportId) {
      setError('notFound')
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
        setError('notFound')
      }
    } catch {
      setError('loadFailed')
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
      if (!report || pdfAction) return
      setPdfAction(action)
      setPdfError(null)
      let blobUrl: string | null = null
      // Open the tab NOW, inside the tap. A window.open after the PDF request
      // returns is outside the gesture, and Safari and Chrome block it silently —
      // Open and Print used to be dead buttons for exactly this reason.
      const tab = action === 'download' ? null : window.open('', '_blank')
      try {
        // The PDF is rendered server-side by headless Chromium (see /api/report/pdf) so
        // non-Latin patient names and free-text shape correctly for every script — jsPDF
        // could not. Returns application/pdf bytes we turn into a blob.
        const res = await fetch('/api/report/pdf', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            reportId: report.report_id,
            reportData: reportToReportData(report),
            patientInfo: {
              name: report.patient_name,
              age: report.patient_age,
              dob: report.patient_dob,
              sex: report.patient_sex,
              language: report.language_used,
              visitType: formatVisitType(report.visit_type),
            },
            physicianNotes: physicianNotes || undefined,
          }),
        })
        if (!res.ok) throw new Error(`PDF request failed: ${res.status}`)

        const blob = await res.blob()
        blobUrl = URL.createObjectURL(blob)

        if (action === 'download') {
          const a = document.createElement('a')
          a.href = blobUrl
          a.download = `Keiro-Report-${report.report_id}.pdf`
          document.body.appendChild(a)
          a.click()
          a.remove()
        } else if (tab) {
          tab.location.href = blobUrl
          if (action === 'print') tab.addEventListener('load', () => tab.print())
        } else {
          // The browser refused a new tab even inside the gesture (strict popup
          // settings). Hand the file over as a download rather than doing nothing.
          const a = document.createElement('a')
          a.href = blobUrl
          a.download = `Keiro-Report-${report.report_id}.pdf`
          document.body.appendChild(a)
          a.click()
          a.remove()
        }
      } catch (err) {
        tab?.close()
        setPdfError(action)
        logger.error('report_pdf_failed', 'report_page', null, {
          error: err instanceof Error ? err.message : String(err),
        })
      } finally {
        // Revoke on the next tick so the new tab / download has grabbed the URL first.
        if (blobUrl) setTimeout(() => URL.revokeObjectURL(blobUrl as string), 60_000)
        setPdfAction(null)
      }
    },
    [report, physicianNotes, pdfAction],
  )

  const copyShareLink = useCallback(async () => {
    if (!reportShareUrl) return
    try {
      await navigator.clipboard.writeText(reportShareUrl)
      setCopyError(false)
      setLinkCopied(true)
      setTimeout(() => setLinkCopied(false), 2000)
    } catch {
      // Clipboard blocked (permissions, insecure context). Say so — the link is
      // still on screen to copy by hand.
      setCopyError(true)
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

  /* Kai used to speak the completion message out loud the instant the report
     finished loading, with no way to stop it. A patient reading this in a waiting
     room does not want their symptoms announced to the room, and this was the only
     auto-playing audio in the app — everywhere else in chat, speech is opt-in per
     message. So it is opt-in here too: the button below starts it, and stops it. */
  const speech = useSpeech()
  const rawListenPhase = speech.key === 'report-completion' ? speech.phase : 'idle'
  // "ready" (audio arrived, about to start) still reads as preparing to a patient.
  const listenPhase = rawListenPhase === 'ready' ? 'loading' : rawListenPhase
  const speaking = listenPhase === 'playing'

  const toggleCompletionSpeech = useCallback(() => {
    toggleSpeech('report-completion', getLang(COMPLETION_MESSAGES, langCode), langCode)
  }, [langCode])

  // Never leave audio playing behind us when the patient navigates away — or
  // when the language changes, since the next Listen must use the new voice.
  useEffect(() => () => stopSpeech(), [langCode])

  if (loading) {
    return (
      <main id="main-content" className="mx-auto w-full max-w-2xl flex-1 px-4 py-6">
        {/* Matches the loaded state's visible h1 so the page always has one */}
        <h1 className="sr-only">Medical intake report</h1>
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
      </main>
    )
  }

  if (error || !report) {
    return (
      <main id="main-content" className="flex min-h-svh flex-col items-center justify-center px-6 text-center">
        <Kai size="md" state="idle" interactive={false} />
        <h1 className="mt-4 text-base font-semibold text-text-primary">
          {error === 'loadFailed' ? t('report.loadFailed') : t('report.notFound')}
        </h1>
        <button
          onClick={() => router.push('/history')}
          className="mt-6 min-h-[44px] rounded-md bg-brand-ink px-6 py-2.5 text-sm font-medium text-white transition-colors duration-150 hover:bg-brand-ink-hover"
        >
          {t('report.viewPastVisits')}
        </button>
      </main>
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
      className="flex min-h-svh flex-col bg-transparent"
    >
      <header className="sticky top-0 z-10 flex min-h-16 items-center gap-3 border-b border-border-subtle/70 bg-white/80 px-4 backdrop-blur-xl backdrop-saturate-150">
        <button
          onClick={() => router.back()}
          className="flex size-11 items-center justify-center rounded-full text-text-secondary transition-colors duration-150 hover:bg-sunken hover:text-text-primary"
          aria-label={t('common.goBack')}
        >
          <ArrowLeft size={18} className="rtl:-scale-x-100" aria-hidden />
        </button>
        <div className="min-w-0 flex-1">
          <h1 className="text-lg font-semibold leading-tight tracking-[-0.02em] text-text-primary">Medical intake report</h1>
          <div className="font-mono text-xs text-text-tertiary">{rd.report_id}</div>
        </div>
        <span className="shrink-0 rounded-full bg-brand-subtle px-3 py-1 text-sm font-medium text-brand-ink">
          {rd.language_used}
        </span>
      </header>

      {/* main#main-content on every page: skip-link target + landmark navigation */}
      <main id="main-content" className="mx-auto w-full max-w-2xl flex-1 px-4 py-6">
        <div className="mb-6 flex items-start gap-3">
          <Kai size="sm" state={speaking ? 'talking' : 'happy'} interactive={false} />
          <div className="pt-1">
            <p className="text-pretty text-lg leading-relaxed text-text-primary">
              {getLang(COMPLETION_MESSAGES, langCode)}
            </p>
            {/* Opt-in, not automatic. Quiet by default because the person reading
                this is often sitting in a waiting room. */}
            <button
              type="button"
              onClick={toggleCompletionSpeech}
              aria-busy={listenPhase === 'loading' || undefined}
              aria-label={
                listenPhase === 'loading'
                  ? t('chat.preparingAudio')
                  : listenPhase === 'playing'
                    ? t('chat.pauseReading')
                    : listenPhase === 'paused'
                      ? t('chat.resumeReading')
                      : t('chat.listenAloud')
              }
              className="mt-2 inline-flex min-h-11 items-center gap-2 rounded-full bg-brand-subtle px-4 text-base font-semibold text-brand-ink transition-colors duration-150 hover:bg-brand-muted"
            >
              {listenPhase === 'loading' ? (
                <>
                  <Loader2 size={16} className="animate-spin motion-reduce:animate-none" aria-hidden /> {t('chat.preparingAudio')}
                </>
              ) : listenPhase === 'playing' ? (
                <>
                  <VolumeX size={16} aria-hidden /> {t('chat.pause')}
                </>
              ) : listenPhase === 'paused' ? (
                <>
                  <Volume2 size={16} aria-hidden /> {t('chat.resume')}
                </>
              ) : listenPhase === 'error' ? (
                <>
                  <Volume2 size={16} aria-hidden /> {t('chat.retryAudio')}
                </>
              ) : (
                <>
                  <Volume2 size={16} aria-hidden /> {t('chat.listen')}
                </>
              )}
            </button>
          </div>
        </div>

        {/* Actions — every one labeled in words, and each says when it is working. */}
        <div className="mb-3 flex flex-col gap-2">
          <motion.button
            onClick={() => handlePdf('download')}
            aria-disabled={busy || undefined}
            aria-busy={pdfAction === 'download' || undefined}
            className="flex min-h-14 w-full items-center justify-center gap-2.5 rounded-full bg-brand-ink px-6 text-lg font-semibold text-white transition-colors duration-150 hover:bg-brand-ink-hover aria-disabled:opacity-60"
            whileTap={busy ? undefined : { scale: 0.97 }}
          >
            {pdfAction === 'download' ? (
              <Loader2 size={18} className="animate-spin motion-reduce:animate-none" aria-hidden />
            ) : (
              <Download size={18} aria-hidden />
            )}
            {pdfAction === 'download' ? t('report.preparingPdf') : t('report.downloadPdf')}
          </motion.button>
          <div className="grid grid-cols-3 gap-2">
            {([
              { action: 'open' as const, icon: ExternalLink, label: t('report.open') },
              { action: 'print' as const, icon: Printer, label: t('report.print') },
            ]).map(({ action, icon: Icon, label }) => (
              <motion.button
                key={action}
                onClick={() => handlePdf(action)}
                aria-disabled={busy || undefined}
                aria-busy={pdfAction === action || undefined}
                aria-label={action === 'open' ? t('report.openPdf') : t('report.printReport')}
                className="flex min-h-12 items-center justify-center gap-2 rounded-full bg-sunken px-3 text-base font-semibold text-text-primary transition-colors duration-150 hover:bg-border-subtle aria-disabled:opacity-60"
                whileTap={busy ? undefined : { scale: 0.97 }}
              >
                {pdfAction === action ? (
                  <Loader2 size={16} className="animate-spin motion-reduce:animate-none" aria-hidden />
                ) : (
                  <Icon size={16} aria-hidden />
                )}
                {label}
              </motion.button>
            ))}
            <motion.button
              onClick={() => setShowQr(true)}
              aria-label={t('report.shareLink')}
              className="flex min-h-12 items-center justify-center gap-2 rounded-full bg-sunken px-3 text-base font-semibold text-text-primary transition-colors duration-150 hover:bg-border-subtle"
              whileTap={{ scale: 0.97 }}
            >
              <Link2 size={16} aria-hidden /> {t('report.share')}
            </motion.button>
          </div>
        </div>
        <p role="status" aria-live="polite" className={pdfError ? 'mb-6 rounded-[1.25rem] bg-error-subtle px-5 py-4 text-base text-error-text' : 'sr-only'}>
          {pdfError ? (
            <>
              {t('report.pdfFailed')}{' '}
              <button
                type="button"
                onClick={() => handlePdf(pdfError)}
                className="font-semibold underline underline-offset-4"
              >
                {t('chat.retryAudio')}
              </button>
            </>
          ) : pdfAction ? (
            t('report.preparingPdf')
          ) : (
            ''
          )}
        </p>
        {!pdfError && <div className="mb-5" />}

        {/* Live consult */}
        {patientProfile && (
          <motion.button
            onClick={() => setConsultMode(true)}
            className="mb-8 flex min-h-12 w-full items-center justify-center gap-2 rounded-full bg-brand-subtle px-5 text-base font-semibold text-brand-ink transition-colors duration-150 hover:bg-brand-muted"
            whileTap={{ scale: 0.98 }}
          >
            <Stethoscope size={14} aria-hidden /> {t('report.startConsult')}
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
          <Row label="Visit Type" value={formatVisitType(rd.visit_type)} />
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
              <Row key={key} label={LIFESTYLE_LABELS[key] ?? key.replace(/_/g, ' ')} value={val ? 'Yes' : 'No'} />
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
            <span className="text-sm font-semibold text-warning-text">
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
          <h3 className="mb-1 text-sm font-semibold text-text-secondary">Physician Notes</h3>
          <div className="mb-3 h-px bg-border-subtle" />
          <textarea
            value={physicianNotes}
            onChange={(e) => setPhysicianNotes(e.target.value)}
            onBlur={() => void savePhysicianNotes()}
            placeholder="Add notes for the record…"
            rows={5}
            className="w-full resize-y rounded-2xl border border-border-default bg-surface p-4 text-base text-text-primary outline-none transition-colors duration-150 placeholder:text-text-placeholder focus:border-brand-ink focus:ring-2 focus:ring-brand-ink/20"
          />
          <div className="mt-2 flex items-center justify-between">
            <span role="status" aria-live="polite" className={`text-sm ${noteSaveError ? 'text-error-text' : 'text-text-tertiary'}`}>
              {savingNotes ? 'Saving…' : noteSaveError ? 'Not saved — check the connection and tap Save notes' : 'Notes save when you leave the box'}
            </span>
            <button
              onClick={() => void savePhysicianNotes()}
              disabled={savingNotes}
              className="min-h-11 shrink-0 rounded-full bg-sunken px-4 text-sm font-semibold text-text-primary transition-colors duration-150 hover:bg-border-subtle disabled:opacity-50"
            >
              Save notes
            </button>
          </div>
        </div>
      </main>

      {/* Share link sheet */}
      {showQr && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/30 p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] sm:items-center"
          onClick={() => setShowQr(false)}
          onKeyDown={(e) => e.key === 'Escape' && setShowQr(false)}
        >
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="share-title"
            initial={{ y: 24, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 420, damping: 38 }}
            className="w-full max-w-sm rounded-[1.75rem] bg-surface p-6 shadow-[0_30px_80px_-30px_rgba(12,34,23,0.45)]"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 id="share-title" className="text-[1.375rem] font-semibold tracking-[-0.025em] text-text-primary">
              {t('report.shareTitle')}
            </h2>
            <p className="mt-1.5 text-base leading-relaxed text-text-secondary">{t('report.shareNote')}</p>
            <p className="mt-4 select-all break-all rounded-2xl bg-sunken px-4 py-3 font-mono text-sm text-text-secondary">
              {reportShareUrl}
            </p>
            <p role="status" aria-live="polite" className={copyError ? 'mt-2 text-sm text-error-text' : 'sr-only'}>
              {copyError ? t('report.copyFailed') : linkCopied ? t('report.copied') : ''}
            </p>
            <div className="mt-5 flex flex-col gap-2">
              <button
                autoFocus
                onClick={() => void copyShareLink()}
                aria-label={t('report.copyLink')}
                className="inline-flex min-h-13 items-center justify-center gap-2 rounded-full bg-brand-ink px-5 text-lg font-semibold text-white transition-[background-color,transform] duration-150 hover:bg-brand-ink-hover active:scale-[0.97]"
              >
                {linkCopied ? <CheckCircle size={18} aria-hidden /> : <Copy size={18} aria-hidden />}
                {linkCopied ? t('report.copied') : t('report.copyLink')}
              </button>
              <button
                onClick={() => setShowQr(false)}
                className="min-h-12 rounded-full px-5 text-base font-semibold text-brand-ink transition-colors duration-150 hover:bg-brand-subtle"
              >
                {t('common.close')}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </motion.div>
  )
}

export default function ReportPage() {
  return (
    <ErrorBoundary>
      <Suspense fallback={<ReportLoading />}>
        <ReportContent />
      </Suspense>
    </ErrorBoundary>
  )
}
