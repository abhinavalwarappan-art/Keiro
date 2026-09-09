import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // Generated artifacts (also in .gitignore) — never lint their minified bundles.
    "playwright-report/**",
    "test-results/**",
    "coverage/**",
    "graphify-out/**",
    // Local agent checkouts and audit evidence are not part of this application.
    ".claude/**",
    ".remember/**",
    "artifacts/**",
    "scripts/audit/**",
    "supabase/.temp/**",
  ]),
  {
    // These react-hooks rules flag idiomatic patterns / dead code here, not bugs,
    // so they're downgraded to warnings to not block the build:
    // - set-state-in-effect: hydration mount-guards (setMounted/setIsClient in
    //   FlagEmoji, Hero, ai-voice-input), window-resize sync (SpiralLanguageScroll),
    //   and the ChatBubble typewriter reveal.
    // - immutability: a self-referential setTimeout in ia-siri-chat.tsx.
    // Note: src/components/ui/ai-voice-input.tsx and src/components/ui/ia-siri-chat.tsx
    // are unused vendored components (dead code).
    files: ["**/*.{ts,tsx}"],
    rules: {
      "react-hooks/set-state-in-effect": "warn",
      "react-hooks/immutability": "warn",
    },
  },
  {
    // Playwright E2E files are not React; the react-hooks plugin otherwise
    // misreads Playwright's fixture `use()` as the React `use()` hook.
    files: ["tests/e2e/**/*.{ts,tsx}"],
    rules: {
      "react-hooks/rules-of-hooks": "off",
      "react-hooks/set-state-in-effect": "off",
    },
  },
]);

export default eslintConfig;
