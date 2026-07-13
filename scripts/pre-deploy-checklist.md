# Keiro — Pre-Deploy Checklist

Run through this before every merge to `main`. It takes under 5 minutes and prevents the most common production incidents.

---

## 1. Database Migrations

- [ ] All new migration files in `supabase/migrations/` have been tested against a local Supabase instance (`supabase db reset && supabase db push`).
- [ ] Migration filenames use the `YYYYMMDD_description.sql` format and are numbered sequentially.
- [ ] No `DROP COLUMN`, `DROP TABLE`, or destructive `ALTER TABLE` runs in the same deploy as the code that depends on it — if you need one, deploy the backward-compatible code first.
- [ ] If the migration adds a new NOT NULL column, a default value or backfill is included.

```bash
# Test migrations locally
supabase db reset
supabase db push
```

---

## 2. Environment Variables

- [ ] Every variable used in the codebase is set in Vercel: **Settings → Environment Variables → Production**.
- [ ] Required variables are present and non-empty:
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - `GEMINI_API_KEY` (required — a missing key fails the build and takes down every route)
  - `OPENAI_API_KEY`
  - `DEEPL_API_KEY`
  - `GOOGLE_TRANSLATE_KEY`
  - `RESEND_API_KEY`
  - `DEPLOYMENT_VERSION` (bump this on every deploy — e.g. `v1.5.0` or the git tag)
- [ ] No `NEXT_PUBLIC_` prefix on any secret key.
- [ ] `.env.local` and `.env.production` are in `.gitignore` and not committed.

---

## 3. Sentry

- [ ] Sentry DSN is configured in the Vercel environment (`SENTRY_DSN` or via the Sentry Vercel integration).
- [ ] `SENTRY_ORG` and `SENTRY_PROJECT` are set so source maps upload correctly at build time.
- [ ] Open **https://sentry.io** and confirm the project is receiving events (send a test event if it has been quiet).
- [ ] No unresolved **P0/Critical** issues in Sentry from the current build.

---

## 4. Health Endpoint

- [ ] After the deploy completes, hit the health endpoint and confirm:

```bash
curl https://keiro.app/api/health
# Must return: {"status":"ok","version":"<the version you just set>","timestamp":"..."}
```

- [ ] `version` in the response matches the `DEPLOYMENT_VERSION` you set for this deploy.
- [ ] HTTP status is `200`.

---

## 5. Smoke Test (preview URL)

- [ ] The Vercel preview deployment for this branch was reviewed before merging.
- [ ] The following flows were tested on the preview URL:
  - [ ] Language selector → chat starts in correct language
  - [ ] Send at least 2 messages → Kai responds
  - [ ] "Prepare my report" → report page loads with data
  - [ ] PDF download button → PDF generates without error
  - [ ] `/api/health` returns 200 on the preview URL

---

## 6. Final Gate

- [ ] All CI checks (TypeScript, lint) are green on the PR.
- [ ] No `console.log` or hardcoded secrets introduced in this diff (`git diff main...HEAD | grep -E 'console\.log|sk-|AKIA'`).
- [ ] Rollback plan is known: see `scripts/rollback.md`.

---

> If any item is unchecked, **do not merge**. Fix it first or explicitly document why it is acceptable to skip.
