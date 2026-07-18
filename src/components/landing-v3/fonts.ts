/* Marketing-site typefaces — v4 "THE LEDGER" (see DESIGN.md).

   Loaded here rather than in app/layout.tsx so the patient app keeps its
   single-typeface (DM Sans) rule.

   THREE faces, three jobs — the register is "a beautifully kept clinical
   ledger, filled in by someone kind":

   1. Bricolage Grotesque — display and headings. A grotesque with genuine
      warmth: flared joins and humanist quirk that read "friendly product with
      a spine". The opsz axis does the display refinement (big type gets the
      tight display cut, small serif moments stay sturdy). It ships NO italic —
      emphasis inside a heading is weight + the display green, never posture.
      Do not let the browser synthesize an oblique.

   2. IBM Plex Sans — body, UI chrome, card titles, and the human italic
      asides. An engineered document face with real legibility at text sizes
      and the latin-ext + vietnamese coverage a multilingual brand exercises.
      It carries the reading; it never carries the voice.

   3. IBM Plex Mono — the chart voice: running heads, field labels, ISO codes,
      folios, measured values, "KAI · LISTENING". Blood sibling of Plex Sans,
      so the document layer and its annotations share one skeleton.

   All three are Latin-script faces. Anything rendering a *patient's* own
   language must use `.lx-native` (Plex Sans first, then the Noto/system
   stack — see landing.css), or the glyphs fall back to a mismatched font.
   Never put translated copy in `.lx-display` or `.lx-heading`. */

import { Bricolage_Grotesque, IBM_Plex_Sans, IBM_Plex_Mono } from 'next/font/google'

export const bricolage = Bricolage_Grotesque({
  subsets: ['latin', 'latin-ext', 'vietnamese'],
  display: 'swap',
  variable: '--font-bricolage',
  /* Variable wght plus the optical-size axis. wdth is deliberately NOT loaded:
     it stays pinned at 100 and skipping the axis keeps the payload down. */
  axes: ['opsz'],
})

export const plexSans = IBM_Plex_Sans({
  subsets: ['latin', 'latin-ext', 'vietnamese'],
  display: 'swap',
  variable: '--font-plex-sans',
  style: ['normal', 'italic'],
})

export const plexMono = IBM_Plex_Mono({
  subsets: ['latin', 'latin-ext'],
  display: 'swap',
  variable: '--font-plex-mono',
  /* Static family: exactly the two chart weights, nothing else. */
  weight: ['400', '500'],
  preload: false,
})
