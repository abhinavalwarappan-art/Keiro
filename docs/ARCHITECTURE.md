# Keiro — Backend Architecture

Internal engineering document. Written for a technical reader doing diligence: a CTO,
a technical investor, or a new backend engineer. It describes what is actually built
today, not what is planned. Known gaps are listed in [Known limitations](#known-limitations)
rather than omitted.

Last reviewed: 2026-07-11, against commit `c5515ef`.

---

## What Keiro is

A multilingual symptom-intake app. A patient who does not speak English well talks to
"Kai" — an AI intake assistant — in their own language. Keiro turns that conversation
into a structured clinical summary **in English** that the patient hands to a US
physician. There is also a live consult mode that translates doctor↔patient speech
turn by turn.

Keiro does not diagnose and is not a medical provider. The model surfaces "possible
conditions" as physician reference only.

---

## System diagram

```
                          ┌──────────────────────────────────────┐
                          │  Browser (Next.js 16 App Router, PWA)│
                          │                                      │
                          │  • Web Speech API  → mic (primary)   │
                          │  • Web Speech API  → TTS (all local) │
                          │  • sessionStorage  → live chat state │
                          └──────────────┬───────────────────────┘
                                         │ HTTPS, same-origin
                                         │ Supabase session cookie
                          ┌──────────────▼───────────────────────┐
                          │  Vercel Edge — src/proxy.ts          │
                          │  (Next.js middleware)                │
                          │                                      │
                          │  • CSRF: Origin must match           │
                          │  • Auth gate (401 / redirect)        │
                          │  • Per-IP burst limit (in-memory,    │
                          │    best-effort, per-instance)        │
                          │  Matcher: /api/chat, /api/report,    │
                          │           /api/translate, /history,  │
                          │           /settings                  │
                          └──────────────┬───────────────────────┘
                                         │
             ┌───────────────────────────┼────────────────────────────┐
             │                           │                            │
   ┌─────────▼─────────┐     ┌───────────▼─────────┐     ┌────────────▼────────┐
   │ Serverless routes │     │  Serverless routes  │     │  Serverless routes  │
   │  /api/chat        │     │  /api/transcribe    │     │  /api/contact       │
   │  /api/report      │     │  /api/translate     │     │  /api/health        │
   └─────────┬─────────┘     └───────────┬─────────┘     └────────────┬────────┘
             │                           │                            │
   Every route, in order:                │                            │
     1. supabase.auth.getUser()  ────────┼────────────────────────────┤
     2. per-user  rate limit (RPC) ──────┼──────────────┐             │  (contact:
     3. per-IP    rate limit (RPC) ──────┼──────────────┤              │   IP limit
     4. validate input (Zod / guards)    │              │              │   only, no
     5. call the provider ───────┐       │              │              │   auth)
             │                   │       │              │              │
             ▼                   ▼       ▼              ▼              ▼
   ┌──────────────────┐  ┌─────────────────┐  ┌──────────────────────────────┐
   │  Google Gemini   │  │      Groq       │  │        Supabase (Postgres)   │
   │ 3.1-flash-lite   │  │ whisper-large-  │  │                              │
   │                  │  │    v3-turbo     │  │  auth · profiles · sessions  │
   │ • Kai chat       │  │                 │  │  reports · consents ·        │
   │   (streaming)    │  │ • voice → text  │  │  feedback · api_calls ·      │
   │ • report summary │  │   (fallback     │  │  ip_calls · contact_attempts │
   │ • consult xlate  │  │    only)        │  │                              │
   └──────────────────┘  └─────────────────┘  └──────────────────────────────┘
                                  │
                    ┌─────────────┴──────────────┐
                    │  DeepL → Google Translate  │   (UI strings, consult text)
                    │  Resend                    │   (contact form email)
                    └────────────────────────────┘
```

---

## External dependencies

| Service | Used for | Failure mode if it goes down |
|---|---|---|
| **Supabase** (Postgres + Auth) | Anonymous auth, profiles, sessions, reports, consents, feedback, **and both durable rate limiters** | Hard down. Auth fails → every protected route 401s. Per-user rate limit **fails closed** (denies), per-IP **fails open**. |
| **Google Gemini** (`gemini-3.1-flash-lite`) | Kai's chat (streaming), the clinical report summary, consult-mode translation | Chat and report return 502/503/504. **A *missing* `GEMINI_API_KEY` is different and worse:** it is required in `src/lib/env.ts`, which is parsed in the root layout, so the whole app fails to boot — including the emergency page. |
| **Groq** (`whisper-large-v3-turbo`) | Server-side voice transcription — **fallback only**. The browser's Web Speech API is the primary mic path. | Voice degrades to browser-only STT. Languages with weak browser support lose voice input; typing still works. |
| **DeepL** → **Google Translate** | UI string + consult translation. DeepL first when the language has a `deeplCode` and the key is set; Google is the fallback (and the only path for e.g. Hindi). | DeepL failure silently falls through to Google. Both down → `/api/translate` returns 502. |
| **Resend** | Emails the clinic demo-request form to the team | Contact form returns 500. No patient-facing impact. |
| **Vercel** | Hosting, serverless functions, edge middleware, log drain | Everything. |
| **Sentry** | Exception tracking (client + server + edge configs present; a regression test asserts PHI is scrubbed) | Loss of error visibility only. |
| **PostHog** | Client-side product analytics | Loss of analytics only. |

Notably **not** dependencies any more: Anthropic and DeepSeek. Kai moved off Claude to
DeepSeek on 2026-07-06, then off DeepSeek to Gemini on 2026-07-13 — both times for cost.
`src/lib/deepseek.ts` is deleted, `DEEPSEEK_API_KEY` is gone from the env schema, and the
`@anthropic-ai/sdk` package has been removed. `ANTHROPIC_API_KEY` and `OPENAI_API_KEY`
remain in the env schema as optional legacy entries and are unused.

**Model pinning.** `GEMINI_MODEL` in `src/lib/gemini.ts` is pinned to the exact string
`gemini-3.1-flash-lite`, deliberately *not* the `gemini-flash-lite-latest` alias — a moving
alias would let Google change the model under a medical intake flow with no code change.
Do not "restore" `gemini-2.5-flash-lite`: it 404s with *"no longer available to new users"*
on keys created after Google retired the 2.5 family, even though it still appears in the
`ListModels` catalog.

---

## Data flow for one patient session

### What is stored

| Data | Where | Notes |
|---|---|---|
| Patient profile (name, DOB, sex, chronic conditions, lifestyle) | `profiles`, and denormalised onto `reports` | Collected on the intake form before chat. |
| Session row | `sessions` | Language, timestamps. |
| The clinical report | `reports` | Chief complaint, symptoms, medications, allergies, differentials (`possible_conditions_json`), physician notes, consult transcript. **This is the PHI of record.** |
| Consent record | `consents` | |
| Rate-limit counters | `api_calls` (per user), `ip_calls` (per hashed IP), `contact_attempts` (per hashed IP) | IPs are **never** stored raw — SHA-256, truncated to 32 hex chars. |

### What is ephemeral

**The chat conversation itself is never written to the database.** There is a `messages`
table in Postgres, but no Keiro code path reads or writes it — verified by grep. The
transcript lives in the browser's `sessionStorage` and is passed in the request body on
each turn. It reaches the server, is forwarded to Gemini, and is discarded when the
function returns. Only the *derived* report is persisted.

This is a genuinely strong privacy property and it is worth stating plainly to a
clinician: Keiro does not retain the conversation, only the summary the patient chose to
generate.

### What is sent to third parties

- **Google (Gemini)** receives the full conversation text and the patient profile block
  (name, DOB, age, sex, chronic conditions, lifestyle). This is PHI leaving our
  infrastructure — **and we send it on Google's free tier**, whose terms state that
  submitted content is used to improve Google's products, that human reviewers may read
  API input and output, and that sensitive/confidential/personal information should not be
  submitted at all. Moving to a paid Gemini tier reverses all three. See
  [Known limitations](#known-limitations).
- **Groq** receives raw audio of the patient speaking, when the browser STT path is not used.
- **Google / DeepL** receive UI strings and consult-mode utterances.

None of these are currently under a BAA. See [Known limitations](#known-limitations).

### What is never logged

`src/lib/logger.ts` is the only logging path in the API layer. It writes newline-delimited
JSON to stdout in production (picked up by the Vercel log drain) and human-readable lines
in development. It deliberately logs:

- event name, route, severity, timestamp
- a `sessionRef` — the **last 6 characters** of the anonymous user id, for correlation only
- non-PHI metadata: message *count*, language *code*, report id, upstream provider name

It never logs message content, transcripts, patient input, profile fields, or full tokens.
Upstream error bodies are also never logged, because providers echo the request back in
error responses — that echo is patient content. Routes log `provider` / `kind` /
`upstreamStatus` from an `UpstreamError` instead of `err.message`.

---

## Request path for a single chat message

This is the hot path. One patient message triggers **5 network calls**:

| # | Call | Service |
|---|---|---|
| 1 | `updateSession()` in middleware | Supabase Auth |
| 2 | `supabase.auth.getUser()` in the route | Supabase Auth |
| 3 | `check_and_record_api_call` (per-user limit) | Supabase Postgres |
| 4 | `check_and_record_ip_call` (per-IP limit) | Supabase Postgres |
| 5 | `POST /models/gemini-3.1-flash-lite:streamGenerateContent?alt=sse` | Google Gemini |

(3) and (4) run concurrently via `Promise.all`. So: **4 Supabase round trips and exactly
1 LLM call per message.** There is no retrieval step, no embedding call, no fan-out — the
LLM cost per message is a single completion.

A **voice** message adds a prior `/api/transcribe` request (auth + 2 limiter RPCs + 1 Groq
call). Report generation is 4 Supabase round trips + 1 Gemini call + 1 insert.

Emergency detection is a **local keyword scan** across 11 languages before any LLM call,
plus a model-emitted `{"emergency":true}` marker that the stream watches for. The keyword
path costs zero external calls and short-circuits the request.

---

## Rate limits, and why they are set where they are

Three tiers, all live simultaneously.

**Tier 1 — per user (`api_calls`, atomic RPC, fails CLOSED).** The primary tier.

| Endpoint | Limit | Rationale |
|---|---|---|
| `chat` | 30 / 2h | A complete intake conversation is ~15–25 turns. 30 leaves headroom without funding an abuse loop. |
| `report` | 3 / 2h | A patient needs one report. 3 allows a retry after a failure. |
| `transcribe` | 60 / h | One per spoken answer, plus retries. |
| `translate` | 60 / h | UI strings are cached client-side; 60 covers a consult. |
| `report_patch` | 20 / h | Physician note autosave. |

**Tier 2 — per IP (`ip_calls`, atomic RPC, fails OPEN).** Backstops the fact that anonymous
auth lets a user mint a fresh account to reset Tier 1. IPs are hashed. Ceilings are higher
than Tier 1 because one IP may be a whole clinic behind NAT: `chat` 200/h, `report` 20/h,
`translate` 500/h, `transcribe` 400/h, `report_patch` 60/h.

It fails **open** on purpose: a missing migration or a DB blip on the secondary tier must
not lock real patients out, because Tier 1 is already fail-closed.

**Tier 3 — per IP in edge middleware (`src/proxy.ts`), in-memory.** Burst absorption only.
This `Map` resets on cold start and is not shared across instances, so it is explicitly
*not* an enforcement layer — Tier 2 is the durable one. It is documented as such in the code.

**Contact form:** 5 submissions per 15 min per hashed IP, via `check_and_record_contact_attempt`.
No auth (it is a public landing-page form), so the IP limit is the only gate.

Both durable limiters take a transaction-scoped `pg_advisory_xact_lock` and do the
count-check and the insert in one statement, so concurrent requests cannot all read
`count = 0` and slip through.

---

## Capacity: what breaks first under load

Documented provider limits (verified 2026-07-11 against public docs — **our account's
actual tier is not confirmed and must be checked in each console before any demo**):

- **Google Gemini**, on the **free** tier, is now the **binding constraint** — this reverses
  the previous position, where DeepSeek's concurrency-only throttle meant the model provider
  never bound. Google no longer publishes per-model limits in its docs (they are key-specific,
  at [aistudio.google.com/rate-limit](https://aistudio.google.com/rate-limit)); the commonly
  documented free-tier flash-lite figures are **15 RPM / 250k TPM / 1,000 RPD**. Every patient
  turn is one request and every report is one more, so ~15 RPM works out to roughly **5–7
  concurrent users** and 1,000 RPD to roughly **75–100 complete intake sessions per day**.
  That is *tighter than Groq's 20 RPM*, so Gemini — not voice — is what fails first now.
  A transient `503 "high demand"` was also observed on this tier during the migration.
  **Enable billing before any in-person demo.** Paid tier raises these ceilings and
  simultaneously fixes the PHI-on-free-tier problem described above.

- **Groq**, on the **free** tier, limits `whisper-large-v3-turbo` to **20 requests/minute**,
  2,000/day, and 7,200 audio-seconds/hour. This is by far the hardest external ceiling we
  have. Twenty requests per minute is *shared across all users*. In a room where ten people
  are demoing voice input at once, this is reachable.

**The honest conclusion is that our own per-IP limits bind before any provider does.**
A clinic sits behind one NAT IP. The `chat` per-IP ceiling is 200/hour and a full intake is
~30 messages, so roughly **6–7 patients per hour per clinic IP** before the 7th patient
starts getting `429 — Please wait a moment before continuing.`

That is the correct design for the open internet and the wrong one for a room full of
physicians on shared WiFi. Before an on-site demo, either raise `IP_ENDPOINT_CONFIGS` in
`src/lib/rateLimit.ts` and `IP_LIMITS` in `src/proxy.ts`, or set `RATE_LIMIT_DISABLED=true`
for the demo environment only.

I have not run a real load test. The numbers above are derived from reading the code path
and the providers' public documentation, not measured.

---

## Reliability posture

Every outbound provider call goes through `fetchUpstream()` in `src/lib/upstream.ts`, which
enforces an explicit timeout and normalises failures into a typed `UpstreamError`:

| Call | Timeout |
|---|---|
| Gemini — streaming (chat) | 55s |
| Gemini — non-streaming (report, consult) | 45s |
| Groq transcription | 30s |
| DeepL / Google translate | 10s |

Routes map `UpstreamError` to an honest status code — **504** on timeout, **429** when the
provider throttles us, **502** when it is down — instead of collapsing everything into a
generic 500. `/api/chat` and `/api/report` set `maxDuration = 60` so the platform does not
kill a long report generation mid-flight.

`/api/chat` pulls the **first streamed token before returning the SSE response**. This
matters: once the 200 and the `text/event-stream` headers are on the wire, a Gemini
failure can only appear as a truncated stream — the patient sees an empty Kai bubble and
nothing is logged. Blocking on the first delta moves that failure back to a point where it
can still become a real status code.

---

## Known limitations

Listed because a diligence reader will find them anyway, and finding them undisclosed is
worse than finding them disclosed.

**Compliance**

1. **No BAA with any subprocessor.** Patient conversation text goes to Google (Gemini),
   patient audio to Groq, consult utterances to Google/DeepL. None of these are HIPAA-covered
   arrangements today. Keiro is currently defensible as a *pre-clinical intake aid*, not as
   a system of record. This is the single biggest gap between the demo and a real clinical
   deployment, and it is a commercial/legal problem before it is an engineering one.
2. **We send PHI to Gemini's *free* tier, which Google's own terms forbid.** The Gemini API
   Additional Terms state: *"Do not submit sensitive, confidential, or personal information
   to the Unpaid Services"*, that Google uses unpaid-tier content to improve its products,
   and that human reviewers may read API input and output. Keiro sends patient names, DOBs,
   symptoms, medications and allergies over exactly that tier. **Enabling billing is the
   single highest-leverage fix in this document**: the paid tier stops model training on our
   data, stops human review, and limits retention to abuse detection. It also raises the rate
   limits we are about to hit. This supersedes the old "DeepSeek is a PRC-based provider"
   concern — the data-residency objection is gone, but the training/review objection is not.
3. The consent copy in `src/app/privacy/page.tsx` and `src/app/privacy-safety/page.tsx` was
   corrected on 2026-07-13 and now names Google/Gemini and discloses the free-tier terms
   above. **If billing is enabled, that copy becomes wrong in the opposite (over-scary)
   direction and must be updated again.**

**Blocking — contact form**

4. **Resend is still in sandbox mode, so the contact form cannot deliver mail.** This is a
   *second, independent* break on the same endpoint, sitting behind the database bug that
   was just fixed. Resend will only deliver to the account owner
   (`abhinav.alwarappan@gmail.com`) until a domain is verified, but the route sends **to**
   `keiro.contact@gmail.com` **from** the sandbox sender `onboarding@resend.dev`
   (`CONTACT_FROM_EMAIL` is unset, so the code falls back to it). Verified end-to-end
   against a local production build: the request now passes auth, rate limiting, and
   validation, and fails only at the Resend call with `email_send_failed`.

   To fix, both are needed:
   - Verify a sending domain at `resend.com/domains`, then set `CONTACT_FROM_EMAIL` in
     Vercel to an address on it (e.g. `Keiro <contact@keiro.app>`).
   - Confirm `CONTACT_TO_EMAIL` in Vercel is the inbox you actually watch.

   Both are environment/dashboard changes, not code. Substituting a deliverable recipient
   locally makes the same request return `200 {"success":true}` — the code path is correct.
   **Until this is done the contact form still returns 500 in production**, even with the
   database fix in place.

**Security / correctness**

5. ~~`contact_attempts` had RLS disabled with `authenticated` holding SELECT/INSERT~~ and
   ~~`check_and_record_contact_attempt` was `SECURITY DEFINER` without a pinned `search_path`~~.
   **Both fixed by migration 009, applied 2026-07-11.** RLS is now on with zero policies
   (deny-all), all direct table grants are revoked from `anon`/`authenticated`/`PUBLIC`, and
   the RPC is the only access path — the same shape migration 007 uses for `ip_calls`.
   Supabase's linter now reports zero ERROR-level findings.
6. **`/api/transcribe` is not in the middleware matcher**, so it gets no CSRF `Origin` check
   — unlike chat/report/translate. It is auth-gated and rate-limited at the route, so the
   exposure is a cross-site request burning a victim's transcription quota, not data loss.
   Should be added to the matcher.
7. **`possible_conditions` (the AI differential) renders on the report page the patient
   holds**, guarded only by a "for physician reference only" banner — not hidden from the
   patient. This may well be intentional, but it is a product decision with clinical-safety
   implications and it is not currently gated by a doctor-only view. *(Frontend; out of
   scope for this pass — flagged, not changed.)*
8. Anonymous auth means a determined user can mint fresh accounts to reset the per-user
   limits. The per-IP tier is the intended backstop.

**Operations**

9. **No retry or backoff on upstream failures.** A single Gemini 429 or a transient blip
   fails the patient's message outright. This is now materially riskier than it was under
   DeepSeek: the free tier's 15 RPM ceiling means a 429 is a *routine* event at demo scale,
   not an exotic one, and a `503 "high demand"` was already observed during the migration.
   One retry with jitter is exactly what is wanted here. Not implemented.
10. **No alerting.** Logs are structured JSON on stdout and Sentry captures exceptions, but
    nothing pages anyone. There is no dashboard, no SLO, no error-budget. "How do you
    monitor this?" currently answers as: *Vercel logs plus Sentry, reactively.*
11. The in-memory translation cache and the middleware IP map are per-instance and reset on
    cold start. Both are best-effort by design, but neither gives a consistent hit rate on
    serverless — do not reason about cost savings from the cache.
12. **Keiro shares one Supabase project with an unrelated product.** The same database
    contains `lab_*` tables (a coaching/payments product), one of which has an
    `INSERT ... WITH CHECK (true)` policy. An RLS mistake or credential leak on that side
    shares a blast radius with patient reports. A healthcare product should have its own
    project. This is the finding I would expect a competent technical investor to raise first.

**Testing**

13. No load test has been run. The capacity section above is analysis, not measurement.
14. Provider account tiers are unconfirmed. The Groq free-tier ceiling (20 RPM) would be the
    first thing to break in a live demo, and we do not currently know which tier the account
    is on.
