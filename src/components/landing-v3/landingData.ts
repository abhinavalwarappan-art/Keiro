export type Language = {
  /** ISO 3166-1 alpha-2 region used to render the flag emoji client-side. */
  region: string
  name: string
  native: string
  code: string
}

export const languages: Language[] = [
  { region: 'US', name: 'English', native: 'English', code: 'en' },
  { region: 'ES', name: 'Spanish', native: 'Español', code: 'es' },
  { region: 'CN', name: 'Mandarin', native: '普通话', code: 'zh' },
  { region: 'IN', name: 'Hindi', native: 'हिन्दी', code: 'hi' },
  { region: 'SA', name: 'Arabic', native: 'العربية', code: 'ar' },
  { region: 'BR', name: 'Portuguese', native: 'Português', code: 'pt' },
  { region: 'FR', name: 'French', native: 'Français', code: 'fr' },
  { region: 'RU', name: 'Russian', native: 'Русский', code: 'ru' },
  { region: 'VN', name: 'Vietnamese', native: 'Tiếng Việt', code: 'vi' },
  { region: 'KR', name: 'Korean', native: '한국어', code: 'ko' },
  { region: 'PH', name: 'Tagalog', native: 'Tagalog', code: 'tl' },
  { region: 'PK', name: 'Urdu', native: 'اردو', code: 'ur' },
  { region: 'IN', name: 'Tamil', native: 'தமிழ்', code: 'ta' },
  { region: 'IN', name: 'Telugu', native: 'తెలుగు', code: 'te' },
  { region: 'IN', name: 'Gujarati', native: 'ગુજરાતી', code: 'gu' },
  { region: 'JP', name: 'Japanese', native: '日本語', code: 'ja' },
  { region: 'TR', name: 'Turkish', native: 'Türkçe', code: 'tr' },
  { region: 'BD', name: 'Bengali', native: 'বাংলা', code: 'bn' },
  { region: 'KE', name: 'Swahili', native: 'Kiswahili', code: 'sw' },
  { region: 'ID', name: 'Indonesian', native: 'Bahasa Indonesia', code: 'id' },
  { region: 'IN', name: 'Malayalam', native: 'മലയാളം', code: 'ml' },
  { region: 'DE', name: 'German', native: 'Deutsch', code: 'de' },
  { region: 'IT', name: 'Italian', native: 'Italiano', code: 'it' },
  { region: 'PL', name: 'Polish', native: 'Polski', code: 'pl' },
  { region: 'UA', name: 'Ukrainian', native: 'Українська', code: 'uk' },
  { region: 'NL', name: 'Dutch', native: 'Nederlands', code: 'nl' },
  { region: 'GR', name: 'Greek', native: 'Ελληνικά', code: 'el' },
  { region: 'CZ', name: 'Czech', native: 'Čeština', code: 'cs' },
  { region: 'RO', name: 'Romanian', native: 'Română', code: 'ro' },
  { region: 'SE', name: 'Swedish', native: 'Svenska', code: 'sv' },
  { region: 'DK', name: 'Danish', native: 'Dansk', code: 'da' },
  { region: 'FI', name: 'Finnish', native: 'Suomi', code: 'fi' },
  { region: 'NO', name: 'Norwegian', native: 'Norsk', code: 'no' },
  { region: 'HU', name: 'Hungarian', native: 'Magyar', code: 'hu' },
  { region: 'BG', name: 'Bulgarian', native: 'Български', code: 'bg' },
  { region: 'TW', name: 'Chinese (Traditional)', native: '繁體中文', code: 'zh-TW' },
  { region: 'SK', name: 'Slovak', native: 'Slovenčina', code: 'sk' },
  { region: 'SI', name: 'Slovenian', native: 'Slovenščina', code: 'sl' },
  { region: 'EE', name: 'Estonian', native: 'Eesti', code: 'et' },
  { region: 'LV', name: 'Latvian', native: 'Latviešu', code: 'lv' },
  { region: 'LT', name: 'Lithuanian', native: 'Lietuvių', code: 'lt' },
]

/* ============================================================================
   ⚠️  UNREVIEWED TRANSLATIONS — NEEDS NATIVE SPEAKER CHECK BEFORE LAUNCH  ⚠️
   ----------------------------------------------------------------------------
   STATUS: draft. Cleared for the investor/technical demo only (2026-07-11,
   founder call). NOT cleared for production / public launch.

   Every `text` below except `en` was machine-authored and has NOT been verified
   by a native speaker. Do not treat these as verified copy, do not copy them
   into src/i18n/locales/, and do not reuse them anywhere a patient makes a
   medical decision.

   Why this matters more here than anywhere else in the app: this section exists
   purely to earn an anxious, non-English-speaking patient's trust by showing
   them their own language rendered correctly. A grammatically wrong sentence in
   someone's mother tongue destroys exactly the trust it was built to earn — it
   is worse than showing nothing. This repo has already shipped mistranslations
   once (the patient-intake sex labels, fixed across 16 locales in c5515ef).

   BEFORE LAUNCH: get each line signed off by a speaker, then delete this banner.
   Adding a new language here without a reviewed greeting is a regression.

   `rtl` drives dir="rtl" on the rendered bubble.
   ========================================================================== */
