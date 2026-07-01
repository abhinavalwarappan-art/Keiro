'use client'

import { useRef, useState } from 'react'
import { Search } from 'lucide-react'
import Kai from '@/components/kai/Kai'
import { getLanguageDisplayLines, LANGUAGES, type Language } from '@/lib/languages'
import { trackLanguageSelected } from '@/lib/analytics'

interface AppLanguagePickerProps {
  onSelect: (lang: Language) => void
}

/** Simple, high-contrast language list for app entry — easier for older users than the landing spiral. */
export default function AppLanguagePicker({ onSelect }: AppLanguagePickerProps) {
  const [query, setQuery] = useState('')
  const listRef = useRef<HTMLDivElement>(null)

  const lowerQuery = query.toLowerCase()
  const filtered = LANGUAGES.filter(
    (lang) =>
      lang.en.toLowerCase().includes(lowerQuery) ||
      lang.native.toLowerCase().includes(lowerQuery) ||
      lang.roman.toLowerCase().includes(lowerQuery),
  )

  const handleSelect = (lang: Language) => {
    trackLanguageSelected(lang.code)
    try {
      localStorage.setItem('keiro-roman', '0')
    } catch {
      // localStorage unavailable (private browsing, storage quota, etc.)
    }
    onSelect(lang)
  }

  return (
    <div className="mx-auto flex h-dvh min-h-0 w-full max-w-lg flex-col bg-transparent">
      <header className="shrink-0 px-5 pb-4 pt-6 text-center sm:pt-8">
        <div className="mx-auto flex justify-center">
          <Kai size="md" state="waving" interactive={false} />
        </div>
        <h1 className="mt-3 font-display text-2xl font-semibold tracking-tight text-white">
          Choose your language
        </h1>
        <p className="mt-1.5 text-sm leading-relaxed text-white/55">
          Tap your language, then confirm on the next screen.
        </p>
      </header>

      <div className="shrink-0 px-5 pb-3">
        <div className="flex items-center gap-3 rounded-xl border border-white/15 bg-white/8 px-4 py-3 backdrop-blur-md">
          <Search size={18} className="shrink-0 text-white/45" aria-hidden />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search languages…"
            className="flex-1 bg-transparent text-base text-white placeholder:text-white/35 focus:outline-none"
            aria-label="Search languages"
            autoComplete="off"
            enterKeyHint="search"
          />
        </div>
      </div>

      <div
        ref={listRef}
        data-lenis-prevent
        className="lang-scroll lang-scroll--dark min-h-0 flex-1 touch-pan-y overflow-y-auto overscroll-contain px-3 pb-6"
        role="listbox"
        aria-label="Available languages"
      >
        {filtered.length === 0 ? (
          <p className="px-4 py-8 text-center text-base text-white/55">No languages match your search.</p>
        ) : (
          filtered.map((lang) => {
            const displayLines = getLanguageDisplayLines(lang)
            const primaryLine = displayLines.find((line) => line.role === 'english') ?? displayLines[0]
            const secondaryLines = displayLines.filter((line) => line !== primaryLine)

            return (
              <button
                key={lang.code}
                type="button"
                onClick={() => handleSelect(lang)}
                role="option"
                aria-selected={false}
                className="mb-2 flex min-h-[68px] w-full items-center gap-4 rounded-xl border border-white/10 bg-white/6 px-4 py-3.5 text-left transition-colors hover:border-white/20 hover:bg-white/10 active:scale-[0.99]"
              >
                <span className="shrink-0 text-3xl leading-none">{lang.flag}</span>
                <div className="min-w-0 flex-1">
                  <div className="text-lg font-semibold leading-tight text-white">{primaryLine.text}</div>
                  <div className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-0.5">
                    {secondaryLines.map((line) => (
                      <span
                        key={`${line.role}-${line.text}`}
                        className={
                          line.role === 'roman'
                            ? 'text-sm text-white/45'
                            : 'text-base text-white/75'
                        }
                        style={line.role === 'native' ? { direction: lang.rtl ? 'rtl' : 'ltr' } : undefined}
                      >
                        {line.text}
                      </span>
                    ))}
                  </div>
                </div>
              </button>
            )
          })
        )}
      </div>
    </div>
  )
}