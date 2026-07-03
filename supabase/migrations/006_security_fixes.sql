-- Migration 006: Security fixes from audit 2026-06-17
--
-- 1. RLS UPDATE policy for reports table
--    Migration 003 documented "UPDATE not needed — reports are write-once" but
--    migration 005 added physician_notes + consult_transcript_json and a PATCH
--    endpoint to write them. Without this policy, PATCH silently fails (RLS
--    violation) and physician notes are never persisted to the DB.
--
-- 2. Atomic rate-limit function
--    Replaces the read-then-write race condition in checkRateLimit (H-1).
--    Two concurrent requests could both read count=N, both pass, and both
--    insert — exceeding the limit. A single SQL function using an advisory
--    lock makes the check-and-insert atomic (no separate counter table needed).
--
-- 3. contact_attempts table
--    Replaces the in-memory Map in /api/contact that resets on every Vercel
--    cold start. M-2 fix.

-- ─── 1. Reports: allow users to update their own rows ──────────────────────
CREATE POLICY "Users can update own reports"
  ON public.reports
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ─── 2. Atomic rate-limit function ─────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.check_and_record_api_call(
  p_user_id  uuid,
  p_endpoint text,
  p_limit    int,
  p_window_ms bigint
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_count        int;
  v_window_start timestamptz;
BEGIN
  v_window_start := now() - (p_window_ms || ' milliseconds')::interval;

  -- Acquire a transaction-scoped advisory lock keyed on (user_id, endpoint).
  -- Concurrent calls with the same key block here until the first completes,
  -- making the count-check and insert below atomic per (user, endpoint) pair.
  PERFORM pg_advisory_xact_lock(
    hashtext(p_user_id::text),
    hashtext(p_endpoint)
  );

  SELECT COUNT(*) INTO v_count
  FROM public.api_calls
  WHERE user_id  = p_user_id
    AND endpoint = p_endpoint
    AND created_at >= v_window_start;

  IF v_count >= p_limit THEN
    RETURN false;
  END IF;

  INSERT INTO public.api_calls (user_id, endpoint)
  VALUES (p_user_id, p_endpoint);

  RETURN true;
END;
$$;

-- Only authenticated users may call this function (anon key is the caller).
-- REVOKE/GRANT do not accept comma-separated role lists; use separate statements.
REVOKE EXECUTE ON FUNCTION public.check_and_record_api_call FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.check_and_record_api_call FROM anon;
GRANT  EXECUTE ON FUNCTION public.check_and_record_api_call TO authenticated;

-- ─── 3. contact_attempts table for persistent IP rate limiting ─────────────
CREATE TABLE IF NOT EXISTS public.contact_attempts (
  id         bigserial PRIMARY KEY,
  ip_hash    text        NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS contact_attempts_ip_hash_created_at_idx
  ON public.contact_attempts (ip_hash, created_at);

-- RLS disabled; enforce access through explicit role grants only.
-- The contact form is unauthenticated so PostgREST uses the anon role.
ALTER TABLE public.contact_attempts DISABLE ROW LEVEL SECURITY;
GRANT INSERT, SELECT ON public.contact_attempts TO anon;
GRANT INSERT, SELECT ON public.contact_attempts TO authenticated;
