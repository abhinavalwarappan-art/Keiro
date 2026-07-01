import type { PatientProfile } from '@/types'

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