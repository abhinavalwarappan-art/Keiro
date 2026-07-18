'use client'

/* Top navigation — the ledger's masthead.

   Structure: informational links and the primary CTA are two separate things,
   not one styled list. The CTA ("Start with Kai") is the patient's door and
   must never get lost among pages written for clinics, press and investors —
   so it lives outside NAV_LINKS entirely.

   Dropdown is click-to-open, not hover: hover menus are unusable on touch and
   hostile to anyone with a tremor. Escape and outside-click close it. */

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Kai } from '@/components/kai/Kai'
import { IconChevronDown, IconMenu, IconX } from './icons'

type NavLink = { href: string; label: string; children?: { href: string; label: string }[] }

/* Informational nav. Kept to five items — a nav slot creates an expectation of
   depth, so nothing goes here that can't carry a page of its own. */
const NAV_LINKS: NavLink[] = [
  { href: '/how-it-works', label: 'How it works' },
  { href: '/languages', label: 'Languages' },
  {
    href: '/about',
    label: 'About',
    children: [
      { href: '/about', label: 'Our mission' },
      { href: '/meet-kai', label: 'Meet Kai' },
      { href: '/privacy-safety', label: 'Privacy & safety' },
      { href: '/accessibility', label: 'Accessibility' },
    ],
  },
  { href: '/for-clinics', label: 'For clinics' },
  { href: '/contact', label: 'Contact' },
]

/* The one CTA. Structurally separate from NAV_LINKS on purpose. */
const CTA = { href: '/onboarding?fresh=1', label: 'Start with Kai' }

