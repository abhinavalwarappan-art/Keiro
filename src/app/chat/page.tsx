'use client'

import { useState, useEffect, useRef, useCallback, Suspense } from 'react'
import { ErrorBoundary } from '@/components/ErrorBoundary'
import { motion, AnimatePresence } from 'framer-motion'
import { useRouter, useSearchParams } from 'next/navigation'
import { FileText, LogOut } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import TopBar from '@/components/layout/TopBar'
import Kai, { KaiState } from '@/components/kai/Kai'
import KaiAvatar from '@/components/kai/KaiAvatar'
import ChatBubble from '@/components/chat/ChatBubble'
import ChatInput from '@/components/chat/ChatInput'
import { SeverityPicker, YesNoPicker } from '@/components/chat/SeverityPicker'
import { PatientProfileIntake } from '@/components/chat/PatientProfileIntake'
import ReportCard from '@/components/report/ReportCard'
import { ChatMessage, PatientProfile, Report } from '@/types'
import { getInputPlaceholder, getOpeningMessage } from '@/lib/languages'
import { preloadSpeechVoices } from '@/lib/speech'
import { useSpeechActive } from '@/hooks/useSpeechActive'
import { trackAIQuerySent, trackConversationStarted, trackReportGenerated } from '@/lib/analytics'
import { ACTIVE_CHAT_SESSION_KEY, EMERGENCY_CHAT_SOURCE_KEY, PATIENT_PROFILE_SESSION_KEY, SESSION_ID_KEY } from '@/lib/chatSession'
import { isPatientProfileComplete } from '@/lib/patientProfile'

type QuickReplyType = 'severity' | 'yesno' | null

/** Show timeout warning at 90 minutes (30-minute heads-up before the 2-hour session limit). */
const SESSION_WARN_MS = 90 * 60 * 1000
/** Hard-expire the session at 120 minutes — clears state and redirects to home. */
const SESSION_EXPIRE_MS = 120 * 60 * 1000

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

type StoredChatMessage = Omit<ChatMessage, 'timestamp'> & {
  timestamp: string
}

interface StoredChatSession {
  version: 1
  langCode: string
  langName: string
  langNative: string
  roman: boolean
  messages: StoredChatMessage[]
  quickReply: QuickReplyType
  showPrepareReport: boolean
  preparedReport: Report | null
  patientProfile: PatientProfile | null
}

function loadStoredPatientProfile(): PatientProfile | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = sessionStorage.getItem(PATIENT_PROFILE_SESSION_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as PatientProfile
    return isPatientProfileComplete(parsed) ? parsed : null
  } catch {
    return null
  }
}

function restoreChatSession(
  langCode: string,
  langName: string,
  langNative: string,
  roman: boolean,
): StoredChatSession | null {
  if (typeof window === 'undefined') return null

  try {
    const raw = sessionStorage.getItem(ACTIVE_CHAT_SESSION_KEY)
    if (!raw) return null

    const parsed = JSON.parse(raw) as StoredChatSession
    if (
      parsed.version !== 1 ||
      parsed.langCode !== langCode ||
      parsed.langName !== langName ||
      parsed.langNative !== langNative ||
      parsed.roman !== roman ||
      !Array.isArray(parsed.messages)
    ) {
      return null
    }

    return parsed
  } catch {
    return null
  }
}

function serializeMessages(messages: ChatMessage[]): StoredChatMessage[] {
  return messages.map(message => ({
    ...message,
    timestamp: message.timestamp.toISOString(),
  }))
}

function deserializeMessages(messages: StoredChatMessage[]): ChatMessage[] {
  return messages.map(message => ({
    ...message,
    timestamp: new Date(message.timestamp),
  }))
}

