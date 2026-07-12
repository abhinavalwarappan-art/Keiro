/* Marketing-site typefaces.

   Loaded here rather than in app/layout.tsx so the patient app keeps its
   single-typeface (DM Sans) rule.

   TWO faces, with sharply separated jobs:

   1. Inter Tight — display, headings, UI chrome, numerals. This is the
      "engineered" face and it does the overwhelming majority of the work.

      The reason the site read as a boutique magazine rather than as software was
      not the colour or the layout: it was that every heading was a SEMIBOLD SERIF.
      Stripe, Linear and Vercel all run the opposite discipline — a precise
      neo-grotesque whose display sizes get *lighter* and *tighter* as they grow
      (weight 300, tracking -0.025em, leading 1.03), while the small sizes get
      sturdier (weight 500, tracking 0, leading 1.2). Type contrast comes from
      weight and tracking moving in lockstep with size, never from size alone.
      That inversion is most of the "serious engineering team" signal.

   2. Fraunces — kept, but demoted to an accent. It now appears on two or three
      deliberately emotional beats (the mission thesis, the "she is 72" quote) and
      nowhere else. Used everywhere it was wallpaper; used twice it is a voice.

   Both are Latin-only. Anything rendering a *patient's* own language must use
   `.lx-native` (a Noto/system stack — see landing.css), or the glyphs fall back
   to a mismatched font. Never put translated copy in `.lx-display` or `.lx-serif`. */

import { Fraunces, Inter_Tight } from 'next/font/google'

export const interTight = Inter_Tight({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter-tight',
  // 300 display / 400 body / 500 titles / 600 buttons. Nothing heavier: a
  // 700-weight headline is a newspaper, and that is the look we are leaving.
  weight: ['300', '400', '500', '600'],
})

export const fraunces = Fraunces({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-fraunces',
})
