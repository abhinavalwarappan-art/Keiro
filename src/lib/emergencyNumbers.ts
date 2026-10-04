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
 * - The region comes, in order, from the DEVICE's time zone (where the phone is),
 *   then from the region subtag of the patient's language (e.g. "es-ES" -> ES),
 *   then the global fallback. Language alone is the wrong signal: Keiro's patients
 *   are mostly immigrants in US clinics, and a Spanish speaker in Texas must be
 *   told 911, not Spain's 112. Neither signal is a verified location, so callers
 *   MUST always show a "verify locally" note — see the emergency screen.
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
  // Reached by time zone only (no Keiro language is pinned to these regions).
  CA: { number: '911', country: 'Canada' },
  MX: { number: '911', country: 'Mexico' },
  GB: { number: '999', country: 'the United Kingdom' },
  IE: { number: '112', country: 'Ireland' },
  AU: { number: '000', country: 'Australia' },
  NZ: { number: '111', country: 'New Zealand' },
}

/** IANA zones whose country is unambiguous. Anything unlisted falls through to the language. */
const REGION_BY_TIME_ZONE: Record<string, string> = {
  'America/New_York': 'US', 'America/Detroit': 'US', 'America/Chicago': 'US', 'America/Denver': 'US',
  'America/Boise': 'US', 'America/Phoenix': 'US', 'America/Los_Angeles': 'US', 'America/Anchorage': 'US',
  'America/Juneau': 'US', 'America/Sitka': 'US', 'America/Metlakatla': 'US', 'America/Yakutat': 'US',
  'America/Nome': 'US', 'America/Adak': 'US', 'America/Menominee': 'US', 'Pacific/Honolulu': 'US',
  'America/Toronto': 'CA', 'America/Vancouver': 'CA', 'America/Edmonton': 'CA', 'America/Winnipeg': 'CA',
  'America/Halifax': 'CA', 'America/St_Johns': 'CA', 'America/Regina': 'CA', 'America/Moncton': 'CA',
  'America/Mexico_City': 'MX', 'America/Monterrey': 'MX', 'America/Tijuana': 'MX', 'America/Cancun': 'MX',
  'Europe/London': 'GB', 'Europe/Dublin': 'IE', 'Australia/Sydney': 'AU', 'Australia/Melbourne': 'AU',
  'Australia/Brisbane': 'AU', 'Australia/Perth': 'AU', 'Australia/Adelaide': 'AU', 'Pacific/Auckland': 'NZ',
  'Europe/Madrid': 'ES', 'Asia/Shanghai': 'CN', 'Asia/Kolkata': 'IN', 'Asia/Calcutta': 'IN', 'Asia/Riyadh': 'SA',
  'Asia/Ho_Chi_Minh': 'VN', 'Asia/Saigon': 'VN', 'Asia/Seoul': 'KR', 'Asia/Manila': 'PH', 'Asia/Karachi': 'PK',
  'Europe/Paris': 'FR', 'Europe/Berlin': 'DE', 'America/Sao_Paulo': 'BR', 'Asia/Tokyo': 'JP',
  'Europe/Moscow': 'RU', 'Europe/Istanbul': 'TR', 'Asia/Tehran': 'IR', 'Africa/Addis_Ababa': 'ET',
  'Africa/Nairobi': 'KE', 'Africa/Mogadishu': 'SO', 'Asia/Jakarta': 'ID', 'Europe/Warsaw': 'PL',
  'Europe/Kyiv': 'UA', 'Europe/Kiev': 'UA', 'Asia/Dhaka': 'BD', 'Europe/Rome': 'IT', 'Europe/Amsterdam': 'NL',
  'Europe/Athens': 'GR', 'Europe/Prague': 'CZ', 'Europe/Bucharest': 'RO', 'Europe/Stockholm': 'SE',
  'Europe/Copenhagen': 'DK', 'Europe/Helsinki': 'FI', 'Europe/Oslo': 'NO', 'Europe/Budapest': 'HU',
  'Europe/Sofia': 'BG', 'Asia/Taipei': 'TW', 'Europe/Bratislava': 'SK', 'Europe/Ljubljana': 'SI',
  'Europe/Tallinn': 'EE', 'Europe/Riga': 'LV', 'Europe/Vilnius': 'LT',
}

/** US zones that live under sub-folders (America/Indiana/Indianapolis, …). */
const US_TIME_ZONE_PREFIXES = ['America/Indiana/', 'America/Kentucky/', 'America/North_Dakota/', 'US/']

export function regionFromTimeZone(timeZone: string | null | undefined): string | undefined {
  if (!timeZone) return undefined
  if (REGION_BY_TIME_ZONE[timeZone]) return REGION_BY_TIME_ZONE[timeZone]
  if (US_TIME_ZONE_PREFIXES.some((prefix) => timeZone.startsWith(prefix))) return 'US'
  return undefined
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

/**
 * Resolve the number for where the DEVICE is: its time zone first, the patient's
 * language second, the global fallback last. This is what the emergency screen
 * shows; `resolveEmergencyNumber` alone would tell a Spanish speaker in a US
 * clinic to dial Spain's number.
 */
export function resolveEmergencyForDevice(
  timeZone: string | null | undefined,
  langCode: string | null | undefined,
): ResolvedEmergency {
  const region = regionFromTimeZone(timeZone)
  const match = region ? EMERGENCY_BY_REGION[region] : undefined
  if (match) return { number: match.number, country: match.country, isFallback: false }
  return resolveEmergencyNumber(langCode)
}

/** The device's IANA time zone, or null where Intl can't say. */
export function deviceTimeZone(): string | null {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || null
  } catch {
    return null
  }
}
