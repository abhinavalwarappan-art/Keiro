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
  opening?: string
  inputPlaceholder?: string
}

/**
 * The ONE list of languages Keiro supports. The selector, the UI translations,
 * the emergency screen and Kai's voice routing all derive from it — add a
 * language here and the type system points at every place that must follow
 * (e.g. the Fish voice map in kaiVoices.ts will not compile without it).
 */
const LANGUAGE_DATA = [
  { code: 'en-US', en: 'English', native: 'English', roman: 'English', flag: '🇺🇸', deeplCode: 'EN-US', googleCode: 'en', voiceLang: 'en-US' },
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
  { code: 'bn-BD', en: 'Bengali', native: 'বাংলা', roman: 'Bangla', flag: '🇧🇩', googleCode: 'bn', voiceLang: 'bn-BD' },
  { code: 'ml-IN', en: 'Malayalam', native: 'മലയാളം', roman: 'Malayalam', flag: '🇮🇳', googleCode: 'ml', voiceLang: 'ml-IN' },
  { code: 'it-IT', en: 'Italian', native: 'Italiano', roman: 'Italiano', flag: '🇮🇹', deeplCode: 'IT', googleCode: 'it', voiceLang: 'it-IT' },
  { code: 'nl-NL', en: 'Dutch', native: 'Nederlands', roman: 'Nederlands', flag: '🇳🇱', deeplCode: 'NL', googleCode: 'nl', voiceLang: 'nl-NL' },
  { code: 'el-GR', en: 'Greek', native: 'Ελληνικά', roman: 'Ellinika', flag: '🇬🇷', googleCode: 'el', voiceLang: 'el-GR' },
  { code: 'cs-CZ', en: 'Czech', native: 'Čeština', roman: 'Cestina', flag: '🇨🇿', deeplCode: 'CS', googleCode: 'cs', voiceLang: 'cs-CZ' },
  { code: 'ro-RO', en: 'Romanian', native: 'Română', roman: 'Romana', flag: '🇷🇴', googleCode: 'ro', voiceLang: 'ro-RO' },
  { code: 'sv-SE', en: 'Swedish', native: 'Svenska', roman: 'Svenska', flag: '🇸🇪', googleCode: 'sv', voiceLang: 'sv-SE' },
  { code: 'da-DK', en: 'Danish', native: 'Dansk', roman: 'Dansk', flag: '🇩🇰', googleCode: 'da', voiceLang: 'da-DK' },
  { code: 'fi-FI', en: 'Finnish', native: 'Suomi', roman: 'Suomi', flag: '🇫🇮', googleCode: 'fi', voiceLang: 'fi-FI' },
  { code: 'nb-NO', en: 'Norwegian', native: 'Norsk', roman: 'Norsk', flag: '🇳🇴', googleCode: 'no', voiceLang: 'nb-NO' },
  { code: 'hu-HU', en: 'Hungarian', native: 'Magyar', roman: 'Magyar', flag: '🇭🇺', googleCode: 'hu', voiceLang: 'hu-HU' },
  { code: 'bg-BG', en: 'Bulgarian', native: 'Български', roman: 'Balgarski', flag: '🇧🇬', googleCode: 'bg', voiceLang: 'bg-BG' },
  { code: 'zh-TW', en: 'Chinese (Traditional)', native: '繁體中文', roman: 'Fanti Zhongwen', flag: '🇹🇼', googleCode: 'zh-TW', voiceLang: 'zh-TW' },
  { code: 'sk-SK', en: 'Slovak', native: 'Slovenčina', roman: 'Slovencina', flag: '🇸🇰', googleCode: 'sk', voiceLang: 'sk-SK' },
  { code: 'sl-SI', en: 'Slovenian', native: 'Slovenščina', roman: 'Slovenscina', flag: '🇸🇮', googleCode: 'sl', voiceLang: 'sl-SI' },
  { code: 'et-EE', en: 'Estonian', native: 'Eesti', roman: 'Eesti', flag: '🇪🇪', googleCode: 'et', voiceLang: 'et-EE' },
  { code: 'lv-LV', en: 'Latvian', native: 'Latviešu', roman: 'Latviesu', flag: '🇱🇻', googleCode: 'lv', voiceLang: 'lv-LV' },
  { code: 'lt-LT', en: 'Lithuanian', native: 'Lietuvių', roman: 'Lietuviu', flag: '🇱🇹', googleCode: 'lt', voiceLang: 'lt-LT' },
] as const satisfies readonly Language[]

export const LANGUAGES: Language[] = [...LANGUAGE_DATA]

/** A language code Keiro actually supports, e.g. `ta-IN`. Derived, never hand-listed. */
export type SupportedLocale = (typeof LANGUAGE_DATA)[number]['code']

