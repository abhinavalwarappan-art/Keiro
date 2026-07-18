'use client'

/* THE INDEX (DESIGN.md §7.3).

   The 45 languages set as a typeset foundry index rather than a chip cloud:
   full-width ruled rows grouped by writing system under sticky mono headers,
   each row carrying the endonym at specimen scale, its ISO code, the English
   name, and a direction glyph. Focus or click a row and Kai's actual opening
   line unfolds in that language, in its own script, flipping to RTL where that
   is correct — the page proves the claim instead of stating it.

   The group of a language is derived from the Unicode block of its endonym, so
   the taxonomy cannot drift from the data. The search matches endonym, English
   name and romanisation at once. */

import { useMemo, useState } from 'react'
import { LANGUAGES, type Language } from '@/lib/languages'
import { KAI_GREETINGS } from '../../greetings'
import { KaiDot } from '../../ChatMock'
import { IconPlus } from '../../icons'

/* Writing-system families, in reading order. */
const GROUPS = [
  { key: 'latin', label: 'Latin script' },
  { key: 'arabic', label: 'Arabic script — right to left' },
  { key: 'south-asian', label: 'South Asian scripts' },
  { key: 'east-asian', label: 'East Asian scripts' },
  { key: 'cyrillic', label: 'Cyrillic' },
  { key: 'greek', label: 'Greek' },
  { key: 'ethiopic', label: 'Ethiopic' },
] as const

type GroupKey = (typeof GROUPS)[number]['key']

/* Bucket by the first strong (non-ASCII) character of the endonym. Ranges are
   the canonical Unicode blocks; anything unmatched falls to Latin. */
function scriptGroup(native: string): GroupKey {
  for (const ch of native) {
    const cp = ch.codePointAt(0) ?? 0
    if (cp < 0x0080) continue // ASCII — accented Latin endonyms stay Latin
    if (cp >= 0x0600 && cp <= 0x06ff) return 'arabic'
    if (cp >= 0x0370 && cp <= 0x03ff) return 'greek'
    if (cp >= 0x0400 && cp <= 0x04ff) return 'cyrillic'
    if (cp >= 0x0900 && cp <= 0x0dff) return 'south-asian' // Devanagari…Malayalam
    if (cp >= 0x1200 && cp <= 0x137f) return 'ethiopic'
    if (
      (cp >= 0x4e00 && cp <= 0x9fff) || // CJK Han
      (cp >= 0x3040 && cp <= 0x30ff) || // Kana
      (cp >= 0xac00 && cp <= 0xd7af) // Hangul
    )
      return 'east-asian'
    return 'latin'
  }
  return 'latin'
}

function matches(language: Language, query: string): boolean {
  const q = query.trim().toLowerCase()
  if (!q) return true
  return (
    language.native.toLowerCase().includes(q) ||
    language.en.toLowerCase().includes(q) ||
    language.roman.toLowerCase().includes(q)
  )
}

