import { describe, it, expect, vi } from 'vitest'

/**
 * The routing table is the whole feature: a patient must get their own script
 * back. Fish writes the eight languages below in the wrong script entirely
 * (Telugu as Latin, Bengali as Devanagari, Gujarati as Perso-Arabic…), so if
 * one of them ever falls back to Fish, that patient's words become unreadable
 * to them AND to the doctor reading the report — while still looking like a
 * successful transcription.
 */

vi.mock('server-only', () => ({}))
vi.mock('@/lib/env', () => ({
  env: { FISH_AUDIO_API_KEY: 'test-key', FISH_AUDIO_VOICE: 'test-voice' },
}))

import { providerFor } from '@/lib/transcription'
import { LANGUAGES } from '@/lib/languages'

/** Verified against both providers on 2026-08-16 — see lib/transcription.ts. */
const WRONG_SCRIPT_ON_FISH = ['ta', 'te', 'gu', 'pa', 'fa', 'am', 'bn', 'ml']

describe('providerFor', () => {
  it('routes every language Fish writes in the wrong script to Gemini', () => {
    for (const primary of WRONG_SCRIPT_ON_FISH) {
      const lang = LANGUAGES.find(l => l.code.split('-')[0] === primary)
      expect(lang, `${primary} should still be one of the 45`).toBeDefined()
      expect(providerFor(lang!.code), `${lang!.en} must not go to Fish`).toBe('gemini')
    }
  })

  it('keeps the languages Fish gets right on Fish', () => {
    // Verified word-perfect in native script on Fish; moving these would trade
    // a ~1s transcription for a slower one with no accuracy gain.
    for (const code of ['en-US', 'vi-VN', 'hi-IN', 'zh-CN', 'zh-TW', 'ar-SA', 'ru-RU', 'ko-KR', 'ja-JP']) {
      expect(providerFor(code), `${code} should stay on Fish`).toBe('fish')
    }
  })

  it('assigns a provider to all 45 languages', () => {
    for (const lang of LANGUAGES) {
      expect(['fish', 'gemini']).toContain(providerFor(lang.code))
    }
  })

  it('routes on the language, not the region', () => {
    expect(providerFor('ta-IN')).toBe('gemini')
    expect(providerFor('ta')).toBe('gemini')
    expect(providerFor('TA-in')).toBe('gemini')
  })

  it('falls back to Fish auto-detect when no language is known yet', () => {
    expect(providerFor(undefined)).toBe('fish')
    expect(providerFor('')).toBe('fish')
  })
})