export type Greeting = {
  code: string
  region: string
  /** Endonym — always written in the language's own script. */
  label: string
  /**
   * ⚠️ UNREVIEWED — needs native speaker check. Demo-only; not launch-ready.
   * See the banner above `heroGreetings`. Do not reuse outside the landing hero.
   */
  text: string
  rtl?: boolean
}

export const heroGreetings: Greeting[] = [
  {
    code: 'en',
    region: 'US',
    label: 'English',
    text: "Hello, I'm Kai. Tell me what hurts — in your own words. I'll explain it to your doctor.",
  },
  {
    code: 'es',
    region: 'ES',
    label: 'Español',
    text: 'Hola, soy Kai. Cuéntame qué te duele, con tus propias palabras. Yo se lo explicaré a tu médico.',
  },
  {
    code: 'zh',
    region: 'CN',
    label: '普通话',
    text: '你好，我是 Kai。用你自己的话告诉我哪里不舒服，我会替你转达给医生。',
  },
  {
    code: 'hi',
    region: 'IN',
    label: 'हिन्दी',
    text: 'नमस्ते, मैं Kai हूँ। अपने शब्दों में बताइए कि कहाँ दर्द है। मैं आपके डॉक्टर को समझा दूँगा।',
  },
  {
    code: 'ar',
    region: 'SA',
    label: 'العربية',
    text: 'مرحباً، أنا Kai. أخبرني بما يؤلمك بكلماتك الخاصة، وسأشرح ذلك لطبيبك.',
    rtl: true,
  },
  {
    code: 'vi',
    region: 'VN',
    label: 'Tiếng Việt',
    text: 'Xin chào, tôi là Kai. Hãy nói cho tôi biết bạn đau ở đâu, bằng lời của bạn. Tôi sẽ giải thích cho bác sĩ của bạn.',
  },
  {
    code: 'tl',
    region: 'PH',
    label: 'Tagalog',
    text: 'Kumusta, ako si Kai. Sabihin mo sa akin kung saan masakit, sa sarili mong salita. Ipapaliwanag ko ito sa doktor mo.',
  },
  {
    code: 'zh-TW',
    region: 'TW',
    label: '繁體中文',
    text: '你好，我是 Kai。用你自己的話告訴我哪裡不舒服，我會替你轉達給醫生。',
  },
  {
    code: 'ko',
    region: 'KR',
    label: '한국어',
    text: '안녕하세요, 저는 Kai입니다. 어디가 아픈지 편하게 말씀해 주세요. 제가 의사 선생님께 전해 드릴게요.',
  },
  {
    code: 'ru',
    region: 'RU',
    label: 'Русский',
    text: 'Здравствуйте, я Kai. Расскажите своими словами, что у вас болит. Я объясню это вашему врачу.',
  },
  {
    code: 'pt',
    region: 'BR',
    label: 'Português',
    text: 'Olá, eu sou o Kai. Me conte o que está doendo, com as suas palavras. Eu explico ao seu médico.',
  },
  {
    code: 'ur',
    region: 'PK',
    label: 'اردو',
    text: 'السلام علیکم، میں Kai ہوں۔ اپنے الفاظ میں بتائیے کہ کہاں تکلیف ہے۔ میں آپ کے ڈاکٹر کو سمجھا دوں گا۔',
    rtl: true,
  },
  {
    code: 'bn',
    region: 'BD',
    label: 'বাংলা',
    text: 'নমস্কার, আমি Kai। নিজের ভাষায় বলুন কোথায় ব্যথা করছে। আমি আপনার ডাক্তারকে বুঝিয়ে বলব।',
  },
  {
    code: 'fr',
    region: 'FR',
    label: 'Français',
    text: 'Bonjour, je suis Kai. Dites-moi ce qui vous fait mal, avec vos mots. Je l’expliquerai à votre médecin.',
  },
]

export type Step = {
  id: string
  title: string
  body: string
}

export const steps: Step[] = [
  {
    id: '01',
    title: 'You talk. Kai listens.',
    body: 'Pick the language you use at home, then say what hurts — out loud, or typed if you prefer. There is no form to fill in. Most people take about five minutes.',
  },
  {
    id: '02',
    title: 'Kai writes it down.',
    body: 'Kai turns what you said into clear clinical notes, without changing what you meant. If something is unclear, Kai asks you — it never guesses.',
  },
  {
    id: '03',
    title: 'Your doctor reads it first.',
    body: 'Before you sit down, your doctor already knows why you came in. You do not have to start the story over in a language you are still finding.',
  },
]
