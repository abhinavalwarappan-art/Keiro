# Engineering Notes

## Accepted risk: `postcss` advisory (GHSA-qx2v-qp2m-jg93)

`npm audit` reports **2 moderate** vulnerabilities that are intentionally left unfixed:

```
postcss  <8.5.10  — XSS via Unescaped </style> in CSS Stringify Output
  next  (depends on the vulnerable postcss)
  node_modules/next/node_modules/postcss
```

**Why it's accepted:**

- The vulnerable `postcss` is **bundled inside Next.js's own build tooling**
  (`node_modules/next/node_modules/postcss`), not a dependency we import or run
  at runtime. The advisory concerns PostCSS's CSS *stringify* output, which in
  this project only runs at **build time** over our own stylesheets — there is
  no path where attacker-controlled input reaches it.
- The only automated remediation, `npm audit fix --force`, resolves it by
  installing **`next@9.3.3`** — downgrading from Next 16 to Next 9, a breaking
  change that would destroy the app. **Do not run `npm audit fix --force`.**
- The genuine fix is a Next.js patch release that bumps its bundled `postcss`.
  Re-run `npm audit` after each Next upgrade; drop this note once it clears.

**Do not run:** `npm audit fix --force`
**Recheck on:** every `next` version bump.

## ESLint: `react-hooks/set-state-in-effect` downgraded to `warn`

See the comment in [`eslint.config.mjs`](./eslint.config.mjs). The flagged
instances are idiomatic hydration mount-guards, window-resize sync, and a
typewriter reveal — not bugs. `src/components/ui/ai-voice-input.tsx` and
`src/components/ui/ia-siri-chat.tsx` are unused vendored components (dead code).
