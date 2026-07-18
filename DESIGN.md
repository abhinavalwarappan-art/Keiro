# KEIRO MARKETING SITE — DESIGN SYSTEM (v4 "THE LEDGER")

> Source of truth for the 2026-07 redesign. Every build agent works from this file.
> If a page could be mistaken for a recolor of the previous site, it has failed.

## 1. Thesis

Keiro's entire product is a **document** — one clean English intake summary a clinician
trusts — so the site is typeset **as the document it produces**: chart-paper grounds,
hairline rules, mono field annotations in the margins, asymmetric editorial grids that
never center anything by default. The **45 scripts are the art**: patient languages set
at specimen scale, English as the quiet clinical annotation beneath, RTL mirroring
performed as a designed gesture. The warmth comes from voice and from the scripts, not
from decoration. Precision is the empathy: a site this exact about typography is
believable when it claims to be exact about your symptoms.

Register: *a beautifully kept clinical ledger, filled in by someone kind.*

Craft references (for discipline, not copying): Stripe's docs-grade restraint, Linear's
typographic hierarchy, type-foundry specimen sheets, medical-journal figure captions.

DESIGN_VARIANCE 7 · MOTION_INTENSITY 5 · VISUAL_DENSITY 3. Light-only site.

## 2. Type — three faces, three jobs (all verified in next/font google registry)

| Role | Face | next/font export | Loading |
|---|---|---|---|
| **Display / voice** | Bricolage Grotesque | `Bricolage_Grotesque` | variable (wght+opsz), subsets latin, latin-ext, vietnamese. **No italic exists** — see emphasis rule. |
| **Body / document** | IBM Plex Sans | `IBM_Plex_Sans` | variable wght, styles normal+italic, subsets latin, latin-ext, vietnamese |
| **Mono / chart** | IBM Plex Mono | `IBM_Plex_Mono` | static 400 + 500, subsets latin, latin-ext |

CSS classes (landing.css owns family+weight+tracking+leading; JSX must NOT add Tailwind
font-weight/tracking/leading utilities on the same node — they win the cascade):

- `.lx-display` — Bricolage, wght 560, tracking −0.025em, leading 1.04. H1s, giant numerals.
- `.lx-heading` — Bricolage, wght 540, tracking −0.015em, leading 1.12. Section h2s.
- `.lx-title` — Plex Sans 600, −0.008em, 1.3. Card/row titles (UI, not voice).
- `.lx-label` — Plex Mono 500, +0.08em, uppercase. Eyebrows, field labels, running heads, folios.
- `.lx-mono` — Plex Mono, tabular-nums. Codes, figures, measured values.
- `.lx-serif` — **now the ASIDE voice**: Plex Sans italic 450, 1.45. The human beats
  ("she is 72"). Same class name kept so existing props keep working.
- `.lx-native` — script-complete stack (Plex Sans → Noto family → system). REQUIRED on
  every element rendering a patient's language. Never put translated copy in `.lx-display`.

**Emphasis idiom (the one big register change):** Bricolage has no italic. The
italic-green-phrase tell is DEAD. Inside a heading, emphasis = `Accent` component:
`--lx-green-display` color + wght 650, upright. Never faux-italic the display face.
`GradWord` is retired (renders same as Accent for compatibility — do not use in new work).

## 3. Color — role-locked, ratios measured (CI enforces axe AA; targets are AAA)

Grounds (never text): `--lx-paper #FCFCF9` page · `--lx-graph #F1F4EE` tinted plane ·
`--lx-wash #E3F1E6` highlight/plain-words fills · `--lx-card #FFFFFF` artifact paper ·
`--lx-deep #0E2A1C` the ONE dark plate per page.

| Token | Hex | Role (hard-locked) | Ratio on paper/graph/wash |
|---|---|---|---|
| `--lx-ink` | #14241B | display text, primary button ground | 15.7 / 14.6 / 13.9 |
| `--lx-body` | #2A342D | running prose | 12.6 / 11.6 / 11.1 |
| `--lx-muted` | #4C5951 | secondary text, captions | 7.2 / 6.6 / 6.3 |
| `--lx-green-ink` | #146038 | green text at body size, ALL links, focus rings (light) | 7.4 / 6.9 / 6.5 |
| `--lx-green-display` | #177544 | green text ≥24px (Accent) — safe even if misused small | 5.6 / 5.2 / 4.9 |
| `--lx-green-fill` | #27A566 | FILLS ONLY, never text: ticks, listening bars, rules-as-emphasis. 2.84:1 on graph → never a lone semantic boundary there | — |
| `--lx-signal-ink` | #8C4E00 | amber annotation text — mono utility layer only (WILL-NOT clauses, margin notes). Never headlines, never fills | 6.4 / 5.9 / 5.6 |
| `--lx-signal-fill` | #E4632E | non-text: pulse dot, tick ornaments | — |
| `--lx-hairline` | #D8E0D6 | 1px rules, tables, registration marks. Decorative — a semantic boundary also gets spacing/label |

