import 'server-only'
import { env } from './env'
import { logger } from './logger'
import { normalizeLocale, type SupportedLocale } from './languages'

/**
 * Which Fish Audio voice Kai speaks with, per language — the ONE place to
 * change it. Server-only: these are voice (reference) ids, not secrets, but
 * the browser never needs them — it sends a locale and the server decides.
 *
 * English is not listed here on purpose: it is Kai's original voice, configured
 * as `FISH_AUDIO_VOICE` in the deploy environment, and is read from there
 * unchanged. Every other supported locale must have an entry — the Record type
 * below makes a missing (or extra) language a compile error, so adding a
 * language to `LANGUAGES` without a voice cannot ship.
 *
 * Never add an id here that hasn't been verified in the Fish dashboard: an
 * unknown id fails that language's audio and the patient hears the device voice.
 */
type NonEnglishLocale = Exclude<SupportedLocale, 'en-US'>

export const FISH_VOICE_BY_LOCALE = {
  'es-ES': '8bc9b77a96b1486999c72d4c77c752a9',
  'zh-CN': '7c954313fb4b4fa18cc723b7e84b8aa4',
  'hi-IN': '96d215865cae4f7bbc25b2c44fc56503',
  'ar-SA': 'a2a7296c90ca41b08c8e8098687abfbf',
  'vi-VN': '9dfcb5bc6ab54a90965fad68cb0cc276',
  'ko-KR': '270f7f922fa8499ea3cb273deb1f4b20',
  'tl-PH': '5e801155e72c40d091d1c40a8d6d8767',
  'ur-PK': 'edcd5351e82d443eb5ceb7a70dd6c595',
  'ta-IN': '1c0b64f46957499c9caa21e6c1884355',
  'te-IN': 'ebc6294534bc419284e498806156f328',
  'gu-IN': '6263b030ad79434a9c70527f6698cb08',
  'pa-IN': 'f805fd4b9ae74dafa9393cffb9c18adb',
  'fr-FR': '9a7537aac3dc4f698987db5b551d1ab0',
  'de-DE': '1eefb4c7836b4bdcb49ff8ad296dd177',
  'pt-BR': 'b5cc5734d73545f494b8dfdd226d9666',
  'ja-JP': '8011988e71f442e6b86b8e4b06bae7f7',
  'ru-RU': '60316a86c291457599b846bc069018af',
  'tr-TR': '15279f5c2adf4a8e993b2343745f2683',
  'fa-IR': 'b801cb3e3f244e1b867f360750b00c50',
  'am-ET': 'bdad2f541ceb43aa96f79bb3bbc85b6b',
  'sw-KE': '3af454ad58124bae925af285088603ed',
  'so-SO': '07f5a895511646d3b6e374e1a245e884',
  'id-ID': '74be2b2bfa2d425faa4c7d4a21b418a1',
  'pl-PL': '69c19ed10b7c4526832b3cd24dac5bf6',
  'uk-UA': 'f67748d631d14acc905b377e64abc230',
  'bn-BD': 'e9b1d2dcd5d543dfaf4df7a75208a634',
  'ml-IN': 'f68a47b0cb1e486eba0d7667fb4c982d',
  'it-IT': 'c4efe31e1db04864818f0fd04aac18de',
  'nl-NL': 'ae3013478536467987be7a99631bb5ad',
  'el-GR': '7619fa7994dd43bdb35a0a04203ea79b',
  'cs-CZ': '75fa9778bcd34e43a965a4835d895e1f',
  'ro-RO': 'bc84ced26d7849eea76eba15ec02f52f',
  'sv-SE': '04905a05d34a47388a26420f324ee0cf',
  'da-DK': '9e4eb32ff11a4bb4a78882c5e74c97c0',
  'fi-FI': '7c9015a229194815a1af1342c529eee6',
  'nb-NO': '590b0b50348047f69495dd082571702d',
  'hu-HU': '599ff22812dc41808ef13b3c398920ec',
  'bg-BG': '1a201bdf93ab4f21a76fedc54b3ce2f7',
  'zh-TW': '9d04f568a9044256bdb9476a162857d6',
  'sk-SK': 'e661fa352fd547d3b389f3d53624ccd7',
  'sl-SI': 'bbb06e4fdd8e464ca4b5e18792fc1106',
  'et-EE': '0fad44527b464734998f70465f7cb262',
  'lv-LV': 'c4d3c29df45144e6a2e4ac26590afe4d',
  'lt-LT': 'b6890ce875884410af087ab788aa7107',
} as const satisfies Readonly<Record<NonEnglishLocale, string>>

/** Kai's original English voice, exactly as configured for the deploy. */
function englishVoiceId(): string | undefined {
  return env.FISH_AUDIO_VOICE?.trim() || undefined
}

export interface FishVoiceResolution {
  /** The Fish reference id to synthesize with; undefined only when even English is unconfigured. */
  voiceId: string | undefined
  /** The supported locale the voice was chosen for, or null when the input wasn't one. */
  locale: SupportedLocale | null
  /** True when the English voice is standing in for an unknown or malformed locale. */
  isFallback: boolean
}

/**
 * Resolve the Fish voice for a locale. A supported locale always gets its own
 * voice; English stands in ONLY for input that isn't a supported locale at all
 * (unknown, malformed, or absent) — and that fallback is logged, so a routing
 * bug can never quietly give a Tamil speaker the English voice.
 */
export function resolveFishVoiceId(input: string | null | undefined): FishVoiceResolution {
  const locale = normalizeLocale(input)
  if (locale === 'en-US') return { voiceId: englishVoiceId(), locale, isFallback: false }
  if (locale) return { voiceId: FISH_VOICE_BY_LOCALE[locale], locale, isFallback: false }

  // Log the shape of what arrived (bounded, no text), never the request body.
  const received = typeof input === 'string' ? input.trim().slice(0, 20) : input === undefined ? 'missing' : 'invalid'
  logger.warn('tts_voice_fallback', '/api/tts', undefined, { received })
  return { voiceId: englishVoiceId(), locale: null, isFallback: true }
}
