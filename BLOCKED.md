# Blocked / Needs-Dashboard Items

Things that cannot be completed from code or MCP and need a human in a dashboard.
Everything else in the build is done — these are the only open items.

## Supabase (dashboard: supabase.com/dashboard/project/fpvnwlvjpdhzespxyicf)

1. **Enable leaked-password protection** — Auth → Providers → Email → "Prevent use of leaked passwords".
   Flagged by the security advisor; not exposed via MCP/API.
2. **Google OAuth provider** — Auth → Providers → Google. Paste `GOOGLE_CLIENT_ID` /
   `GOOGLE_CLIENT_SECRET` from `.env.local` (the app env vars are NOT read by Supabase).
   Authorized redirect URI in Google Cloud Console must be
   `https://fpvnwlvjpdhzespxyicf.supabase.co/auth/v1/callback`.
   The app-side flow (button → `signInWithOAuth` → `/auth/callback` PKCE exchange) is implemented and tested.
3. **Phone OTP (Twilio)** — Auth → Providers → Phone. Phone OTP UI is fully implemented in `/auth`;
   it returns an error until a Twilio Verify service is connected (Account SID, Auth Token, Verify SID).
   If you don't want phone auth at launch, hide the button in `src/app/auth/page.tsx` (one block).
4. **Email templates** — Auth → Templates: confirm signup + reset password copy are Supabase defaults;
   customize with Keiro branding before launch (optional but recommended).
5. **Site URL / redirect allowlist** — Auth → URL Configuration: add the production domain
   (and `http://localhost:3000` for dev) to Site URL + Redirect URLs, including
   `/auth/callback` and `/auth/reset-password`.

## Decisions made in this build (not blockers — documented intentionally)

- **No `subscriptions`/`waitlist` tables, no `useSubscription` hook** — Keiro is free with no plans
  or metering; per-user rate limits in `api_calls` serve that purpose. (Prompt's generic SaaS schema
  did not fit the product; see AUDIT.md.)
- **No avatars storage bucket** — there is no avatar feature; users are mostly anonymous patients.
- **`posthog-node` not installed** — all analytics are client-side and consent-gated; no server
  events are emitted, so the server SDK would be dead weight.
- **No `vercel.json`** — security headers, CSP, and HSTS are set in `next.config.ts` `headers()`,
  which Vercel honors. A `vercel.json` would duplicate them.
- **Full auth-account erasure** requires the service-role key (`auth.admin.deleteUser`).
  `SUPABASE_SERVICE_ROLE_KEY` is not in `.env.local`. Settings → "Delete all my data" deletes every
  DB row (profiles/sessions/messages/reports cascade) and signs out; the bare auth.users row
  remains until you add the service key and the delete-account route can be upgraded.
  See DEPLOYMENT_CHECKLIST.md.