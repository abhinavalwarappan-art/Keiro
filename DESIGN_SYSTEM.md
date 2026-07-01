# Keiro Design System

> The single source of truth for Keiro's visual language. Implemented as Tailwind v4
> `@theme` tokens in `src/app/globals.css` (this project is Tailwind v4 / CSS-first —
> there is no `tailwind.config.ts`; `@theme` is the v4 equivalent).

## Direction: "Calm clinical warmth"

Keiro is a healthcare AI assistant. People arrive worried, often in a second language.
The interface must feel **safe, calm, precise, and warm** — Vercel's typographic
discipline + Linear's interaction density + the Claude/Perplexity no-bubble chat
pattern, on a warm stone canvas with a single teal accent.

What it is NOT: a generic SaaS dashboard, a 2018 medical app (blue gradients, stock
doctors), a robot-avatar chatbot, or a vibe-coded side project.

Rules of thumb:
- Color appears only where it means something. Teal = Keiro speaking or acting.
  Red = emergency, and nothing competes with it. Amber = caution.
- The human sits in a bubble; Kai never does. AI text renders directly on canvas.
- Hairline stone borders carry structure; shadows are reserved for overlays.
- More whitespace than feels necessary. Density goes into interaction states.

## Typography — Geist, one system

| Token | Use |
|---|---|
| `--font-sans` Geist | everything |
| `--font-mono` Geist Mono | timestamps, codes, report IDs, dev errors |

Scale (the ONLY sizes): `text-xs` 12 / `text-sm` 14 / `text-base` 16 / `text-lg` 18 /
`text-xl` 20 / `text-2xl` 24 / `text-3xl` 30 / `text-4xl` 36 (marketing) /
landing hero may use clamp up to ~64px.

Weights: 400 body · 500 labels/nav/buttons · 600 card titles/section headers ·
700 page titles/hero only. Tracking: `tracking-tight` ≥ text-2xl, `tracking-wide`
only for 12px uppercase labels. Body copy `leading-relaxed`, headings `leading-tight`.

## Color

### Neutrals (warm stone)
| Token | Value | Use |
|---|---|---|
| `canvas` | `#FAFAF9` | page background |
| `surface` | `#FFFFFF` | cards, panels, inputs |
| `sunken` | `#F5F5F4` | inset areas, hover fills, quoted content |
| `border-subtle` | `#E7E5E4` | default hairline borders |
| `border-default` | `#D6D3D1` | emphasized borders |
| `border-strong` | `#A8A29E` | rare, strong emphasis |
| `text-primary` | `#1C1917` | headings, message content |
| `text-secondary` | `#57534E` | body, descriptions |
| `text-tertiary` | `#79716B` | timestamps, metadata (AA on canvas) |
| `text-placeholder` | `#A8A29E` | placeholders only |

### Brand (teal) — used sparingly
| Token | Value | Use |
|---|---|---|
| `brand-subtle` | `#F0FDFA` | tinted backgrounds |
| `brand-muted` | `#CCFBF1` | hover on tinted backgrounds |
| `brand-border` | `#99F6E4` | borders on tinted surfaces |
| `brand` | `#14B8A6` | icons, accents, progress fills, decorative |
| `brand-strong` | `#0D9488` | icon hover, large-text accents |
| `brand-ink` | `#0F766E` | **links, text, primary button bg** |
| `brand-ink-hover` | `#115E59` | primary button hover |
| `brand-ink-active` | `#134E4A` | pressed |

> **Deviation from the brief, on purpose:** `#14B8A6` with white text is ~2.5:1 —
> fails WCAG AA. Filled controls and text links therefore use `brand-ink #0F766E`
> (5.1:1 with white). `#14B8A6` stays the *visual* brand for icons, fills ≥3:1 UI
> elements, and decorative use. This keeps the YC-demo look AND passes the Step-9 audit.

### Semantic
success `#16A34A` on `#F0FDF4` (text `#166534`) · warning `#D97706` on `#FFFBEB`
(text `#92400E`) · error `#DC2626` on `#FEF2F2` (text `#991B1B`) · emergency red
`#DC2626` is reserved — no other saturated red anywhere.

## Spacing
4px grid only: 4 8 12 16 20 24 32 40 48 64 80 96 128 → `p-1 … p-32`. No odd values.

## Radius
`sm` 4 (inputs, badges) · `DEFAULT` 6 (buttons) · `md` 8 (dropdowns, modals) ·
`lg` 12 (cards, panels) · `xl` 16 (large containers) · `full` (pills, avatars).
Nested radii: child ≤ parent.

## Shadows — barely any
xs `0 1px 2px rgb(28 25 23 / .05)` (inputs on focus) ·
sm `0 1px 3px rgb(28 25 23 / .08), 0 1px 2px -1px rgb(28 25 23 / .08)` (dropdowns/tooltips) ·
md (modals only). Static cards: **border, no shadow**.

## Motion
150ms `cubic-bezier(0.4,0,0.2,1)` for color/border/shadow; 200ms ease-out for
overlays (scale .96→1 + fade); buttons `active:scale-[0.98]`; transform/opacity only;
`prefers-reduced-motion` collapses everything. No autoplaying decoration in app surfaces.

## Components (canonical specs)
- **Button** sm h-8/md h-9/lg h-10, font-medium; primary = brand-ink bg, white text;
  secondary = surface + subtle border; ghost; destructive; loading keeps label + spinner,
  width stable. Mobile touch target ≥44px via padding/inset hit area.
- **Input** h-10, rounded-md, surface bg, subtle border, label ALWAYS above
  (12px medium uppercase tracking-wide, text-secondary), error inline below.
- **Card** surface, rounded-lg, subtle border, p-6, no shadow. Interactive: hover
  border-default + shadow-xs + active scale .995.
- **Badge** pill, 12px medium: default/brand/success/warning/error tinted variants.
- **Chat** user = brand-ink bubble right, white text, rounded-lg w/ rounded-br-sm;
  Kai = NO bubble, 24px Kai mark at group start, text-primary on canvas, copy-on-hover;
  typing = three pulsing dots; disclaimer pinned above input, always visible.
- **Skeleton** stone shimmer, mirrors final layout exactly.
- **Empty states** one icon (24–48px, border-subtle color), one sentence
  (text-secondary), one brand-ink action. Never illustrations.

## Voice & micro-copy
Short, factual, warm. "No conversations yet" not "It's quiet in here! 🎉".
Sentence case everywhere, including buttons. Ellipsis character `…` not `...`.

## Legacy variable remap (migration strategy)

App pages style heavily through `--keiro-*` CSS variables. Those variables are
**remapped** to this palette (e.g. `--keiro-mid` → brand, `--keiro-muted` → stone
secondary, `--off-white` → canvas), so every page shifts onto the new system at the
token layer first; surfaces are then rebuilt page-by-page on top. New code must use
the semantic Tailwind tokens (`bg-canvas`, `text-secondary`, `border-subtle`,
`bg-brand-ink`…), never raw hex.