const COMPLETION_MESSAGES_ROMAN: Record<string, string> = {
  ta: 'Ungal arikkai thayaaranaathu. Idhai ungal maruthuvaridam kaattungal.',
  hi: 'Aapki report taiyaar hai. Kripya ise apne doctor ko dikhayein.',
  es: 'Su informe esta listo. Por favor muestreselo a su medico.',
  ar: "Taqeeruk jahiz. Arju an tu'ridhu 'ala tabibik.",
  zh: 'Nin de baogao yi zhunbei hao. Qing jiang qi chushi gei nin de yisheng.',
  fr: 'Votre rapport est pret. Veuillez le montrer a votre medecin.',
  vi: 'Bao cao cua ban da san sang. Vui long cho bac si xem.',
  ko: 'Bogoseoga junbibi doeeotseumnida. Uisaege boyeojuseyo.',
  pt: 'Seu relatorio esta pronto. Por favor, mostre ao seu medico.',
  ru: 'Vash otchet gotov. Pozhaluysta, pokazhite yego vrachu.',
  ja: 'Repooto ga dekimashita. Isha ni omise kudasai.',
  de: 'Ihr Bericht ist fertig. Bitte zeigen Sie ihn Ihrem Arzt.',
  it: 'Il suo rapporto e pronto. Per favore lo mostri al suo medico.',
  tr: 'Raporunuz hazir. Lutfen doktorunuza gosterin.',
  pl: 'Twoj raport jest gotowy. Prosze pokazac go lekarzowi.',
  uk: 'Vash zvit gotovyy. Bud laska, pokazhit yoho likaryu.',
  bn: 'Apnar report prostut. Onugroho kore eti apnar doctorke dekhan.',
  ml: 'Ningalude report thayyaranu. Dayavaayi ithu ningalude doctorinu kaanikkuka.',
  nl: 'Uw rapport is klaar. Toon het alstublieft aan uw arts.',
  el: 'I anafora sas einai etoimi. Parakalo deixte tin ston giatro sas.',
  cs: 'Vase zprava je pripravena. Ukažte ji prosim svemu lekari.',
  ro: 'Raportul dvs. este gata. Va rugam sa il aratati medicului.',
  sv: 'Din rapport ar klar. Visa den for din lakare.',
  da: 'Din rapport er klar. Vis den venligst til din laege.',
  fi: 'Raporttisi on valmis. Nayta se laakarillesi.',
  no: 'Rapporten din er klar. Vis den til legen din.',
  hu: 'A jelentese elkeszult. Kerjuk, mutassa meg orvosanak.',
  bg: 'Vashiyat doklad e gotov. Molya, pokazhete go na lekarya si.',
  'zh-TW': 'Nin de baogao yi zhunbei hao. Qing jiang qi chushi gei nin de yisheng.',
  sk: 'Vasa sprava je pripravena. Ukazte ju prosim svojmu lekarovi.',
  sl: 'Vase porocilo je pripravljeno. Prosimo, pokazite ga zdravniku.',
  et: 'Teie aruanne on valmis. Palun naidake seda arstile.',
  lv: 'Jusu parskats ir gatavs. Ludzu, paradiet to savam arstam.',
  lt: 'Jusu ataskaita paruosta. Prasome parodyti ja gydytojui.',
  id: 'Laporan Anda sudah siap. Silakan tunjukkan kepada dokter Anda.',
  sw: 'Ripoti yako iko tayari. Tafadhali ionyeshe kwa daktari wako.',
  en: 'Your report is ready. Please show this to your doctor.',
}

function getCompletionMessage(langCode: string, romanized: boolean): string {
  const map = romanized ? COMPLETION_MESSAGES_ROMAN : COMPLETION_MESSAGES
  return map[langCode] ?? map[langCode.split('-')[0]] ?? map.en
}

