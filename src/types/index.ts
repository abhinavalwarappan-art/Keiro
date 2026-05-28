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

export interface Profile {
  id: string
  name?: string
  age?: number
  sex?: 'male' | 'female' | 'prefer_not_to_say'
  preferred_language: string
  language_code: string
  romanization_enabled: boolean
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
  patient_sex?: string
  language_used: string
  visit_type: string
  chief_complaint: string
  symptoms_json: Symptom[]
  associated_symptoms_json: AssociatedSymptoms
  lifestyle_json: Lifestyle
  medications_json: Medication[]
  conditions_json: string[]
  family_history_json: string
  allergies_json: string[]
  possible_conditions_json: PossibleCondition[]
  additional_notes: string
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
