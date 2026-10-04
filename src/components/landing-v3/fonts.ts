/* Marketing-site typefaces.

   Loaded here rather than in app/layout.tsx so the patient app keeps its
   single-typeface (DM Sans) rule.

   THREE faces, with sharply separated jobs — the register is "a clinician's
   letterhead, read aloud by someone kind":

   1. Literata — display, headings, and the emotional beats. A book face,
      designed to be read slowly and patiently, which is the product promise
      ("Kai will wait as long as you need") set in type. Warm, humanist
      detailing; nothing newspaper about it at 400–500 with the optical-size
      axis doing the display work. Emphasis inside a heading is the SAME face
      in italic plus the accent green — a posture shift, not a font swap.

   2. Source Sans 3 — body, UI chrome, buttons, card titles. A humanist sans
      built for legibility at text sizes, with the Latin-ext + Vietnamese
      coverage a multilingual brand actually exercises. It carries the reading;
      it never carries the voice.

   3. Spline Sans Mono — the clinical-utility layer: eyebrows, field labels,
      ISO language codes, step indices, anything that should read as *charted*
      rather than written. One mono, one tracking, everywhere.

   All three are Latin-script faces. Anything rendering a *patient's* own
   language must use `.lx-native` (Source Sans 3 first, then the Noto/system
   stack — see landing.css), or the glyphs fall back to a mismatched font.
   Never put translated copy in `.lx-display` or `.lx-serif`. */

import { Literata, Source_Sans_3, Spline_Sans_Mono } from 'next/font/google'
import { GeistSans } from 'geist/font/sans'

/* Geist — the product face for the redesigned shell (nav, home). Latin only,
   like the others: patient-language text still goes through `.lx-native`. */
export const geistSans = GeistSans

export const literata = Literata({
  subsets: ['latin', 'latin-ext', 'vietnamese'],
  display: 'swap',
  variable: '--font-literata',
  style: ['normal', 'italic'],
  // Variable font: full weight axis, plus the optical-size axis — opsz is what
  // keeps 56px headings airy while small serif moments stay sturdy.
  axes: ['opsz'],
})

export const sourceSans = Source_Sans_3({
  subsets: ['latin', 'latin-ext', 'vietnamese'],
  display: 'swap',
  variable: '--font-source-sans',
})

export const splineMono = Spline_Sans_Mono({
  subsets: ['latin', 'latin-ext'],
  display: 'swap',
  variable: '--font-spline-mono',
})
