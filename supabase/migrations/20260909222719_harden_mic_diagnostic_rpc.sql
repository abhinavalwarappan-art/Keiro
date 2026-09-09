-- Defense in depth for the intentionally public microphone-diagnostics RPC.
-- The Next.js route validates and rate-limits first, but anon callers can reach
-- exposed Supabase RPCs directly. Repeat those controls at the trust boundary.

CREATE INDEX IF NOT EXISTS mic_diagnostics_ip_window_idx
  ON public.mic_diagnostics (ip_hash, created_at DESC);

CREATE OR REPLACE FUNCTION public.record_mic_diagnostic(
  p_error_kind        text,
  p_error_name        text,
  p_error_message     text,
  p_source            text,
  p_lang_code         text,
  p_permission_state  text,
  p_in_app_browser    text,
  p_platform          text,
  p_user_agent        text,
  p_secure_context    boolean,
  p_has_media_devices boolean,
  p_ip_hash           text
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_now timestamptz := now();
  v_count integer;
BEGIN
  IF p_error_kind IS NULL OR p_error_kind NOT IN (
    'denied', 'no-hardware', 'in-use', 'insecure', 'unsupported', 'unknown'
  ) OR p_source IS NULL OR p_source NOT IN ('getUserMedia', 'speech-recognition') THEN
    RAISE EXCEPTION 'invalid diagnostic category' USING ERRCODE = '22023';
  END IF;

  IF p_permission_state IS NOT NULL AND p_permission_state NOT IN (
    'granted', 'denied', 'prompt', 'unsupported'
  ) OR p_platform IS NOT NULL AND p_platform NOT IN (
    'ios-safari', 'android-chrome', 'other'
  ) THEN
    RAISE EXCEPTION 'invalid diagnostic metadata' USING ERRCODE = '22023';
  END IF;

  IF p_ip_hash IS NULL OR p_ip_hash !~ '^[0-9a-f]{32}$'
    OR length(coalesce(p_error_name, '')) > 300
    OR length(coalesce(p_error_message, '')) > 300
    OR length(coalesce(p_lang_code, '')) > 20
    OR length(coalesce(p_in_app_browser, '')) > 40
    OR length(coalesce(p_user_agent, '')) > 400 THEN
    RAISE EXCEPTION 'invalid diagnostic payload' USING ERRCODE = '22023';
  END IF;

  -- Serialize the count-and-insert sequence. A global ceiling bounds direct-RPC
  -- floods even when an attacker rotates the caller-supplied IP hash.
  PERFORM pg_advisory_xact_lock(hashtext('mic_diagnostics'), 0);

  SELECT count(*) INTO v_count
  FROM public.mic_diagnostics
  WHERE created_at >= v_now - interval '1 minute';
  IF v_count >= 500 THEN RETURN; END IF;

  SELECT count(*) INTO v_count
  FROM public.mic_diagnostics
  WHERE ip_hash = p_ip_hash
    AND created_at >= v_now - interval '1 hour';
  IF v_count >= 60 THEN RETURN; END IF;

  INSERT INTO public.mic_diagnostics (
    error_kind, error_name, error_message, source, lang_code,
    permission_state, in_app_browser, platform, user_agent,
    secure_context, has_media_devices, ip_hash, created_at
  ) VALUES (
    p_error_kind, p_error_name, p_error_message, p_source, p_lang_code,
    p_permission_state, p_in_app_browser, p_platform, p_user_agent,
    p_secure_context, p_has_media_devices, p_ip_hash, v_now
  );
END;
$$;

REVOKE ALL ON FUNCTION public.record_mic_diagnostic(
  text,text,text,text,text,text,text,text,text,boolean,boolean,text
) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.record_mic_diagnostic(
  text,text,text,text,text,text,text,text,text,boolean,boolean,text
) TO anon, authenticated;