// Kai appends an invisible UI-signal tag (e.g. [[PICKER:SEVERITY]]) at the end of
// a reply to drive quick-reply pickers in a language-agnostic way. Strip them from
// anything shown to the patient — including a partial tag still arriving mid-stream.
const COMPLETE_PICKER_RE = /\s*\[\[PICKER:[A-Z_]+\]\]/g
const TRAILING_PARTIAL_PICKER_RE = /\s*\[\[[A-Z:_]*$/

function stripPickerMarkers(text: string): string {
  return text.replace(COMPLETE_PICKER_RE, '').replace(TRAILING_PARTIAL_PICKER_RE, '')
}

function ChatContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const langCode = searchParams.get('lang') || 'en-US'
  const langName = searchParams.get('langName') || 'English'
  const langNative = searchParams.get('langNative') || 'English'
  const roman = searchParams.get('roman') === '1'
  const [restoredSession] = useState(() => restoreChatSession(langCode, langName, langNative, roman))
  const [patientProfile, setPatientProfile] = useState<PatientProfile | null>(
    () => restoredSession?.patientProfile ?? loadStoredPatientProfile(),
  )
  const [showProfileIntake, setShowProfileIntake] = useState(
    () => !(restoredSession?.patientProfile ?? loadStoredPatientProfile()),
  )
  const restoredMessages = restoredSession ? deserializeMessages(restoredSession.messages) : []
  const restoredHasMessages = restoredMessages.length > 0

  const [messages, setMessages] = useState<ChatMessage[]>(restoredMessages)
  // Starts true: the opening-message effect shows Kai typing immediately on mount
  const [isTyping, setIsTyping] = useState(!restoredHasMessages)
  const [chatError, setChatError] = useState(false)
  const [rateLimitError, setRateLimitError] = useState(false)
  const [sessionTimeoutWarning, setSessionTimeoutWarning] = useState(false)
  const [quickReply, setQuickReply] = useState<QuickReplyType>(restoredSession?.quickReply ?? null)
  const [showPrepareReport, setShowPrepareReport] = useState(restoredSession?.showPrepareReport ?? false)
  const [generatingReport, setGeneratingReport] = useState(false)
  const [preparedReport, setPreparedReport] = useState<Report | null>(restoredSession?.preparedReport ?? null)
  const [reportError, setReportError] = useState(false)
  const isKaiSpeaking = useSpeechActive()
  const scrollRef = useRef<HTMLDivElement>(null)
  const kaiReplyInFlightRef = useRef(false)
  const chatAbortRef = useRef<AbortController | null>(null)
  const openingRequestedRef = useRef(restoredHasMessages)

  const supabase = createClient()

  const kaiState: KaiState = generatingReport || isTyping ? 'thinking' : isKaiSpeaking ? 'talking' : 'idle'
  // Lock all patient input while Kai is speaking so nothing gets clicked/typed
  // over the audio — patients must listen through before responding.
  const inputDisabled = isTyping || generatingReport || showProfileIntake || isKaiSpeaking

  const scrollToBottom = useCallback(() => {
    requestAnimationFrame(() => {
      const el = scrollRef.current
      if (el) el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' })
    })
  }, [])

  // Persist the live chat session so a refresh or an emergency detour can restore it.
  useEffect(() => {
    if (typeof window === 'undefined') return
    if (messages.length === 0) return

    const snapshot: StoredChatSession = {
      version: 1,
      langCode,
      langName,
      langNative,
      roman,
      messages: serializeMessages(messages),
      quickReply,
      showPrepareReport,
      preparedReport,
      patientProfile,
    }

    try {
      sessionStorage.setItem(ACTIVE_CHAT_SESSION_KEY, JSON.stringify(snapshot))
    } catch {
      // sessionStorage may be unavailable (private browsing) — non-fatal.
    }
  }, [messages, langCode, langName, langNative, roman, quickReply, showPrepareReport, preparedReport, patientProfile])

  // Preload TTS voices once so the first Listen press has a voice ready. Kai never
  // speaks on its own — a patient opts in with the Listen button on each message.
  useEffect(() => {
    preloadSpeechVoices()
  }, [])

  const streamKaiReply = useCallback(
    async (history: ChatMessage[], isOpening: boolean) => {
      if (kaiReplyInFlightRef.current) return
      kaiReplyInFlightRef.current = true

      chatAbortRef.current?.abort()
      const controller = new AbortController()
      chatAbortRef.current = controller

      setChatError(false)
      setRateLimitError(false)
      setQuickReply(null)
      setIsTyping(true)
      scrollToBottom()

      try {
        const res = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            messages: history,
            language: langName,
            romanization: roman,
            isOpening,
            patientProfile,
          }),
          signal: controller.signal,
        })

        if (res.status === 429) {
          setIsTyping(false)
          setRateLimitError(true)
          return
        }

        if (!res.ok) {
          setIsTyping(false)
          setChatError(true)
          return
        }

        const contentType = res.headers.get('Content-Type') ?? ''
        if (!contentType.includes('text/event-stream')) {
          const data = await res.json().catch(() => null)
          setIsTyping(false)
          if (data?.emergency) {
            try {
              sessionStorage.setItem(EMERGENCY_CHAT_SOURCE_KEY, '1')
            } catch {
              // Non-fatal.
            }
            router.push('/emergency')
          }
          return
        }

        const reader = res.body?.getReader()
        if (!reader) {
          setIsTyping(false)
          setChatError(true)
          return
        }

        setIsTyping(false)
        const kaiMessageId = crypto.randomUUID()
        setMessages(prev => [
          ...prev,
          { id: kaiMessageId, role: 'kai', content: '', timestamp: new Date() },
        ])

        const decoder = new TextDecoder()
        let fullText = ''
        let buffer = ''

        while (true) {
          const { done, value } = await reader.read()
          if (done) break

          buffer += decoder.decode(value, { stream: true })
          const lines = buffer.split('\n')
          buffer = lines.pop() ?? ''

          for (const line of lines) {
            if (!line.startsWith('data: ')) continue
            const payload = line.slice(6)
            if (payload === '[DONE]') continue

            try {
              const parsed = JSON.parse(payload) as { text?: string; emergency?: boolean }
              if (parsed.emergency) {
                try {
                  sessionStorage.setItem(EMERGENCY_CHAT_SOURCE_KEY, '1')
                } catch {
                  // Non-fatal.
                }
                router.push('/emergency')
                return
              }
              if (parsed.text) {
                fullText += parsed.text
                setMessages(prev =>
                  prev.map(m => (m.id === kaiMessageId ? { ...m, content: stripPickerMarkers(fullText) } : m)),
                )
              }
            } catch {
              // Ignore malformed SSE chunks.
            }
          }
        }

        scrollToBottom()

        // Language-agnostic quick-reply signals: Kai appends an invisible
        // [[PICKER:*]] tag (stripped from the visible text above) instead of us
        // sniffing English keywords, so pickers work in every language.
        if (fullText.includes('[[PICKER:SEVERITY]]')) {
          setQuickReply('severity')
        } else if (fullText.includes('[[PICKER:YESNO]]')) {
          setQuickReply('yesno')
        }

        if (fullText.includes('[[PICKER:PREPARE_REPORT]]')) {
          setShowPrepareReport(true)
        }
      } catch (error) {
        if (error instanceof DOMException && error.name === 'AbortError') return
        setIsTyping(false)
        setChatError(true)
      } finally {
        kaiReplyInFlightRef.current = false
        if (chatAbortRef.current === controller) chatAbortRef.current = null
      }
    },
    [langName, roman, patientProfile, router, scrollToBottom],
  )

  const sendMessage = useCallback(
    async (text: string): Promise<boolean> => {
      const trimmed = text.trim()
      if (!trimmed || inputDisabled) return false

      const userMessage: ChatMessage = {
        id: crypto.randomUUID(),
        role: 'user',
        content: trimmed,
        timestamp: new Date(),
      }
      const nextHistory = [...messages, userMessage]

      setMessages(nextHistory)
      setQuickReply(null)
      setShowPrepareReport(false)
      scrollToBottom()

      trackAIQuerySent(langCode, nextHistory.length)
      void streamKaiReply(nextHistory, false)
      return true
    },
    [messages, inputDisabled, langCode, streamKaiReply, scrollToBottom],
  )

  const handleProfileComplete = useCallback(
    (profile: PatientProfile) => {
      setPatientProfile(profile)
      setShowProfileIntake(false)
      try {
        sessionStorage.setItem(PATIENT_PROFILE_SESSION_KEY, JSON.stringify(profile))
      } catch {
        // Non-fatal.
      }
    },
    [],
  )

  const handleEndSession = useCallback(async () => {
    try {
      sessionStorage.removeItem(ACTIVE_CHAT_SESSION_KEY)
      sessionStorage.removeItem(SESSION_ID_KEY)
    } catch {
      // Non-fatal.
    }
    chatAbortRef.current?.abort()
    await supabase.auth.signOut().catch(() => {})
    router.push('/')
  }, [supabase, router])

  const handlePrepareReport = useCallback(async () => {
    if (generatingReport) return

    setGeneratingReport(true)
    setReportError(false)
    setShowPrepareReport(false)

    let sessionId: string | null = null
    try {
      sessionId = sessionStorage.getItem(SESSION_ID_KEY)
    } catch {
      sessionId = null
    }

    try {
      const res = await fetch('/api/report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages,
          language: langName,
          sessionId,
          patientProfile,
        }),
      })

      if (res.status === 429) {
        setGeneratingReport(false)
        setRateLimitError(true)
        return
      }

      if (!res.ok) {
        setGeneratingReport(false)
        setReportError(true)
        return
      }

      const data = (await res.json()) as { reportId?: string; reportData?: unknown }
      if (!data.reportId) {
        setGeneratingReport(false)
        setReportError(true)
        return
      }

      trackReportGenerated(langCode)

      // Cache the generated report so the report page can render it without a round-trip.
      try {
        sessionStorage.setItem(
          `report_${data.reportId}`,
          JSON.stringify(data.reportData ?? {}),
        )
        sessionStorage.removeItem(ACTIVE_CHAT_SESSION_KEY)
      } catch {
        // Non-fatal.
      }

      const params = new URLSearchParams({
        reportId: data.reportId,
        lang: langCode,
        langName,
      })
      router.push(`/report?${params.toString()}`)
    } catch {
      setGeneratingReport(false)
      setReportError(true)
    }
  }, [generatingReport, messages, langName, langCode, patientProfile, router])

  // Kick off the opening message once the patient profile is in place.
  useEffect(() => {
    if (showProfileIntake) return
    if (openingRequestedRef.current) return
    openingRequestedRef.current = true
    trackConversationStarted(langCode)
    void streamKaiReply([], true)
  }, [showProfileIntake, langCode, streamKaiReply])

  // Session lifetime: warn at 90 min, hard-expire at 120 min.
  useEffect(() => {
    const warnTimer = setTimeout(() => setSessionTimeoutWarning(true), SESSION_WARN_MS)
    const expireTimer = setTimeout(() => {
      try {
        sessionStorage.removeItem(ACTIVE_CHAT_SESSION_KEY)
        sessionStorage.removeItem(SESSION_ID_KEY)
      } catch {
        // Non-fatal.
      }
      router.push('/')
    }, SESSION_EXPIRE_MS)

    return () => {
      clearTimeout(warnTimer)
      clearTimeout(expireTimer)
    }
  }, [router])

  // Abort any in-flight stream on unmount.
  useEffect(() => {
    return () => {
      chatAbortRef.current?.abort()
    }
  }, [])

  if (showProfileIntake) {
    return (
      <div className="flex h-dvh flex-col bg-transparent">
        <TopBar kaiState="idle" language={langName} langNative={langNative} />
        <div data-lenis-prevent className="flex-1 overflow-y-auto">
          <PatientProfileIntake
            langCode={langCode}
            langName={langName}
            onComplete={handleProfileComplete}
          />
        </div>
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      className="flex h-dvh flex-col bg-transparent"
    >
      <TopBar
        kaiState={kaiState}
        language={langName}
        langNative={langNative}
        rightElement={
          <button
            type="button"
            onClick={handleEndSession}
            aria-label="End session and sign out"
            className="flex size-9 min-h-[44px] min-w-[44px] shrink-0 items-center justify-center rounded-md text-text-secondary transition-colors duration-150 hover:bg-sunken hover:text-text-primary"
          >
            <LogOut size={18} aria-hidden />
          </button>
        }
      />

      <div ref={scrollRef} data-lenis-prevent className="flex-1 overflow-y-auto">
        <div
          role="log"
          aria-label="Conversation with Kai"
          aria-live="polite"
          className="mx-auto w-full max-w-2xl space-y-6 px-4 py-6 md:px-8"
        >
          {messages.map(message => (
            <ChatBubble key={message.id} message={message} langCode={langCode} />
          ))}

          {isTyping && (
            <motion.div
              className="flex items-start gap-3"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Kai size="xs" state="thinking" interactive={false} />
              <span className="pt-2 text-sm text-text-tertiary">Kai is typing…</span>
            </motion.div>
          )}

          {sessionTimeoutWarning && (
            <div className="rounded-lg border border-warning/40 bg-warning/10 px-4 py-3 text-sm text-text-secondary">
              Your session will expire soon. Prepare your report before it ends.
            </div>
          )}

          {rateLimitError && (
            <div className="rounded-lg border border-warning/40 bg-warning/10 px-4 py-3 text-sm text-text-secondary">
              You&apos;re sending messages too quickly. Please wait a moment and try again.
            </div>
          )}

          {chatError && (
            <div className="rounded-lg border border-danger/40 bg-danger/10 px-4 py-3 text-sm text-text-secondary">
              Something went wrong reaching Kai. Please try again.
            </div>
          )}

          {reportError && (
            <div className="rounded-lg border border-danger/40 bg-danger/10 px-4 py-3 text-sm text-text-secondary">
              We couldn&apos;t prepare your report. Please try again.
            </div>
          )}

          <AnimatePresence>
            {showPrepareReport && !generatingReport && (
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="flex flex-col gap-2"
              >
                <motion.button
                  type="button"
                  onClick={handlePrepareReport}
                  disabled={isKaiSpeaking}
                  className="flex w-full items-center justify-center gap-2 rounded-lg bg-brand-ink py-3.5 font-semibold text-white disabled:opacity-50"
                  whileTap={isKaiSpeaking ? {} : { scale: 0.97 }}
                >
                  <FileText size={16} aria-hidden /> Yes, prepare my report
                </motion.button>
                <motion.button
                  type="button"
                  onClick={() => setShowPrepareReport(false)}
                  disabled={isKaiSpeaking}
                  className="w-full rounded-lg border border-border-subtle bg-surface py-3.5 text-sm font-semibold text-text-primary disabled:opacity-50"
                  whileTap={isKaiSpeaking ? {} : { scale: 0.97 }}
                >
                  I have more to add
                </motion.button>
              </motion.div>
            )}

            {generatingReport && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col items-center gap-3 py-8"
              >
                <Kai size="sm" state="thinking" interactive={false} />
                <p className="text-sm text-text-tertiary">Preparing your report…</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <div className="border-t border-border-subtle bg-surface">
        {preparedReport && (
          <div className="mx-auto w-full max-w-2xl px-4 pt-3">
            <ReportCard
              report={preparedReport}
              onClick={() => {
                const params = new URLSearchParams({
                  reportId: preparedReport.report_id,
                  lang: langCode,
                  langName,
                })
                router.push(`/report?${params.toString()}`)
              }}
            />
          </div>
        )}

        {quickReply === 'severity' && !isTyping && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="mx-auto w-full max-w-2xl px-4 pt-3"
          >
            <SeverityPicker onSelect={sendMessage} disabled={inputDisabled} />
          </motion.div>
        )}

        {quickReply === 'yesno' && !isTyping && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="mx-auto w-full max-w-2xl px-4 pt-3"
          >
            <YesNoPicker onSelect={sendMessage} disabled={inputDisabled} />
          </motion.div>
        )}

        <div className="mx-auto w-full max-w-2xl px-4 pb-4 pt-3">
          <ChatInput
            onSend={sendMessage}
            disabled={inputDisabled}
            placeholder={getInputPlaceholder(langCode)}
            langCode={langCode}
          />
        </div>
      </div>
    </motion.div>
  )
}

export default function ChatPage() {
  return (
    <ErrorBoundary>
      <Suspense>
        <ChatContent />
      </Suspense>
    </ErrorBoundary>
  )
}