function LanguageRow({
  language,
  open,
  onToggle,
}: {
  language: Language
  open: boolean
  onToggle: () => void
}) {
  const greeting = KAI_GREETINGS[language.code] ?? KAI_GREETINGS['en-US']
  const panelId = `lang-panel-${language.code}`

  return (
    <li className="border-b border-[var(--band-line)]">
      <button
        type="button"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={onToggle}
        className="lx-focus grid w-full grid-cols-[1fr_auto] items-center gap-4 py-4 text-left sm:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)_auto_auto] sm:gap-6"
      >
        <span
          lang={language.googleCode}
          dir={language.rtl ? 'rtl' : undefined}
          className="lx-native min-w-0 truncate text-[clamp(1.15rem,2.4vw,1.6rem)] text-[var(--band-ink)]"
        >
          {language.native}
        </span>
        <span className="hidden text-[0.95rem] text-[var(--band-muted)] sm:block">
          {language.en}
        </span>
        <span className="lx-mono hidden text-xs text-[var(--band-muted)] sm:block">
          {language.googleCode.toUpperCase()}
        </span>
        <span className="flex items-center justify-end gap-3">
          {language.rtl && (
            <span className="lx-label text-[0.6rem] text-[var(--lx-signal-ink)]" aria-hidden="true">
              ← RTL
            </span>
          )}
          <span
            aria-hidden="true"
            className={`grid h-5 w-5 place-items-center text-[var(--lx-green-ink)] motion-safe:transition-transform motion-safe:duration-200 ${
              open ? 'rotate-45' : ''
            }`}
          >
            <IconPlus size={14} />
          </span>
        </span>
      </button>

      <div className="lx-reveal-grid" data-open={open} id={panelId}>
        <div>
          <div className="pb-5">
            <div className="rounded-[4px] border border-[var(--band-line)] bg-[var(--lx-wash)] p-4">
              <div
                className="flex items-center justify-between gap-3 pb-3"
                dir={language.rtl ? 'rtl' : undefined}
              >
                <span className="flex items-center gap-2">
                  <KaiDot size={22} />
                  <span className="lx-label text-[0.6rem] text-[var(--lx-muted)]">
                    Kai opens with
                  </span>
                </span>
                <span className="lx-mono text-[0.65rem] text-[var(--lx-muted)]">{language.code}</span>
              </div>
              <p
                lang={language.googleCode}
                dir={language.rtl ? 'rtl' : undefined}
                className="lx-native text-[1.1rem] leading-[1.7] text-[var(--lx-body)]"
              >
                {greeting}
              </p>
              {language.roman !== language.native && language.roman !== language.en && (
                <p className="lx-mono mt-2 text-xs text-[var(--lx-muted)]">{language.roman}</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </li>
  )
}

export function LanguageIndex() {
  const [query, setQuery] = useState('')
  const [openCode, setOpenCode] = useState<string | null>(null)

  const groups = useMemo(() => {
    const shown = LANGUAGES.filter((l) => matches(l, query))
    return GROUPS.map((g) => ({
      ...g,
      langs: shown.filter((l) => scriptGroup(l.native) === g.key),
    })).filter((g) => g.langs.length > 0)
  }, [query])

  const total = groups.reduce((n, g) => n + g.langs.length, 0)

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4 border-b border-[var(--band-line-strong)] pb-4">
        <div className="min-w-0 flex-1">
          <label
            htmlFor="lang-index-search"
            className="lx-label block text-[0.6rem] text-[var(--band-muted)]"
          >
            Find your language
          </label>
          <input
            id="lang-index-search"
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Tagalog · தமிழ் · Polski"
            className="lx-focus mt-2 block w-full max-w-md border-b border-[var(--band-line)] bg-transparent pb-2 text-lg text-[var(--band-ink)] placeholder:text-[var(--band-muted)]/60"
          />
        </div>
        <span className="lx-mono text-sm text-[var(--band-muted)]" aria-live="polite">
          {total} / {LANGUAGES.length}
        </span>
      </div>

      {groups.length === 0 ? (
        <p className="py-10 text-[var(--band-muted)]">
          No match. Kai may still be able to help —{' '}
          <a
            href="/contact"
            className="lx-focus text-[var(--lx-green-ink)] underline underline-offset-2"
          >
            tell us which language to add
          </a>
          .
        </p>
      ) : (
        <div className="mt-4">
          {groups.map((group) => (
            <section key={group.key} aria-labelledby={`grp-${group.key}`} className="mb-2">
              <h3
                id={`grp-${group.key}`}
                className="lx-label sticky top-16 z-[5] flex items-center justify-between gap-3 border-y border-[var(--band-line)] bg-[var(--band-bg)] py-2.5 text-[0.6rem] text-[var(--band-muted)]"
              >
                <span>{group.label}</span>
                <span aria-hidden="true">{String(group.langs.length).padStart(2, '0')}</span>
              </h3>
              <ul>
                {group.langs.map((language) => (
                  <LanguageRow
                    key={language.code}
                    language={language}
                    open={openCode === language.code}
                    onToggle={() =>
                      setOpenCode((c) => (c === language.code ? null : language.code))
                    }
                  />
                ))}
              </ul>
            </section>
          ))}
        </div>
      )}
    </div>
  )
}
