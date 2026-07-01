# Keiro Design Research

> Compiled 2026-06-11, before the full UI/UX redesign. Sources: Vercel's
> [web-interface-guidelines](https://github.com/vercel-labs/web-interface-guidelines) (fetched in full),
> published breakdowns of Linear/Vercel/Stripe design systems, and documented analysis of each
> reference product below.

---

## Reference teardowns

### linear.app
1. **Type**: Inter Variable, tight tracking on headings (−0.02em), 510–590 weights for UI labels.
2. **Primary color**: Indigo (#5E6AD2), used on <5% of pixels — primary buttons, active states, that's it.
3. **Background**: Slightly tinted dark (#08090A) or off-white; never pure white in app surfaces.
4. **Borders**: Hairline borders (rgba at 8–12% opacity) over shadows. Shadows only on overlays.
5. **Radius**: 6–8px on controls, 12px on panels. Consistent everywhere.
6. **Empty states**: One icon, one sentence, one action. Never illustrations.
7. **Primary button**: Solid indigo, 32px tall, 13px font-medium label, subtle inner highlight.
8. **Nav**: 220px sidebar, 28px row height, icon+label, active = tinted bg not border.
9. **Signature**: Every interactive element has six distinct states; keyboard-first (⌘K everywhere).
10. **What others don't do**: Interaction density over visual density — sparse pixels, dense behavior.

### vercel.com
1. **Type**: Geist Sans / Geist Mono. Headings tracking-tight, body 14–16px.
2. **Primary color**: Near-monochrome. Black buttons on white; blue only for links/info.
3. **Background**: Pure white marketing, #fafafa app surfaces, #000 dark.
4. **Borders**: 1px #eaeaea everywhere. Shadows almost never on static content.
5. **Radius**: 6px buttons/inputs, 8–12px cards.
6. **Empty states**: Dashed-border container + short copy + primary action.
7. **Primary button**: Solid black, white text, 8px radius, instant hover invert.
8. **Nav**: Top tab bar w/ animated active underline; breadcrumb project switcher.
9. **Signature**: Tabular numbers in all dashboards, ⌘K menu, skeletons that exactly mirror content.
10. **What others don't do**: Ships near-zero color and lets typography carry the entire hierarchy.

### liveblocks.io / resend.com / raycast.com
- Dark surfaces are *warm-tinted*, never pure #000 page-wide; accents glow (shadow in accent color at low alpha).
- Resend: empty states are a product tour — each empty screen teaches the next action. Micro-copy is written like documentation: short, factual, friendly.
- Raycast: feature presentation = real product UI re-rendered as live components, not screenshots. Motion is 150–250ms ease-out, always interruptible.

### clerk.com / cal.com
- Auth forms: single column, max-w-sm, social OAuth first, divider, email/password, one primary action. Labels above inputs, 12–13px, font-medium.
- Cal.com: settings = left rail of sections (200px), each section a flat list of labeled rows; danger zone visually quarantined with red border.

### plain.com / superhuman.com
- Chat: user messages right-aligned in filled container; agent/system messages left, minimal chrome.
- Plain uses *no avatar repetition* — sender shown once per group; timestamps only on group boundaries.
- Superhuman: speed-as-design — every action has a visible keyboard shortcut, transitions under 100ms.

### arc.net
- Personality through color *zones* (user-chosen gradients) contained inside a disciplined neutral shell — color belongs to content, chrome stays neutral.

### Perplexity / Claude.ai (chat pattern reference)
- AI responses are **not bubbles**: plain text on canvas, max ~65ch, brand mark at group start, actions (copy) appear on hover. User messages are compact filled bubbles right-aligned. This single pattern is the biggest "premium vs chatbot" differentiator.

---

## Search findings (2025–2026 SaaS design analysis)

- Premium = "sparse visually, interaction-dense." Density lives in hover/focus/keyboard states, not pixels.
- Spacing: 4px grid, limited scale (4/8/12/16/24/32/48), *more* whitespace than feels necessary.
- Color restraint: neutrals + ONE measured accent used for meaning, not decoration.
- Crisp edges: semi-transparent borders + (rare) layered shadows; tint grays toward background hue.
- Six states per control: default / hover / active / focus / disabled / loading.

Sources: [Mantlr — How Stripe, Linear, and Vercel Ship Premium UI](https://mantlr.com/blog/stripe-linear-vercel-premium-ui),
[LogRocket — Linear design](https://blog.logrocket.com/ux-design/linear-design/),
[925 Studios — Linear Design Breakdown](https://www.925studios.co/blog/linear-design-breakdown-saas-ui-2026),
[Vercel Web Interface Guidelines](https://vercel.com/design/guidelines).

---

## Vercel Web Interface Guidelines — rules adopted as hard requirements

(Full list fetched; the ones most relevant to Keiro's audit in Step 9)

- Focus: visible `:focus-visible` rings everywhere; never remove outline without replacement.
- Hit targets ≥24px desktop, ≥44px mobile.
- Forms: labels always; errors inline next to fields; never block paste; `inputmode`/`autocomplete` set; ≥16px input font on mobile (iOS zoom).
- Loading buttons keep their label + spinner; width stays stable.
- Animation: `transform`/`opacity` only; no `transition: all`; honor `prefers-reduced-motion`.
- Skeletons mirror final layout exactly (no CLS).
- `tabular-nums` for numbers users compare.
- Empty/sparse/dense/error states all designed; no dead ends — always a next step.
- Touch: `touch-action: manipulation`; `overscroll-behavior: contain` in drawers/modals.
- Text: `truncate`/`line-clamp` + `min-w-0` on flex children; locale-aware dates via `Intl`.
- Color: contrast AA minimum; increase contrast on hover/active; redundant cues (never color-only).

---

## Healthcare-specific principles

- **Trust = calm neutrals + one clinical accent.** Warm stone neutrals (not blue-gray) read human, not hospital.
- **Never robot avatars** for the assistant — a geometric brand mark keeps it product-like, not gimmicky.
- **Disclaimers are part of the design**, pinned and legible, not buried fine print.
- **Multilingual reality**: long strings (Tamil, German) must not break layouts → truncation + flexible rows everywhere; language switcher always one tap away.
- **Emergency surfaces** get the only saturated red in the app; nothing else competes with it.

---

## The design opinion (what Keiro will be)

**"Calm clinical warmth"** — Vercel's typographic discipline + Linear's interaction density + Claude/Perplexity's no-bubble AI chat, on a warm stone canvas with a single teal accent. Geist for everything. Hairline stone borders, almost no shadows. The AI never sits in a bubble; the human does. Color appears only where it means something: teal = Keiro speaking/acting, red = emergency, amber = caution.
