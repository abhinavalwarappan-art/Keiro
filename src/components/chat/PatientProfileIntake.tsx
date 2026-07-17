'use client'

import { Fragment, useEffect, useMemo, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Input } from '@/components/ui/Input'
import { DateInput } from '@/components/ui/DateInput'
import { ageFromDateOfBirth, isRealCalendarDate } from '@/lib/patientProfile'
import { getLanguageByCode } from '@/lib/languages'
import { useTranslations, type MessageKey, type TranslateFn } from '@/i18n/useTranslations'
import type {
  BiologicalSex,
  LifestyleFrequency,
  PatientLifestyle,
  PatientProfile,
  TravelRecency,
  TripLength,
} from '@/types'
import { cn } from '@/lib/utils'

interface PatientProfileIntakeProps {
  langCode: string
  langName: string
  onComplete: (profile: PatientProfile) => void
}

const SEX_OPTIONS: { value: BiologicalSex; labelKey: MessageKey }[] = [
  { value: 'male', labelKey: 'intake.sexMale' },
  { value: 'female', labelKey: 'intake.sexFemale' },
  { value: 'other', labelKey: 'intake.sexOther' },
]

const LIFESTYLE_OPTIONS: { key: 'smoker' | 'alcohol' | 'recentTravel'; labelKey: MessageKey }[] = [
  { key: 'smoker', labelKey: 'intake.lifestyleSmoker' },
  { key: 'alcohol', labelKey: 'intake.lifestyleAlcohol' },
  { key: 'recentTravel', labelKey: 'intake.lifestyleTravel' },
]

// COPPA and equivalent children's-privacy laws require users to be at least 13.
// Anyone younger is blocked from creating a session at intake.
const MINIMUM_AGE = 13

// Follow-up options revealed after a lifestyle factor is ticked. Frequency is
// shared by the smoking and drinking questions; travel has its own two scales.
const FREQUENCY_OPTIONS: { value: LifestyleFrequency; labelKey: MessageKey }[] = [
  { value: 'rarely', labelKey: 'intake.freqRarely' },
  { value: 'sometimes', labelKey: 'intake.freqSometimes' },
  { value: 'often', labelKey: 'intake.freqOften' },
]

const TRAVEL_WHEN_OPTIONS: { value: TravelRecency; labelKey: MessageKey }[] = [
  { value: 'past_week', labelKey: 'intake.travelPastWeek' },
  { value: 'past_month', labelKey: 'intake.travelPastMonth' },
  { value: 'past_6_months', labelKey: 'intake.travelPast6Months' },
]

const TRIP_LENGTH_OPTIONS: { value: TripLength; labelKey: MessageKey }[] = [
  { value: 'over_2h', labelKey: 'intake.trip2h' },
  { value: 'over_6h', labelKey: 'intake.trip6h' },
  { value: 'over_12h', labelKey: 'intake.trip12h' },
]

/** A labelled row of single-select follow-up pills for a lifestyle factor. */
function ChoiceRow<T extends string>({
  label,
  value,
  options,
  onSelect,
  t,
}: {
  label: string
  value: T | undefined
  options: readonly { value: T; labelKey: MessageKey }[]
  onSelect: (value: T) => void
  t: TranslateFn
}) {
  return (
    <div className="mt-3">
      <p className="mb-1.5 text-xs font-medium text-text-secondary">{label}</p>
      <div className="flex flex-wrap gap-2">
        {options.map(opt => {
          const selected = value === opt.value
          return (
            <button
              key={opt.value}
              type="button"
              aria-pressed={selected}
              onClick={() => onSelect(opt.value)}
              className={cn(
                'min-h-[44px] rounded-md border px-3.5 py-1.5 text-sm font-medium transition-colors duration-150',
                selected
                  ? 'border-brand-strong bg-brand-subtle text-brand-ink'
                  : 'border-border-subtle bg-surface text-text-primary hover:border-border-default hover:bg-sunken',
              )}
            >
              {t(opt.labelKey)}
            </button>
          )
        })}
      </div>
    </div>
  )
}

