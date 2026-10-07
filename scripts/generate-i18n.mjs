/**
 * Generate localized UI dictionaries for every supported language.
 *
 * Reads the English source at src/i18n/en.json, machine-translates missing
 * strings into languages listed in src/lib/languages.ts via Google Translate,
 * and merges into src/i18n/locales/<code>.json. Existing translations are
 * preserved so reviewed corrections survive subsequent runs.
 *
 * Usage:  GOOGLE_TRANSLATE_KEY=... node scripts/generate-i18n.mjs
 * (or:    npm run i18n:generate   — after loading env vars)
 * To refresh selected keys: I18N_REFRESH_KEYS=key.one,key.two npm run i18n:generate
 *
 * Placeholders like {age} / {terms} are preserved: any string whose
 * placeholders are lost in translation falls back to the English source so
 * runtime interpolation never breaks.
 */
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const scriptDir = dirname(fileURLToPath(import.meta.url))
const root = join(scriptDir, '..')
const enPath = join(root, 'src/i18n/en.json')
const langPath = join(root, 'src/lib/languages.ts')
const outDir = join(root, 'src/i18n/locales')

// Bare `node` does not load .env like Next does — pull in the keys ourselves.
function loadEnv(file) {
  const path = join(root, file)
  if (!existsSync(path)) return
  for (const line of readFileSync(path, 'utf8').split('\n')) {
    const match = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/)
    if (!match) continue
    const key = match[1]
    if (process.env[key]) continue
    process.env[key] = match[2].replace(/^["']|["']$/g, '')
  }
}
loadEnv('.env.local')
loadEnv('.env')

const GOOGLE_KEY = process.env.GOOGLE_TRANSLATE_KEY
if (!GOOGLE_KEY) {
  console.error('✗ GOOGLE_TRANSLATE_KEY is not set. Export it and re-run.')
  process.exit(1)
}

const source = JSON.parse(readFileSync(enPath, 'utf8'))
const refreshKeys = new Set((process.env.I18N_REFRESH_KEYS ?? '').split(',').filter(Boolean))

// Extract { code, googleCode } from each LANGUAGES entry. Entries are one per
// line and are the only lines carrying both `code:` and `googleCode:`.
const languages = []
for (const line of readFileSync(langPath, 'utf8').split('\n')) {
  const code = line.match(/\bcode:\s*'([^']+)'/)
  const google = line.match(/\bgoogleCode:\s*'([^']+)'/)
  if (code && google) languages.push({ code: code[1], google: google[1] })
}

const placeholders = str => str.match(/\{\w+\}/g) ?? []
const normalizeBraces = str => str.replace(/\{\s*(\w+)\s*\}/g, '{$1}')

// Google Translate happily translates the *word* inside {terms} → {términos},
// which breaks runtime interpolation. Swap each named placeholder for a numbered
// token ({0}, {1}, …) that has no translatable word, then restore it afterward.
function protectPlaceholders(str) {
  const names = []
  const protectedStr = str.replace(/\{(\w+)\}/g, (_, name) => {
    const index = names.length
    names.push(name)
    return `{${index}}`
  })
  return { protectedStr, names }
}

function restorePlaceholders(str, names) {
  return str.replace(/\{\s*(\d+)\s*\}/g, (match, digits) => {
    const name = names[Number(digits)]
    return name ? `{${name}}` : match
  })
}

async function translateBatch(texts, target) {
  const params = new URLSearchParams({ key: GOOGLE_KEY, target, source: 'en', format: 'text' })
  for (const text of texts) params.append('q', text)

  const res = await fetch('https://translation.googleapis.com/language/translate/v2', {
    method: 'POST',
    body: params,
  })
  if (!res.ok) {
    throw new Error(`Google Translate ${res.status} ${res.statusText}`)
  }
  const data = await res.json()
  const translations = data?.data?.translations
  if (!Array.isArray(translations) || translations.length !== texts.length) {
    throw new Error('Unexpected Google Translate response shape')
  }
  return translations.map(t => t.translatedText)
}

mkdirSync(outDir, { recursive: true })

let generated = 0
for (const lang of languages) {
  // English is the source and is committed by hand — skip it.
  if (lang.google === 'en') continue

  try {
    const outputPath = join(outDir, `${lang.code}.json`)
    const dict = existsSync(outputPath) ? JSON.parse(readFileSync(outputPath, 'utf8')) : {}
    const keys = Object.keys(source).filter(key => !(key in dict) || refreshKeys.has(key))
    if (keys.length === 0) {
      console.log(`✓ ${lang.code} (already complete)`)
      continue
    }
    const shielded = keys.map(k => protectPlaceholders(source[k]))
    const translated = await translateBatch(shielded.map(s => s.protectedStr), lang.google)
    let repaired = 0

    keys.forEach((key, i) => {
      const original = source[key]
      const candidate = normalizeBraces(restorePlaceholders(translated[i], shielded[i].names))
      const wanted = placeholders(original)
      const kept = new Set(placeholders(candidate))
      const placeholdersOk = wanted.every(p => kept.has(p))
      if (placeholdersOk) {
        dict[key] = candidate
      } else {
        dict[key] = original // keep English so interpolation stays intact
        repaired++
      }
    })

    writeFileSync(outputPath, JSON.stringify(dict, null, 2) + '\n')
    generated++
    const note = repaired ? ` (${repaired} kept as English — placeholder mismatch)` : ''
    console.log(`✓ ${lang.code}${note}`)
  } catch (err) {
    console.error(`✗ ${lang.code}: ${err instanceof Error ? err.message : err}`)
  }
}

console.log(`\nDone. Generated ${generated} locale file(s) in src/i18n/locales/`)