export const SUPPORTED_LOCALES: readonly SupportedLocale[] = LANGUAGE_DATA.map((l) => l.code)

const SUPPORTED_LOCALE_BY_LOWER = new Map<string, SupportedLocale>(
  SUPPORTED_LOCALES.map((code) => [code.toLowerCase(), code]),
)

/**
 * Short or script-tagged forms that legitimately mean one supported locale.
 * Deliberately explicit: Chinese is the one language with two supported
 * locales, so `zh-Hant`/`zh-TW` and `zh-Hans`/`zh-CN` must never collapse into
 * each other, and a bare primary subtag is only accepted where it is listed here.
 */
const LOCALE_ALIASES: Readonly<Record<string, SupportedLocale>> = {
  en: 'en-US',
  es: 'es-ES',
  zh: 'zh-CN',
  'zh-hans': 'zh-CN',
  'zh-hans-cn': 'zh-CN',
  'zh-hant': 'zh-TW',
  'zh-hant-tw': 'zh-TW',
  no: 'nb-NO',
  nb: 'nb-NO',
  'no-no': 'nb-NO',
  pt: 'pt-BR',
}

/**
 * Map any locale string the app might hold onto a supported locale, or null.
 * Case-insensitive; accepts `_` for `-`. Unknown or malformed input returns
 * null — callers decide the fallback, so a wrong guess is never silent.
 */
export function normalizeLocale(input: string | null | undefined): SupportedLocale | null {
  if (typeof input !== 'string') return null
  const key = input.trim().replace(/_/g, '-').toLowerCase()
  if (!key || key.length > 20) return null
  return SUPPORTED_LOCALE_BY_LOWER.get(key) ?? LOCALE_ALIASES[key] ?? null
}

// Build lookup maps once at module load to avoid repeated linear scans
const LANGUAGE_BY_CODE = new Map<string, Language>(LANGUAGES.map((l) => [l.code, l]))
const LANGUAGE_BY_GOOGLE_CODE = new Map<string, Language>(LANGUAGES.map((l) => [l.googleCode, l]))

/** Latin, Latin Extended A/B and Latin Extended Additional (Vietnamese), plus punctuation. */
const LATIN_ONLY = /^[\u0000-\u024F\u1E00-\u1EFF\s]*$/

/**
 * Whether the language is written in a non-Latin script — the only case where
 * a "show it in English letters" option means anything.
 */
export function usesNonLatinScript(lang: Language): boolean {
  return !LATIN_ONLY.test(lang.native)
}

export function getLanguageByCode(code: string): Language | undefined {
  return LANGUAGE_BY_CODE.get(code)
}

const normLabel = (value: string) =>
  value.toLowerCase().replace(/[^\w\s\u0080-\uFFFF]/g, '').trim()

export function languageLabelsEqual(a: string, b: string): boolean {
  return normLabel(a) === normLabel(b)
}

export type LanguageDisplayLine = {
  text: string
  role: 'english' | 'native' | 'roman'
}

/** Deduplicated labels for UI — skips English when same as native, roman when redundant. */
export function getLanguageDisplayLines(lang: Language): LanguageDisplayLine[] {
  const lines: LanguageDisplayLine[] = []
  const showEnglish = !languageLabelsEqual(lang.en, lang.native)

  if (showEnglish) {
    lines.push({ text: lang.en, role: 'english' })
  }
  lines.push({ text: lang.native, role: 'native' })

  if (
    !languageLabelsEqual(lang.roman, lang.native) &&
    !languageLabelsEqual(lang.roman, lang.en)
  ) {
    lines.push({ text: lang.roman, role: 'roman' })
  }

  return lines
}

/** Resolve a language from a full code (e.g. es-ES) or short googleCode (e.g. es). */
export function resolveLanguage(code: string): Language | undefined {
  const normalized = code.trim()
  if (!normalized) return undefined
  return (
    LANGUAGE_BY_CODE.get(normalized) ??
    LANGUAGE_BY_GOOGLE_CODE.get(normalized)
  )
}

