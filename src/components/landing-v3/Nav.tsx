/* Top navigation — fixed rounded section tabs + fast app entry. */

import Link from 'next/link'

const navItems = [
  { href: '#hero', label: 'Meet Kai' },
  { href: '#kai', label: 'Why Keiro' },
  { href: '#flow', label: 'Steps' },
  { href: '#languages', label: 'Languages' },
  { href: '#how-kai-works', label: 'How it works' },
]

export function Nav({ hasSessionBanner = false }: { hasSessionBanner?: boolean }) {
  const topClass = hasSessionBanner ? 'top-14' : 'top-4'

  return (
    <header className={`fixed inset-x-0 z-50 px-3 sm:px-5 lg:px-8 ${topClass}`}>
      <div className="mx-auto flex w-fit max-w-[calc(100vw-1.5rem)] items-center gap-1 rounded-full border border-white/10 bg-black/55 p-1.5 shadow-[0_18px_60px_rgba(0,0,0,0.35)] backdrop-blur-xl">
        <Link
          href="#hero"
          className="font-display shrink-0 cursor-pointer rounded-full px-3 py-2 text-lg font-bold tracking-[-0.03em] text-white transition-colors duration-200 hover:text-[var(--kx-accent)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--kx-accent)]"
        >
          Keiro <span className="text-[var(--kx-accent)]">●</span>
        </Link>
        <nav
          className="flex min-w-0 items-center justify-center gap-0 overflow-x-auto rounded-full text-[0.64rem] font-semibold uppercase tracking-[0.1em] text-white/60 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          aria-label="Landing page sections"
        >
          {navItems.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="shrink-0 cursor-pointer rounded-full px-2 py-2.5 transition-colors duration-200 hover:bg-white/[0.07] hover:text-[var(--kx-accent)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--kx-accent)]"
            >
              {item.label}
            </a>
          ))}
        </nav>
        <Link
          href="/onboarding?fresh=1"
          aria-label="Open Keiro"
          className="lx-shimmer-host lx-glow relative shrink-0 overflow-hidden rounded-full bg-[var(--kx-accent)] px-4 py-2.5 text-xs font-bold uppercase tracking-[0.14em] text-[#03110d] transition-transform duration-200 hover:-translate-y-0.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
        >
          <span className="lx-shimmer" aria-hidden />
          <span className="relative z-10 hidden sm:inline">Open Keiro</span>
          <span className="relative z-10 sm:hidden">Open</span>
        </Link>
      </div>
    </header>
  )
}