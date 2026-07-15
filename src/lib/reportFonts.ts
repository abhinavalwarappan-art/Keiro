import 'server-only'
import { readFileSync } from 'node:fs'
import path from 'node:path'

/**
 * Noto font faces embedded into the report HTML as base64 `@font-face` data-URIs.
 *
 * Why embed instead of relying on system/bundled fonts: serverless Chromium
 * (@sparticuz/chromium) ships almost no fonts, so CJK/Arabic/Indic rendered as tofu in
 * production even though local dev looked fine (macOS has those fonts). Carrying the
 * fonts INSIDE the document removes that dependency entirely — the same HTML renders
 * identically in dev and on Vercel, because the glyphs travel with it.
 *
 * All faces share one family ("NotoReport") scoped by `unicode-range`, so the browser
 * picks the right font per script. Ranges are disjoint to avoid ambiguity. Total ~2.7MB
 * (subset woff2), read once and cached per warm function instance.
 *
 * Coverage: Latin, Cyrillic, Greek, Arabic, Devanagari, CJK (Simplified Han), Japanese
 * kana, Korean Hangul. Other Indic scripts the app supports (Tamil, Telugu, Bengali,
 * Gujarati, Malayalam, Gurmukhi, Amharic) are a follow-up: drop the Noto subset in
 * src/lib/fonts and add a row below — the mechanism is identical.
 */

interface FontFace {
  file: string
  unicodeRange: string
}

const FONT_DIR = path.join(process.cwd(), 'src', 'lib', 'fonts')

const FONT_FACES: FontFace[] = [
  { file: 'noto-sans-latin.woff2', unicodeRange: 'U+0000-024F, U+2000-206F, U+20A0-20BF, U+2212' },
  { file: 'noto-sans-cyrillic.woff2', unicodeRange: 'U+0400-052F, U+2116' },
  { file: 'noto-sans-greek.woff2', unicodeRange: 'U+0370-03FF, U+1F00-1FFF' },
  { file: 'noto-sans-arabic.woff2', unicodeRange: 'U+0600-06FF, U+0750-077F, U+08A0-08FF, U+FB50-FDFF, U+FE70-FEFF' },
  { file: 'noto-sans-devanagari.woff2', unicodeRange: 'U+0900-097F, U+1CD0-1CFF, U+A8E0-A8FF' },
  { file: 'noto-sans-sc.woff2', unicodeRange: 'U+3000-303F, U+3400-4DBF, U+4E00-9FFF, U+F900-FAFF, U+FF00-FFEF' },
  { file: 'noto-sans-jp.woff2', unicodeRange: 'U+3040-309F, U+30A0-30FF, U+31F0-31FF' },
  { file: 'noto-sans-kr.woff2', unicodeRange: 'U+1100-11FF, U+3130-318F, U+AC00-D7AF' },
]

let cachedStyle: string | null = null

/** A `<style>` block of `@font-face` rules with the fonts inlined as data-URIs. */
export function buildReportFontStyle(): string {
  if (cachedStyle) return cachedStyle
  const faces = FONT_FACES.map(({ file, unicodeRange }) => {
    const base64 = readFileSync(path.join(FONT_DIR, file)).toString('base64')
    return (
      `@font-face{font-family:'NotoReport';font-style:normal;font-weight:400;` +
      `font-display:block;src:url(data:font/woff2;base64,${base64}) format('woff2');` +
      `unicode-range:${unicodeRange};}`
    )
  }).join('')
  cachedStyle = `<style id="report-fonts">${faces}</style>`
  return cachedStyle
}
