/* Top navigation — calm, light, and legible. The old version was a floating
   dark pill with 0.64rem uppercase tracked-out labels; at 375px that is close to
   unreadable for the person this product is for. */

import Link from 'next/link'

const navItems = [
  { href: '#meet-kai', label: 'Meet Kai' },
  { href: '#how-it-works', label: 'How it works' },
  { href: '#languages', label: 'Languages' },
]

export function Nav({ hasSessionBanner = false }: { hasSessionBanner?: boolean }) {
  return (
    <header
      className={`sticky z-50 border-b border-[var(--lx-line)] bg-[var(--lx-cream)]/90 backdrop-blur ${
        hasSessionBanner ? 'top-12' : 'top-0'
      }`}
    >
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-5 sm:px-8 lg:px-16">
        <Link
          href="#hero"
          className="lx-focus lx-display inline-flex min-h-11 shrink-0 items-center text-xl font-semibold tracking-[-0.02em] text-[var(--lx-ink)]"
        >
          Keiro
        </Link>

        <nav className="hidden items-center gap-1 md:flex" aria-label="Landing page sections">
          {navItems.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="lx-focus inline-flex min-h-11 items-center rounded-full px-3 font-medium text-[var(--lx-muted)] transition-colors duration-200 hover:bg-[var(--lx-mint)] hover:text-[var(--lx-ink)]"
            >
              {item.label}
            </a>
          ))}
        </nav>

        <Link
          href="/onboarding?fresh=1"
          className="lx-focus inline-flex min-h-11 shrink-0 items-center justify-center rounded-full bg-[var(--lx-ink)] px-5 font-semibold text-[var(--lx-cream)] transition-colors duration-200 hover:bg-[#14301f]"
        >
          Start
        </Link>
      </div>
    </header>
  )
}
