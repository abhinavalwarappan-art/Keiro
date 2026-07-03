import { defineConfig, devices } from '@playwright/test'

/**
 * Keiro E2E config.
 *
 * Strategy (per project decision):
 * - Runs locally against `next dev` (reused if already running), CI boots its own.
 * - Hybrid externals: real Supabase auth/session, AI/translate endpoints are mocked
 *   per-test via browser-level route interception (see tests/e2e/fixtures/mocks).
 * - RATE_LIMIT_DISABLED=true keeps the per-user/per-IP limiters out of the way so
 *   auth + protected-route flows stay deterministic.
 */
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000
const BASE_URL = process.env.BASE_URL ?? `http://localhost:${PORT}`
const GUEST_STATE = 'tests/e2e/.auth/guest.json'

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  // E2E under heavy parallel load has rare timing flakes; one local retry absorbs
  // them. A genuinely broken test fails both attempts, so real failures still surface.
  retries: process.env.CI ? 2 : 1,
  // The app under test is a single `next dev` server; too many parallel workers
  // contend on it (slow route compiles → navigation/teardown timeouts). Cap local
  // workers to keep runs stable. CI stays single-worker for full determinism.
  workers: process.env.CI ? 1 : 3,
  reporter: process.env.CI ? [['list'], ['html', { open: 'never' }]] : [['list'], ['html', { open: 'never' }]],

  timeout: 30_000,
  expect: { timeout: 10_000 },

  use: {
    baseURL: BASE_URL,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },

  projects: [
    // One real anonymous sign-in, saved to GUEST_STATE.
    { name: 'setup', testMatch: /auth\.setup\.ts$/ },

    // Everything except the chat specs runs unauthenticated, as authored.
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
      testIgnore: /[\\/]chat[\\/]/,
    },

    // Chat specs reuse the single shared guest session (no per-test sign-in).
    {
      name: 'chromium-authed',
      testMatch: /[\\/]chat[\\/].*\.spec\.ts$/,
      use: { ...devices['Desktop Chrome'], storageState: GUEST_STATE },
      dependencies: ['setup'],
    },
  ],

  webServer: {
    command: 'npm run dev',
    url: BASE_URL,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
    env: {
      RATE_LIMIT_DISABLED: 'true',
      PORT: String(PORT),
    },
  },
})