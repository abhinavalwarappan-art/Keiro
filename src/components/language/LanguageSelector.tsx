'use client'

import { useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, Check } from 'lucide-react'
import { getLanguageDisplayLines, LANGUAGES, Language } from '@/lib/languages'

interface LanguageSelectorProps {
  selected?: string
  onSelect: (lang: Language) => void
  showRomanization?: boolean
}

export default function LanguageSelector({ selected, onSelect, showRomanization = false }: LanguageSelectorProps) {
  const [query, setQuery] = useState('')
  const listRef = useRef<HTMLDivElement>(null)

  const lowerQuery = query.toLowerCase()
  const filtered = LANGUAGES.filter(
    (lang) =>
      lang.en.toLowerCase().includes(lowerQuery) ||
      lang.native.toLowerCase().includes(lowerQuery) ||
      lang.roman.toLowerCase().includes(lowerQuery),
  )

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="shrink-0 border-b border-border-subtle bg-surface px-4 py-3">
        <div className="flex items-center gap-3 rounded-md border border-border-subtle bg-sunken px-4 py-1 transition-[border-color] duration-150 focus-within:border-brand-ink">
          <Search size={16} className="shrink-0 text-text-tertiary" aria-hidden />
          {/* min-h keeps the field itself a ≥44px target — the padded wrapper
              isn't clickable, so its size doesn't count for touch. */}
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search languages…"
            className="min-h-[44px] flex-1 bg-transparent text-base text-text-primary placeholder:text-text-placeholder focus:outline-none"
            aria-label="Search languages"
          />
        </div>
      </div>

      <div
        ref={listRef}
        className="lang-scroll lang-scroll--light min-h-0 flex-1 touch-pan-y overflow-y-auto overscroll-contain py-1 pr-1"
        role="listbox"
        aria-label="Available languages"
      >
        {filtered.length === 0 ? (
          <p className="px-5 py-6 text-sm text-text-secondary">No languages match your search.</p>
        ) : (
          filtered.map((lang, i) => {
            const isSelected = selected === lang.code
            const displayLines = getLanguageDisplayLines(lang).filter(
              (line) => showRomanization || line.role !== 'roman',
            )
            const primaryLine = displayLines.find((line) => line.role === 'english') ?? displayLines[0]
            const secondaryLines = displayLines.filter((line) => line !== primaryLine)
            return (
              <motion.button
                key={lang.code}
                type="button"
                onClick={() => onSelect(lang)}
                role="option"
                aria-selected={isSelected}
                className={`flex min-h-[60px] w-full items-center gap-4 border-b border-l-2 px-5 py-3.5 text-left transition-colors duration-150 ${
                  isSelected
                    ? 'border-l-brand bg-brand-subtle'
                    : 'border-l-transparent bg-surface hover:bg-sunken'
                } border-b-border-subtle/60`}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: Math.min(i * 0.015, 0.25) }}
                whileTap={{ scale: 0.99 }}
              >
                <span className="shrink-0 text-2xl leading-none">{lang.flag}</span>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-base font-medium text-text-primary">{primaryLine.text}</span>
                    {secondaryLines.map((line) => (
                      <span key={`${line.role}-${line.text}`} className="contents">
                        <span className="text-sm text-text-tertiary">·</span>
                        <span
                          className={
                            line.role === 'roman'
                              ? 'text-xs text-text-tertiary'
                              : 'text-base text-text-secondary'
                          }
                          style={line.role === 'native' ? { direction: lang.rtl ? 'rtl' : 'ltr' } : undefined}
                        >
                          {line.text}
                        </span>
                      </span>
                    ))}
                  </div>
                </div>
                <AnimatePresence>
                  {isSelected && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      exit={{ scale: 0 }}
                      className="flex size-6 shrink-0 items-center justify-center rounded-full bg-brand-ink"
                      aria-hidden
                    >
                      <Check size={13} color="white" strokeWidth={2.5} />
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.button>
            )
          })
        )}
      </div>
    </div>
  )
}