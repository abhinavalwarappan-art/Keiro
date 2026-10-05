import { Geist } from 'next/font/google'

/**
 * Geist, Keiro's product face — one instance for the whole app.
 *
 * Loaded through next/font/google (self-hosted at build time) rather than the
 * `geist` package because Next generates a size-adjusted fallback for it: the
 * system font shown before Geist arrives has matching metrics, so text no
 * longer reflows (a measurable layout shift on slow clinic connections) when
 * the web font swaps in.
 */
export const geistSans = Geist({
  subsets: ['latin', 'latin-ext'],
  display: 'swap',
  variable: '--font-geist-sans',
})
