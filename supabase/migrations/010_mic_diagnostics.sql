-- Migration 010: microphone failure diagnostics
--
-- PROPOSED — not yet applied. Review before running.
--
-- Voice input fails silently for some testers and works for others on the same
-- build. Without the browser's actual error name we can only guess: a tester who
-- had already granted mic permission in their phone Settings still saw a generic
-- "blocked" message, which means the real fault was NOT a permission denial
-- (NotReadableError / an in-app browser webview both present the same way).
--
-- One row per failed mic attempt, written by /api/mic-diagnostics.
--
-- PRIVACY: this table carries NO health data and no message content. It holds a
-- user agent string, the browser's error name/message, and the app language —
-- device metadata only. IPs are stored as the same truncated SHA-256 hash used
-- everywhere else (src/lib/clientIp.ts), never raw. user_id is deliberately NOT
-- recorded: correlating a device fingerprint to a patient identity is not needed
-- to fix a microphone, and not collecting it keeps the table out of PHI scope.

-- ─── table ──────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.mic_diagnostics (
  id               bigserial   PRIMARY KEY,
  -- 'denied' | 'no-hardware' | 'in-use' | 'insecure' | 'unsupported' | 'unknown'
  error_kind       text        NOT NULL,
  -- Raw DOMException name, e.g. 'NotReadableError'. The whole point of the table.
  error_name       text,
  error_message    text,
  -- 'getUserMedia' | 'speech-recognition'
  source           text        NOT NULL,
  lang_code        text,
  -- Permissions API reading at failure time: granted|denied|prompt|unsupported.
  -- 'granted' here alongside a failure is the smoking gun for a non-permission fault.
  permission_state text,
  -- Host app when running in a webview (Instagram, TikTok, …), else NULL.
  in_app_browser   text,
  platform         text,
  user_agent       text,
  secure_context   boolean,
  has_media_devices boolean,
  ip_hash          text,
  created_at       timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS mic_diagnostics_triage_idx
  ON public.mic_diagnostics (created_at DESC, error_kind);

-- ─── lock the table down ────────────────────────────────────────────────────
-- Same posture as ip_calls (007) and contact_attempts (009): RLS on with zero
-- policies denies every non-owner role, and the default grants are revoked so
-- PostgREST cannot read or write it. The only path in is the SECURITY DEFINER
-- function below, which runs as the owner and so bypasses RLS.
--
-- This matters more than it looks: every Keiro patient is signed in (anonymous
-- auth) the moment they start a chat, so leaving `authenticated` with a grant
-- would let any visitor dump every tester's user agent.
ALTER TABLE public.mic_diagnostics ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON public.mic_diagnostics FROM PUBLIC;
REVOKE ALL ON public.mic_diagnostics FROM anon;
REVOKE ALL ON public.mic_diagnostics FROM authenticated;

REVOKE ALL ON SEQUENCE public.mic_diagnostics_id_seq FROM PUBLIC;
REVOKE ALL ON SEQUENCE public.mic_diagnostics_id_seq FROM anon;
REVOKE ALL ON SEQUENCE public.mic_diagnostics_id_seq FROM authenticated;

-- ─── write path: SECURITY DEFINER insert with a pinned search_path ──────────
-- search_path is pinned per 009's finding: an unpinned SECURITY DEFINER function
-- with unqualified table references can be pointed at an attacker-chosen relation.
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
BEGIN
  INSERT INTO public.mic_diagnostics (
    error_kind, error_name, error_message, source, lang_code,
    permission_state, in_app_browser, platform, user_agent,
    secure_context, has_media_devices, ip_hash
  ) VALUES (
    p_error_kind, p_error_name, p_error_message, p_source, p_lang_code,
    p_permission_state, p_in_app_browser, p_platform, p_user_agent,
    p_secure_context, p_has_media_devices, p_ip_hash
  );
END;
$$;

-- The mic can fail before a patient has any session, and the /chat route serves
-- anonymous visitors, so anon must keep EXECUTE.
REVOKE EXECUTE ON FUNCTION public.record_mic_diagnostic(
  text,text,text,text,text,text,text,text,text,boolean,boolean,text
) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.record_mic_diagnostic(
  text,text,text,text,text,text,text,text,text,boolean,boolean,text
) TO anon;
GRANT EXECUTE ON FUNCTION public.record_mic_diagnostic(
  text,text,text,text,text,text,text,text,text,boolean,boolean,text
) TO authenticated;

-- ─── verify (run separately; all should be TRUE) ────────────────────────────
-- select
--   (select relrowsecurity from pg_class where oid = 'public.mic_diagnostics'::regclass) as rls_on,
--   not has_table_privilege('anon','public.mic_diagnostics','SELECT')          as anon_cannot_read,
--   not has_table_privilege('authenticated','public.mic_diagnostics','SELECT') as authed_cannot_read,
--   not has_table_privilege('authenticated','public.mic_diagnostics','INSERT') as authed_cannot_insert,
--   has_function_privilege('anon','public.record_mic_diagnostic(text,text,text,text,text,text,text,text,text,boolean,boolean,text)','EXECUTE') as anon_can_exec,
--   (select proconfig from pg_proc where oid = 'public.record_mic_diagnostic(text,text,text,text,text,text,text,text,text,boolean,boolean,text)'::regprocedure) @> array['search_path=""'] as search_path_pinned;
--
-- Triage query — the failures worth acting on, newest first:
--   select created_at, error_kind, error_name, permission_state, in_app_browser, platform, user_agent
--   from public.mic_diagnostics order by created_at desc limit 50;
--
-- "Granted at the OS level but still failing" — the case that started this:
--   select error_name, count(*) from public.mic_diagnostics
--   where permission_state = 'granted' group by 1 order by 2 desc;
