# Keiro Design References

Reference doc for all UI decisions in this build. Keiro is a **mobile-first healthcare PWA**
(430px phone frame) — the references below are adapted to that constraint, not copied wholesale.

## Reference sites — what to borrow

| Site | What to take | What NOT to take |
|------|--------------|------------------|
| linear.app | Interaction quality: every hover/active/focus state feels designed; restrained motion that communicates state changes | Dark-first palette (Keiro is clinical light) |
| resend.com | Clean SaaS spacing rhythm, one accent color used semantically, sparse shadows | Developer-tool tone of voice |
| cal.com | Open-source trust signals, plain-language copy, accessible defaults | Dense settings UI |
| mercury.com | Trust + premium feel through typography contrast and whitespace, serif/sans pairing for editorial moments | Finance-dark gradients |
| vercel.com | Typography discipline: tight tracking on display sizes, generous line-height on body, monochrome base + one accent | Geist-everything sameness |

## Keiro's existing visual identity (KEEP — it's already distinctive)

- **Brand teal ramp**: `#F8FCFE → #F0F9FB → #CCF0F8 → #BAE8F2 → #52C5DC → #0B8FAC → #075F77 → #0B5E72 → #1A1A2E`
- **Warning amber** `#F59E0B` / `#FFFBEB` / `#92400E` (disclaimers, report CTA)
- **Emergency red** `#C0392B` / `#FFF5F5` / `#FECACA`
- **Kai the mascot** — the single biggest anti-template asset. Lead with it.
- Phone-frame, 430px max width, h-dvh layouts — a deliberate "medical kiosk" feel.

## Vibe-code checklist — things to avoid (from research)

1. Default lavender/purple-blue gradients → Keiro uses its own teal; keep it that way
2. Inter-only typography → Keiro already loads a display font (`font-display`); enforce the pairing
3. Seven different card treatments on one page → one card primitive, repeated
4. Uniform `rounded-2xl shadow-lg` on everything → shadows only on floating/elevated surfaces
5. Centered-icon + headline + paragraph template sections → keep Keiro's editorial left-aligned headers
6. Stock photos of doctors/stethoscopes → never; show the actual chat UI and Kai
7. Placeholder copy ("Lorem", "Your journey starts here") → real medical-intake copy only
8. Random padding values → spacing scale only (12/16/24/32/48px)
9. Arbitrary hex sprinkled per-file → tokens in `globals.css` (`--brand-*`), referenced everywhere
10. Dead default assets (`next.svg`, `vercel.svg`) shipping in `public/` → delete

Sources: [Developers Digest — AI design slop patterns](https://www.developersdigest.tech/blog/ai-design-slop-and-how-to-spot-it),
[Standard Beagle — what AI interfaces got wrong](https://standardbeagle.com/the-year-ai-generated-interfaces-took-over/),
[Vibe Coder — production readiness checklist](https://blog.vibecoder.me/production-readiness-checklist-vibe-coded-apps)

## Healthcare-specific conventions

- Clean whites/very light tints as base; color carries meaning (teal = brand/info, amber = caution, red = emergency only)
- Trust signals near every data-entry point: "Private", "Free", "Not stored unless you sign in"
- Medical disclaimer must be persistent and non-dismissible on AI surfaces (already present in chat — keep)
- WCAG: 44px touch targets, visible focus rings, `role="log"`/`aria-live` on chat (already present — keep)
- Reading level: short sentences, no jargon — the audience is patients who may not read English well

## Typography scale (applied in Phase 6)

- Display: `font-display text-[28px]/[34px] font-bold tracking-tight` (phone frame — no 6xl)
- H1: `font-display text-[24px] font-bold tracking-tight`
- H2: `font-display text-[20px] font-semibold`
- Body: `text-[15px] leading-relaxed`
- Caption: `text-[13px]`
- Label: `text-[12px] font-semibold uppercase tracking-wider`

## GDPR notes for legal pages (from research)

- Health data = GDPR Art. 9 special-category → requires **explicit, dedicated consent** naming the
  data types (symptoms, medications, conditions) and purposes — not bundled with marketing
- No pre-ticked boxes (Planet49, CJEU C-673/17)
- Service access must not be conditioned on non-essential processing
- Keiro is **not a HIPAA covered entity** (no insurance billing, not a provider) — state this plainly
- Rights to surface in UI: access (download), erasure (delete account), portability (PDF/JSON export)

Sources: [Momentum — GDPR consent for health data](https://www.themomentum.ai/blog/gdpr-consent-requirements-health-data),
[VertiComply — GDPR for US healthcare apps](https://verticomply.com/blog/gdpr-for-us-healthcare-apps-guide)
