# Keiro Production Audit — 2026-06-10

Full codebase + infrastructure audit before the production build pass.

## Verdict

Keiro is **much further along than a prototype**. Build, type-check, and schema are healthy.
The real gaps are: analytics not wired, 25 lint errors, a deprecated middleware convention,
chat transcripts not persisted, missing GDPR data-export, and design-token drift in Settings.

## What works

- `npm run build` — **passes clean** (Next.js 16.2.6, Turbopack, 19 routes)
- `npx tsc --noEmit` — **zero errors**
- Supabase project `fpvnwlvjpdhzespxyicf` ACTIVE_HEALTHY; RLS enabled on all 5 tables
  (`profiles` 15 rows, `sessions`, `messages`, `reports`, `api_calls` 79 rows)
- Auth: anonymous (guest), phone OTP, and Google OAuth all implemented in `/auth`;
  PKCE callback at `src/app/auth/callback/route.ts`
- API hardening: middleware does CSRF origin check + per-IP rate limits + auth gate on
  `/api/chat`, `/api/report`, `/api/translate`; per-user rate limits in `lib/rateLimit.ts`
- Security headers: CSP, HSTS, X-Frame-Options DENY, nosniff, Referrer-Policy,
  Permissions-Policy — already in `next.config.ts`
- Sentry: client/server/edge configs present, source maps uploaded + stripped
- Emergency path: keyword detection (10 languages) in `/api/chat` → `/emergency` (zero-auth page)
- Medical disclaimer: persistent, non-dismissible banner in chat ✓
- Legal pages exist: `/privacy` (212 lines), `/terms` (181 lines)
- Cookie consent banner exists (essential-only messaging)
- PWA: manifest, icons, installable
- A11y: skip-link, aria-live chat log, 44px targets, focus management
- Migrations are documented and incremental (001–003 + perf indexes)

## What's broken

| # | Issue | Where |
|---|-------|-------|
| 1 | 25 ESLint errors (`set-state-in-effect` ×14, `no-explicit-any` ×6 in ChatInput, refs-during-render ×3 in particles.tsx, impure render in ai-voice-input, `<a>` for nav in ErrorBoundary) | see `npm run lint` |
| 2 | `middleware.ts` uses deprecated convention — Next 16 wants `proxy.ts` | `src/middleware.ts` |
| 3 | 10 lint warnings (unused vars/imports) | various |

## What's missing

| # | Gap | Phase |
|---|-----|-------|
| 1 | PostHog: env keys set, **zero code** (no provider, no events, consent not gated) | 3 |
| 2 | Chat messages never written to the `messages` DB table (table exists, unused) | 1/5 |
| 3 | `feedback` table + UI; `waitlist` not needed (app is live + free) — document decision | 1 |
| 4 | "Download my data" (GDPR portability) in Settings — delete exists, export doesn't | 5 |
| 5 | Root `app/error.tsx` and `app/loading.tsx` (only per-route loading + class ErrorBoundary) | 5 |
| 6 | `.env.example` | 3 |
| 7 | `lib/env.ts` zod-style runtime env validation | 8 |
| 8 | `robots.txt` + `sitemap.xml` | 8 |
| 9 | Page-level metadata for /privacy, /terms, /emergency etc. | 8 |
| 10 | Template cruft in `public/` (next.svg, vercel.svg, file.svg, globe.svg, window.svg) | 6 |
| 11 | `vercel.json` (headers already in next.config — only needed if extra config required) | 3 |
| 12 | DEPLOYMENT_CHECKLIST.md, README refresh | 10 |

## Supabase advisor findings (live project)

| Severity | Finding | Fix |
|----------|---------|-----|
| WARN | `handle_new_user`, `generate_report_id` have mutable `search_path` | `ALTER FUNCTION ... SET search_path = ''` |
| WARN | `handle_new_user`, `rls_auto_enable` are SECURITY DEFINER executable by anon/authenticated via RPC | `REVOKE EXECUTE` from anon/authenticated |
| WARN | Leaked-password protection disabled | Dashboard toggle (documented in DEPLOYMENT_CHECKLIST — not exposed via MCP) |
| INFO | Anonymous-access RLS policies flagged | **Intentional** — guest mode is a core feature; policies are `auth.uid()`-scoped |

## Design debt (Phase 6 targets)

1. **Settings page uses a green palette** (`#c5edd8`, `#2da866`, `#3B6D11`) — rest of app is teal. Migrate.
2. Hex values inlined per-file everywhere — centralize as CSS custom properties, keep visual output identical.
3. Settings back-button is 32px (<44px touch target).
4. Unused showcase components in `src/components/ui/` (retro-grid, meteors, ia-siri-chat, beams-background, limelight-nav, cube-loader, shine-border, border-beam, magic-card, animated-gradient-text, number-ticker, particles…) — several have lint errors and ship dead weight. Remove unused ones.
5. `maximumScale: 1` in viewport blocks pinch-zoom — accessibility violation, remove.

## Domain-model note (Phase 1)

The build prompt's generic SaaS schema (subscriptions/plans/queries_limit/waitlist) does **not** fit
Keiro: it's a free medical-intake app with ephemeral 2-hour sessions, not a metered chat SaaS.
Phase 1 will: keep the existing domain schema; add the genuinely useful missing pieces
(`feedback`, `consents` audit trail, message persistence, avatars storage); fix advisor warnings;
skip `subscriptions`/`waitlist` (decision documented here). `CREATE POLICY IF NOT EXISTS` in the
prompt's SQL is not valid Postgres — policies are created via guarded DO blocks instead.

## Plan

Phases 1→10 tracked in the session task list: schema → auth polish → PostHog/Sentry/Vercel →
legal → feature completion → UI overhaul → Vercel guidelines audit → perf/security → verification → docs.
