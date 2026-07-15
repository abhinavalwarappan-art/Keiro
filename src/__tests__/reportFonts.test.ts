import { describe, it, expect, vi } from 'vitest'

// reportFonts imports 'server-only', which throws outside an RSC bundle — stub it.
vi.mock('server-only', () => ({}))
import { buildReportFontStyle } from '@/lib/reportFonts'

describe('buildReportFontStyle', () => {
  const style = buildReportFontStyle()

  it('emits one @font-face per bundled script under the NotoReport family', () => {
    const faces = style.match(/@font-face/g) ?? []
    expect(faces.length).toBe(8) // latin, cyrillic, greek, arabic, devanagari, sc, jp, kr
    expect(style).toContain("font-family:'NotoReport'")
  })

  it('inlines each font as a woff2 data-URI (fonts travel with the document)', () => {
    const dataUris = style.match(/src:url\(data:font\/woff2;base64,[A-Za-z0-9+/=]+\)/g) ?? []
    expect(dataUris.length).toBe(8)
    // Each embedded font is non-trivial (the CJK subset alone is ~1MB → big base64).
    for (const uri of dataUris) expect(uri.length).toBeGreaterThan(1000)
  })

  it('scopes the key non-Latin scripts with unicode-range so the right font is picked', () => {
    expect(style).toMatch(/unicode-range:[^;]*U\+4E00-9FFF/) // CJK Han
    expect(style).toMatch(/unicode-range:[^;]*U\+0600-06FF/) // Arabic
    expect(style).toMatch(/unicode-range:[^;]*U\+0900-097F/) // Devanagari
    expect(style).toMatch(/unicode-range:[^;]*U\+0400-052F/) // Cyrillic
  })
})
