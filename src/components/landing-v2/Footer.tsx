'use client'

import Link from 'next/link'

const COLS: { heading: string; links: { label: string; href: string }[] }[] = [
  {
    heading: 'Product',
    links: [
      { label: 'Talk to Kai', href: '/onboarding?fresh=1' },
      { label: 'How it works', href: '#how' },
      { label: 'Languages', href: '#languages' },
    ],
  },
  {
    heading: 'Urgent',
    links: [
      { label: 'Emergency help', href: '/emergency' },
      { label: 'For clinics', href: '#waitlist' },
    ],
  },
  {
    heading: 'Legal',
    links: [
      { label: 'Privacy', href: '/privacy' },
      { label: 'Terms', href: '/terms' },
    ],
  },
]

export function Footer() {
  return (
    <footer className="relative border-t border-[var(--line)] py-16">
      <div className="mx-auto max-w-[1240px] px-6 md:px-10">
        <div className="grid grid-cols-2 gap-10 md:grid-cols-[1.5fr_repeat(3,1fr)]">
          {/* Wordmark + line */}
          <div className="col-span-2 md:col-span-1">
            <div className="inline-flex items-baseline gap-2">
              <span className="kx-serif text-[1.6rem] leading-none text-[var(--fg)]">Keiro</span>
              <span className="h-1.5 w-1.5 rounded-full bg-[var(--amber)] shadow-[0_0_12px_var(--amber-glow)]" />
            </div>
            <p className="mt-4 max-w-[22rem] text-[0.95rem] leading-relaxed text-[var(--fg-2)]">
              Speak freely. Be understood. Health intelligence in the language you
              think in.
            </p>
          </div>

          {COLS.map((col) => (
            <div key={col.heading}>
              <h3 className="kx-mono text-[0.7rem] uppercase tracking-[0.16em] text-[var(--fg-3)]">
                {col.heading}
              </h3>
              <ul className="mt-4 space-y-2.5">
                {col.links.map((l) => (
                  <li key={l.href}>
                    <Link
                      href={l.href}
                      className="text-[0.95rem] text-[var(--fg-2)] transition-colors hover:text-[var(--fg)]"
                    >
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="kx-rule mt-14" />

        <div className="mt-7 flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
          <p className="kx-mono text-[0.72rem] uppercase tracking-[0.12em] text-[var(--fg-3)]">
            © {new Date().getFullYear()} Keiro — Not a substitute for emergency care
          </p>
          <p className="kx-mono text-[0.72rem] uppercase tracking-[0.12em] text-[var(--fg-3)]">
            Built for the waiting room
          </p>
        </div>
      </div>
    </footer>
  )
}