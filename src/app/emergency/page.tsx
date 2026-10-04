'use client'

import { useCallback, useEffect, useState } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { MessageCircle, Phone } from 'lucide-react'
import { trackEmergencyShown } from '@/lib/analytics'
import { ACTIVE_CHAT_SESSION_KEY, EMERGENCY_CHAT_SOURCE_KEY } from '@/lib/chatSession'
import { resolveEmergencyNumber, type ResolvedEmergency } from '@/lib/emergencyNumbers'

// `{n}` is replaced at render time with the patient's locale-resolved emergency
// number (see resolveEmergencyNumber) — never hardcode a country's number here.
const EMERGENCY_TRANSLATIONS = [
  { flag: '🇪🇸', lang: 'Español', text: 'Necesito ayuda médica urgente. Por favor llame al {n} inmediatamente.', roman: 'Necesito ayuda médica urgente.' },
  { flag: '🇮🇳', lang: 'हिन्दी', text: 'मुझे तत्काल चिकित्सा सहायता चाहिए। कृपया अभी {n} पर कॉल करें।', roman: 'Mujhe tatkal chikitsa sahayta chahiye.' },
  { flag: '🇨🇳', lang: '中文', text: '我需要紧急医疗帮助。请立即拨打{n}。', roman: 'Wǒ xūyào jǐnjí yīliáo bāngzhù.' },
  { flag: '🇸🇦', lang: 'العربية', text: 'أحتاج إلى مساعدة طبية عاجلة. من فضلك اتصل بـ {n} الآن.', roman: 'Ahtaj ila musaada tibbiya ajila.' },
  { flag: '🇻🇳', lang: 'Tiếng Việt', text: 'Tôi cần giúp đỡ y tế khẩn cấp. Xin hãy gọi {n} ngay lập tức.', roman: 'Tôi cần giúp đỡ y tế khẩn cấp.' },
  { flag: '🇵🇭', lang: 'Tagalog', text: 'Kailangan ko ng agarang tulong medikal. Mangyaring tumawag ng {n} agad.', roman: '' },
  { flag: '🇰🇷', lang: '한국어', text: '긴급 의료 도움이 필요합니다. 지금 바로 {n}에 전화해 주세요.', roman: 'Ginjip uiryo doryumi piryohabnida.' },
  { flag: '🇵🇰', lang: 'اردو', text: 'مجھے فوری طبی مدد چاہیے۔ براہ کرم ابھی {n} پر کال کریں۔', roman: 'Mujhe fori tibbi madad chahiye.' },
  { flag: '🇮🇳', lang: 'தமிழ்', text: 'எனக்கு அவசர மருத்துவ உதவி தேவை. உடனே {n} ஐ அழைக்கவும்.', roman: 'Enakku avasara maruttuva utavi teva.' },
  { flag: '🇮🇳', lang: 'ગુજરાતી', text: 'મને તાત્કાલિક તબીબી સહાય જોઈએ. કૃપા કરીને હવે {n} પર ફોન કરો.', roman: 'Mane tatkaalik tabeebi sahay joi-e.' },
  { flag: '🇫🇷', lang: 'Français', text: "J'ai besoin d'aide médicale urgente. Appelez le {n} immédiatement.", roman: '' },
  { flag: '🇧🇷', lang: 'Português', text: 'Preciso de ajuda médica urgente. Por favor ligue para o {n} imediatamente.', roman: '' },
  { flag: '🇷🇺', lang: 'Русский', text: 'Мне нужна срочная медицинская помощь. Пожалуйста, позвоните {n} немедленно.', roman: 'Mne nuzhna srochnaya meditsinskaya pomoshch.' },
  { flag: '🇹🇷', lang: 'Türkçe', text: 'Acil tıbbi yardıma ihtiyacım var. Lütfen hemen {n}\'i arayın.', roman: '' },
  { flag: '🇮🇷', lang: 'فارسی', text: 'به کمک فوری پزشکی نیاز دارم. لطفاً همین الان با {n} تماس بگیرید.', roman: 'Be komak fowri pezeshki niyaz daram.' },
]

const RTL_LANGUAGES = new Set(['العربية', 'اردو', 'فارسی'])

