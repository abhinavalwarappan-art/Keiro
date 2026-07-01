'use client'

import { useCallback, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { MessageCircle, Phone } from 'lucide-react'
import { trackEmergencyShown } from '@/lib/analytics'
import { ACTIVE_CHAT_SESSION_KEY, EMERGENCY_CHAT_SOURCE_KEY } from '@/lib/chatSession'

const EMERGENCY_TRANSLATIONS = [
  { flag: '🇪🇸', lang: 'Español', text: 'Necesito ayuda médica urgente. Por favor llame al 911 inmediatamente.', roman: 'Necesito ayuda médica urgente.' },
  { flag: '🇮🇳', lang: 'हिन्दी', text: 'मुझे तत्काल चिकित्सा सहायता चाहिए। कृपया अभी 911 पर कॉल करें।', roman: 'Mujhe tatkal chikitsa sahayta chahiye.' },
  { flag: '🇨🇳', lang: '中文', text: '我需要紧急医疗帮助。请立即拨打911。', roman: 'Wǒ xūyào jǐnjí yīliáo bāngzhù.' },
  { flag: '🇸🇦', lang: 'العربية', text: 'أحتاج إلى مساعدة طبية عاجلة. من فضلك اتصل بـ 911 الآن.', roman: 'Ahtaj ila musaada tibbiya ajila.' },
  { flag: '🇻🇳', lang: 'Tiếng Việt', text: 'Tôi cần giúp đỡ y tế khẩn cấp. Xin hãy gọi 911 ngay lập tức.', roman: 'Tôi cần giúp đỡ y tế khẩn cấp.' },
  { flag: '🇵🇭', lang: 'Tagalog', text: 'Kailangan ko ng agarang tulong medikal. Mangyaring tumawag ng 911 agad.', roman: '' },
  { flag: '🇰🇷', lang: '한국어', text: '긴급 의료 도움이 필요합니다. 지금 바로 911에 전화해 주세요.', roman: 'Ginjip uiryo doryumi piryohabnida.' },
  { flag: '🇵🇰', lang: 'اردو', text: 'مجھے فوری طبی مدد چاہیے۔ براہ کرم ابھی 911 پر کال کریں۔', roman: 'Mujhe fori tibbi madad chahiye.' },
  { flag: '🇮🇳', lang: 'தமிழ்', text: 'எனக்கு அவசர மருத்துவ உதவி தேவை. உடனே 911 ஐ அழைக்கவும்.', roman: 'Enakku avasara maruttuva utavi teva.' },
  { flag: '🇮🇳', lang: 'ગુજરાતી', text: 'મને તાત્કાલિક તબીબી સહાય જોઈએ. કૃપા કરીને હવે 911 પર ફોન કરો.', roman: 'Mane tatkaalik tabeebi sahay joi-e.' },
  { flag: '🇫🇷', lang: 'Français', text: "J'ai besoin d'aide médicale urgente. Appelez le 911 immédiatement.", roman: '' },
  { flag: '🇧🇷', lang: 'Português', text: 'Preciso de ajuda médica urgente. Por favor ligue para o 911 imediatamente.', roman: '' },
  { flag: '🇷🇺', lang: 'Русский', text: 'Мне нужна срочная медицинская помощь. Пожалуйста, позвоните 911 немедленно.', roman: 'Mne nuzhna srochnaya meditsinskaya pomoshch.' },
  { flag: '🇹🇷', lang: 'Türkçe', text: 'Acil tıbbi yardıma ihtiyacım var. Lütfen hemen 911\'i arayın.', roman: '' },
  { flag: '🇮🇷', lang: 'فارسی', text: 'به کمک فوری پزشکی نیاز دارم. لطفاً همین الان با ۹۱۱ تماس بگیرید.', roman: 'Be komak fowri pezeshki niyaz daram.' },
]

const RTL_LANGUAGES = new Set(['العربية', 'اردو', 'فارسی'])

export default function EmergencyPage() {
  const router = useRouter()

  useEffect(() => {
    trackEmergencyShown()
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
      <main className="mx-auto flex min-h-screen w-full max-w-2xl flex-col px-4 py-4 sm:py-6">
        {/* Header — the one place red owns the screen */}
        <section className="overflow-hidden rounded-2xl border border-error/20 bg-error text-center shadow-[0_18px_45px_rgba(220,38,38,0.22)]">
          <div className="relative px-5 py-8">
            <div className="absolute inset-x-8 top-0 h-28 rounded-full bg-white/10 blur-3xl" aria-hidden />
            <div className="relative mx-auto mb-5 flex size-24 items-center justify-center">
              {[1, 2, 3].map(i => (
                <motion.div
                  key={i}
                  className="absolute rounded-full border border-white/35 shadow-[0_0_28px_rgba(255,255,255,0.22)]"
                  style={{ width: 38 + i * 22, height: 38 + i * 22 }}
                  animate={{ scale: [0.82, 1.28], opacity: [0.55, 0] }}
                  transition={{ duration: 1.8, repeat: Infinity, delay: i * 0.24, ease: 'easeOut' }}
                />
              ))}
              <motion.div
                className="relative z-10 flex size-[4.5rem] items-center justify-center rounded-full border border-white/35 bg-white/20 text-4xl shadow-inner backdrop-blur-md"
                animate={{ scale: [1, 1.04, 1], rotate: [0, -2, 2, 0] }}
                transition={{ duration: 1.4, repeat: Infinity, ease: 'easeInOut' }}
              >
                🚨
              </motion.div>
            </div>
            <h1 className="text-2xl font-semibold tracking-tight text-white text-balance">This looks urgent</h1>
            <p className="mt-2 text-sm font-medium text-white/85">Please get help now</p>
          </div>
        </section>

        {/* Call 911 */}
        <section className="py-5">
          <motion.a
            href="tel:911"
            className="flex min-h-[60px] w-full items-center justify-center gap-3 rounded-xl bg-error py-4 text-lg font-semibold text-white shadow-[0_12px_28px_rgba(220,38,38,0.25)] transition-[background-color,box-shadow,transform] duration-150 hover:bg-red-700 active:scale-[0.98]"
            animate={{ boxShadow: ['0 12px 28px rgba(220,38,38,0.22)', '0 16px 36px rgba(220,38,38,0.32)', '0 12px 28px rgba(220,38,38,0.22)'] }}
            transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
          >
            <Phone size={22} aria-hidden />
            <span>Call 911 now</span>
          </motion.a>
          <p className="mt-3 text-center text-xs font-medium text-text-secondary">
            Show this screen to anyone nearby
          </p>
        </section>

        {/* Translations */}
        <section className="flex-1 overflow-y-auto pb-4">
          <div className="mb-3 flex items-center justify-between gap-3">
            <h2 className="text-xs font-semibold uppercase tracking-[0.16em] text-text-tertiary">
              Emergency message in all languages
            </h2>
            <span className="rounded-full border border-border-subtle bg-surface px-2.5 py-1 text-[11px] font-medium text-text-tertiary">
              911
            </span>
          </div>
          <div className="flex flex-col gap-2.5">
            {EMERGENCY_TRANSLATIONS.map((t, i) => {
              const isRtl = RTL_LANGUAGES.has(t.lang)

              return (
                <motion.article
                  key={t.lang}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.035, duration: 0.22 }}
                  className="grid grid-cols-[6.75rem_1fr] gap-3 rounded-xl border border-border-subtle bg-surface p-3.5 shadow-xs sm:grid-cols-[7.5rem_1fr] sm:p-4"
                >
                  <div className="flex min-w-0 items-start gap-2 border-r border-border-subtle pr-3">
                    <span className="mt-0.5 text-base leading-none" aria-hidden>{t.flag}</span>
                    <div className="min-w-0">
                      <p className="truncate text-xs font-semibold text-error-text">{t.lang}</p>
                      <p className="mt-0.5 text-[10px] font-medium uppercase tracking-wide text-text-tertiary">
                        Help phrase
                      </p>
                    </div>
                  </div>
                  <div className="min-w-0">
                    <p
                      dir={isRtl ? 'rtl' : 'ltr'}
                      className={`text-[15px] leading-relaxed text-text-primary text-pretty ${isRtl ? 'text-right' : 'text-left'}`}
                    >
                      {t.text}
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