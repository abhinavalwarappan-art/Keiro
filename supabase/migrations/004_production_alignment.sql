-- 004: Align live schema with application code (see AUDIT.md for drift analysis)
-- Applied to project fpvnwlvjpdhzespxyicf on 2026-06-10 via Supabase MCP.
--
-- Why: the live DB held an older prototype shape (reports with patient_info jsonb,
-- api_calls.called_at, 4-column profiles) while the app code and migrations 001-003
-- expect the *_json report columns, api_calls.created_at, and full profiles.
-- reports/sessions/messages were empty live, so they are recreated; profiles (15 rows)
-- is extended additively; api_calls keeps its data through a column rename.

-- ── 1. PROFILES: add columns the app reads/writes ────────────────────────────
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS name text,
  ADD COLUMN IF NOT EXISTS age integer,
  ADD COLUMN IF NOT EXISTS sex text,
  ADD COLUMN IF NOT EXISTS language_code text NOT NULL DEFAULT 'en-US',
  ADD COLUMN IF NOT EXISTS romanization_enabled boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS preferred_voice text,
  ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT now(),
  ADD COLUMN IF NOT EXISTS data_processing_consent boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS consent_date timestamptz;

DO $$ BEGIN
  ALTER TABLE public.profiles
    ADD CONSTRAINT profiles_sex_check CHECK (sex IN ('male','female','prefer_not_to_say'));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Bug fix: guard against missing column before altering default
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns
             WHERE table_schema = 'public' AND table_name = 'profiles'
               AND column_name = 'preferred_language') THEN
    ALTER TABLE public.profiles ALTER COLUMN preferred_language SET DEFAULT 'en';
  END IF;
END $$;

DO $$ BEGIN
  ALTER TABLE public.profiles
    ADD CONSTRAINT profiles_language_len CHECK (char_length(language_code) <= 20);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ── 2. API_CALLS: column name the rate limiter queries ──────────────────────
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns
             WHERE table_schema='public' AND table_name='api_calls' AND column_name='called_at') THEN
    ALTER TABLE public.api_calls RENAME COLUMN called_at TO created_at;
  END IF;
END $$;

-- Guard: only alter default if created_at now exists (either renamed or pre-existing)
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns
             WHERE table_schema='public' AND table_name='api_calls' AND column_name='created_at') THEN
    ALTER TABLE public.api_calls ALTER COLUMN created_at SET DEFAULT now();
  END IF;
END $$;

-- ── 3. Recreate drifted, empty tables in dependency order ───────────────────
DROP TABLE IF EXISTS public.messages;
DROP TABLE IF EXISTS public.reports;
DROP TABLE IF EXISTS public.sessions;

