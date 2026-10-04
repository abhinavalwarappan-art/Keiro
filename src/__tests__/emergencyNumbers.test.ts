import { describe, it, expect } from 'vitest'
import { resolveEmergencyNumber, resolveEmergencyForDevice, FALLBACK_EMERGENCY_NUMBER } from '@/lib/emergencyNumbers'
import { LANGUAGES } from '@/lib/languages'

describe('resolveEmergencyNumber', () => {
  it('returns the country-specific number for a known locale', () => {
    expect(resolveEmergencyNumber('en-US')).toEqual({
      number: '911',
      country: 'the United States',
      isFallback: false,
    })
  })

  it('maps several distinct locales to their correct numbers', () => {
    expect(resolveEmergencyNumber('es-ES').number).toBe('112') // Spain (EU)
    expect(resolveEmergencyNumber('zh-CN').number).toBe('120') // China (medical)
    expect(resolveEmergencyNumber('ja-JP').number).toBe('119') // Japan (ambulance)
    expect(resolveEmergencyNumber('pt-BR').number).toBe('192') // Brazil (SAMU)
    expect(resolveEmergencyNumber('ur-PK').number).toBe('1122') // Pakistan (Rescue)
    expect(resolveEmergencyNumber('no-NO' /* nb-NO region */).number).toBe('113') // Norway
  })

  it('is case-insensitive on the region subtag', () => {
    expect(resolveEmergencyNumber('es-es').number).toBe('112')
  })

  it('falls back to 112 with a note flag when the region is unknown or absent', () => {
    for (const code of [null, undefined, '', 'fr', 'xx', 'en-ZZ']) {
      const result = resolveEmergencyNumber(code)
      expect(result.number).toBe(FALLBACK_EMERGENCY_NUMBER)
      expect(result.country).toBeNull()
      expect(result.isFallback).toBe(true)
    }
  })

  it('never renders a US-only 911 as a global default (regression for the P0)', () => {
    // The bug: 911 was hardcoded for every locale. A non-US locale must not resolve to 911.
    expect(resolveEmergencyNumber('hi-IN').number).not.toBe('911')
    expect(resolveEmergencyNumber('ar-SA').number).not.toBe('911')
    expect(resolveEmergencyNumber(null).number).not.toBe('911')
  })

  it('resolves EVERY supported language to a real country number, never the fallback', () => {
    // Guards against adding a language whose region has no emergency number mapped.
    const missing = LANGUAGES.filter(l => resolveEmergencyNumber(l.code).isFallback).map(l => l.code)
    expect(missing).toEqual([])
  })
})

describe('resolveEmergencyForDevice', () => {
  it('uses where the phone is, not the language: Spanish in Texas dials 911', () => {
    expect(resolveEmergencyForDevice('America/Chicago', 'es-ES')).toMatchObject({ number: '911', isFallback: false })
    expect(resolveEmergencyForDevice('America/Indiana/Indianapolis', 'ta-IN').number).toBe('911')
  })

  it('maps non-US zones to their own numbers', () => {
    expect(resolveEmergencyForDevice('Europe/London', 'en-US').number).toBe('999')
    expect(resolveEmergencyForDevice('Asia/Kolkata', 'en-US').number).toBe('112')
  })

  it('falls back to the language region when the zone is unknown', () => {
    expect(resolveEmergencyForDevice('Etc/UTC', 'ko-KR').number).toBe('119')
    expect(resolveEmergencyForDevice(null, 'ko-KR').number).toBe('119')
  })

  it('falls back to 112 when neither signal resolves', () => {
    expect(resolveEmergencyForDevice(null, null)).toMatchObject({ number: '112', isFallback: true })
  })
})
