'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, Check } from 'lucide-react'
import { LANGUAGES, Language } from '@/lib/languages'

interface LanguageSelectorProps {
  selected?: string
  onSelect: (lang: Language) => void
  showRomanization?: boolean
}

export default function LanguageSelector({ selected, onSelect, showRomanization = false }: LanguageSelectorProps) {
  const [query, setQuery] = useState('')

  const filtered = LANGUAGES.filter(lang =>
    lang.en.toLowerCase().includes(query.toLowerCase()) ||
    lang.native.toLowerCase().includes(query.toLowerCase()) ||
    lang.roman.toLowerCase().includes(query.toLowerCase())
  )

  return (
    <div className="flex flex-col gap-0 h-full">
      <div className="px-4 py-3 sticky top-0 z-10" style={{ background: 'white', borderBottom: '1px solid #c5edd8' }}>
        <div className="flex items-center gap-2 px-3 py-2 rounded-xl" style={{ background: '#f8fffe', border: '1.5px solid #c5edd8' }}>
          <Search size={15} style={{ color: '#3B6D11' }} />
          <input
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search languages..."
            className="flex-1 outline-none text-sm bg-transparent"
            style={{ color: '#0f2419' }}
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {filtered.map((lang, i) => {
          const isSelected = selected === lang.code
          return (
            <motion.button
              key={lang.code}
              onClick={() => onSelect(lang)}
              className="w-full flex items-center gap-3 px-4 py-3.5 text-left transition-all"
              style={{
                background: isSelected ? '#d4f5e5' : 'white',
                borderBottom: '1px solid #edfaf4',
              }}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: Math.min(i * 0.02, 0.3) }}
              whileTap={{ scale: 0.98 }}
            >
              <span className="text-2xl leading-none">{lang.flag}</span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-sm" style={{ color: '#0f2419' }}>{lang.en}</span>
                  <span className="text-sm" style={{ color: '#3B6D11' }}>·</span>
                  <span
                    className="text-sm"
                    style={{ color: '#0f2419', direction: lang.rtl ? 'rtl' : 'ltr' }}
                  >
                    {lang.native}
                  </span>
                </div>
                {showRomanization && (
                  <div className="text-xs mt-0.5" style={{ color: '#3B6D11' }}>{lang.roman}</div>
                )}
              </div>
              <AnimatePresence>
                {isSelected && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0 }}
                    className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0"
                    style={{ background: '#2da866' }}
                  >
                    <Check size={13} color="white" strokeWidth={3} />
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.button>
          )
        })}
      </div>
    </div>
  )
}
