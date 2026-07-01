-- Migration 003: RLS hardening
-- Audit date: 2026-06-08
--
-- Findings from 001_initial.sql review:
--   • All 5 tables already have RLS ENABLED with correct per-user SELECT/INSERT policies.
--   • Sessions table is missing an UPDATE policy (needed to mark sessions complete/expired).
--   • Api_calls table is missing an UPDATE policy (not operationally required but belt-and-suspenders).
--   • No cross-user data access is possible via the existing ANON key + per-user policies.
--   • Sessions already expire at now() + 2 hours — no DB change needed.
--   • Service role is only used server-side (env var never exposed to client).
--
-- Changes in this migration:
--   1. Add UPDATE policy for sessions (e.g., marking a session as completed).
--   2. Add DB-level length constraints on user-input columns.
--   3. Confirm hospitals is safe to be publicly readable (non-sensitive reference data).

-- ── 1. Sessions UPDATE policy ────────────────────────────────────────────────
-- Allows the authenticated user to update only their own session row.
-- This is needed by the server-side session-completion logic.
-- Restrict updatable columns to prevent privilege escalation: users must not
-- be able to rewrite user_id, created_at, or other immutable identity fields.
CREATE POLICY "Users can update own sessions"
  ON sessions
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Prevent users from reassigning a session to a different user_id.
-- The column-level security below ensures user_id is never changed via
-- the authenticated role even if the UPDATE policy above passes.
REVOKE UPDATE (user_id, created_at) ON sessions FROM authenticated;

-- ── 2. DB-level length constraints ───────────────────────────────────────────
-- These mirror the application-layer caps already in the API routes and
-- add a last-resort defense at the database layer.
-- NOT VALID skips re-scanning existing rows (safe for reference/BCP-47 codes
-- that are already well-formed) while enforcing the constraint on future writes.

-- Reports: language field (BCP-47 code, max 20 chars)
ALTER TABLE reports
  ADD CONSTRAINT reports_language_len CHECK (char_length(language) <= 20) NOT VALID;

-- Reports: language_code field
ALTER TABLE reports
  ADD CONSTRAINT reports_language_code_len CHECK (char_length(language_code) <= 20) NOT VALID;

-- Sessions: language field
ALTER TABLE sessions
  ADD CONSTRAINT sessions_language_len CHECK (char_length(language) <= 20) NOT VALID;

-- Sessions: language_code field
ALTER TABLE sessions
  ADD CONSTRAINT sessions_language_code_len CHECK (char_length(language_code) <= 20) NOT VALID;

-- Profiles: language field (if present)
ALTER TABLE profiles
  ADD CONSTRAINT profiles_language_len CHECK (char_length(language) <= 20) NOT VALID;

-- ── 3. Confirm hospitals public-read policy is intentional ───────────────────
-- Hospitals is a reference table (clinic names / addresses for UI lookup).
-- No PII is stored here. The existing public SELECT policy is correct.
-- Explicitly revoke INSERT/UPDATE/DELETE from anon and authenticated roles so
-- that the public-read grant cannot be widened accidentally by a future policy.
REVOKE INSERT, UPDATE, DELETE ON hospitals FROM anon, authenticated;
-- No further changes needed — this comment documents the explicit decision.

-- ── Summary ──────────────────────────────────────────────────────────────────
-- After this migration:
--   • sessions: SELECT ✓  INSERT ✓  UPDATE ✓  (DELETE not needed — sessions are immutable after creation)
--               user_id and created_at columns are non-updatable by authenticated role
--   • reports:  SELECT ✓  INSERT ✓  DELETE ✓  (UPDATE not needed — reports are write-once)
--   • profiles: SELECT ✓  INSERT ✓  UPDATE ✓
--   • api_calls: SELECT ✓  INSERT ✓  (service-role-only writes are fine via anon+JWT)
--   • hospitals: public SELECT ✓  INSERT/UPDATE/DELETE revoked from anon+authenticated  (reference data only, no PII)