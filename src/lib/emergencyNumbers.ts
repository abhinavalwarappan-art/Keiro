/**
 * Locale-aware emergency telephone numbers.
 *
 * Source: Wikipedia, "List of emergency telephone numbers" (verified 2026-07-15).
 * Each entry is the number a member of the public dials for a MEDICAL emergency
 * (ambulance) in that country.
 *
 * Policy — read before editing:
 * - For EU/EEA members we deliberately use 112, the legally guaranteed pan-European
 *   emergency number that always reaches medical dispatch, rather than national
 *   ambulance sub-numbers (e.g. NO uses 113 as a well-known medical-direct line;
 *   others fall back to 112). This keeps the mapping correct and low-risk instead of
 *   guessing at per-country sub-numbers.
 * - The region comes from the patient's SELECTED LOCALE (the region subtag of the
 *   app's BCP-47 language codes, e.g. "es-ES" -> ES). That is the locale's primary
 *   country, NOT the patient's verified physical location. Callers MUST therefore
 *   always show a "verify locally" note — see the emergency screen.
 */

export interface EmergencyInfo {
  /** Number to dial for a medical emergency. */
  number: string
  /** Country the number applies to, for the "if you are not in X" note. */
  country: string
}

/** Keyed by ISO-3166-1 alpha-2 region (the subtag of the app's language codes). */
const EMERGENCY_BY_REGION: Record<string, EmergencyInfo> = {
  US: { number: '911', country: 'the United States' },
  ES: { number: '112', country: 'Spain' },
  CN: { number: '120', country: 'China' },
  IN: { number: '112', country: 'India' },
  SA: { number: '997', country: 'Saudi Arabia' },
  VN: { number: '115', country: 'Vietnam' },
  KR: { number: '119', country: 'South Korea' },
  PH: { number: '911', country: 'the Philippines' },
  PK: { number: '1122', country: 'Pakistan' },
  FR: { number: '112', country: 'France' },
  DE: { number: '112', country: 'Germany' },
  BR: { number: '192', country: 'Brazil' },
  JP: { number: '119', country: 'Japan' },
  RU: { number: '112', country: 'Russia' },
  TR: { number: '112', country: 'Turkey' },
  IR: { number: '115', country: 'Iran' },
  ET: { number: '907', country: 'Ethiopia' },
  KE: { number: '112', country: 'Kenya' },
  SO: { number: '999', country: 'Somalia' },
  ID: { number: '112', country: 'Indonesia' },
  PL: { number: '112', country: 'Poland' },
  UA: { number: '103', country: 'Ukraine' },
  BD: { number: '999', country: 'Bangladesh' },
  IT: { number: '112', country: 'Italy' },
  NL: { number: '112', country: 'the Netherlands' },
  GR: { number: '112', country: 'Greece' },
  CZ: { number: '112', country: 'the Czech Republic' },
  RO: { number: '112', country: 'Romania' },
  SE: { number: '112', country: 'Sweden' },
  DK: { number: '112', country: 'Denmark' },
  FI: { number: '112', country: 'Finland' },
  NO: { number: '113', country: 'Norway' },
  HU: { number: '112', country: 'Hungary' },
  BG: { number: '112', country: 'Bulgaria' },
  TW: { number: '119', country: 'Taiwan' },
  SK: { number: '112', country: 'Slovakia' },
  SI: { number: '112', country: 'Slovenia' },
  EE: { number: '112', country: 'Estonia' },
  LV: { number: '112', country: 'Latvia' },
  LT: { number: '112', country: 'Lithuania' },
}

/**
 * Safest global fallback. 112 is reachable on essentially all GSM/mobile networks
 * worldwide (often even with no SIM or a locked keypad) and routes to local emergency
 * services. Used when the patient's country cannot be inferred from their locale.
 */
export const FALLBACK_EMERGENCY_NUMBER = '112'

export interface ResolvedEmergency {
  /** Number to display and dial. */
  number: string
  /** Country the number is for, or null when we fell back globally. */
  country: string | null
  /** True when `number` is the global fallback, not a country-specific match. */
  isFallback: boolean
}

/**
 * Resolve the emergency number to show from a BCP-47 language code (e.g. "es-ES").
 * The region subtag gives the locale's primary country — a best default, never a
 * verified physical location — so the UI must always pair this with a "verify
 * locally" note.
 */
export function resolveEmergencyNumber(langCode: string | null | undefined): ResolvedEmergency {
  const region = langCode?.split('-')[1]?.toUpperCase()
  const match = region ? EMERGENCY_BY_REGION[region] : undefined
  if (match) {
    return { number: match.number, country: match.country, isFallback: false }
  }
  return { number: FALLBACK_EMERGENCY_NUMBER, country: null, isFallback: true }
}
