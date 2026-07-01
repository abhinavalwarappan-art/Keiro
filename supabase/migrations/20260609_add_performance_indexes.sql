-- Migration 20260609: Add performance indexes
--
-- Indexes are added only on columns that appear in WHERE clauses or ORDER BY
-- in hot query paths. Write-heavy tables (api_calls) already have the critical
-- composite index from 001_initial.sql — that index is documented here for
-- clarity but is NOT re-created (duplicate indexes waste storage and slow writes).
--
-- Table: sessions
--   Hot paths:
--     • Fetch all sessions for a user      → WHERE user_id = $1
--     • List sessions ordered by recency   → ORDER BY started_at DESC
--   Note: sessions.started_at is the timestamp column (not created_at).
--
-- Table: messages
--   No messages table exists in this schema. Chat messages are ephemeral —
--   they are passed in the API request body and never persisted to the DB.
--   If a messages table is added in a future migration, index
--   (session_id, created_at) at that time.
--
-- Table: reports
--   Hot paths:
--     • Fetch report for a given session   → WHERE session_id = $1
--     • RLS policy already filters user_id, but an explicit index on user_id
--       helps the planner avoid a seq-scan when RLS rewrites the query.
--
-- Table: api_calls
--   The composite index (user_id, endpoint, created_at) was already created
--   in 001_initial.sql and covers the rate-limiter query fully:
--     SELECT COUNT(*) WHERE user_id = $1 AND endpoint = $2 AND created_at >= $3
--   No additional index is needed here.

-- ── sessions ────────────────────────────────────────────────────────────────

-- Supports: WHERE user_id = $1 (fetch a user's sessions)
-- Also covers ORDER BY started_at DESC when filtering by user_id, making
-- idx_sessions_started_at below useful only for unfiltered recency sorts.
CREATE INDEX IF NOT EXISTS idx_sessions_user_id
  ON public.sessions (user_id);

-- Supports: ORDER BY started_at DESC (list sessions by recency)
CREATE INDEX IF NOT EXISTS idx_sessions_started_at
  ON public.sessions (started_at DESC);

-- ── reports ─────────────────────────────────────────────────────────────────

-- Supports: WHERE session_id = $1 (fetch the report for a session)
CREATE INDEX IF NOT EXISTS idx_reports_session_id
  ON public.reports (session_id);

-- Supports: WHERE user_id = $1 (history page, RLS rewrite)
CREATE INDEX IF NOT EXISTS idx_reports_user_id
  ON public.reports (user_id);

-- ── api_calls (documentation only — index already exists) ───────────────────
-- Existing index from 001_initial.sql:
--   CREATE INDEX ON public.api_calls (user_id, endpoint, created_at);
-- This covers the rate-limiter query completely. No change needed.