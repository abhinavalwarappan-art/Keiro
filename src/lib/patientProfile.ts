import type {
  LifestyleFrequency,
  PatientLifestyle,
  PatientProfile,
  TravelRecency,
  TripLength,
} from '@/types'

/** Compute age in whole years from an ISO date string (YYYY-MM-DD). */
export function ageFromDateOfBirth(dob: string): number | null {
  if (!dob) return null
  const birth = new Date(dob)
  if (Number.isNaN(birth.getTime())) return null
  const today = new Date()
  let age = today.getFullYear() - birth.getFullYear()
  const monthDiff = today.getMonth() - birth.getMonth()
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age -= 1
  }
  return age >= 0 ? age : null
}

/**
 * True when `iso` (YYYY-MM-DD) is a real calendar date — rejects rollover dates
 * like 2008-02-30 that `new Date()` would silently coerce to a later day.
 */
export function isRealCalendarDate(iso: string): boolean {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso)
  if (!m) return false
  const y = Number(m[1])
  const mo = Number(m[2])
  const d = Number(m[3])
  const dt = new Date(y, mo - 1, d)
  return dt.getFullYear() === y && dt.getMonth() === mo - 1 && dt.getDate() === d
}

// Physician-facing English labels for the lifestyle follow-up answers.
const FREQUENCY_TEXT: Record<LifestyleFrequency, string> = {
  rarely: 'rarely',
  sometimes: 'sometimes',
  often: 'often',
}
const TRAVEL_WHEN_TEXT: Record<TravelRecency, string> = {
  past_week: 'past week',
  past_month: 'past month',
  past_6_months: 'past 6 months',
}
const TRIP_LENGTH_TEXT: Record<TripLength, string> = {
  over_2h: '2+ hour trip',
  over_6h: '6+ hour trip',
  over_12h: '12+ hour trip',
}

/**
 * Render the ticked lifestyle factors as physician-facing English phrases,
 * splicing in each follow-up detail when present, e.g.
 * `['smoker (often)', 'recent travel (past week, 12+ hour trip)']`.
 * Accepts a loosely-typed shape so the report API can pass raw request JSON.
 */
export function describeLifestyle(lifestyle?: Partial<PatientLifestyle> | null): string[] {
  if (!lifestyle) return []
  const out: string[] = []

  if (lifestyle.smoker) {
    const freq = lifestyle.smokerFrequency && FREQUENCY_TEXT[lifestyle.smokerFrequency]
    out.push(freq ? `smoker (${freq})` : 'smoker')
  }
  if (lifestyle.alcohol) {
    const freq = lifestyle.alcoholFrequency && FREQUENCY_TEXT[lifestyle.alcoholFrequency]
    out.push(freq ? `drinks alcohol (${freq})` : 'drinks alcohol')
  }
  if (lifestyle.recentTravel) {
    const detail = [
      lifestyle.travelWhen && TRAVEL_WHEN_TEXT[lifestyle.travelWhen],
      lifestyle.tripLength && TRIP_LENGTH_TEXT[lifestyle.tripLength],
    ].filter(Boolean)
    out.push(detail.length ? `recent travel (${detail.join(', ')})` : 'recent travel')
  }
  return out
}

export function formatPatientSex(sex: PatientProfile['biologicalSex']): string {
  switch (sex) {
    case 'male':
      return 'Male'
    case 'female':
      return 'Female'
    case 'other':
      return 'Other'
    default:
      return 'Not specified'
  }
}

export function buildPatientContextBlock(profile: PatientProfile): string {
  const age = profile.age ?? ageFromDateOfBirth(profile.dateOfBirth)
  const lines = [
    `Name: ${profile.fullName}`,
    `Date of Birth: ${profile.dateOfBirth}`,
    age != null ? `Age: ${age} years` : null,
    `Biological Sex: ${formatPatientSex(profile.biologicalSex)}`,
    `Primary Language: ${profile.primaryLanguage}`,
  ]
  if (profile.chronicConditions?.trim()) {
    lines.push(`Known Chronic Conditions / Allergies: ${profile.chronicConditions.trim()}`)
  }
  if (profile.lifestyle) {
    const flags = describeLifestyle(profile.lifestyle)
    lines.push(`Lifestyle (patient-reported): ${flags.length ? flags.join(', ') : 'none reported'}`)
  }
  return lines.filter(Boolean).join('\n')
}

export function isPatientProfileComplete(profile: Partial<PatientProfile> | null | undefined): profile is PatientProfile {
  if (!profile) return false
  return Boolean(
    profile.fullName?.trim() &&
    profile.dateOfBirth &&
    profile.biologicalSex &&
    profile.primaryLanguage?.trim() &&
    profile.consentAt
  )
}