const OPENING_BY_CODE: Record<string, string> = {
  'en-US': "Hello! I'm Kai. I'm here to help you communicate with your doctor today. Do you already know what condition you have, or are you unsure what's wrong today?",
  'es-ES': '¡Hola! Soy Kai. Estoy aquí para ayudarte a comunicarte con tu médico hoy. ¿Ya sabes qué condición tienes, o no estás seguro de qué te pasa hoy?',
  'zh-CN': '你好！我是 Kai。今天我来帮你和医生沟通。你已经知道自己有什么病，还是不确定今天哪里不舒服？',
  'hi-IN': 'नमस्ते! मैं Kai हूँ। आज मैं आपको डॉक्टर से बात करने में मदद करूँगा। क्या आपको पता है कि आपको क्या बीमारी है, या आज आप निश्चित नहीं हैं?',
  'ar-SA': 'مرحباً! أنا Kai. أنا هنا لمساعدتك على التواصل مع طبيبك اليوم. هل تعرف بالفعل ما هي حالتك، أم أنك غير متأكد مما يحدث اليوم؟',
  'vi-VN': 'Xin chào! Tôi là Kai. Hôm nay tôi ở đây để giúp bạn trao đổi với bác sĩ. Bạn đã biết mình bị bệnh gì chưa, hay hôm nay bạn không chắc mình bị làm sao?',
}

/** The composer's placeholder, per language. Typed so a new language can't ship without one. */
const PLACEHOLDER_BY_CODE: Record<SupportedLocale, string> = {
  'en-US': 'Type your message…',
  'es-ES': 'Escriba su mensaje…',
  'zh-CN': '输入你的消息…',
  'hi-IN': 'अपना संदेश लिखें…',
  'ar-SA': 'اكتب رسالتك…',
  'vi-VN': 'Nhập tin nhắn của bạn…',
  'ko-KR': '메시지를 입력하세요…',
  'tl-PH': 'I-type ang iyong mensahe…',
  'ur-PK': 'اپنا پیغام لکھیں…',
  'ta-IN': 'உங்கள் செய்தியை எழுதுங்கள்…',
  'te-IN': 'మీ సందేశాన్ని టైప్ చేయండి…',
  'gu-IN': 'તમારો સંદેશ લખો…',
  'pa-IN': 'ਆਪਣਾ ਸੁਨੇਹਾ ਲਿਖੋ…',
  'fr-FR': 'Écrivez votre message…',
  'de-DE': 'Schreiben Sie Ihre Nachricht…',
  'pt-BR': 'Digite sua mensagem…',
  'ja-JP': 'メッセージを入力してください…',
  'ru-RU': 'Напишите сообщение…',
  'tr-TR': 'Mesajınızı yazın…',
  'fa-IR': 'پیام خود را بنویسید…',
  'am-ET': 'መልእክትዎን ይጻፉ…',
  'sw-KE': 'Andika ujumbe wako…',
  'so-SO': 'Qor fariintaada…',
  'id-ID': 'Ketik pesan Anda…',
  'pl-PL': 'Wpisz swoją wiadomość…',
  'uk-UA': 'Напишіть повідомлення…',
  'bn-BD': 'আপনার বার্তা লিখুন…',
  'ml-IN': 'നിങ്ങളുടെ സന്ദേശം എഴുതുക…',
  'it-IT': 'Scriva il suo messaggio…',
  'nl-NL': 'Typ uw bericht…',
  'el-GR': 'Γράψτε το μήνυμά σας…',
  'cs-CZ': 'Napište svou zprávu…',
  'ro-RO': 'Scrieți mesajul dvs.…',
  'sv-SE': 'Skriv ditt meddelande…',
  'da-DK': 'Skriv din besked…',
  'fi-FI': 'Kirjoita viestisi…',
  'nb-NO': 'Skriv meldingen din…',
  'hu-HU': 'Írja be az üzenetét…',
  'bg-BG': 'Напишете съобщението си…',
  'zh-TW': '輸入你的訊息…',
  'sk-SK': 'Napíšte svoju správu…',
  'sl-SI': 'Napišite svoje sporočilo…',
  'et-EE': 'Kirjutage oma sõnum…',
  'lv-LV': 'Ierakstiet savu ziņu…',
  'lt-LT': 'Parašykite savo žinutę…',
}

/**
 * Kai's opening greeting for a language, falling back to English when no
 * localized opening exists. Romanization is opt-in elsewhere and currently
 * resolves to the base (native-script) opening.
 */
export function getOpeningMessage(code: string, romanization?: boolean): string {
  void romanization
  return OPENING_BY_CODE[code] ?? OPENING_BY_CODE['en-US']
}

/** Localized chat input placeholder, falling back to English. */
export function getInputPlaceholder(code: string): string {
  return PLACEHOLDER_BY_CODE[normalizeLocale(code) ?? 'en-US']
}

/**
 * Allowlist check for the chat `language` request parameter. The name is
 * injected into the model system prompt, so this guards against prompt
 * injection: only labels (English, native, or romanized) of a supported
 * language are accepted.
 */
export function isAllowedChatLanguage(language: string): boolean {
  const normalized = normLabel(language)
  if (!normalized) return false
  return LANGUAGES.some(
    (l) =>
      normLabel(l.en) === normalized ||
      normLabel(l.native) === normalized ||
      normLabel(l.roman) === normalized,
  )
}
