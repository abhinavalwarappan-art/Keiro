/**
 * Generate localized UI dictionaries for every supported language.
 *
 * Reads the English source at src/i18n/en.json, machine-translates each string
 * into all languages listed in src/lib/languages.ts via Google Translate, and
 * writes one file per language to src/i18n/locales/<code>.json.
 *
 * Usage:  GOOGLE_TRANSLATE_KEY=... node scripts/generate-i18n.mjs
 * (or:    npm run i18n:generate   — after loading env vars)
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
const keys = Object.keys(source)

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
    const translated = await translateBatch(keys.map(k => source[k]), lang.google)
    const dict = {}
    let repaired = 0

    keys.forEach((key, i) => {
      const original = source[key]
      const candidate = normalizeBraces(translated[i])
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

    writeFileSync(join(outDir, `${lang.code}.json`), JSON.stringify(dict, null, 2) + '\n')
    generated++
    const note = repaired ? ` (${repaired} kept as English — placeholder mismatch)` : ''
    console.log(`✓ ${lang.code}${note}`)
  } catch (err) {
    console.error(`✗ ${lang.code}: ${err instanceof Error ? err.message : err}`)
  }
}

console.log(`\nDone. Generated ${generated} locale file(s) in src/i18n/locales/`)