export default function EmergencyPage() {
  const router = useRouter()
  const reducedMotion = useReducedMotion()

  // The patient's locale decides which country's emergency number to show. We start
  // from the safe global fallback (112) so the first paint is never wrong, then
  // resolve the real locale on the client. Locale is a best-guess of the patient's
  // country, not their verified location — hence the always-visible "verify" note.
  const [emergency, setEmergency] = useState<ResolvedEmergency>(() => resolveEmergencyNumber(null))
  const { number, country, isFallback } = emergency

  useEffect(() => {
    trackEmergencyShown()
  }, [])

  useEffect(() => {
    // Prefer an explicit ?lang= (set by the chat emergency detour); otherwise read
    // the persisted chat session; otherwise keep the global fallback.
    let langCode: string | null = null
    try {
      langCode = new URLSearchParams(window.location.search).get('lang')
      if (!langCode) {
        const raw = sessionStorage.getItem(ACTIVE_CHAT_SESSION_KEY)
        if (raw) langCode = (JSON.parse(raw) as { langCode?: string }).langCode ?? null
      }
    } catch {
      // URL or sessionStorage unavailable — keep the global fallback number
    }
    if (langCode) setEmergency(resolveEmergencyNumber(langCode))
  }, [])

  const handleContinueChat = useCallback(() => {
    let hasActiveChat: string | null = null
    let cameFromChat: string | null = null

    try {
      hasActiveChat = sessionStorage.getItem(ACTIVE_CHAT_SESSION_KEY)
      cameFromChat = sessionStorage.getItem(EMERGENCY_CHAT_SOURCE_KEY)
      sessionStorage.removeItem(EMERGENCY_CHAT_SOURCE_KEY)
    } catch {
      // sessionStorage unavailable (e.g. private browsing restrictions)
    }

    if (hasActiveChat && cameFromChat) {
      router.back()
      return
    }

    router.push('/chat')
  }, [router])

  return (
    <div className="min-h-screen bg-transparent">
      <main id="main-content" className="mx-auto flex min-h-screen w-full max-w-2xl flex-col px-4 py-4 sm:py-6">
        {/* Header — the one place red owns the screen */}
        <section className="rounded-3xl bg-error px-6 py-10 text-center">
          <h1 className="text-balance text-[2.25rem] font-semibold leading-[1.05] tracking-[-0.04em] text-white">
            This looks urgent
          </h1>
          {/* Full white, not white/85: on the red ground /85 measured 3.8:1 —
              below AA — and this line is the instruction on a life-critical
              screen shown to stressed, often older, often low-vision users. */}
          <p className="mt-3 text-xl font-medium text-white">Please get help now</p>
        </section>

        {/* Call the local emergency number */}
        <section className="py-5">
          <motion.a
            href={`tel:${number}`}
            className="flex min-h-[64px] w-full items-center justify-center gap-3 rounded-full bg-error py-4 text-xl font-semibold text-white transition-colors duration-150 hover:bg-red-700"
            whileTap={reducedMotion ? undefined : { scale: 0.97 }}
            transition={{ type: 'spring', stiffness: 700, damping: 45 }}
          >
            <Phone size={22} aria-hidden />
            <span>Call {number} now</span>
          </motion.a>
          <p className="mt-3 text-center text-xs font-medium text-text-secondary">
            Show this screen to anyone nearby
          </p>
          <p className="mt-1.5 text-center text-xs font-medium text-text-tertiary">
            {isFallback
              ? `${number} reaches emergency services from mobile phones in most countries. If it does not connect, dial your local emergency number.`
              : `This is the emergency number for ${country}. If you are somewhere else, dial your local emergency number instead.`}
          </p>
        </section>

        {/* Translations */}
        <section className="flex-1 overflow-y-auto pb-4">
          <div className="mb-3 flex items-center justify-between gap-3">
            <h2 className="text-sm font-semibold text-text-secondary">
              Emergency message in all languages
            </h2>
            <span className="rounded-full border border-border-subtle bg-surface px-2.5 py-1 text-[11px] font-medium text-text-tertiary">
              {number}
            </span>
          </div>
          <div className="flex flex-col gap-2.5">
            {EMERGENCY_TRANSLATIONS.map((t, i) => {
              const isRtl = RTL_LANGUAGES.has(t.lang)

              return (
                <motion.article
                  key={t.lang}
                  initial={reducedMotion ? false : { opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: reducedMotion ? 0 : i * 0.035, duration: reducedMotion ? 0 : 0.22 }}
                  className="grid grid-cols-[6.75rem_1fr] gap-3 rounded-xl border border-border-subtle bg-surface p-3.5 shadow-xs sm:grid-cols-[7.5rem_1fr] sm:p-4"
                >
                  <div className="flex min-w-0 items-start gap-2 border-r border-border-subtle pr-3">
                    <span className="mt-0.5 text-base leading-none" aria-hidden>{t.flag}</span>
                    <div className="min-w-0">
                      <p className="truncate text-xs font-semibold text-error-text">{t.lang}</p>
                      <p className="mt-0.5 text-xs font-medium text-text-tertiary">
                        Help phrase
                      </p>
                    </div>
                  </div>
                  <div className="min-w-0">
                    <p
                      dir={isRtl ? 'rtl' : 'ltr'}
                      className={`text-[15px] leading-relaxed text-text-primary text-pretty ${isRtl ? 'text-right' : 'text-left'}`}
                    >
                      {t.text.replace('{n}', number)}
                    </p>
                    <p className="mt-1.5 min-h-4 text-xs leading-snug text-text-tertiary">
                      {t.roman || ' '}
                    </p>
                  </div>
                </motion.article>
              )
            })}
          </div>
        </section>

        <footer className="sticky bottom-0 -mx-4 border-t border-border-subtle bg-canvas/95 px-4 py-3 backdrop-blur">
          <button
            type="button"
            onClick={handleContinueChat}
            className="flex min-h-[48px] w-full items-center justify-center gap-2 rounded-xl border border-border-subtle bg-surface py-3 text-sm font-semibold text-text-primary shadow-xs transition-[background-color,border-color,box-shadow,transform] duration-150 hover:border-border-default hover:bg-sunken active:scale-[0.98]"
          >
            <MessageCircle size={17} aria-hidden />
            Continue chat
          </button>
        </footer>
      </main>
    </div>
  )
}