/** Height-collapsing wrapper so a factor's follow-ups slide in when it's ticked. */
function Reveal({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, gridTemplateRows: '0fr' }}
      animate={{ opacity: 1, gridTemplateRows: '1fr' }}
      exit={{ opacity: 0, gridTemplateRows: '0fr' }}
      transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
      style={{ display: 'grid' }}
    >
      <div className="min-h-0 overflow-hidden">{children}</div>
    </motion.div>
  )
}

/**
 * Render the consent sentence, splicing the Terms and Privacy links into the
 * translated template at its {terms} / {privacy} placeholders so word order
 * stays correct in every language.
 */
function renderConsent(t: TranslateFn) {
  const template = t('intake.consent')
  const nodes: Record<string, React.ReactNode> = {
    '{terms}': (
      <Link href="/terms" className="font-medium text-brand-ink underline underline-offset-2" target="_blank">
        {t('intake.termsOfService')}
      </Link>
    ),
    '{privacy}': (
      <Link href="/privacy" className="font-medium text-brand-ink underline underline-offset-2" target="_blank">
        {t('intake.privacyPolicy')}
      </Link>
    ),
  }
  return template.split(/(\{terms\}|\{privacy\})/).map((part, i) => (
    <Fragment key={i}>{nodes[part] ?? part}</Fragment>
  ))
}

// The profiles.sex column only allows 'male' | 'female' | 'prefer_not_to_say',
// so map the UI's 'other' to the stored value in both directions.
const toDbSex = (sex: BiologicalSex): string => (sex === 'other' ? 'prefer_not_to_say' : sex)
const fromDbSex = (sex: string): BiologicalSex | null => {
  if (sex === 'male' || sex === 'female') return sex
  if (sex === 'other' || sex === 'prefer_not_to_say') return 'other'
  return null
}

