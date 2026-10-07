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
import { useSiteTranslations } from '@/i18n/useSiteTranslations'
import type { TranslateFn } from '@/i18n/useTranslations'

type NavLink = { href: string; label: string; children?: { href: string; label: string }[] }

/* Informational nav. Kept to five items — a nav slot creates an expectation of
   depth, so nothing goes here that can't carry a page of its own. */
const getNavLinks = (t: TranslateFn): NavLink[] => [
  { href: '/how-it-works', label: t('site.howLink') },
  { href: '/languages', label: t('site.nav.languages') },
  {
    href: '/about',
    label: t('site.nav.about'),
    children: [
      { href: '/about', label: t('site.nav.mission') },
      { href: '/meet-kai', label: t('site.nav.meet') },
      { href: '/privacy-safety', label: t('site.nav.privacy') },
      { href: '/accessibility', label: t('site.nav.accessibility') },
    ],
  },
  { href: '/for-clinics', label: t('site.nav.clinics') },
  { href: '/contact', label: t('site.nav.contact') },
]

const LINK_BASE =
  'lx-focus inline-flex min-h-11 items-center rounded-lg px-3 text-[0.9375rem] font-medium tracking-[-0.01em] transition-colors duration-150'

export function Nav() {
  const { locale, t } = useSiteTranslations()
  const NAV_LINKS = getNavLinks(t)
  const CTA = { href: `/onboarding/confirm?lang=${locale}`, label: t('site.start') }
  const pathname = usePathname()
  const [openMenu, setOpenMenu] = useState(false)
  const [openAbout, setOpenAbout] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const aboutRef = useRef<HTMLDivElement>(null)
  const menuButtonRef = useRef<HTMLButtonElement>(null)

  // While the mobile sheet is open the page underneath must not scroll — it
  // used to slide around behind the menu. Locking <html> is what iOS Safari
  // honours (body alone is ignored there).
  useEffect(() => {
    if (!openMenu) return
    const root = document.documentElement
    const previous = root.style.overflow
    root.style.overflow = 'hidden'
    return () => {
      root.style.overflow = previous
    }
  }, [openMenu])

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
        setOpenMenu((wasOpen) => {
          // Give keyboard users their place back, on the control that opened it.
          if (wasOpen) menuButtonRef.current?.focus()
          return false
        })
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
      } top-0`}
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
              <span className="sm:hidden">{t('auth.start').replace(/\s*[→←]\s*$/u, '')}</span>
            </span>
          </Link>

          {/* ── Mobile toggle ── */}
          <button
            ref={menuButtonRef}
            type="button"
            aria-expanded={openMenu}
            aria-controls="mobile-menu"
            aria-label={openMenu ? t('site.nav.close') : t('site.nav.open')}
            onClick={() => setOpenMenu((v) => !v)}
            className="lx-focus inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-[var(--hm-ink)] transition-colors duration-150 hover:bg-[var(--hm-warm)] lg:hidden"
          >
            <span aria-hidden="true" className="grid place-items-center">
              {openMenu ? <IconX size={18} /> : <IconMenu size={19} />}
            </span>
          </button>
        </div>
      </div>

      {/* ── Mobile sheet — big type, one flat list, the CTA within thumb reach ──
          It covers the page below the bar (which stays put) so the menu reads as
          its own surface rather than a dropdown over a still-scrolling page. */}
      {openMenu && (
        <div
          id="mobile-menu"
          className="hm-sheet absolute inset-x-0 top-full flex h-[calc(100dvh-100%)] flex-col border-t border-[var(--hm-line)] bg-white lg:hidden"
        >
          <nav
            aria-label="Main"
            className="mx-auto w-full max-w-[68rem] flex-1 overflow-y-auto overscroll-contain px-5 pt-2 sm:px-8"
          >
            <ul className="flex flex-col">
              {[...NAV_LINKS.filter((l) => !l.children), ...NAV_LINKS[2].children!].map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    aria-current={isActive(link.href) ? 'page' : undefined}
                    className={`lx-focus flex min-h-14 items-center border-b border-[var(--hm-line)] text-[clamp(1.375rem,1.1rem+1.2vw,1.625rem)] font-semibold tracking-[-0.025em] transition-colors duration-150 active:text-[var(--hm-pine)] ${
                      isActive(link.href) ? 'text-[var(--hm-pine)]' : 'text-[var(--hm-ink)]'
                    }`}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
          <div className="mx-auto w-full max-w-[68rem] px-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] pt-4 sm:px-8">
            <Link href={CTA.href} className="lx-focus hm-btn w-full">
              {CTA.label}
            </Link>
          </div>
        </div>
      )}
    </header>
  )
}
