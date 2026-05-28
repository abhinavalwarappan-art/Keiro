'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { Phone, ChevronLeft } from 'lucide-react'

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

export default function EmergencyPage() {
  return (
    <div className="flex flex-col min-h-screen" style={{ background: '#fff5f5', maxWidth: 430, margin: '0 auto' }}>
      {/* Header */}
      <div className="px-4 py-5 text-center" style={{ background: '#A32D2D' }}>
        <div className="flex justify-center mb-3">
          {[1, 2, 3].map(i => (
            <motion.div
              key={i}
              className="absolute rounded-full"
              style={{ width: 24 + i * 20, height: 24 + i * 20, border: '2px solid rgba(255,255,255,0.3)', marginTop: -(i * 10) }}
              animate={{ scale: [1, 1.3, 1], opacity: [0.7, 0.1, 0.7] }}
              transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.3 }}
            />
          ))}
          <motion.div
            className="w-16 h-16 rounded-full flex items-center justify-center text-3xl relative z-10"
            style={{ background: 'rgba(255,255,255,0.2)' }}
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ duration: 1, repeat: Infinity }}
          >
            🚨
          </motion.div>
        </div>
        <h1 className="text-xl font-bold text-white mt-4 mb-1">This looks urgent</h1>
        <p className="text-sm text-white opacity-80">Please get help now</p>
      </div>

      {/* Call 911 */}
      <div className="px-4 py-6">
        <motion.a
          href="tel:911"
          className="flex items-center justify-center gap-3 w-full py-5 rounded-2xl text-white font-bold text-xl"
          style={{ background: '#A32D2D' }}
          animate={{ scale: [1, 1.02, 1] }}
          transition={{ duration: 1, repeat: Infinity }}
        >
          <Phone size={24} />
          Call 911 Now
        </motion.a>
        <p className="text-center text-xs mt-3" style={{ color: '#A32D2D' }}>Show this screen to anyone nearby</p>
      </div>

      {/* Translations */}
      <div className="flex-1 px-4 pb-4 overflow-y-auto">
        <div className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: '#A32D2D' }}>
          Emergency message in all languages:
        </div>
        <div className="flex flex-col gap-3">
          {EMERGENCY_TRANSLATIONS.map((t, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              className="p-3 rounded-xl"
              style={{ background: 'white', border: '1px solid #fecaca' }}
            >
              <div className="flex items-center gap-2 mb-1.5">
                <span className="text-lg">{t.flag}</span>
                <span className="text-xs font-semibold" style={{ color: '#A32D2D' }}>{t.lang}</span>
              </div>
              <p className="text-sm leading-relaxed" style={{ color: '#1a1a1a', direction: ['العربية', 'اردو', 'فارسی'].includes(t.lang) ? 'rtl' : 'ltr' }}>
                {t.text}
              </p>
              {t.roman && (
                <p className="text-xs mt-1" style={{ color: '#888' }}>{t.roman}</p>
              )}
            </motion.div>
          ))}
        </div>
      </div>

      <div className="p-4" style={{ borderTop: '1px solid #fecaca' }}>
        <Link href="/">
          <button className="w-full py-3 rounded-xl text-sm font-medium" style={{ color: '#A32D2D', background: 'transparent' }}>
            <ChevronLeft size={14} className="inline mr-1" />
            I&apos;m okay, go back
          </button>
        </Link>
      </div>
    </div>
  )
}
