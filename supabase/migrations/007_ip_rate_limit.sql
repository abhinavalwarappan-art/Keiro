-- Migration 007: durable per-IP rate limiting for the main API routes
--
-- The per-IP tier in src/proxy.ts is an in-memory Map: it resets on every Vercel
-- cold start and is not shared across serverless instances, so it only catches
-- bursts on a single warm instance. This adds a DURABLE, cross-instance per-IP
-- limiter backed by the DB — atomic like the per-user check_and_record_api_call
-- (advisory lock, no read-then-write race). Called from the route handlers
-- alongside the per-user tier (src/lib/rateLimit.ts -> checkIpRateLimit).
--
-- IPs are stored as a truncated SHA-256 hash (see src/lib/clientIp.ts), never raw.

-- ─── table: one row per recorded request, keyed by hashed IP + endpoint ─────
CREATE TABLE IF NOT EXISTS public.ip_calls (
  id         bigserial   PRIMARY KEY,
  ip_hash    text        NOT NULL,
  endpoint   text        NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS ip_calls_lookup_idx
  ON public.ip_calls (ip_hash, endpoint, created_at);

-- Lock the table down: no direct client access. Only the SECURITY DEFINER
-- function below (owned by postgres) touches it. RLS is enabled (not FORCE) so the
-- owner still bypasses it, while anon/authenticated get no policy = denied. Revoke
-- the default grants too, so access is impossible except through the function.
ALTER TABLE public.ip_calls ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.ip_calls FROM anon;
REVOKE ALL ON public.ip_calls FROM authenticated;

-- ─── atomic check-and-record, keyed on hashed IP ────────────────────────────
CREATE OR REPLACE FUNCTION public.check_and_record_ip_call(
  p_ip_hash   text,
  p_endpoint  text,
  p_limit     int,
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

  -- Transaction-scoped advisory lock on (ip_hash, endpoint) makes the
  -- count-check and insert atomic per key — no read-then-write race.
  PERFORM pg_advisory_xact_lock(hashtext(p_ip_hash), hashtext(p_endpoint));

  SELECT COUNT(*) INTO v_count
  FROM public.ip_calls
  WHERE ip_hash = p_ip_hash
    AND endpoint = p_endpoint
    AND created_at >= v_window_start;

  IF v_count >= p_limit THEN
    RETURN false;
  END IF;

  INSERT INTO public.ip_calls (ip_hash, endpoint)
  VALUES (p_ip_hash, p_endpoint);

  RETURN true;
END;
$$;

-- Callers are the authenticated route handlers (SSR client = authenticated role).
REVOKE EXECUTE ON FUNCTION public.check_and_record_ip_call FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.check_and_record_ip_call FROM anon;
GRANT  EXECUTE ON FUNCTION public.check_and_record_ip_call TO authenticated;

-- ─── verify (run separately; all should be TRUE) ────────────────────────────
-- select
--   to_regclass('public.ip_calls') is not null                                              as table_exists,
--   to_regprocedure('public.check_and_record_ip_call(text,text,int,bigint)') is not null     as fn_exists,
--   has_function_privilege('authenticated','public.check_and_record_ip_call(text,text,int,bigint)','EXECUTE') as authed_can_exec,
--   not has_function_privilege('anon','public.check_and_record_ip_call(text,text,int,bigint)','EXECUTE')       as anon_blocked;
-- Smoke (records one row, returns true): select public.check_and_record_ip_call('verify-hash','chat',5,60000);
-- Cleanup after smoke:                    delete from public.ip_calls where ip_hash='verify-hash';
