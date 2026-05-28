'use client'

import { useState, Suspense } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useRouter, useSearchParams } from 'next/navigation'
import Kai from '@/components/kai/Kai'
import LanguageSelector from '@/components/language/LanguageSelector'
import RomanizationToggle from '@/components/language/RomanizationToggle'
import { Language } from '@/lib/languages'
import { pageVariants } from '@/lib/motion'

function OnboardingContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [selected, setSelected] = useState<Language | null>(null)
  const [romanization, setRomanization] = useState(false)
  const hospitalSlug = searchParams.get('hospital')

  const handleContinue = () => {
    if (!selected) return
    const params = new URLSearchParams({
      lang: selected.code,
      langName: selected.en,
      langNative: selected.native,
      roman: romanization ? '1' : '0',
    })
    if (hospitalSlug) params.set('hospital', hospitalSlug)
    router.push(`/auth?${params.toString()}`)
  }

  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      className="flex flex-col h-screen bg-off-white max-w-[430px] mx-auto"
    >
      <div className="flex flex-col items-center pt-10 pb-4 px-6 gap-4">
        <div className="relative animate-float">
          <Kai size="md" state="waving" interactive={false} />
        </div>
        <div className="bg-white border border-keiro-border rounded-2xl px-4 py-3 text-center shadow-sm max-w-[300px]">
          <p className="text-sm text-keiro-muted">
            Hello! I&apos;m Kai. Let&apos;s make sure we speak the same language.
          </p>
        </div>
        <div className="text-center">
          <h1 className="font-display text-xl font-semibold text-[#0a1f12]">Hi, I&apos;m Kai, your assistant.</h1>
          <p className="text-sm mt-1 text-keiro-muted">What language are you most comfortable in?</p>
        </div>
        <div className="flex items-center justify-between w-full pt-2">
          <RomanizationToggle enabled={romanization} onToggle={() => setRomanization((p) => !p)} />
          <span className="text-xs text-keiro-muted">25+ languages</span>
        </div>
      </div>

      <div className="flex-1 overflow-hidden bg-white border-t border-keiro-border">
        <LanguageSelector
          selected={selected?.code}
          onSelect={setSelected}
          showRomanization={romanization}
        />
      </div>

      <div className="p-4 bg-white border-t border-keiro-border">
        <AnimatePresence>
          {selected && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 8 }}
              className="mb-3 flex items-center gap-3 px-4 py-3 rounded-xl bg-keiro-surface border border-keiro-mid"
            >
              <span className="text-2xl">{selected.flag}</span>
              <div>
                <div className="text-sm font-semibold text-keiro-dark">{selected.en}</div>
                <div className="text-xs text-keiro-mid">{selected.native}</div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        <motion.button
          onClick={handleContinue}
          disabled={!selected}
          className="w-full py-4 rounded-2xl font-semibold text-base transition-all duration-300"
          style={{
            background: selected ? '#1a3d2b' : '#c5edd8',
            color: selected ? 'white' : '#3B6D11',
          }}
          whileTap={selected ? { scale: 0.97 } : {}}
        >
          Continue →
        </motion.button>
      </div>
    </motion.div>
  )
}

export default function OnboardingPage() {
  return (
    <Suspense>
      <OnboardingContent />
    </Suspense>
  )
}
