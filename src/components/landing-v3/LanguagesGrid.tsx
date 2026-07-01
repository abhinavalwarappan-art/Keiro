'use client'

/* ====================== SECTION — LANGUAGES SPIRAL ========================
   Scroll-driven ring: one language faces you at a time. Tap → onboarding confirm.
   ========================================================================== */

import SpiralLanguageScroll from '@/components/language/SpiralLanguageScroll'

export function LanguagesGrid() {
  return <SpiralLanguageScroll embedded sectionId="languages" />
}