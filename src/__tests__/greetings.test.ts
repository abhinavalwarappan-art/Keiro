import { describe, it, expect } from 'vitest'
import { LANGUAGES } from '@/lib/languages'
import { KAI_GREETINGS } from '@/components/landing-v3/greetings'

/* The landing page previously drifted out of sync with the app's language list
   (it advertised 41 while the app supported 45). These tests make that class of
   bug fail the build instead of shipping. */

describe('KAI_GREETINGS', () => {
  it('has a greeting for every language the app supports', () => {
    const missing = LANGUAGES.filter((l) => !KAI_GREETINGS[l.code]).map((l) => l.code)
    expect(missing).toEqual([])
  })

  it('has no greeting for a language that does not exist', () => {
    const known = new Set(LANGUAGES.map((l) => l.code))
    const orphaned = Object.keys(KAI_GREETINGS).filter((code) => !known.has(code))
    expect(orphaned).toEqual([])
  })

  it('mentions Kai by name in every language', () => {
    const missingName = Object.entries(KAI_GREETINGS)
      .filter(([, text]) => !text.includes('Kai'))
      .map(([code]) => code)
    expect(missingName).toEqual([])
  })
})