CREATE TABLE IF NOT EXISTS public.hospitals (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  location text,
  qr_slug text UNIQUE,
  contact_email text,
  active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE public.sessions (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
  hospital_id uuid REFERENCES public.hospitals(id),
  mode text CHECK (mode IN ('new_symptoms','known_diagnosis','returning')),
  language text NOT NULL,
  language_code text NOT NULL,
  status text DEFAULT 'active' CHECK (status IN ('active','completed','abandoned')),
  started_at timestamptz DEFAULT now(),
  completed_at timestamptz,
  expires_at timestamptz DEFAULT (now() + interval '2 hours'),
  CONSTRAINT sessions_language_len CHECK (char_length(language) <= 50),
  CONSTRAINT sessions_language_code_len CHECK (char_length(language_code) <= 20)
);

CREATE TABLE public.messages (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id uuid REFERENCES public.sessions(id) ON DELETE CASCADE,
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  role text NOT NULL CHECK (role IN ('user','assistant')),
  content text NOT NULL CHECK (char_length(content) <= 4000),
  language text,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE public.reports (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id uuid REFERENCES public.sessions(id) ON DELETE CASCADE,
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
  report_id text UNIQUE NOT NULL,
  patient_name text,
  patient_age integer,
  patient_sex text,
  language_used text CHECK (char_length(language_used) <= 50),
  visit_type text,
  chief_complaint text,
  symptoms_json jsonb,
  associated_symptoms_json jsonb,
  lifestyle_json jsonb,
  medications_json jsonb,
  conditions_json jsonb,
  family_history_json jsonb,
  allergies_json jsonb,
  possible_conditions_json jsonb,
  additional_notes text,
  created_at timestamptz DEFAULT now()
);

-- ── 4. New: feedback + consent audit trail ──────────────────────────────────
CREATE TABLE IF NOT EXISTS public.feedback (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  type text CHECK (type IN ('bug','feature','general','complaint')),
  subject text CHECK (char_length(subject) <= 200),
  message text NOT NULL CHECK (char_length(message) <= 4000),
  status text DEFAULT 'open' CHECK (status IN ('open','in_progress','resolved','closed')),
  page_url text CHECK (char_length(page_url) <= 2048),
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.consents (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  consent_type text NOT NULL CHECK (consent_type IN ('terms','privacy','health_data','analytics')),
  granted boolean NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- ── 5. RLS ───────────────────────────────────────────────────────────────────
ALTER TABLE public.hospitals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.consents ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "Hospitals are publicly readable"
    ON public.hospitals FOR SELECT USING (active = true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "Users can view own sessions"
    ON public.sessions FOR SELECT USING (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "Users can insert own sessions"
    ON public.sessions FOR INSERT WITH CHECK (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "Users can update own sessions"
    ON public.sessions FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "Users can delete own sessions"
    ON public.sessions FOR DELETE USING (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "Users can view own messages"
    ON public.messages FOR SELECT USING (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "Users can insert own messages"
    ON public.messages FOR INSERT WITH CHECK (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "Users can delete own messages"
    ON public.messages FOR DELETE USING (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "Users can view own reports"
    ON public.reports FOR SELECT USING (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "Users can insert own reports"
    ON public.reports FOR INSERT WITH CHECK (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "Users can delete own reports"
    ON public.reports FOR DELETE USING (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  -- Security fix: unauthenticated users must not set user_id; authenticated users
  -- may submit anonymous feedback (user_id IS NULL) or attach their own id only.
  CREATE POLICY "Authenticated users can submit feedback"
    ON public.feedback FOR INSERT TO authenticated
    WITH CHECK (user_id IS NULL OR auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  -- Security fix: NULL user_id rows (anonymous feedback) are excluded from user view
  CREATE POLICY "Users can view own feedback"
    ON public.feedback FOR SELECT USING (user_id IS NOT NULL AND auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "Users can insert own consents"
    ON public.consents FOR INSERT WITH CHECK (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "Users can view own consents"
    ON public.consents FOR SELECT USING (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "Users can delete own profile"
    ON public.profiles FOR DELETE USING (auth.uid() = id);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ── 6. Functions: advisor fixes ──────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
BEGIN
  INSERT INTO public.profiles (id, is_anonymous)
  VALUES (
    NEW.id,
    COALESCE((NEW.raw_user_meta_data->>'is_anonymous')::boolean, NEW.is_anonymous, false)
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;

DO $$ BEGIN
  REVOKE EXECUTE ON FUNCTION public.rls_auto_enable() FROM PUBLIC, anon, authenticated;
EXCEPTION WHEN undefined_function THEN NULL; END $$;

DO $$ BEGIN
  ALTER FUNCTION public.rls_auto_enable() SET search_path = '';
EXCEPTION WHEN undefined_function THEN NULL; END $$;

DO $$ BEGIN
  ALTER FUNCTION public.generate_report_id() SET search_path = '';
EXCEPTION WHEN undefined_function THEN NULL; END $$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;
REVOKE EXECUTE ON FUNCTION public.handle_updated_at() FROM PUBLIC, anon, authenticated;

DROP TRIGGER IF EXISTS profiles_updated_at ON public.profiles;
CREATE TRIGGER profiles_updated_at BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- ── 7. Indexes ────────────────────────────────────────────────────────────────
-- Guard: only create rate-limiter index if created_at column exists on api_calls
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns
             WHERE table_schema='public' AND table_name='api_calls' AND column_name='created_at') THEN
    CREATE INDEX IF NOT EXISTS idx_api_calls_rate ON public.api_calls (user_id, endpoint, created_at);
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON public.sessions (user_id);
CREATE INDEX IF NOT EXISTS idx_messages_session_id ON public.messages (session_id);
CREATE INDEX IF NOT EXISTS idx_messages_user_id ON public.messages (user_id);
CREATE INDEX IF NOT EXISTS idx_reports_user_id ON public.reports (user_id);
CREATE INDEX IF NOT EXISTS idx_reports_created_at ON public.reports (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_feedback_user_id ON public.feedback (user_id);
CREATE INDEX IF NOT EXISTS idx_consents_user_id ON public.consents (user_id);