export interface Language {
  code: string
  en: string
  native: string
  roman: string
  flag: string
  deeplCode?: string
  googleCode: string
  voiceLang: string
  rtl?: boolean
}

export type BiologicalSex = 'male' | 'female' | 'other'

/**
 * Which Keiro voice reads Kai's messages aloud. Asked separately from
 * biologicalSex at intake — the sex a report needs and the voice a patient
 * wants to be spoken to in are two different questions.
 */
export type VoiceType = 'male' | 'female'

export interface PatientProfile {
  fullName: string
  dateOfBirth: string
  age?: number
  biologicalSex: BiologicalSex
  /** Optional on the wire: profiles saved before intake asked this have none. */
  voiceType?: VoiceType
  primaryLanguage: string
  primaryLanguageCode: string
  chronicConditions?: string
  lifestyle?: PatientLifestyle
  consentAt: string
}

/** How often a patient-reported habit (smoking, drinking) occurs. */
export type LifestyleFrequency = 'rarely' | 'sometimes' | 'often'

/** How recently the patient last travelled. */
export type TravelRecency = 'past_week' | 'past_month' | 'past_6_months'

/** Duration of the patient's most recent trip (relevant to clot / exposure risk). */
export type TripLength = 'over_2h' | 'over_6h' | 'over_12h'

/**
 * Lifestyle factors collected up front — the chat no longer asks these, to save
 * turns. Each flag can carry an optional follow-up detail the patient taps in.
 */
export interface PatientLifestyle {
  smoker: boolean
  smokerFrequency?: LifestyleFrequency
  alcohol: boolean
  alcoholFrequency?: LifestyleFrequency
  recentTravel: boolean
  travelWhen?: TravelRecency
  tripLength?: TripLength
}

export interface ConsultMessage {
  id: string
  side: 'doctor' | 'patient'
  original: string
  translation: string
  timestamp: string
}

export interface Profile {
  id: string
  name?: string
  age?: number
  date_of_birth?: string
  sex?: BiologicalSex | 'prefer_not_to_say'
  chronic_conditions?: string
  preferred_language: string
  language_code: string
  romanization_enabled: boolean
  /** A VoiceType since Fish Audio replaced browser TTS; older rows hold a browser voice name. */
  preferred_voice?: string
  is_anonymous: boolean
  created_at: string
  updated_at: string
}

export interface Session {
  id: string
  user_id: string
  hospital_id?: string
  mode: 'new_symptoms' | 'known_diagnosis' | 'returning'
  language: string
  language_code: string
  status: 'active' | 'completed' | 'abandoned'
  started_at: string
  completed_at?: string
  expires_at: string
}

export interface Symptom {
  location: string
  severity: number
  duration: string
  character: string
  onset: string
  modifiers: string
}

export interface Medication {
  name: string
  dosage: string
  frequency: string
}

export interface AssociatedSymptoms {
  fever: boolean
  nausea: boolean
  fatigue: boolean
  dizziness: boolean
  appetite_loss: boolean
}

export interface Lifestyle {
  smoker: boolean
  alcohol: boolean
  recent_travel: boolean
}

export interface PossibleCondition {
  condition: string
  reasoning: string
}

export interface Report {
  id: string
  session_id: string
  user_id: string
  report_id: string
  patient_name?: string
  patient_age?: number
  patient_dob?: string
  patient_sex?: string
  language_used: string
  visit_type: string
  chief_complaint: string
  clinical_symptoms_summary?: string
  symptoms_json: Symptom[]
  associated_symptoms_json: AssociatedSymptoms
  lifestyle_json: Lifestyle
  medications_json: Medication[]
  conditions_json: string[]
  family_history_json: string
  allergies_json: string[]
  possible_conditions_json: PossibleCondition[]
  additional_notes: string
  physician_notes?: string
  consult_transcript_json?: ConsultMessage[]
  created_at: string
}

export interface Hospital {
  id: string
  name: string
  location?: string
  qr_slug?: string
  contact_email?: string
  active: boolean
  created_at: string
}

export interface ChatMessage {
  id: string
  role: 'kai' | 'user'
  content: string
  timestamp: Date
  isTyping?: boolean
}

export interface ReportData {
  chief_complaint: string
  clinical_symptoms_summary?: string
  symptoms: Symptom[]
  associated_symptoms: AssociatedSymptoms
  medications: Medication[]
  allergies: string[]
  conditions: string[]
  history: string
  lifestyle: Lifestyle
  family_history: string
  lmp?: string | null
  additional_notes: string
  possible_conditions: PossibleCondition[]
}