On-deep tiers: `--lx-deep-ink #F2F7F1` (14.2), `--lx-deep-body #C9D8CC` (10.4),
`--lx-deep-muted #A9BFAE` (7.9), `--lx-deep-mint #B7EECD` (11.8) for green text + focus on deep.

**Band system is kept** (same class names, remapped): `lx-band-cream` → paper ground,
`lx-band-mint` → graph plane, `lx-band-deep` → deep plate. `--band-*` vars unchanged in
name. `--band-focus` = green-ink on light bands, deep-mint on deep. Focus rings NEVER
use `--lx-green-fill`.

**Retired:** the nine `data-flow` gradient palettes, `.lx-flow*`, `.lx-flow-drift`,
`.lx-grain`, gradient buttons, gradient text. SiteShell keeps its `flow` prop (API
compatibility; renders a dead data attribute). Atmosphere now comes from: paper warmth,
the hairline armature, ONE `.lx-daylight` wash (a barely-there radial green tint allowed
behind a page's hero only), and the deep plate's inset vignette.

## 4. Surfaces, depth, armature

- **Spacing**: 8px base, 4px sub-grid for annotations. Section rhythm:
  `--lx-section: clamp(4.5rem, 3rem + 5vw, 8.5rem)`. Rhythm is contrast: heading sits
  tight (12px) to its lede, far (48px+) from the previous block.
- **Radius, role-coded (three values)**: `4px` chips/annotations/inputs/tabs ·
  `8px` buttons/cards/controls · `14px` reserved for product artifacts (the ledger, the
  report). Pills (999px) ONLY for the language-count badge and status dots. **No pill
  buttons anywhere** — rectangular CTAs are part of the new identity.
- **Depth, nearly abolished**: hierarchy comes from hairlines and plane changes.
  L0 planes (bands, flush; ground change + 1px lit top edge). L1 cards: flat `--band-card`
  panes, 1px hairline, NO resting shadow; hover = 2px lift (transform) + green hairline
  arrival via the `::before` mask trick (kept). L2 artifacts: ONLY real product output
  (the bilingual ledger, the clinician report) — `--lx-shadow-artifact:
  0 24px 64px -32px rgba(14,42,28,.18)` + 1px ink-tinted ring. Zero box-shadow
  transitions anywhere (kept rule).
- **The armature**: `.lx-rails` (1px vertical rules on the content column) is now a
  first-class identity element — most sections carry it. **Running heads**: every major
  section opens with `.lx-runhead` — top hairline + mono folio flush-left
  (`02 · METHOD`) + optional mono meta flush-right. Sections are separated by rules and
  running heads, not by background swaps alone.
- **Chart details** (cheap, high identity): registration-mark corners on artifact frames
  (`.lx-regmark`), carbon-copy double-rule under table headers (`.lx-cc-edge`), figure
  captions under artifact fragments (`FIG. 2 — FOLLOW-UP, DEVANAGARI` in `.lx-label`),
  `.lx-wash-sweep` highlight (scaleX overlay, transform-only).
- **Graph-paper grid**: allowed ONLY inside artifact surfaces (`.lx-sheet-grid`), never
  page-wide.

## 5. Motion — intensity 5, opt-in forever

Everything animated is declared inside `@media (prefers-reduced-motion: no-preference)`
or routed through Framer under `MotionConfig reducedMotion="user"` (kept). The SSR/
reduced state is the complete, composed state — END-STATE PINNING is kept.

- Entrances: opacity + 12px rise, 480ms, cubic-bezier(0.22,1,0.36,1), whileInView
  `once: true`. Stagger varies by archetype (48–90ms) — never one metronome sitewide.
- Typing: fixed 24ms/char (CJK 80, Devanagari 40), deterministic scripts, no
  Date.now/Math.random in render.
- Leader lines: SVG stroke-dashoffset draws, 700ms, desktop only.
- The 3-bar `KAI · LISTENING` meter (scaleY): the one permitted loop; runs only while
  visible and listening.
- Hover bus (`--lx-hover` inherited custom property) kept: arrow shaft/head, hairline
  arrivals, rule-thickens (scaleY).
- Buttons: press = 1px translateY; NO framer spring scale (MotionLink's whileHover scale
  is deleted).
- Banned: drifting/breathing backgrounds, marquee autoscroll, parallax, scroll-linked
  animation, box-shadow transitions, infinite decorative loops.

## 6. Signature element — THE BILINGUAL LEDGER (KaiDemo.tsx, rebuilt)

The hero artifact is a single paper document (14px radius, registration marks, the
site's one ambient shadow) split by a vertical hairline into two panes:
**PATIENT · <native language>** and **CLINICIAN · ENGLISH**. Mono chart header:
`KEIRO · INTAKE`, localized status (`KAI · LISTENING` / `كاي يستمع` …) + 3-bar meter,
language tabs ES · AR · HI · ZH · VI (real buttons, aria-pressed, min-h-11, keyboard-drivable).

Choreography per language (~9s, IO-gated ≥40% visible, pauses offscreen, fixed order):
1. Patient's line types on in native script — Arabic/Urdu flip the pane `dir="rtl"`:
   right-aligned text, caret advancing leftward, pane labels mirrored. RTL as proof.
2. Kai's follow-up fades in beneath, same script.
3. English summary fields commit one-by-one on the clinician pane (CHIEF COMPLAINT /
   ONSET / TRIGGER / RELIEVED BY / PATIENT SPOKE — mono labels, ruled rows), each with a
   wash sweep; on desktop a 1px leader line draws from the patient phrase across the
   center rule to its field.
4. Status flips to `SUMMARY READY` + green-fill tick; hold; rotate to next language.

Kept mechanics from the current KaiDemo (non-negotiable): IO gating, timer cleanup,
`driven` flag (user pick stops auto-rotate permanently), reduced-motion = fully composed
end state (both panes complete, tabs still work), `lang` attributes, `.lx-native`,
logical properties for RTL, summary pane pinned `dir="ltr"`. NEW: the pre-hydration/
SSR initial render is the COMPOSED COMPLETE state (not an empty frame). Mobile: panes stack.

## 7. Per-page work orders (structural, not palette)

Every page keeps its route, its metadata export, its h1 (via PageHero or `as="h1"`), and
all 91 inventoried legal/safety copy blocks with meaning intact.

1. **Home — THE SPLIT LEDGER.** 7/5 asymmetric hero: display headline hard-left + CTAs,
   Bilingual Ledger right (artifact above CTAs on mobile — keep grid-placement trick +
   `data-testid="hero-headline"` + copy `/Tell me what hurts.*language you think in/i`).
   Then: full-bleed **SPECIMEN BAND** — a static composed glyph wall ("tell me where it
   hurts" in ~7 scripts at specimen sizes with mono ISO annotations; replaces the
   marquee; set, not scrolled). Then THE METHOD: ledger rows docking to a 1px spine with
   running heads (01 SPEAK / 02 ASK / 03 HAND OFF), each an asymmetric artifact-fragment
   + copy pair. Then the deep plate: trust promises as a numbered reversed clause
   register. Clinics teaser: one ruled row with a mini report fragment + ArrowLink (not
   a card banner). Close: CtaBand (rebuilt as a wide ruled appointment slip, not a
   centered stack). Session-ended banner mechanism (?ended=1, Suspense) untouched.
2. **How it works — THE PROCEDURE COLUMN.** A numbered clinical protocol: narrow reading
   column; oversized half-cropped display numerals 01–04 in the left margin with mono
   annotations (duration, what Kai knows so far); each step closes with a FIG. artifact
   fragment (registration marks + figure caption). Data-handling table as ruled rows
   with carbon-copy edge. QA as margin notes.
3. **Languages — THE INDEX.** Kill chip cloud + marquee. A typeset table: one ruled row
   per language — native name at specimen size (`.lx-native`, `lang` attr), mono ISO
   code, script family, direction glyph (← in signal-ink for RTL) — grouped by writing
   system under sticky mono group headers. Row focus/click reveals Kai's actual greeting
   inline (grid-rows 0fr→1fr). The existing search keeps working (filters rows; groups
   collapse gracefully). Proper table/list semantics for axe.
4. **Meet Kai — THE CASE FILE.** The site's one centered layout: a vertical dossier.
   Mascot in a registration-marked portrait frame; ruled dossier rows NAME / ROLE /
   SPEAKS / WILL / WILL NOT — mono labels left, warm first-person answers right; WILL
   NOT rows set in signal-ink mono (the safety limits are the most visually distinct
   copy). FAQ as interview Q&A: mono questions, display-voice answers.
5. **About — THE EDITORIAL LETTER.** One paper plane, zero cards/bands: broadsheet
   letter — left 60% first-person letter with a giant Bricolage initial cap; right
   margin carries footnote-style mono annotations (67M, 45, $0, the four rules) tied by
   hairline ticks. Ends with a signature line. h1 via `as="h1"`.
6. **For clinics — THE SPECIMEN REPORT.** A life-size completed intake summary document
   is the page: sticky in the right ~5 columns (the one shadowed artifact), while claims
   scroll left, each with a mono anchor label (SEVERITY, MEDS, FLAGS); the matching
   report region gets a wash highlight via IO class-toggle (not scroll-linked). Stats as
   ONE ruled tabular strip (45 · 5 MIN · $0 · 0 SETUP), not cards. "What Keiro is not" →
   deep plate, numbered clause register, copy verbatim. FAQ as ruled rows.
7. **Contact — THE INTAKE FORM, LITERALLY.** Split plane: deep plate left third ("Say
   it in any language." + who answers + response expectation + emergency escalation as
   mono meta rows in deep-mint), the form right styled as one of Keiro's own documents:
   mono labels above hairline-underlined inputs (no boxes), 56px targets, submit is the
   page's only ink-ground element. **ContactForm submit logic untouched** (RPC
   anti-abuse). The audience router becomes ruled index rows.
8. **Privacy & Safety — THE CLAUSES.** Legal-document topology: two-level mono clause
   numerals (1. / 1.1) hanging in a wide left gutter; formal clause text in the reading
   column; beside key clauses a wash-ground block labeled `IN PLAIN WORDS:`. The Gemini
   free-tier disclosure is the MOST visually distinct clause on the page (signal-ink
   annotation `READ THIS FIRST`), never buried. Never-list on the deep plate. Footnote
   `#ref-N` anchors preserved. FAQ stays native `<details>`. Zero green display accents —
   the most sober page by construction.
9. **Accessibility — THE AUDIT SHEET.** The page is its own conformance report: a ruled
   checklist table where each commitment row shows the MEASURED value in mono (7.40:1 ·
   44px · 18px · 45 · 0 timers) + a green-fill PASS tick + a LIVE demo in situ (real
   44px target, real 18px sentence, palette swatches with printed ratios, focus ring on
   a real button). Self-proving demos stay REAL. The honest-gaps section gets real
   hierarchy (the biggest gap visually leads).

## 8. Hard rules for every build agent

- **Never edit shared files**: landing.css, fonts.ts, Sections.tsx, PageBits.tsx,
  Nav.tsx, Footer.tsx, Reveal.tsx, MotionLink.tsx, SiteShell.tsx, icons.tsx,
  KaiDemo.tsx, ChatMock.tsx — these are foundation-owned. Page-local components live in
  `src/components/landing-v3/pages/<page>/` owned by exactly one agent.
- **Never touch app surfaces**: `@/components/kai/*`, `@/lib/languages`, `@/components/ui/*`,
  globals.css, any route outside the 9 marketing pages.
- **Copy tiers**: marketing copy may be sharpened (keep the warm, plainspoken,
  first-person voice — this is not corporate SaaS). LEGAL/SAFETY/FACTUAL blocks (the 91
  inventoried) keep semantic meaning byte-equivalent; numbers (45, 5 min, $0, WCAG 2.2
  AA, 67M) exactly as-is. Never invent claims (no logos, stats, certifications).
- **A11y contract** (axe CI, 0 critical/serious): h1→h2→h3 order; Reveal `as="li"`
  inside lists; one Reveal div max inside `<dl>`; `lang` attr + `.lx-native` on every
  non-English string; `dir="rtl"` on RTL content; `lx-focus` on every interactive
  element; min-h-11 targets; 18px body floor; no maximumScale; native `<details>` for
  FAQ; aria-expanded/controls pairs on disclosures.
- **Hydration/CSP**: no Date.now()/Math.random()/locale-dependent output in render; no
  inline event-handler strings; no new npm dependencies; deterministic decorative data.
- **Lenis**: any new fixed/scrollable overlay needs `data-lenis-prevent`.
- **Testids**: `hero-headline`, `nav-cta`, `footer-link-*` stay. Footer keeps links to
  /privacy and /terms.
- **Perf**: no raster images; inline SVG only; landing JS < 150kb gz; no new fonts.
