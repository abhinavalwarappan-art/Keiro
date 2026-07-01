-- Patient profile fields, session consent audit, report consult extensions

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS date_of_birth date,
  ADD COLUMN IF NOT EXISTS chronic_conditions text;

DO $$ BEGIN
  ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_sex_check;
  ALTER TABLE public.profiles
    ADD CONSTRAINT profiles_sex_check CHECK (sex IN ('male','female','other','prefer_not_to_say'));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

ALTER TABLE public.sessions
  ADD COLUMN IF NOT EXISTS consent_at timestamptz,
  ADD COLUMN IF NOT EXISTS patient_profile_json jsonb;

ALTER TABLE public.reports
  ADD COLUMN IF NOT EXISTS patient_dob date,
  ADD COLUMN IF NOT EXISTS clinical_symptoms_summary text,
  ADD COLUMN IF NOT EXISTS physician_notes text,
  ADD COLUMN IF NOT EXISTS consult_transcript_json jsonb;

CREATE INDEX IF NOT EXISTS idx_sessions_user_active
  ON public.sessions (user_id, status)
  WHERE status = 'active';