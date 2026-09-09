-- PRE-LAUNCH AUDIT: keep rate-limit state private and prevent cross-user DoS.
-- Validated as SQL only. Do not apply without production approval.

REVOKE ALL ON TABLE public.api_calls FROM anon, authenticated;
REVOKE ALL ON TABLE public.ip_calls FROM anon, authenticated;
REVOKE ALL ON TABLE public.contact_attempts FROM anon, authenticated;

DROP POLICY IF EXISTS "Users see own api calls" ON public.api_calls;

CREATE OR REPLACE FUNCTION public.check_and_record_api_call(
  p_user_id uuid,
  p_endpoint text,
  p_limit integer,
  p_window_ms bigint
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_count integer;
  v_window_start timestamptz;
BEGIN
  IF auth.uid() IS NULL OR auth.uid() <> p_user_id THEN
    RAISE EXCEPTION 'unauthorized' USING ERRCODE = '42501';
  END IF;
  IF p_endpoint IS NULL OR p_limit < 1 OR p_window_ms < 1 THEN
    RAISE EXCEPTION 'invalid rate-limit arguments' USING ERRCODE = '22023';
  END IF;

  v_window_start := now() - (p_window_ms || ' milliseconds')::interval;
  PERFORM pg_advisory_xact_lock(hashtext(p_user_id::text), hashtext(p_endpoint));

  SELECT count(*) INTO v_count
  FROM public.api_calls
  WHERE user_id = p_user_id
    AND endpoint = p_endpoint
    AND created_at >= v_window_start;

  IF v_count >= p_limit THEN RETURN false; END IF;

  INSERT INTO public.api_calls (user_id, endpoint) VALUES (p_user_id, p_endpoint);
  RETURN true;
END;
$$;

REVOKE ALL ON FUNCTION public.check_and_record_api_call(uuid, text, integer, bigint) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.check_and_record_api_call(uuid, text, integer, bigint) TO authenticated, service_role;
