'use client'

import { useMemo, useState, useSyncExternalStore } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { Search } from 'lucide-react'
import Kai from '@/components/kai/Kai'
import { getLanguageDisplayLines, LANGUAGES, resolveLanguage, type Language } from '@/lib/languages'
import { trackLanguageSelected } from '@/lib/analytics'

interface AppLanguagePickerProps {
  onSelect: (lang: Language) => void
}

/** Press feedback is a tight spring: it starts on pointer-down and can be
 *  re-targeted mid-flight, so a fast tap never waits on an animation. */
const PRESS_SPRING = { type: 'spring', stiffness: 700, damping: 45 } as const

/** Code of the first browser language Keiro supports, or '' (also the server
 *  snapshot, so hydration matches and the suggestion appears after mount). */
function getDeviceLanguageCode(): string {
  for (const tag of navigator.languages ?? [navigator.language]) {
    const match = resolveLanguage(tag) ?? resolveLanguage(tag.split('-')[0])
    if (match) return match.code
  }
  return ''
}
const subscribeNever = () => () => {}
const getServerDeviceLanguageCode = () => ''

function LanguageRow({ lang, onPick }: { lang: Language; onPick: (lang: Language) => void }) {
  const reduceMotion = useReducedMotion()
  const lines = getLanguageDisplayLines(lang)
  // A patient reads their own script first; English is the helper line.
  const primary = lines.find((l) => l.role === 'native') ?? lines[0]
  const secondary = lines.filter((l) => l !== primary && l.role === 'english')
  const dir = lang.rtl ? 'rtl' : 'ltr'

  return (
    <motion.button
      type="button"
      onClick={() => onPick(lang)}
      role="option"
      aria-selected={false}
      whileTap={reduceMotion ? undefined : { scale: 0.985 }}
      transition={PRESS_SPRING}
      className="flex min-h-[72px] w-full items-center gap-4 px-5 py-3 text-start transition-colors duration-100 active:bg-brand-muted hover:bg-brand-subtle focus-visible:bg-brand-subtle"
    >
      <span className="shrink-0 text-[1.75rem] leading-none" aria-hidden>
        {lang.flag}
      </span>
      <span className="min-w-0 flex-1">
        <span
          lang={lang.googleCode}
          dir={dir}
          className="block text-left text-xl font-semibold leading-snug text-text-primary"
        >
          {primary.text}
        </span>
        {secondary.map((l) => (
          <span key={l.text} className="block text-base leading-snug text-text-secondary">
            {l.text}
          </span>
        ))}
      </span>
    </motion.button>
  )
}

/** Language list for app entry. Built for the person who may not read the page
 *  heading: every row is in its own script, the device language leads, and each
 *  target is a full-width 72px row. */
export default function AppLanguagePicker({ onSelect }: AppLanguagePickerProps) {
  const [query, setQuery] = useState('')
  const deviceCode = useSyncExternalStore(
    subscribeNever,
    getDeviceLanguageCode,
    getServerDeviceLanguageCode,
  )
  const deviceLang = deviceCode ? resolveLanguage(deviceCode) : undefined

  const handleSelect = (lang: Language) => {
    trackLanguageSelected(lang.code)
    try {
      localStorage.setItem('keiro-roman', '0')
    } catch {
      // localStorage unavailable (private browsing, storage quota, etc.)
    }
    onSelect(lang)
  }

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return LANGUAGES
    return LANGUAGES.filter(
      (l) =>
        l.en.toLowerCase().includes(q) ||
        l.native.toLowerCase().includes(q) ||
        l.roman.toLowerCase().includes(q),
    )
  }, [query])

  const showSuggestion = deviceLang && !query.trim()
  const listed = showSuggestion ? filtered.filter((l) => l.code !== deviceLang.code) : filtered

  return (
    <div className="mx-auto flex h-dvh min-h-0 w-full max-w-lg flex-col">
      <header className="shrink-0 px-5 pb-4 pt-5">
        <div className="flex items-center gap-4">
          <Kai size="xs" state="waving" interactive={false} />
          <div className="min-w-0">
            <h1 className="font-display text-2xl font-semibold leading-tight tracking-tight text-text-primary">
              Choose your language
            </h1>
            <p className="mt-1 text-base leading-snug text-text-secondary">
              Tap once. You&apos;ll confirm next.
            </p>
          </div>
        </div>

        <div className="mt-4 flex items-center gap-3 rounded-xl border border-border-default bg-surface px-4 transition-colors duration-150 focus-within:border-brand-ink focus-within:ring-2 focus-within:ring-brand-ink/20">
          <Search size={20} className="shrink-0 text-text-tertiary" aria-hidden />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search languages"
            className="min-h-[52px] flex-1 bg-transparent text-lg text-text-primary placeholder:text-text-placeholder focus:outline-none"
            aria-label="Search languages"
            autoComplete="off"
            enterKeyHint="search"
          />
        </div>
      </header>

      <div
        data-lenis-prevent
        className="lang-scroll lang-scroll--light min-h-0 flex-1 touch-pan-y overflow-y-auto overscroll-contain pb-[max(1.5rem,env(safe-area-inset-bottom))]"
        role="listbox"
        aria-label="Available languages"
      >
        {showSuggestion && (
          <div
            role="group"
            aria-labelledby="device-language-label"
            className="border-y border-brand-border bg-brand-subtle/60"
          >
            <div id="device-language-label" aria-hidden className="px-5 pt-3 text-sm font-medium text-brand-ink">
              Your device language
            </div>
            <LanguageRow lang={deviceLang} onPick={handleSelect} />
          </div>
        )}

        {listed.length === 0 ? (
          <p className="px-5 py-10 text-center text-base text-text-secondary">
            No languages match your search.
          </p>
        ) : (
          <div
            className={`divide-y divide-border-subtle border-b border-border-subtle bg-surface ${showSuggestion ? '' : 'border-t'}`}
          >
            {listed.map((lang) => (
              <LanguageRow key={lang.code} lang={lang} onPick={handleSelect} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
