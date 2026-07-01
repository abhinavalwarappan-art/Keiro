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

export type Step = {
  id: string
  title: string
  body: string
}

export const steps: Step[] = [
  {
    id: '01',
    title: 'You speak',
    body: 'Choose the language you use at home. Then say what hurts, what changed, and what you are worried about.',
  },
  {
    id: '02',
    title: 'Kai interprets',
    body: 'Kai keeps your meaning intact and turns everyday words into clear medical context.',
  },
  {
    id: '03',
    title: 'Doctor reads',
    body: 'Before the visit starts, your doctor sees a clean English summary with the important details.',
  },
]