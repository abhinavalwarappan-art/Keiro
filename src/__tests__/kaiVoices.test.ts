import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('server-only', () => ({}))
vi.mock('@/lib/env', () => ({ env: { FISH_AUDIO_API_KEY: 'test-key', FISH_AUDIO_VOICE: 'existing-english-voice' } }))
const warn = vi.fn()
vi.mock('@/lib/logger', () => ({ logger: { warn: (...a: unknown[]) => warn(...a), info: vi.fn(), error: vi.fn() } }))

import { FISH_VOICE_BY_LOCALE, resolveFishVoiceId } from '@/lib/kaiVoices'
import { LANGUAGES, normalizeLocale, SUPPORTED_LOCALES } from '@/lib/languages'

/**
 * The verified Fish voice ids, copied from the founder's list as an INDEPENDENT
 * oracle — if someone edits the map (or this table) by mistake, the two disagree
 * and this fails, instead of a language silently getting another one's voice.
 */
const EXPECTED: Record<string, string> = {
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
}

describe('Fish voice routing', () => {
  beforeEach(() => warn.mockClear())

  it('covers exactly the 45 supported locales (English via its existing env voice)', () => {
    expect(SUPPORTED_LOCALES).toHaveLength(45)
    expect(LANGUAGES.map((l) => l.code)).toEqual([...SUPPORTED_LOCALES])
    const mapped = Object.keys(FISH_VOICE_BY_LOCALE).sort()
    expect(mapped).toEqual(SUPPORTED_LOCALES.filter((l) => l !== 'en-US').sort())
  })

  it.each(SUPPORTED_LOCALES.filter((l) => l !== 'en-US'))('%s resolves to its exact verified voice', (locale) => {
    const r = resolveFishVoiceId(locale)
    expect(r).toEqual({ voiceId: EXPECTED[locale], locale, isFallback: false })
  })

  it('has no empty or malformed ids, and no two languages share a voice', () => {
    const ids = Object.values(FISH_VOICE_BY_LOCALE)
    for (const id of ids) expect(id).toMatch(/^[0-9a-f]{32}$/)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('English keeps the pre-existing voice exactly as configured', () => {
    expect(resolveFishVoiceId('en-US')).toEqual({ voiceId: 'existing-english-voice', locale: 'en-US', isFallback: false })
    expect(Object.values(FISH_VOICE_BY_LOCALE)).not.toContain('existing-english-voice')
  })

  it('spot checks: Tamil, Danish, Slovak, Estonian, Lithuanian', () => {
    expect(resolveFishVoiceId('ta-IN').voiceId).toBe('1c0b64f46957499c9caa21e6c1884355')
    expect(resolveFishVoiceId('da-DK').voiceId).toBe('9e4eb32ff11a4bb4a78882c5e74c97c0')
    expect(resolveFishVoiceId('sk-SK').voiceId).toBe('e661fa352fd547d3b389f3d53624ccd7')
    expect(resolveFishVoiceId('et-EE').voiceId).toBe('0fad44527b464734998f70465f7cb262')
    expect(resolveFishVoiceId('lt-LT').voiceId).toBe('b6890ce875884410af087ab788aa7107')
  })

  it('keeps Traditional Chinese and Mandarin distinct, including through aliases', () => {
    expect(resolveFishVoiceId('zh-TW').voiceId).not.toBe(resolveFishVoiceId('zh-CN').voiceId)
    expect(resolveFishVoiceId('zh-Hant').voiceId).toBe(EXPECTED['zh-TW'])
    expect(resolveFishVoiceId('zh-Hans').voiceId).toBe(EXPECTED['zh-CN'])
    expect(resolveFishVoiceId('zh').voiceId).toBe(EXPECTED['zh-CN'])
  })

  it('normalizes legitimate aliases and case', () => {
    expect(normalizeLocale('no')).toBe('nb-NO')
    expect(normalizeLocale('nb')).toBe('nb-NO')
    expect(normalizeLocale('NB-no')).toBe('nb-NO')
    expect(normalizeLocale('ta_in')).toBe('ta-IN')
    expect(normalizeLocale('pt')).toBe('pt-BR')
    expect(resolveFishVoiceId('no')).toEqual({ voiceId: EXPECTED['nb-NO'], locale: 'nb-NO', isFallback: false })
  })

  it('does not guess at bare subtags that are not listed aliases', () => {
    expect(normalizeLocale('ta')).toBeNull()
    expect(normalizeLocale('fr-CA')).toBeNull()
  })

  it.each([['xx-YY'], ['தமிழ்'], [''], [undefined], ['a'.repeat(80)]])(
    'unknown/malformed %s falls back to English explicitly and logs it',
    (input) => {
      const r = resolveFishVoiceId(input as string | undefined)
      expect(r).toEqual({ voiceId: 'existing-english-voice', locale: null, isFallback: true })
      expect(warn).toHaveBeenCalledWith('tts_voice_fallback', '/api/tts', undefined, expect.any(Object))
    },
  )

  it('never falls back for a supported locale', () => {
    for (const locale of SUPPORTED_LOCALES) expect(resolveFishVoiceId(locale).isFallback).toBe(false)
    expect(warn).not.toHaveBeenCalled()
  })
})
