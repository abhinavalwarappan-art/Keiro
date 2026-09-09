# Keiro pre-launch audit — 2026-09-09

Scope: Next.js 16.2.6 application, Supabase backend, Fish Audio ASR/TTS, and the public deployment at `keiro.space`. Work was performed on `audit/prelaunch-2026-09-08`. No production migration or production-data mutation was performed.

## 1. Confirmed working

- Production build: `next build` completes successfully and emits all 36 routes, including the new `/api/feedback` route.
- Automated checks: 14 Vitest files / 113 tests pass; 130 Playwright tests pass. ESLint exits 0 with eight non-blocking React-pattern/dead-code warnings and no errors.
- Accessibility: axe reports zero critical or serious violations across every tested public route plus authenticated chat, history, and settings. The only advisory is that `/auth` has no level-one heading.
- Contrast: the computed opaque text/background audit found no AA failures after fixes. The lowest passing normal-text pair was 4.544:1; the next-lowest was 4.581:1. Axe independently confirmed the affected pages. Gradient/transparency samples cannot be represented reliably by a single computed background and were checked by axe/browser rendering instead.
- Responsive layout: audited at 375, 414, 768, and 1440 CSS pixels. No tested application route had horizontal overflow. Touch-critical controls in the patient flow meet the 44px minimum; inline legal/text links remain naturally sized text links.
- Languages: all 45 picker languages entered a signed-in chat, accepted typed text, displayed it in the log, and left the composer enabled. Arabic, Urdu, and Persian use RTL input/log layout. Romanized mode remains LTR.
- Voice input: simulated iOS Safari and Android Chrome both called `getUserMedia()` in the original click task. Denied, `NotReadableError`, pending permission, Instagram, Facebook, and TikTok cases all kept typing visible and usable. Permission recovery re-queried the Permissions API, and dialog focus remained trapped in both platform simulations.
- Fish Audio: a real provider test transcribed the English sentence “This is a synthetic test. My knee has hurt for two days.” exactly, placed it in the normal chat request path, and returned a 43,466-byte `audio/mpeg` TTS response. Fish timeout, malformed-response, and upstream-rate-limit probes returned bounded errors rather than hanging. `FISH_AUDIO_API_KEY` appears only in server code and was absent from all 113 scanned client bundle files.
- Rate limits: primary per-user limits fail closed. Synthetic repeated calls reached 429 at the configured boundary (chat request 31 and contact request 6). Upstream/database error probes returned safe client messages without stack traces. The secondary IP tier intentionally fails open while the primary user tier remains closed; see the decision item below.
- Secrets/config: 912 Git history blobs were scanned for provider keys, private keys, and exact local secret values; no findings. `.env.example` now documents all application-controlled runtime variables and uses `https://keiro.space` as the canonical URL. CI, Node, Port, Vercel, and audit variables are platform/tool-owned and intentionally not application secrets.
- Live schema snapshot: every observed public table has RLS enabled. Keiro-owned tables observed were `api_calls`, `consents`, `contact_attempts`, `feedback`, `hospitals`, `ip_calls`, `messages`, `profiles`, `reports`, and `sessions`. Ownership policies protect patient rows; hospitals are intentionally public-read. Rate-limit storage tables are not intended for direct public access.

## 2. Fixed

- Restored AA contrast on informational pages and the 404 page.
- Made typing a genuinely always-available alternative while permission is pending, recording, transcribing, denied, busy, unavailable, or inside an in-app browser.
- Added cancellation/abort handling for late mic grants and stalled ASR uploads, including track cleanup and a 45-second transcription timeout.
- Added honest busy-device and Fish failure/rate-limit messages.
- Added keyboard focus trapping and focus restoration to the microphone help dialog.
- Applied reduced-motion behavior to chat recording and emergency animations.
- Applied chat language/direction metadata and removed the one-pixel RTL overflow caused by a screen-reader-only heading.
- Fixed a chat callback stale dependency that could route an emergency using an old language.
- Replaced direct client-side feedback insertion with authenticated `/api/feedback`: Zod validation, same-origin protection, fail-closed per-user limiting, RLS-backed insert, escaped email HTML, non-leaking responses, and server logging. Notifications default to `keirohealthcare@gmail.com`.
- Scoped Vitest and ESLint away from generated files and unrelated hidden worktrees so launch gates measure this checkout.
- Updated the stale landing-page browser assertion and added feedback API/UI coverage.

