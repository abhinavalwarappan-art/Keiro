/* Fraunces — landing-only display face.
   Loaded here rather than in app/layout.tsx so the rest of the app keeps its
   single-typeface (DM Sans) rule. Fraunces covers Latin only; anything that
   renders a patient's own language must use `.lx-native` instead (see landing.css). */

import { Fraunces } from 'next/font/google'

export const fraunces = Fraunces({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-fraunces',
})
