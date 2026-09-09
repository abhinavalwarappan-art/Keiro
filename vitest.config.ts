import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/__tests__/setup.ts'],
    // Only this checkout's application tests; ignored agent worktrees can contain
    // their own Vitest and Playwright suites beneath the repository root.
    include: ['src/**/*.{test,spec}.{ts,tsx}'],
    // Playwright owns tests/e2e — keep vitest from grabbing its *.spec.ts files.
    exclude: ['**/node_modules/**', '**/dist/**', 'tests/e2e/**'],
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
