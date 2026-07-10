CREATE OR REPLACE FUNCTION public.check_and_record_contact_attempt(
  p_ip_hash text,
  p_limit int,
  p_window_ms bigint
) RETURNS boolean SECURITY DEFINER AS $$
DECLARE
  v_count int;
  v_window_start timestamptz;
BEGIN
  PERFORM pg_advisory_xact_lock(hashtext(p_ip_hash));
  v_window_start := now() - (p_window_ms || ' milliseconds')::interval;
  SELECT COUNT(*) INTO v_count
    FROM contact_attempts
    WHERE ip_hash = p_ip_hash
      AND created_at >= v_window_start;
  IF v_count >= p_limit THEN RETURN false; END IF;
  INSERT INTO contact_attempts (ip_hash) VALUES (p_ip_hash);
  RETURN true;
END;
$$ LANGUAGE plpgsql;

REVOKE ALL ON contact_attempts FROM anon;
GRANT EXECUTE ON FUNCTION public.check_and_record_contact_attempt TO anon;
