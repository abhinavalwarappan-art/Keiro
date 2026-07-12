-- Migration 009: harden contact_attempts and its rate-limit RPC
--
-- PROPOSED — not yet applied. Review before running.
--
-- Fixes two issues the Supabase linter flags on the live database, both created by
-- the 006 → 008 sequence:
--
--  1. ERROR  rls_disabled_in_public
--     006 did `ALTER TABLE contact_attempts DISABLE ROW LEVEL SECURITY` and granted
--     anon SELECT+INSERT. 008 revoked anon but left `authenticated` holding both
--     grants, and left RLS off. contact_attempts is in the `public` schema, so
--     PostgREST exposes it: any signed-in user — and every Keiro patient is signed
--     in, via anonymous auth, the moment they start a chat — can currently
--     `GET /rest/v1/contact_attempts` and dump every hashed IP and timestamp.
--     Low-sensitivity data (IPs are SHA-256'd and truncated), but it is a table the
--     app never intends to expose, and it is an unauthenticated-adjacent read of a
--     security table.
--
--  2. WARN   function_search_path_mutable
--     008's check_and_record_contact_attempt is SECURITY DEFINER but does not pin
--     search_path and refers to `contact_attempts` unqualified. A role that can set
--     search_path could shadow the table and have the definer (postgres) write to
--     an attacker-chosen relation. 007's check_and_record_ip_call already does this
--     correctly — this brings 008 in line with it.
--
-- After this migration NOTHING has direct table access. The only path to
-- contact_attempts is the SECURITY DEFINER function, which is exactly how 007
-- treats ip_calls.

-- ─── 1. Repin the RPC: pinned search_path + schema-qualified references ──────
CREATE OR REPLACE FUNCTION public.check_and_record_contact_attempt(
  p_ip_hash   text,
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
  -- Transaction-scoped advisory lock makes the count-check and the insert atomic
  -- for a given IP, so concurrent submissions can't all read count=0 and pass.
  PERFORM pg_advisory_xact_lock(hashtext(p_ip_hash));

  v_window_start := now() - (p_window_ms || ' milliseconds')::interval;

  SELECT COUNT(*) INTO v_count
  FROM public.contact_attempts
  WHERE ip_hash = p_ip_hash
    AND created_at >= v_window_start;

  IF v_count >= p_limit THEN
    RETURN false;
  END IF;

  INSERT INTO public.contact_attempts (ip_hash) VALUES (p_ip_hash);

  RETURN true;
END;
$$;

-- ─── 2. Close direct table access entirely ──────────────────────────────────
-- RLS on with zero policies = every non-owner role is denied. The function above
-- runs as the owner (postgres), which bypasses RLS, so the contact form keeps
-- working while PostgREST reads/writes are shut off.
ALTER TABLE public.contact_attempts ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON public.contact_attempts FROM PUBLIC;
REVOKE ALL ON public.contact_attempts FROM anon;
REVOKE ALL ON public.contact_attempts FROM authenticated;

-- ─── 3. Execute rights: the contact form is public, so anon must keep them ───
REVOKE EXECUTE ON FUNCTION public.check_and_record_contact_attempt(text,int,bigint) FROM PUBLIC;
GRANT  EXECUTE ON FUNCTION public.check_and_record_contact_attempt(text,int,bigint) TO anon;
GRANT  EXECUTE ON FUNCTION public.check_and_record_contact_attempt(text,int,bigint) TO authenticated;

-- ─── APPLIED to the live database on 2026-07-11. ────────────────────────────
--
-- ─── verify (run separately; all should be TRUE) ────────────────────────────
-- Note the search_path predicate: `SET search_path = ''` is stored in proconfig as
-- the string `search_path=""` (quoted empty string), NOT `search_path=`. Asserting
-- the latter yields a false negative.
--
-- select
--   (select relrowsecurity from pg_class where oid = 'public.contact_attempts'::regclass) as rls_on,
--   not has_table_privilege('anon','public.contact_attempts','SELECT')          as anon_cannot_read,
--   not has_table_privilege('authenticated','public.contact_attempts','SELECT') as authed_cannot_read,
--   not has_table_privilege('authenticated','public.contact_attempts','INSERT') as authed_cannot_insert,
--   has_function_privilege('anon','public.check_and_record_contact_attempt(text,int,bigint)','EXECUTE') as anon_can_exec,
--   (select prosecdef from pg_proc where oid = 'public.check_and_record_contact_attempt(text,int,bigint)'::regprocedure) as is_definer,
--   (select proconfig from pg_proc where oid = 'public.check_and_record_contact_attempt(text,int,bigint)'::regprocedure) @> array['search_path=""'] as search_path_pinned;
--
-- Smoke (should return true, then insert one row):
--   select public.check_and_record_contact_attempt('verify-hash', 5, 900000);
--   delete from public.contact_attempts where ip_hash = 'verify-hash';
