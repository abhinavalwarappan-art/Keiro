# Keiro — Beta-Readiness QA Report v2

**Date:** 2026-07-15
**Branch / HEAD:** `main` @ `4db979d` (all of tonight's fixes present)
**Worktree under test:** `.claude/worktrees/zany-hatching-perlis` (clean, at main HEAD)
**Stack:** Next.js 16.2.6 · React 19 · Supabase · Gemini (`gemini-3.1-flash-lite`) · Tailwind v4 · PWA

---

## 0. Verdict

**Not beta-ready without addressing the P0 cluster below.** Tonight's four fixes are all genuinely in place — no regressions. But the full sweep surfaced **2 distinct P0 areas** (one of them a *previously-reported* P0 that is **still broken**), plus a band of P1 localization defects that undercut the product's core multilingual thesis.

| Severity | Count | Headline |
|---|---|---|
| **P0** | 3 | Doctor PDF mojibake for non-Latin (prior P0, still broken); emergency screen hardcodes US 911 for every locale; emergency screen chrome is hardcoded English / 15-of-45 language coverage |
| **P1** | 5 | 47.7% locale completeness; no document-level `dir="rtl"`; `<html lang>` stuck on `en`; `/chat` reverts to English without a URL param; deterministic emergency backstop covers ~10 of 45 languages |
| **P2** | 7 | Orphaned password-reset route; stale privacy-policy copy; homepage skip-link misanchored; no OG image; report Open/Print PDF dead under CSP; 2 moderate npm advisories; silent clinical-data `.catch([])` |
| **P3** | 7 | No Twitter card / canonical; theme-color mismatch; duplicate nav landmark; 13 ESLint warnings; misc |

### The two prior full-audit P0s — explicit status (as requested)

- **(a) Patient language persists to session / report (was: "silently reverts to English")** → ✅ **FIXED in the meaningful path.** The selected language is carried by URL param into the AI system prompt and persisted as `language_used` on the doctor's report. Kai replies in-language and the report records it. **Residual (new-scope P1):** it is *not* stored on a durable profile, `/chat` reverts to `en-US` if entered without the `?lang=` param, and the `<html lang>` / `dir` layer never updates. See F-4/F-6/F-7.
- **(b) Doctor PDF renders non-Latin names/free-text (was: mojibake)** → ❌ **STILL BROKEN — P0.** jsPDF still uses the built-in Latin-1 `helvetica`; no Unicode font is embedded. See F-1.

---

## 1. Scope & method

Ran the full deterministic scan suite (`tsc`, ESLint, semgrep, `npm audit`, vitest) plus deep source-level analysis across four parts. **Live-UI dynamic testing could not be run** — see the blocker below.

### ⚠️ Live testing was blocked (environment provisioning denied)

The QA worktree could not be given `.env.local`. Both `cp` and `ln -s` from the main checkout were **denied by the permission layer** (a secret-file guard). `src/lib/env.ts` validates `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, and `GEMINI_API_KEY` at module load in the **root layout**, so without them **every route 500s** and the Playwright `webServer` (`npm run dev`) never becomes healthy.

**Consequently, the following were verified statically (source-level) but NOT exercised live:**
- E2E suite *execution* ("and pass") — selectors verified to resolve to real elements; suite not run.
- Browser language sweep across 8+ languages (symptom / medication / emergency) through the real UI.
- Live `dir="rtl"` rendering, responsive breakpoints (375/768/1440), Lighthouse/CWV, live console errors.
- Live reproduction of the PDF mojibake and the CSP-blocked PDF buttons.

**To unblock the live half:** from the worktree, run `! cp /Users/abhinavalwarappan/Downloads/Projects/keiro/.env.local .env.local` yourself (the `!` prefix runs it in-session), then re-invoke and I'll run the E2E suite + browser sweep. Every finding below is from source and stands on its own; the live pass would add reproduction evidence and the Part-3 runtime checks.

### Deterministic scan results

| Scan | Result |
|---|---|
| `tsc --noEmit` | ✅ **0 errors** |
| `eslint . --ext .ts,.tsx,.js,.jsx` | ⚠️ **0 errors, 13 warnings** (F-20) |
| `semgrep --config=auto` | ✅ **0 findings** (213 rules · 225 files) |
| `npm audit` | ⚠️ **2 moderate** (postcss XSS via Next transitive; F-14) |
| `vitest run` | ✅ **27/27 pass** (5 files) |

---

## 2. Part 1 — Regression check on tonight's fixes

**No P0/P1 regressions. All four fixes verified.** Two P2 cleanliness items surfaced under the "guest-only" claim.

| Fix | Verdict | Evidence |
|---|---|---|
| Chat E2E fixture re-anchor (`9611703`) | ✅ **VERIFIED** | Every selector in the chat specs + fixture resolves to a live source element. Fixture keys on `getByTestId('guest-start')` → `src/app/auth/page.tsx:161`; asserts `toBeEnabled()`+role so a future rename fails loudly instead of "did not run". `tests/e2e/fixtures/keiro.ts:230-261`. *(Static selector-resolution only — suite not executed; see blocker.)* |
| Rate-limit IP trust (`ea3beca`) | ✅ **VERIFIED** | `src/lib/clientIp.ts:36-46` keys on `hops[hops.length - 1]` — the **rightmost** (trusted-proxy) hop, not the client-controllable leftmost; returns `UNKNOWN_IP` when absent (`proxy.ts` rejects). IPs SHA-256 hashed (`hashIp`, `:52`). |
| Landing/onboarding re-anchor (`18da980`) | ✅ **VERIFIED** | Every landing assertion resolves (`hero-headline`→`Hero.tsx:38`, `nav-cta`→`Nav.tsx:163`, footer testids). Zero references to the deleted `KaiJourney`/`HowKaiWorks`/`#kai`/`#how-kai-works` sections in `src/` or `tests/`. |
| Guest-only auth cleanup (`4db979d`) | ⚠️ **PARTIAL** | `EmailAuthForm.tsx` + `auth/callback/route.ts` deleted; no lingering imports; `auth.spec.ts` de-referenced email/phone. **But** two remnants — see F-9, F-10. |

**Note on the rate-limit fix (informational, not P-rated):** the rightmost-hop model is correct for Vercel's single edge hop (documented in `clientIp.ts:17-26`). If Keiro is ever self-hosted behind nginx/Cloudflare or Vercel Enterprise with a trusted proxy, the correct index becomes `hops[len - N]`; rightmost would then read the nearest proxy's own IP and over-share buckets. Availability nuance, not the XFF-spoofing vuln that was fixed.

---

## 3. Part 2 — Functional + language sweep (source-level)

Locale dir: `src/i18n/locales/` (45 files). Type source-of-truth: `src/i18n/en.json`; English served from `locales/en-US.json`.

### F-4 (P1, ≈P0 for the product thesis) — Locale completeness is 47.7%
- `en.json` = 102 leaf keys; `en-US.json` = 101 (1-key drift). **Every non-English locale = 47/101 keys.**
- **Only `es-ES` is 100% complete (1 of 44).** The other 43 sit at **46.5%**; the per-key English fallback (`useTranslations.ts:56`) silently renders ~52% of the patient UI in English.
- Missing in all 43 (verified vs `hi-IN.json`): **pain-severity picker** (`picker.mild/moderate/severe/unbearable`), **yes/no picker** (`picker.yes/no`), the whole **chat UI** (`chat.typing`, `chat.prepareReport`, `chat.listen`…), all **report** affordances (`report.downloadPdf`, `report.shareLink`…), **auth** strings. A Hindi/Arabic/Chinese patient answering a pain question sees English severity buttons.

### F-5 (P1) — No document-level `dir="rtl"` for RTL languages
- An `rtl` flag exists (`src/lib/languages.ts:10`) covering ar-SA (`:20`), ur-PK (`:24`), fa-IR (`:35`) — **Hebrew is not a supported language at all**.
- It is consumed **only as inline per-text `dir`** on isolated elements (`onboarding/confirm/page.tsx:127,170`, `PatientProfileIntake.tsx:156,355`, etc.). The document root never gets `dir="rtl"` — `layout.tsx:55` has no `dir` and nothing sets `documentElement.dir`.
- The marketing page **falsely promises the opposite**: `languages/page.tsx:77` — *"Right-to-left, properly: the layout itself flips."* It does not.

### F-6 (P1) — `<html lang>` is permanently `en`
- `layout.tsx:55` hardcodes `<html lang="en">`. `LangUpdater.tsx` is meant to patch it client-side from `useLanguage().language`, but `LanguageContext` is only populated from `localStorage['keiro-lang']` (`LanguageContext.tsx:23-27`) and **nothing ever writes `keiro-lang`** — `setLanguage` has zero callers (the picker writes only `keiro-roman`, `AppLanguagePicker.tsx:29`). Net: context is always `null`, `LangUpdater` no-ops, every localized surface ships `lang="en"`. **WCAG 3.1.1 fail.**

### F-7 (P1) — `/chat` hard-defaults to English without the URL param
- `chat/page.tsx:214`: `const langCode = searchParams.get('lang') || 'en-US'`. Any entry to `/chat` without `?lang=` (refresh into a bookmarked/stripped URL, some redirects) silently reverts the patient to English. Language lives only in the URL; there's no durable profile/session fallback.

### Language persistence — happy path (verified working)
Pick (`AppLanguagePicker.tsx:33`) → `?lang=` (`onboarding/page.tsx:43-47`) → confirm (`onboarding/confirm/page.tsx:65`) → `/chat` reads param (`:214`) → POSTs `language` to `/api/chat` (`:336`, sanitized `api/chat/route.ts:142-146`) → report persists `language_used` (`api/report/route.ts:236`) → shown on report + PDF (`report/page.tsx:472`, `pdf.ts:105`). **This is the prior-P0 (a) path and it works.**

---

## 4. Part 3 — Website / architecture audit (static)

Marketing surface is in **strong** shape: per-route unique metadata, labeled forms, real landmarks (`SiteShell.tsx:40-44`), no clickable-`div` antipatterns, no fixed-width overflow traps, `sitemap.ts` + `robots.ts` present and correct (robots disallows `/chat`,`/report`,`/history`,`/settings`,`/auth`,`/api/`). Defects are polish-level except the homepage skip-link.

- **F-11 (P2) — Homepage skip-to-content is ineffective.** `page.tsx:63` puts `id="main-content"` on the outer wrapper *above* the Nav, not on `<main>` (`:75`). "Skip to content" lands focus above navigation and skips nothing — on the highest-traffic page. (`SiteShell` pages anchor it correctly; only the landing page is wrong.)
- **F-12 (P2) — No Open Graph image.** No `opengraph-image.*`; `layout.tsx:37-42` `openGraph` has no `images`. Every share (press, judges, clinics) renders a bare card.
- **F-13 (P2) — Report Open/Print PDF buttons dead under production CSP.** `report/page.tsx:515,524` → jsPDF `data:` iframe blocked by CSP; Download (`:507`) works. Known per project notes; verify on deployed build.
- **F-15 (P2) — Silent clinical-data loss.** `api/report/route.ts:60` `.catch([])` on a clinical field, flagged in-code as "SILENT DATA LOSS."
- **F-16 (P3)** No Twitter card metadata anywhere.
- **F-17 (P3)** No `alternates.canonical`; `?fresh=1` / `?ended=1` variants uncconsolidated.
- **F-18 (P3)** theme-color mismatch: `layout.tsx:47` `#FAFAF9` vs `public/manifest.json:8` `#1a3d2b`.
- **F-19 (P3)** Duplicate `<nav aria-label="Main">` (desktop `Nav.tsx:102` + mobile `:192`) — same-type landmarks need unique names.
- Responsive (static): clean — `overflow-x-clip` roots, `max-w-6xl`+`clamp()`, no `min-w-[…px]` offenders. **Confirm live at 320/375.**
- Hydration (static): no mismatch patterns in the render path (`Math.random()` is canvas-in-effect, onboarding-only; `Date.now()` all in effects/handlers). **Confirm live console.**

---

## 5. Part 4 — Safety content accuracy

**Prompt-level guardrails are solid and language-independent** — the failures are all in downstream localization of the emergency response.

### ✅ Safe (verified)
- **Dosage ban:** `src/lib/claude.ts:80-82` "STRICTLY PROHIBITED … Recommend any medication or dosage"; reinforced `api/report/route.ts:188`.
- **Diagnosis ban:** `claude.ts:80-85` (no diagnosing, no "is/isn't serious", no "need to see a doctor"). Possible conditions constrained to physician-only framing (`claude.ts:158-160`).
- **Emergency detection is defense-in-depth:** prompt protocol incl. suicidal ideation (`claude.ts:88-103`) + code keyword backstop (`route.ts:176-178`) + streaming marker interception that withholds partial JSON from the patient (`route.ts:253-267`, fail-safe). This layering is genuinely good.
- Opening-message + `[[PICKER:*]]` marker mechanics carry no clinical content and are banned from emergency/report JSON (`claude.ts:135`).

### ❌ Failures (emergency response localization)
- **F-2 (P0) — Emergency number hardcoded to US "911" for every locale.** `src/app/emergency/page.tsx:11-25` — all 15 translated strings embed 911 (Hindi `:12` "अभी 911 पर कॉल करें", Chinese `:13` "请立即拨打911", Arabic `:14` "اتصل بـ 911"), plus `tel:911` (`:90`), "Call 911 now" (`:96`), the 911 badge (`:110`). No locale-aware number exists anywhere (no 112/999/119/120/108). For a product whose thesis is *non-English patients abroad*, this hands a frightened patient in India/China/the EU a number that does not reach help. **(Caveat: if the beta is intentionally US-only, downgrade to P2 — but nothing in the code scopes it to the US, and the UI explicitly invites bystanders to call it.)**
- **F-3 (P0) — Emergency screen chrome is hardcoded English, 15-of-45 language coverage.** `emergency/page.tsx` never calls `useTranslations`; `<h1>This looks urgent</h1>` (`:82`), "Please get help now" (`:83`), "Call 911 now" (`:96`), "Show this screen to anyone nearby" (`:99`), "Continue chat" (`:158`) are all English literals. The help *phrases* are a hardcoded 15-language array — a patient whose language is one of the other ~30 gets no phrase in their language on the one screen that matters most.
- **F-8 (P1) — Deterministic emergency backstop covers ~10 of 45 languages.** `api/chat/route.ts:17-55` lists `EMERGENCY_KEYWORDS` for English, Hindi, Tamil, Spanish, Arabic, Mandarin, Vietnamese, Korean, Tagalog, Portuguese. For the other ~35 languages there is **no code-level tripwire** — a red flag in Bengali/Swahili/Thai rests entirely on the small LLM. Degraded defense-in-depth, not total absence (the prompt still instructs in-language detection).
- **F-21 (P2/low)** — Report JSON schema has a med `dosage` field (`claude.ts:145`) populated from free-text conversation; physician-facing, low risk, but worth a QA note.

---

## 6. Part 1 remnant findings (guest-only cleanup)

- **F-9 (P2) — Orphaned `src/app/auth/reset-password/page.tsx`.** Full password-reset UI: `#new-password`/`#confirm-password` (`:88-103`) + `supabase.auth.updateUser({ password })` (`:35`). Nothing links to it; with no password auth, no recovery email can reach it — unreachable dead code with live password fields. Its 7 tests still pass and it was **deliberately kept** (commit `4db979d` body flags it "worth a follow-up decision"). Known leftover, not a missed cleanup — but decide: delete or wire up.
- **F-10 (P2) — Stale privacy-policy copy.** `src/app/privacy/page.tsx:47` still tells users "If you **sign in** (phone, Google, or email), we store only your sign-in details…". That path no longer exists — a factually false statement in the published privacy policy. (`about/page.tsx:87` "no email, no password" is consistent.)

---

## 7. Full findings, severity-sorted

| ID | Sev | Area | Finding | Location |
|---|---|---|---|---|
| F-1 | **P0** | Report/i18n | Doctor PDF still mojibake for non-Latin names/free-text (jsPDF built-in `helvetica`, no Unicode font embed). **Prior P0, still broken.** | `src/lib/pdf.ts` (helvetica `:29…:238`; name `:100`) |
| F-2 | **P0** | Safety | Emergency number hardcoded US "911" for every locale; no locale-aware number | `src/app/emergency/page.tsx:11-25,90,96,110` |
| F-3 | **P0** | Safety/i18n | Emergency-screen chrome hardcoded English; help phrases only 15 of 45 languages | `src/app/emergency/page.tsx` (no `useTranslations`; `:82,83,96,99,158`) |
| F-4 | P1 | i18n | Locale completeness 47.7%; only es-ES complete; pain/yes-no pickers + chat/report/auth untranslated in 43 locales | `src/i18n/locales/*`, `useTranslations.ts:56` |
| F-5 | P1 | i18n/RTL | No document-level `dir="rtl"`; inline-only; marketing falsely claims layout flips | `layout.tsx:55`, `lib/languages.ts:10`, `languages/page.tsx:77` |
| F-6 | P1 | a11y/i18n | `<html lang>` permanently `en`; `LangUpdater` inert (`setLanguage` has no callers) — WCAG 3.1.1 | `layout.tsx:55`, `LanguageContext.tsx:23-27`, `LangUpdater.tsx` |
| F-7 | P1 | i18n | `/chat` reverts to `en-US` when `?lang=` absent | `chat/page.tsx:214` |
| F-8 | P1 | Safety | Deterministic emergency keyword backstop covers ~10 of 45 languages | `api/chat/route.ts:17-55` |
| F-9 | P2 | Auth | Orphaned `reset-password` route with live password UI (unreachable) | `src/app/auth/reset-password/page.tsx:35,88-103` |
| F-10 | P2 | Docs/legal | Privacy policy claims phone/Google/email sign-in that no longer exists | `src/app/privacy/page.tsx:47` |
| F-11 | P2 | a11y | Homepage skip-to-content misanchored above the Nav | `src/app/page.tsx:63` vs `:75` |
| F-12 | P2 | SEO | No Open Graph image on any share | `src/app/layout.tsx:37-42` |
| F-13 | P2 | App/CSP | Report Open/Print PDF buttons dead under production CSP | `report/page.tsx:515,524` |
| F-14 | P2 | Deps | 2 moderate advisories (postcss XSS via Next transitive); fix is a breaking downgrade | `npm audit` |
| F-15 | P2 | Data | `.catch([])` on a clinical field — "SILENT DATA LOSS" | `api/report/route.ts:60` |
| F-16 | P3 | SEO | No Twitter card metadata | `src/app/**` |
| F-17 | P3 | SEO | No canonical URLs | `src/app/**` |
| F-18 | P3 | PWA | theme-color layout (`#FAFAF9`) ≠ manifest (`#1a3d2b`) | `layout.tsx:47`, `manifest.json:8` |
| F-19 | P3 | a11y | Duplicate `<nav aria-label="Main">` landmarks | `Nav.tsx:102,192` |
| F-20 | P3 | Quality | 13 ESLint warnings: `set-state-in-effect` (`Nav.tsx:50`, `Sections.tsx:159`, `ai-voice-input.tsx:48`), unused vars (`Sections.tsx:14`, `languages.ts:136`) | eslint |
| F-21 | P2 | Safety | Report schema med `dosage` field populated from free-text (physician-facing) | `claude.ts:145` |

---

## 8. Recommended beta gate

**Fix before beta (P0):**
1. **F-1** — Embed a Unicode TTF (e.g. Noto Sans + Noto Sans CJK/Devanagari/Arabic subsets) in jsPDF via `addFileToVFS`/`addFont`, or render the PDF via a headless-HTML path. At minimum the **patient name** and any verbatim free-text must not mojibake — this is a doctor-facing clinical artifact.
2. **F-2 / F-3** — Make the emergency number locale-aware (default 112 where valid; region table) and localize the emergency-screen chrome via `useTranslations`. If the beta is genuinely US-only, state that explicitly in-code and in the report, and downgrade — but do not ship a silent US assumption to a multilingual product.

**Strongly recommended (P1):** raise locale coverage past the pickers + chat/report affordances (F-4); apply `dir`/`lang` at the document root (F-5, F-6); give `/chat` a durable language fallback (F-7); extend the emergency keyword backstop or lean on a documented LLM-only policy (F-8).

**P2/P3:** batch the cleanliness items — delete or wire the reset-password route (F-9), correct the privacy copy (F-10), move the homepage skip-link (F-11), add an OG image (F-12).

**Verified healthy — no action:** tonight's 4 fixes, tsc, semgrep (0), vitest (27/27), prompt-level safety guardrails, per-route SEO metadata, form labeling & landmarks.

---

## 10. Fix log (post-report)

- **F-2 (P0) — FIXED.** Emergency number is now locale-aware. New `src/lib/emergencyNumbers.ts` maps each supported locale's region subtag → that country's medical emergency number (sourced from Wikipedia's maintained list, verified 2026-07-15; 112 for EU/EEA and as the global GSM fallback). `emergency/page.tsx` resolves the patient's locale (URL `?lang=` → persisted chat session → 112 fallback) and renders it in the CTA, `tel:`, badge, and all 15 bystander phrases, with an always-visible "this is the number for {country}; if you're elsewhere, dial your local number" note. `?lang=` is now passed on the chat emergency detour (`chat/page.tsx:366,418`). `emergency/layout.tsx` metadata no longer hardcodes 911. Verified: tsc clean, vitest 33/33 (6 new tests incl. an all-languages guard), no 911 hardcode remains on the emergency screen.
- **Still open (deliberately not expanded into this P0):** F-3 (emergency-screen *chrome* still hardcoded English / 15-of-45 phrase coverage); `terms/page.tsx:90` still says "call 911" (separate ToS page). Both recommended as the next pass.
- **NEW P0 (infra) — Vercel deploys have been failing since the Gemini migration (`744f934`).** `env.ts` validates `GEMINI_API_KEY` at build time and it isn't set in the Vercel project, so every build since — incl. production `main` for `4db979d`/`1851d1f`/`35fa4e0`/`d94dc71` — is `ERROR`. **Production is still serving `3433812`; none of tonight's work is live.** Fix: add `GEMINI_API_KEY` in Vercel env (Prod+Preview+Dev, build-time). This also blocks preview verification of the PDF fonts until resolved.
- **F-1 (P0) — font rendering completed (`origin/main` @ `d94dc71`).** The server-side PDF (`35fa4e0`) shapes every script, but serverless Chromium ships almost no fonts — so CJK/Arabic/Indic would have been tofu in prod despite passing locally (macOS system fonts). Fixed by **embedding subset Noto fonts as base64 `@font-face` data-URIs in the report HTML** (`src/lib/reportFonts.ts`, `src/lib/fonts/*.woff2`, ~2.7MB), so glyphs travel with the document and dev==serverless. **VERIFIED ON REAL SERVERLESS (`origin/main` @ `647a5f7`).** After the user added `GEMINI_API_KEY` to Vercel, a preview build succeeded and `POST /api/report/pdf` was exercised on Vercel Lambda: it returned a valid 85KB PDF whose Name row (`王伟 · أحمد المصري · अजय शर्मा`) and allergy (`ペニシリン`) render correctly — Chinese, Arabic (joined+RTL), Hindi (conjuncts), Japanese — zero mojibake. The deploy surfaced a genuine serverless-only bug the local test couldn't: `playwright-core/browsers.json` (and the chromium binary) weren't traced into the Lambda → 500. Fixed by force-including both packages via `outputFileTracingIncludes` (`647a5f7`). Other Indic scripts (Tamil/Telugu/etc.) remain a documented follow-up.
- **F-1 (P0) — original architecture (merged to `origin/main` @ `35fa4e0`).** Doctor PDF now renders server-side via headless Chromium (HarfBuzz text shaping) instead of jsPDF, so CJK/Arabic/Devanagari/Cyrillic patient names + free-text render correctly incl. RTL. New `src/lib/reportHtml.ts` (pure, escaped, `dir="auto"`) + `src/lib/renderReportPdf.ts` + `POST /api/report/pdf` (auth + rate-limited + zod); client fetches a blob; jsPDF/`pdf.ts` removed. Verified: tsc clean, vitest 45/45 incl. a real Chromium render whose text layer extracts 王伟/Раиса/أحمد/अजय with no mojibake. **DEPLOY CAVEAT:** `@sparticuz/chromium` ships no CJK/Arabic/Indic fonts (v149 removed its runtime `font()` loader), so those scripts need Noto fonts bundled into the Vercel function at deploy time — Latin/Cyrillic/Greek work out of the box. Confirm on a preview deploy. Server-authoritative report fetch (vs. client-supplied payload) noted as a hardening follow-up.

## 9. Outstanding — needs a live run

Blocked by the `.env.local` provisioning denial (§1). After `! cp …/.env.local .env.local`, a live pass should: execute the E2E suite (confirm chat specs *pass*, not just resolve); drive the 8-language symptom/medication/emergency sweep through the real UI (incl. Arabic/Urdu RTL + CJK/Devanagari); reproduce the PDF mojibake and CSP-blocked PDF buttons; and capture responsive (375/768/1440), live console (2+ languages), and Lighthouse/CWV.