## 3. Still broken or needs owner decision

- **Apply migrations only after review:** `010_mic_diagnostics.sql` is not present in the live schema snapshot (`mic_diagnostics` and `record_mic_diagnostic` were absent). The API deliberately returns 204 even when diagnostic storage fails, so patient UX works but production mic telemetry is currently not retained.
- **Apply migration only after review:** `20260909_harden_rate_limit_storage.sql` is new and unapplied. The live snapshot shows `api_calls` still has the old “Users see own api calls” policy and the live rate-limit function does not contain the new `auth.uid() = p_user_id` identity guard. The migration revokes direct table access, drops that policy, and adds the guard.
- **Migration history certainty:** schema effects confirm 001 and 003–009, plus the performance indexes, are present. Migration 002 is a no-op UTF-8 confirmation and has no durable schema marker. The Supabase CLI is not authenticated/linked, so exact entries in `supabase_migrations.schema_migrations` could not be independently listed. Do not describe 002 as confirmed applied based only on schema.
- **Feedback email production configuration:** code defaults to the requested inbox, but Vercel must have a valid `RESEND_API_KEY` and a verified `FEEDBACK_FROM_EMAIL` for reliable delivery. A real production submission was not made because the ground rules prohibit production-data mutation. The authenticated UI/server contract was tested with interception.
- **Secondary IP rate limiting:** `checkIpRateLimit` intentionally fails open on RPC/database failure to avoid locking a whole senior community out when Supabase has trouble. The primary per-user tier fails closed. Changing the secondary tier to fail closed is a product/reliability tradeoff, not a silent audit fix.
- **Domain/email remnants:** public legal pages still contain `@keiro.app` email addresses. The website itself is on `keiro.space`; decide whether those mailboxes are owned and intended before changing legal contact text.

## 4. Not fully confident / requires physical verification

- Real iPhone Safari and Android Chrome hardware were not available; user-agent, permissions, media APIs, viewport, keyboard, and reduced-motion behavior were simulated in Chromium.
- Tamil, Vietnamese, Arabic, Urdu, Persian, and other non-English ASR/TTS pronunciation and accuracy require human listeners. Only English provider audio was verified end to end.
- Email receipt in the Gmail inbox cannot be confirmed without a production submission and inbox access.
- Slow-network behavior has loading/typing states and bounded ASR timeouts, but field behavior on poor senior-home Wi-Fi should still be observed during the pilot.
- The public deployment can only be confirmed after the merge-triggered Vercel build. The local Vercel CLI credential is invalid, so deployment observation must use Git and the public site.

## Migration reconciliation

| Migration | Live status evidence |
|---|---|
| `001_initial.sql` | Schema effects present |
| `002_utf8_confirm.sql` | Unknown; no durable effect and migration history unavailable |
| `003_rls_hardening.sql` | Policy/RLS effects present |
| `004_production_alignment.sql` | Feedback, consent, and aligned columns present |
| `005_patient_profile_consult.sql` | Patient/consult columns present |
| `006_security_fixes.sql` | Functions/contact table present |
| `007_ip_rate_limit.sql` | IP table/function/index present |
| `008_contact_rate_limit.sql` | Contact rate-limit function present |
| `009_contact_attempts_hardening.sql` | RLS/grant posture present |
| `010_mic_diagnostics.sql` | **Not applied; table/function absent** |
| `20260609_add_performance_indexes.sql` | Named indexes present |
| `20260909_harden_rate_limit_storage.sql` | **New, staged, not applied** |
