'use client'

import { useEffect, useMemo, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Input } from '@/components/ui/Input'
import { ageFromDateOfBirth } from '@/lib/patientProfile'
import type { BiologicalSex, PatientProfile } from '@/types'
import { cn } from '@/lib/utils'

interface PatientProfileIntakeProps {
  langCode: string
  langName: string
  onComplete: (profile: PatientProfile) => void
}

const SEX_OPTIONS: { value: BiologicalSex; label: string }[] = [
  { value: 'male', label: 'Male' },
  { value: 'female', label: 'Female' },
  { value: 'other', label: 'Other' },
]

export function PatientProfileIntake({ langCode, langName, onComplete }: PatientProfileIntakeProps) {
  const supabase = useMemo(() => createClient(), [])
  const [fullName, setFullName] = useState('')
  const [dateOfBirth, setDateOfBirth] = useState('')
  const [biologicalSex, setBiologicalSex] = useState<BiologicalSex | ''>('')
  const [primaryLanguage, setPrimaryLanguage] = useState(langName)
  const [primaryLanguageCode, setPrimaryLanguageCode] = useState(langCode)
  const [chronicConditions, setChronicConditions] = useState('')
  const [consentChecked, setConsentChecked] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [submitting, setSubmitting] = useState(false)
  const [loadingProfile, setLoadingProfile] = useState(true)
  const [submitError, setSubmitError] = useState<string | null>(null)

  const computedAge = dateOfBirth ? ageFromDateOfBirth(dateOfBirth) : null

  useEffect(() => {
    let cancelled = false

    async function loadProfile() {
      try {
        const { data: { user }, error: userError } = await supabase.auth.getUser()
        if (userError || !user || cancelled) {
          if (!cancelled) setLoadingProfile(false)
          return
        }

        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('name, date_of_birth, sex, chronic_conditions, preferred_language, language_code')
          .eq('id', user.id)
          .single()

        if (profileError || !profile || cancelled) {
          if (!cancelled) setLoadingProfile(false)
          return
        }

        if (profile.name) setFullName(profile.name)
        if (profile.date_of_birth) setDateOfBirth(profile.date_of_birth)
        if (profile.sex === 'male' || profile.sex === 'female' || profile.sex === 'other') {
          setBiologicalSex(profile.sex)
        }
        if (profile.chronic_conditions) setChronicConditions(profile.chronic_conditions)
        if (profile.preferred_language) setPrimaryLanguage(profile.preferred_language)
        if (profile.language_code) setPrimaryLanguageCode(profile.language_code)
      } finally {
        if (!cancelled) setLoadingProfile(false)
      }
    }

    loadProfile()
    return () => { cancelled = true }
  }, [supabase])

  const validate = (): boolean => {
    const next: Record<string, string> = {}
    if (!fullName.trim()) next.fullName = 'Full name is required'
    if (!dateOfBirth) next.dateOfBirth = 'Date of birth is required'
    else if (computedAge === null || computedAge < 0) next.dateOfBirth = 'Enter a valid date of birth'
    else if (computedAge > 120) next.dateOfBirth = 'Enter a valid date of birth'
    if (!biologicalSex) next.biologicalSex = 'Please select biological sex'
    if (!primaryLanguage.trim()) next.primaryLanguage = 'Primary language is required'
    if (!consentChecked) next.consent = 'You must agree before continuing'
    setErrors(next)
    return Object.keys(next).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate() || !biologicalSex) return

    setSubmitting(true)
    setSubmitError(null)

    const consentAt = new Date().toISOString()
    const profile: PatientProfile = {
      fullName: fullName.trim(),
      dateOfBirth,
      age: computedAge ?? undefined,
      biologicalSex,
      primaryLanguage: primaryLanguage.trim(),
      primaryLanguageCode,
      chronicConditions: chronicConditions.trim() || undefined,
      consentAt,
    }

    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      if (userError) throw userError

      if (user) {
        const { error: upsertError } = await supabase.from('profiles').upsert({
          id: user.id,
          name: profile.fullName,
          age: profile.age,
          date_of_birth: profile.dateOfBirth,
          sex: profile.biologicalSex,
          chronic_conditions: profile.chronicConditions ?? null,
          preferred_language: profile.primaryLanguage,
          language_code: profile.primaryLanguageCode,
          data_processing_consent: true,
          consent_date: consentAt,
          updated_at: consentAt,
        })

        if (upsertError) throw upsertError

        const { error: consentsError } = await supabase.from('consents').insert([
          { user_id: user.id, consent_type: 'health_data', granted: true },
          { user_id: user.id, consent_type: 'terms', granted: true },
          { user_id: user.id, consent_type: 'privacy', granted: true },
        ])

        if (consentsError) throw consentsError

        const { data: sessionRow, error: sessionError } = await supabase
          .from('sessions')
          .insert({
            user_id: user.id,
            mode: 'new_symptoms',
            language: profile.primaryLanguage,
            language_code: profile.primaryLanguageCode,
            status: 'active',
            consent_at: consentAt,
            patient_profile_json: profile,
          })
          .select('id')
          .single()

        if (sessionError) throw sessionError

        if (sessionRow?.id) {
          sessionStorage.setItem('keiro_session_id', sessionRow.id)
        }
      }

      sessionStorage.setItem('keiro_patient_profile', JSON.stringify(profile))
      sessionStorage.setItem('keiro_health_consent', '1')
      onComplete(profile)
    } catch {
      setSubmitError('Something went wrong saving your profile. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[60] flex items-end justify-center overflow-y-auto bg-black/40 p-4 backdrop-blur-sm sm:items-center"
        role="dialog"
        aria-modal="true"
        aria-labelledby="profile-intake-title"
      >
        <motion.form
          initial={{ y: 24, scale: 0.97 }}
          animate={{ y: 0, scale: 1 }}
          exit={{ y: 24, opacity: 0 }}
          transition={{ ease: [0.16, 1, 0.3, 1], duration: 0.25 }}
          onSubmit={handleSubmit}
          className="my-auto flex w-full max-w-lg flex-col gap-5 rounded-lg bg-surface p-6 shadow-md"
        >
          <div className="flex flex-col gap-1">
            <h2 id="profile-intake-title" className="text-lg font-semibold text-text-primary">
              Patient information
            </h2>
            <p className="text-sm leading-relaxed text-text-secondary">
              Before Kai asks about your symptoms, we need a few details for your doctor&apos;s report.
            </p>
          </div>

          {loadingProfile ? (
            <div className="space-y-3">
              <div className="skeleton h-10 w-full rounded-md" />
              <div className="skeleton h-10 w-full rounded-md" />
              <div className="skeleton h-10 w-full rounded-md" />
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              <Input
                label="Full name"
                value={fullName}
                onChange={e => setFullName(e.target.value)}
                autoComplete="name"
                error={errors.fullName}
                required
              />

              <div className="grid grid-cols-2 gap-3">
                <Input
                  label="Date of birth"
                  type="date"
                  value={dateOfBirth}
                  onChange={e => setDateOfBirth(e.target.value)}
                  max={new Date().toISOString().split('T')[0]}
                  error={errors.dateOfBirth}
                  required
                />
                <Input
                  label="Age"
                  value={computedAge != null ? `${computedAge} years` : '—'}
                  readOnly
                  tabIndex={-1}
                  className="bg-sunken text-text-secondary"
                  helper="Calculated from date of birth"
                />
              </div>

              <fieldset>
                <legend className="mb-2 block text-xs font-medium uppercase tracking-wide text-text-secondary">
                  Biological sex
                </legend>
                <div className="flex flex-wrap gap-2">
                  {SEX_OPTIONS.map(opt => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setBiologicalSex(opt.value)}
                      className={cn(
                        'min-h-[40px] rounded-md border px-4 py-2 text-sm font-medium transition-colors duration-150',
                        biologicalSex === opt.value
                          ? 'border-brand-strong bg-brand-subtle text-brand-ink'
                          : 'border-border-subtle bg-surface text-text-primary hover:border-border-default hover:bg-sunken',
                      )}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
                {errors.biologicalSex && (
                  <p className="mt-1 text-xs text-error-text" role="alert">{errors.biologicalSex}</p>
                )}
              </fieldset>

              <Input
                label="Primary language"
                value={primaryLanguage}
                onChange={e => setPrimaryLanguage(e.target.value)}
                helper="Auto-detected from your app settings — confirm or edit"
                error={errors.primaryLanguage}
                required
              />

              <div>
                <label
                  htmlFor="chronic-conditions"
                  className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-text-secondary"
                >
                  Chronic conditions or allergies <span className="normal-case text-text-tertiary">(optional)</span>
                </label>
                <textarea
                  id="chronic-conditions"
                  value={chronicConditions}
                  onChange={e => setChronicConditions(e.target.value)}
                  rows={2}
                  placeholder="e.g. Type 2 diabetes, penicillin allergy"
                  className="w-full rounded-md border border-border-subtle bg-surface px-3 py-2 text-base text-text-primary placeholder:text-text-placeholder focus:border-brand-strong focus:outline-none focus:ring-2 focus:ring-brand-strong/25"
                />
              </div>

              <label className="flex cursor-pointer items-start gap-3 rounded-lg border border-border-subtle bg-sunken/50 p-3">
                <input
                  type="checkbox"
                  checked={consentChecked}
                  onChange={e => setConsentChecked(e.target.checked)}
                  className="mt-0.5 size-4 shrink-0 rounded border-border-default accent-brand-ink"
                />
                <span className="text-sm leading-relaxed text-text-secondary">
                  I agree to Keiro&apos;s{' '}
                  <Link href="/terms" className="font-medium text-brand-ink underline underline-offset-2" target="_blank">
                    Terms of Service
                  </Link>{' '}
                  and{' '}
                  <Link href="/privacy" className="font-medium text-brand-ink underline underline-offset-2" target="_blank">
                    Privacy Policy
                  </Link>
                  , including the collection and processing of my health information to generate medical reports.
                </span>
              </label>
              {errors.consent && (
                <p className="-mt-2 text-xs text-error-text" role="alert">{errors.consent}</p>
              )}
            </div>
          )}

          {submitError && (
            <p className="text-xs text-error-text" role="alert">{submitError}</p>
          )}

          <button
            type="submit"
            disabled={submitting || loadingProfile}
            className="min-h-[48px] w-full rounded-md bg-brand-ink py-3 text-base font-medium text-white transition-colors duration-150 hover:bg-brand-ink-hover active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {submitting ? 'Starting session…' : 'Continue to symptom intake'}
          </button>
        </motion.form>
      </motion.div>
    </AnimatePresence>
  )
}