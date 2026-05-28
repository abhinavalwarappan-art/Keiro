export interface Language {
  code: string
  en: string
  native: string
  roman: string
  flag: string
  deeplCode?: string
  googleCode: string
  voiceLang: string
  rtl?: boolean
}

export const LANGUAGES: Language[] = [
  { code: 'es-ES', en: 'Spanish', native: 'Español', roman: 'Espanyol', flag: '🇪🇸', deeplCode: 'ES', googleCode: 'es', voiceLang: 'es-ES' },
  { code: 'zh-CN', en: 'Mandarin', native: '中文', roman: 'Zhōngwén', flag: '🇨🇳', deeplCode: 'ZH', googleCode: 'zh', voiceLang: 'zh-CN' },
  { code: 'hi-IN', en: 'Hindi', native: 'हिन्दी', roman: 'Hindee', flag: '🇮🇳', googleCode: 'hi', voiceLang: 'hi-IN' },
  { code: 'ar-SA', en: 'Arabic', native: 'العربية', roman: 'Arabeeya', flag: '🇸🇦', deeplCode: 'AR', googleCode: 'ar', voiceLang: 'ar-SA', rtl: true },
  { code: 'vi-VN', en: 'Vietnamese', native: 'Tiếng Việt', roman: 'Tyeng Vyet', flag: '🇻🇳', googleCode: 'vi', voiceLang: 'vi-VN' },
  { code: 'ko-KR', en: 'Korean', native: '한국어', roman: 'Hangugeo', flag: '🇰🇷', deeplCode: 'KO', googleCode: 'ko', voiceLang: 'ko-KR' },
  { code: 'tl-PH', en: 'Tagalog', native: 'Tagalog', roman: 'Tagalog', flag: '🇵🇭', googleCode: 'tl', voiceLang: 'tl-PH' },
  { code: 'ur-PK', en: 'Urdu', native: 'اردو', roman: 'Urdoo', flag: '🇵🇰', googleCode: 'ur', voiceLang: 'ur-PK', rtl: true },
  { code: 'ta-IN', en: 'Tamil', native: 'தமிழ்', roman: 'Tamizh', flag: '🇮🇳', googleCode: 'ta', voiceLang: 'ta-IN' },
  { code: 'te-IN', en: 'Telugu', native: 'తెలుగు', roman: 'Telugu', flag: '🇮🇳', googleCode: 'te', voiceLang: 'te-IN' },
  { code: 'gu-IN', en: 'Gujarati', native: 'ગુજરાતી', roman: 'Gujaraati', flag: '🇮🇳', googleCode: 'gu', voiceLang: 'gu-IN' },
  { code: 'pa-IN', en: 'Punjabi', native: 'ਪੰਜਾਬੀ', roman: 'Punjabi', flag: '🇮🇳', googleCode: 'pa', voiceLang: 'pa-IN' },
  { code: 'fr-FR', en: 'French', native: 'Français', roman: 'Fransay', flag: '🇫🇷', deeplCode: 'FR', googleCode: 'fr', voiceLang: 'fr-FR' },
  { code: 'de-DE', en: 'German', native: 'Deutsch', roman: 'Doych', flag: '🇩🇪', deeplCode: 'DE', googleCode: 'de', voiceLang: 'de-DE' },
  { code: 'pt-BR', en: 'Portuguese', native: 'Português', roman: 'Portugez', flag: '🇧🇷', deeplCode: 'PT-BR', googleCode: 'pt', voiceLang: 'pt-BR' },
  { code: 'ja-JP', en: 'Japanese', native: '日本語', roman: 'Nihongo', flag: '🇯🇵', deeplCode: 'JA', googleCode: 'ja', voiceLang: 'ja-JP' },
  { code: 'ru-RU', en: 'Russian', native: 'Русский', roman: 'Ruskiy', flag: '🇷🇺', deeplCode: 'RU', googleCode: 'ru', voiceLang: 'ru-RU' },
  { code: 'tr-TR', en: 'Turkish', native: 'Türkçe', roman: 'Turk-cheh', flag: '🇹🇷', deeplCode: 'TR', googleCode: 'tr', voiceLang: 'tr-TR' },
  { code: 'fa-IR', en: 'Farsi', native: 'فارسی', roman: 'Faarsee', flag: '🇮🇷', googleCode: 'fa', voiceLang: 'fa-IR', rtl: true },
  { code: 'am-ET', en: 'Amharic', native: 'አማርኛ', roman: 'Amarinja', flag: '🇪🇹', googleCode: 'am', voiceLang: 'am-ET' },
  { code: 'sw-KE', en: 'Swahili', native: 'Kiswahili', roman: 'Kiswahili', flag: '🇰🇪', googleCode: 'sw', voiceLang: 'sw-KE' },
  { code: 'so-SO', en: 'Somali', native: 'Soomaali', roman: 'Soomaali', flag: '🇸🇴', googleCode: 'so', voiceLang: 'so-SO' },
  { code: 'id-ID', en: 'Indonesian', native: 'Bahasa Indonesia', roman: 'Bahasa Indonesia', flag: '🇮🇩', deeplCode: 'ID', googleCode: 'id', voiceLang: 'id-ID' },
  { code: 'pl-PL', en: 'Polish', native: 'Polski', roman: 'Polski', flag: '🇵🇱', deeplCode: 'PL', googleCode: 'pl', voiceLang: 'pl-PL' },
  { code: 'uk-UA', en: 'Ukrainian', native: 'Українська', roman: 'Ukrayinska', flag: '🇺🇦', deeplCode: 'UK', googleCode: 'uk', voiceLang: 'uk-UA' },
]

export function getLanguageByCode(code: string): Language | undefined {
  return LANGUAGES.find(l => l.code === code)
}
