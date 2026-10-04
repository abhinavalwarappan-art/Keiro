'use client'

/* Top navigation.

   Structure follows Serve Robotics' pattern: informational links and the primary
   CTA are two separate things, not one styled list. The CTA ("Start talking to
   Kai") is the patient's door and must never get lost among pages written for
   clinics, press and investors — so it lives outside NAV_LINKS entirely.

   Dropdown is click-to-open, not hover: hover menus are unusable on touch and
   hostile to anyone with a tremor. Escape and outside-click close it. */

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import '@/components/home/home.css'
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

const LINK_BASE =
  'lx-focus inline-flex min-h-11 items-center rounded-lg px-3 text-[0.9375rem] font-medium tracking-[-0.01em] transition-colors duration-150'

export function Nav({ hasSessionBanner = false }: { hasSessionBanner?: boolean }) {
  const pathname = usePathname()
  const [openMenu, setOpenMenu] = useState(false)
  const [openAbout, setOpenAbout] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const aboutRef = useRef<HTMLDivElement>(null)

  // Scroll-edge effect: no hairline while the bar sits over the page top; it
  // fades in only once content actually slides underneath. State flips at a
  // single threshold, so the listener causes no per-frame re-renders.
  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 8)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

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
      className={`sticky z-50 border-b bg-white/75 backdrop-blur-xl backdrop-saturate-150 transition-[border-color] duration-200 [font-family:var(--hm-sans)] ${
        isScrolled ? 'border-[var(--hm-line)]' : 'border-transparent'
      } ${hasSessionBanner ? 'top-12' : 'top-0'}`}
    >
      <div className="mx-auto flex h-14 max-w-[68rem] items-center justify-between gap-6 px-5 sm:px-8 lg:px-16">
        <Link
          href="/"
          className="lx-focus group inline-flex min-h-11 shrink-0 items-center gap-2 text-[1.1875rem] font-semibold tracking-[-0.03em] text-[var(--hm-ink)]"
        >
          <span className="relative block h-8 w-7 shrink-0" aria-hidden="true">
            <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 scale-[0.4]">
              <Kai size="xs" animated={false} />
            </span>
          </span>
          Keiro
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
                  className={`${LINK_BASE} gap-1 hover:text-[var(--hm-ink)] ${
                    isAboutActive || openAbout ? 'text-[var(--hm-ink)]' : 'text-[var(--hm-sub)]'
                  }`}
                >
                  {link.label}
                  <span
                    aria-hidden="true"
                    className={`grid place-items-center transition-transform duration-200 ${openAbout ? 'rotate-180' : ''}`}
                  >
                    <IconChevronDown size={11} />
                  </span>
                </button>

                {openAbout && (
                  <ul className="hm-sheet absolute left-0 top-[calc(100%+0.5rem)] w-60 overflow-hidden rounded-2xl border border-[var(--hm-line)] bg-white p-1.5 shadow-[0_24px_60px_-24px_rgba(12,34,23,0.3)]">
                    {link.children.map((child) => (
                      <li key={child.href}>
                        <Link
                          href={child.href}
                          className={`lx-focus flex min-h-11 items-center rounded-xl px-3 text-[0.9375rem] font-medium transition-colors duration-150 hover:bg-[var(--hm-warm)] ${
                            isActive(child.href) ? 'bg-[var(--hm-warm)] text-[var(--hm-ink)]' : 'text-[var(--hm-text)]'
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
                className={`${LINK_BASE} hover:text-[var(--hm-ink)] ${
                  isActive(link.href) ? 'text-[var(--hm-ink)]' : 'text-[var(--hm-sub)]'
                }`}
              >
                {link.label}
              </Link>
            )
          )}
        </nav>

        <div className="flex items-center gap-1">
          {/* data-testid: the E2E suite's handle on the primary CTA. Its label has already
              changed once and it renders two texts by breakpoint, so matching on text is
              not viable. Keep this stable. The Link keeps a 44px hit area; the visible
              pill inside it is a compact 36px. */}
          <Link
            href={CTA.href}
            data-testid="nav-cta"
            className="lx-focus group inline-flex min-h-11 shrink-0 items-center"
          >
            <span className="inline-flex h-9 items-center rounded-full bg-[var(--hm-pine)] px-4 text-[0.9375rem] font-semibold tracking-[-0.01em] text-white transition-colors duration-150 group-hover:bg-[var(--hm-pine-hover)] group-active:scale-[0.96]">
              <span className="hidden sm:inline">{CTA.label}</span>
              <span className="sm:hidden">Start</span>
            </span>
          </Link>

          {/* ── Mobile toggle ── */}
          <button
            type="button"
            aria-expanded={openMenu}
            aria-controls="mobile-menu"
            aria-label={openMenu ? 'Close menu' : 'Open menu'}
            onClick={() => setOpenMenu((v) => !v)}
            className="lx-focus inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-[var(--hm-ink)] transition-colors duration-150 hover:bg-[var(--hm-warm)] lg:hidden"
          >
            <span aria-hidden="true" className="grid place-items-center">
              {openMenu ? <IconX size={18} /> : <IconMenu size={19} />}
            </span>
          </button>
        </div>
      </div>

      {/* ── Mobile panel — big type, one flat list ── */}
      {openMenu && (
        <div id="mobile-menu" className="hm-sheet border-t border-[var(--hm-line)] bg-white lg:hidden">
          <nav
            aria-label="Main"
            className="mx-auto max-h-[calc(100svh-3.5rem)] max-w-[68rem] overflow-y-auto px-5 pb-8 pt-2 sm:px-8"
            data-lenis-prevent
          >
            <ul className="flex flex-col">
              {[...NAV_LINKS.filter((l) => !l.children), ...NAV_LINKS[2].children!].map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className={`lx-focus flex min-h-14 items-center border-b border-[var(--hm-line)] text-[1.5rem] font-semibold tracking-[-0.025em] ${
                      isActive(link.href) ? 'text-[var(--hm-pine)]' : 'text-[var(--hm-ink)]'
                    }`}
                  >
                    {link.label}
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
