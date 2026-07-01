# Keiro Redesign Summary

> Full visual redesign, 2026-06-11. Backend logic untouched; only design, layout,
> typography, color, spacing, motion, and component structure changed. Build and
> typecheck both clean.

## The design decision I'm most proud of

**Kai never sits in a bubble — the patient does.** The old chat put both sides in
teal speech bubbles, which read as "cheap chatbot." The new chat renders Kai's
replies as plain, well-spaced text directly on the canvas with a small brand mark at
the group start (the Claude/Perplexity pattern), and keeps the *human's* messages in a
compact filled bubble on the right. That one inversion is the single biggest reason
the app now reads as a premium product instead of a toy — and it cost nothing in
functionality. The medical disclaimer moved from a yellow banner into a quiet pinned
line above the input, always visible, never shouting.

## Design system (see DESIGN_SYSTEM.md + DESIGN_RESEARCH.md)

- **Direction:** "Calm clinical warmth" — Vercel's typographic discipline + Linear's
  interaction density + Claude's no-bubble chat, on a warm **stone** canvas with a
  single **teal** accent.
- **Type:** Geist Sans / Geist Mono via `next/font` (replaced Fraunces + DM Sans). One
  scale (12→36 + hero clamp), four weights.
- **Color:** warm stone neutrals (`#FAFAF9` canvas → `#1C1917` text) + teal used only
  where it means something. **Key call:** filled buttons/links use `brand-ink #0F766E`
  (5.1:1 on white = WCAG AA), while `#14B8A6` stays the visual brand for icons/decoration.
  The old `#0B8FAC`-on-white buttons failed AA; this fixes it while keeping the look.
- **Tokens:** rebuilt `globals.css` as Tailwind v4 `@theme` semantic utilities
  (`bg-canvas`, `text-text-secondary`, `border-subtle`, `bg-brand-ink`…). Legacy
  `--keiro-*` vars are remapped onto the new palette so every surface shifted at the
  token layer, then each page was rebuilt on top.
- **Radius/shadow/motion:** 4/6/8/12/16 radii; shadows reserved for overlays only;
  150ms transitions on compositor-friendly props; `prefers-reduced-motion` honored;
  full dark-mode palette defined under `.dark`.

## Components rebuilt (`src/components/ui` + shared)

| Component | Change |
|---|---|
| `button.tsx` | Rebuilt on CVA — primary/secondary/ghost/destructive/link × sm/md/lg; loading keeps label + spinner, width stable; `danger` aliased to `destructive` |
| `Input.tsx` (new) | Label-always-above, inline error, AA focus ring, 16px font (no iOS zoom) |
| `Badge.tsx` (new) | default/brand/success/warning/error pill variants |
| `Toast.tsx` | Bottom-right stack (max 3), variant icons, `aria-live`, errors persist, others auto-dismiss |
| `Skeleton.tsx` | Stone shimmer; `SkeletonChatBubble` now mirrors the real bubble-less Kai layout |
| `SOSBar`, `CookieConsent`, `VoicePicker`, `ProgressBar`, `ErrorBoundary` | Migrated to tokens |
| `ChatBubble`, `ChatInput`, `SeverityPicker`, `HealthConsentGate`, `TopBar` | Chat surface rebuilt |
| `Kai` UI helpers (`ai-chat`, `ia-siri-chat`, `feature-highlight-card`, `ai-voice-input`) | Teal ramp updated |

## Pages redesigned

- **Landing** (`/`) — Nav, Hero (eyebrow + weight-contrast headline, no formula color,
  light canvas, Kai centerpiece on a soft brand wash, in-component language dropdown),
  Marquee, HowItWorks, ImpactBento (navy→warm-stone band), Languages (dark→light chip
  wall), MeetKai, ForHospitals (token form), Footer (warm-stone bookend).
- **Chat** (`/chat`) — the centerpiece rebuild described above + matching skeleton.
- **Auth** (`/auth`) + `EmailAuthForm` — single-column max-w-sm, Google-first ordering,
  labeled inputs, password strength, OTP boxes on tokens.
- **Onboarding** (`/onboarding`) + `LanguageSelector` + `RomanizationToggle` — clean
  language list, brand-subtle selected state, sticky CTA footer.
- **History** — hover-row report list, designed empty/error states, mirror-layout skeleton.
- **Settings** — sectioned cards, real toggles, feedback + delete modals, quarantined danger zone.
- **Report** — printed-lab-report look (uppercase label over hairline rule), brand-ink
  primary action, AI disclaimer + physician-notes block.
- **Emergency** — red owns only the header/CTA (the one saturated red in the app); rest on tokens.
- **404 / error / loading** — `404` numeral + one action; dev-only error detail in mono;
  loading = brand-mark pulse, no spinner.
- **Privacy / Terms / Reset-password** — remapped onto token variables.

## Verification

- `npx tsc --noEmit` → **exit 0, zero errors**
- `npm run build` → **exit 0**, all 22 routes generated, TypeScript pass in build
- Responsive: **no horizontal overflow at 375px** on landing or chat; mobile chat,
  mobile hero, desktop hero/auth/settings/chat/onboarding screenshotted and verified
- Computed-style checks confirm Geist applied, canvas/text/brand tokens resolving, and
  the two dark bands converted to warm stone

## What couldn't be fully verified in-harness (not a defect)

The landing page's lower sections (HowItWorks → Footer) use Lenis smooth-scroll +
framer-motion `useInView` reveal gating. The headless preview can't advance Lenis's
virtual scroll via synthetic events, so those sections stay at opacity 0 in automated
screenshots. I verified them instead by **computed-style inspection** (backgrounds,
borders, button fills all resolve to the new tokens) and a clean production build. They
animate in normally for real users on real scroll input. Recommend a quick manual
scroll-through before shipping.

## Notes

- No backend, API, auth, or data logic was changed — only presentation.
- Removed the global grain overlay and custom cursor from the layout for a cleaner,
  faster base; `CustomCursor` import dropped from `layout.tsx`.
- `DESIGN_RESEARCH.md` and `DESIGN_SYSTEM.md` written at repo root.