export function PatientProfileIntake({ langCode, langName, onComplete }: PatientProfileIntakeProps) {
  const t = useTranslations(langCode)
  const rtl = getLanguageByCode(langCode)?.rtl ?? false
  const supabase = useMemo(() => createClient(), [])
  const [fullName, setFullName] = useState('')
  const [dateOfBirth, setDateOfBirth] = useState('')
  const [biologicalSex, setBiologicalSex] = useState<BiologicalSex | ''>('')
  const [primaryLanguage, setPrimaryLanguage] = useState(langName)
  const [primaryLanguageCode, setPrimaryLanguageCode] = useState(langCode)
  const [chronicConditions, setChronicConditions] = useState('')
  const [lifestyle, setLifestyle] = useState<PatientLifestyle>({
    smoker: false,
    alcohol: false,
    recentTravel: false,
  })
  const [consentChecked, setConsentChecked] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [submitting, setSubmitting] = useState(false)
  const [loadingProfile, setLoadingProfile] = useState(true)
  const [submitError, setSubmitError] = useState<string | null>(null)

  const computedAge = dateOfBirth ? ageFromDateOfBirth(dateOfBirth) : null

  // Toggle a lifestyle factor. Turning one off also drops its follow-up answers
  // so a de-selected factor never leaves stale detail in the doctor's report.
  const toggleLifestyle = (key: 'smoker' | 'alcohol' | 'recentTravel') => {
    setLifestyle(prev => {
      const next: PatientLifestyle = { ...prev, [key]: !prev[key] }
      if (!next[key]) {
        if (key === 'smoker') next.smokerFrequency = undefined
        if (key === 'alcohol') next.alcoholFrequency = undefined
        if (key === 'recentTravel') {
          next.travelWhen = undefined
          next.tripLength = undefined
        }
      }
      return next
    })
  }

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
          .select('name, sex, preferred_language, language_code')
          .eq('id', user.id)
          .single()

        if (profileError || !profile || cancelled) {
          if (!cancelled) setLoadingProfile(false)
          return
        }

        if (profile.name) setFullName(profile.name)
        const loadedSex = profile.sex ? fromDbSex(profile.sex) : null
        if (loadedSex) setBiologicalSex(loadedSex)
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
    if (!fullName.trim()) next.fullName = t('intake.errFullName')
    if (!dateOfBirth) next.dateOfBirth = t('intake.errDobRequired')
    else if (!isRealCalendarDate(dateOfBirth)) next.dateOfBirth = t('intake.errDobInvalid')
    else if (computedAge === null || computedAge < 0) next.dateOfBirth = t('intake.errDobInvalid')
    else if (computedAge > 120) next.dateOfBirth = t('intake.errDobInvalid')
    else if (computedAge < MINIMUM_AGE) next.dateOfBirth = t('intake.errDobTooYoung', { age: MINIMUM_AGE })
    if (!biologicalSex) next.biologicalSex = t('intake.errSex')
    if (!primaryLanguage.trim()) next.primaryLanguage = t('intake.errPrimaryLanguage')
    if (!consentChecked) next.consent = t('intake.errConsent')
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
      lifestyle,
      consentAt,
    }

    try {
      // A guest may reach intake without a session (e.g. "Continue to chat" or
      // "Start without an account"). getUser() then returns AuthSessionMissingError,
      // so treat any lookup failure as "no user" rather than aborting the save.
      const { data: { user: existingUser } } = await supabase.auth.getUser()

      // No session yet — establish an anonymous one so the profile, session, and
      // downstream report can persist. If anonymous sign-in is unavailable, fall
      // through to a local-only completion instead of surfacing an error.
      let user = existingUser
      if (!user) {
        const { data: anonData } = await supabase.auth.signInAnonymously()
        user = anonData?.user ?? null
      }

      if (user) {
        const { error: upsertError } = await supabase.from('profiles').upsert({
          id: user.id,
          name: profile.fullName,
          age: profile.age,
          date_of_birth: profile.dateOfBirth,
          sex: toDbSex(profile.biologicalSex),
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
    } catch (err) {
      console.error('Failed to save patient profile', err)
      setSubmitError(t('intake.errSubmit'))
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
        data-lenis-prevent
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
          dir={rtl ? 'rtl' : 'ltr'}
          className="my-auto flex w-full max-w-lg flex-col gap-5 rounded-lg bg-surface p-6 shadow-md"
        >
          <div className="flex flex-col gap-1">
            <h2 id="profile-intake-title" className="text-lg font-semibold text-text-primary">
              {t('intake.title')}
            </h2>
            <p className="text-sm leading-relaxed text-text-secondary">
              {t('intake.subtitle')}
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
                label={t('intake.fullName')}
                value={fullName}
                onChange={e => setFullName(e.target.value)}
                autoComplete="name"
                error={errors.fullName}
                required
              />

              <div className="grid grid-cols-2 gap-3">
                <DateInput
                  label={t('intake.dateOfBirth')}
                  value={dateOfBirth}
                  onChange={setDateOfBirth}
                  error={errors.dateOfBirth}
                  required
                />
                <Input
                  label={t('intake.age')}
                  value={computedAge != null ? t('intake.ageValue', { age: computedAge }) : '—'}
                  readOnly
                  tabIndex={-1}
                  className="bg-sunken text-text-secondary"
                  helper={t('intake.ageHelper')}
                />
              </div>

              <fieldset>
                <legend className="mb-2 block text-xs font-medium uppercase tracking-wide text-text-secondary">
                  {t('intake.biologicalSex')}
                </legend>
                <div className="flex flex-wrap gap-2">
                  {SEX_OPTIONS.map(opt => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setBiologicalSex(opt.value)}
                      className={cn(
                        'min-h-[44px] rounded-md border px-4 py-2 text-sm font-medium transition-colors duration-150',
                        biologicalSex === opt.value
                          ? 'border-brand-strong bg-brand-subtle text-brand-ink'
                          : 'border-border-subtle bg-surface text-text-primary hover:border-border-default hover:bg-sunken',
                      )}
                    >
                      {t(opt.labelKey)}
                    </button>
                  ))}
                </div>
                {errors.biologicalSex && (
                  <p className="mt-1 text-xs text-error-text" role="alert">{errors.biologicalSex}</p>
                )}
              </fieldset>

              <Input
                label={t('intake.primaryLanguage')}
                value={primaryLanguage}
                onChange={e => setPrimaryLanguage(e.target.value)}
                helper={t('intake.primaryLanguageHelper')}
                error={errors.primaryLanguage}
                required
              />

              <div>
                <label
                  htmlFor="chronic-conditions"
                  className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-text-secondary"
                >
                  {t('intake.chronicConditions')} <span className="normal-case text-text-tertiary">{t('common.optional')}</span>
                </label>
                <textarea
                  id="chronic-conditions"
                  value={chronicConditions}
                  onChange={e => setChronicConditions(e.target.value)}
                  rows={2}
                  placeholder={t('intake.chronicPlaceholder')}
                  className="w-full rounded-md border border-border-subtle bg-surface px-3 py-2 text-base text-text-primary placeholder:text-text-placeholder focus:border-brand-ink focus:outline-none focus:ring-2 focus:ring-brand-ink/25"
                />
              </div>

              <fieldset>
                <legend className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-text-secondary">
                  {t('intake.lifestyle')} <span className="normal-case text-text-tertiary">{t('common.optional')}</span>
                </legend>
                <p className="mb-2 text-xs text-text-tertiary">{t('intake.lifestyleHelper')}</p>
                <div className="flex flex-wrap gap-2">
                  {LIFESTYLE_OPTIONS.map(opt => {
                    const active = lifestyle[opt.key]
                    return (
                      <button
                        key={opt.key}
                        type="button"
                        aria-pressed={active}
                        onClick={() => toggleLifestyle(opt.key)}
                        className={cn(
                          'min-h-[44px] rounded-md border px-4 py-2 text-sm font-medium transition-colors duration-150',
                          active
                            ? 'border-brand-strong bg-brand-subtle text-brand-ink'
                            : 'border-border-subtle bg-surface text-text-primary hover:border-border-default hover:bg-sunken',
                        )}
                      >
                        {t(opt.labelKey)}
                      </button>
                    )
                  })}
                </div>

                <AnimatePresence initial={false}>
                  {lifestyle.smoker && (
                    <Reveal key="smoker">
                      <ChoiceRow
                        label={t('intake.smokeFrequencyQuestion')}
                        value={lifestyle.smokerFrequency}
                        options={FREQUENCY_OPTIONS}
                        onSelect={v => setLifestyle(prev => ({ ...prev, smokerFrequency: v }))}
                        t={t}
                      />
                    </Reveal>
                  )}
                  {lifestyle.alcohol && (
                    <Reveal key="alcohol">
                      <ChoiceRow
                        label={t('intake.alcoholFrequencyQuestion')}
                        value={lifestyle.alcoholFrequency}
                        options={FREQUENCY_OPTIONS}
                        onSelect={v => setLifestyle(prev => ({ ...prev, alcoholFrequency: v }))}
                        t={t}
                      />
                    </Reveal>
                  )}
                  {lifestyle.recentTravel && (
                    <Reveal key="travel">
                      <ChoiceRow
                        label={t('intake.travelWhenQuestion')}
                        value={lifestyle.travelWhen}
                        options={TRAVEL_WHEN_OPTIONS}
                        onSelect={v => setLifestyle(prev => ({ ...prev, travelWhen: v }))}
                        t={t}
                      />
                      <ChoiceRow
                        label={t('intake.tripLengthQuestion')}
                        value={lifestyle.tripLength}
                        options={TRIP_LENGTH_OPTIONS}
                        onSelect={v => setLifestyle(prev => ({ ...prev, tripLength: v }))}
                        t={t}
                      />
                    </Reveal>
                  )}
                </AnimatePresence>
              </fieldset>

              <label className="flex cursor-pointer items-start gap-3 rounded-lg border border-border-subtle bg-sunken/50 p-3">
                <input
                  type="checkbox"
                  checked={consentChecked}
                  onChange={e => setConsentChecked(e.target.checked)}
                  className="mt-0.5 size-5 shrink-0 rounded border-border-default accent-brand-ink"
                />
                <span className="text-sm leading-relaxed text-text-secondary">
                  {renderConsent(t)}
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
            {submitting ? t('intake.submitting') : t('intake.submit')}
          </button>
        </motion.form>
      </motion.div>
    </AnimatePresence>
  )
}