export function Nav({ hasSessionBanner = false }: { hasSessionBanner?: boolean }) {
  const pathname = usePathname()
  const [openMenu, setOpenMenu] = useState(false)
  const [openAbout, setOpenAbout] = useState(false)
  const aboutRef = useRef<HTMLDivElement>(null)

  // Close everything on navigation.
  useEffect(() => {
    setOpenMenu(false)
    setOpenAbout(false)
  }, [pathname])

  // Escape closes; outside click closes the dropdown.
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        setOpenAbout(false)
        setOpenMenu(false)
      }
    }
    function onClick(e: MouseEvent) {
      if (aboutRef.current && !aboutRef.current.contains(e.target as Node)) {
        setOpenAbout(false)
      }
    }
    document.addEventListener('keydown', onKey)
    document.addEventListener('mousedown', onClick)
    return () => {
      document.removeEventListener('keydown', onKey)
      document.removeEventListener('mousedown', onClick)
    }
  }, [])

  const isActive = (href: string) => pathname === href
  const isAboutActive = NAV_LINKS[2].children!.some((c) => pathname === c.href)

  return (
    <header
      className={`sticky z-50 border-b border-[var(--lx-hairline)] bg-[var(--lx-paper)]/92 backdrop-blur ${
        hasSessionBanner ? 'top-12' : 'top-0'
      }`}
    >
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-5 sm:px-8 lg:px-10">
        {/* Kai is the logo — he's the product's face, so he leads the wordmark.
            His SVG is 56×75 at `xs`, taller than the 64px bar, so he's absolutely
            positioned inside a fixed box and scaled down; otherwise his layout
            box pushes the header height out. */}
        <Link
          href="/"
          className="lx-focus lx-display group inline-flex min-h-11 shrink-0 items-baseline gap-2.5 text-[1.35rem] text-[var(--lx-ink)]"
        >
          <span className="relative block h-9 w-8 shrink-0 self-center" aria-hidden="true">
            <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 scale-[0.46] transition-transform duration-300 group-hover:scale-[0.52]">
              <Kai size="xs" animated={false} />
            </span>
          </span>
          Keiro
          {/* The masthead's one chart annotation: what this thing is, filed. */}
          <span className="lx-label mb-0.5 hidden self-center text-[0.55rem] text-[var(--lx-muted)] xl:inline">
            Intake · 45 languages
          </span>
        </Link>

        {/* ── Desktop ── */}
        <nav className="hidden items-center gap-1 lg:flex" aria-label="Main">
          {NAV_LINKS.map((link) =>
            link.children ? (
              <div key={link.href} ref={aboutRef} className="relative">
                <button
                  type="button"
                  aria-expanded={openAbout}
                  aria-haspopup="true"
                  onClick={() => setOpenAbout((v) => !v)}
                  className={`lx-focus inline-flex min-h-11 items-center gap-1.5 rounded-[4px] px-3 font-medium transition-colors duration-150 hover:bg-[var(--lx-wash)] hover:text-[var(--lx-ink)] ${
                    isAboutActive ? 'text-[var(--lx-ink)]' : 'text-[var(--lx-muted)]'
                  }`}
                >
                  {link.label}
                  <span
                    aria-hidden="true"
                    className={`grid place-items-center transition-transform duration-150 ${openAbout ? 'rotate-180' : ''}`}
                  >
                    <IconChevronDown size={11} />
                  </span>
                </button>

                {openAbout && (
                  <ul className="lx-pop absolute left-0 top-[calc(100%+0.55rem)] w-60 overflow-hidden rounded-[8px] border border-[var(--lx-hairline)] bg-[var(--lx-card)] p-1.5 shadow-[0_24px_60px_-28px_rgba(14,42,28,0.3)]">
                    {link.children.map((child) => (
                      <li key={child.href}>
                        <Link
                          href={child.href}
                          className={`lx-focus flex min-h-11 items-center rounded-[4px] px-3 font-medium transition-colors duration-150 hover:bg-[var(--lx-wash)] ${
                            isActive(child.href)
                              ? 'bg-[var(--lx-wash)] text-[var(--lx-ink)]'
                              : 'text-[var(--lx-body)]'
                          }`}
                        >
                          {child.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ) : (
              <Link
                key={link.href}
                href={link.href}
                className={`lx-focus inline-flex min-h-11 items-center rounded-[4px] px-3 font-medium transition-colors duration-150 hover:bg-[var(--lx-wash)] hover:text-[var(--lx-ink)] ${
                  isActive(link.href) ? 'text-[var(--lx-ink)]' : 'text-[var(--lx-muted)]'
                }`}
              >
                {link.label}
              </Link>
            )
          )}
        </nav>

        <div className="flex items-center gap-2">
          {/* data-testid: the E2E suite's handle on the primary CTA. Its label has already
              changed once ("Open Keiro" → "Start with Kai") and it renders two different
              texts by breakpoint, so matching on text is not viable. Keep this stable. */}
          <Link
            href={CTA.href}
            data-testid="nav-cta"
            className="lx-focus lx-btn lx-btn-primary inline-flex min-h-11 shrink-0 items-center justify-center px-4 font-semibold sm:px-5"
          >
            <span className="hidden sm:inline">{CTA.label}</span>
            <span className="sm:hidden">Talk to Kai</span>
          </Link>

          {/* ── Mobile toggle ── */}
          <button
            type="button"
            aria-expanded={openMenu}
            aria-controls="mobile-menu"
            aria-label={openMenu ? 'Close menu' : 'Open menu'}
            onClick={() => setOpenMenu((v) => !v)}
            className="lx-focus inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-[8px] border border-[var(--lx-hairline)] text-[var(--lx-ink)] lg:hidden"
          >
            <span aria-hidden="true" className="grid place-items-center">
              {openMenu ? <IconX size={16} /> : <IconMenu size={17} />}
            </span>
          </button>
        </div>
      </div>

      {/* ── Mobile panel — About is a flat labelled group, not a nested dropdown ── */}
      {openMenu && (
        <div
          id="mobile-menu"
          className="lx-pop border-t border-[var(--lx-hairline)] bg-[var(--lx-paper)] lg:hidden"
        >
          <nav
            aria-label="Main"
            className="mx-auto max-h-[calc(100svh-4rem)] max-w-6xl overflow-y-auto px-5 py-3 sm:px-8"
            data-lenis-prevent
          >
            <ul className="flex flex-col">
              {NAV_LINKS.filter((l) => !l.children).map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className={`lx-focus flex min-h-12 items-center border-b border-[var(--lx-hairline)] font-medium ${
                      isActive(link.href) ? 'text-[var(--lx-ink)]' : 'text-[var(--lx-body)]'
                    }`}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>

            <p className="lx-label pt-5 text-xs text-[var(--lx-muted)]">About</p>
            <ul className="flex flex-col">
              {NAV_LINKS[2].children!.map((child) => (
                <li key={child.href}>
                  <Link
                    href={child.href}
                    className={`lx-focus flex min-h-12 items-center border-b border-[var(--lx-hairline)] font-medium ${
                      isActive(child.href) ? 'text-[var(--lx-ink)]' : 'text-[var(--lx-body)]'
                    }`}
                  >
                    {child.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      )}
    </header>
  )
}
