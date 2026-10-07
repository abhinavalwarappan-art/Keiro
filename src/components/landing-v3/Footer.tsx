'use client'

/* Footer — the page's one dark surface, and purely functional.

   It used to carry its own "Whenever you're ready / Start talking to Kai" block,
   which sat directly on top of each page's CtaBand and produced two stacked
   invitations at the bottom of every page. The footer is now navigation and
   safety information only; the CTA belongs to the page, and there is at most one.

   Dark on purpose: /onboarding renders on a dark background, so a cream footer
   would flash-bang straight into it on click-through. */

import Link from 'next/link'
import { useSiteTranslations } from '@/i18n/useSiteTranslations'

export function Footer() {
  const { t } = useSiteTranslations()
  return (
    /* Text opacities are measured on --lx-ink, not eyeballed: /75 composites to
       7.5:1 (AAA). The old /50 labels (4.3:1) and /45 bottom row (3.7:1) were
       the site's only recurring AA contrast failures. Hierarchy now comes from
       size and case, not from dimming text below legibility. */
    <footer className="relative bg-[var(--lx-ink)] px-5 py-14 text-white/75 sm:px-8 md:py-16 lg:px-16">
      <div className="mx-auto max-w-6xl">
        <div className="grid gap-10 md:grid-cols-2 md:gap-x-12 lg:grid-cols-4 lg:gap-x-10">
          <div>
            <div className="lx-display text-xl font-semibold text-white">Keiro</div>
            <p className="mt-4 max-w-sm leading-[1.8]">
              {t('site.footer.description')}
            </p>
          </div>

          {/* Footer IA is flatter than the nav on purpose — every page, in one
              place, without the About grouping. */}
          <nav aria-label="Footer" className="grid grid-cols-2 gap-8 md:order-last md:col-span-2 lg:order-none">
            <div>
              <h3 className="lx-label text-xs text-white/75">
                Keiro
              </h3>
              <ul className="mt-5 space-y-1">
                {[
                  { href: '/how-it-works', label: t('site.howLink') },
                  { href: '/languages', label: t('site.nav.languages') },
                  { href: '/meet-kai', label: t('site.nav.meet') },
                  { href: '/about', label: t('site.nav.mission') },
                ].map((item) => (
                  <li key={item.href}>
                    {/* Keyed on href, not label: "Privacy policy" and "Privacy & safety" both
                        match a /Privacy/i lookup, which made the E2E locator ambiguous. */}
                    <Link
                      href={item.href}
                      data-testid={`footer-link-${item.href.slice(1)}`}
                      className="lx-focus inline-flex min-h-11 items-center transition-colors duration-200 hover:text-white"
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="lx-label text-xs text-white/75">
                {t('site.footer.trust')}
              </h3>
              <ul className="mt-5 space-y-1">
                {[
                  { href: '/privacy-safety', label: t('site.nav.privacy') },
                  { href: '/accessibility', label: t('site.nav.accessibility') },
                  { href: '/for-clinics', label: t('site.nav.clinics') },
                  { href: '/contact', label: t('site.nav.contact') },
                  { href: '/privacy', label: t('site.footer.privacyPolicy') },
                  { href: '/terms', label: t('site.footer.terms') },
                ].map((item) => (
                  <li key={item.href}>
                    {/* Keyed on href, not label: "Privacy policy" and "Privacy & safety" both
                        match a /Privacy/i lookup, which made the E2E locator ambiguous. */}
                    <Link
                      href={item.href}
                      data-testid={`footer-link-${item.href.slice(1)}`}
                      className="lx-focus inline-flex min-h-11 items-center transition-colors duration-200 hover:text-white"
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </nav>

          <div>
            <h3 className="lx-label text-xs text-white/75">
              {t('site.footer.notice')}
            </h3>
            <p className="mt-5 leading-[1.8]">
              {t('site.footer.safety')}
            </p>
            <Link
              href="/emergency"
              className="lx-focus mt-4 inline-flex min-h-11 items-center font-semibold text-[var(--lx-sage)] underline underline-offset-4 hover:text-white"
            >
              {t('site.trust.emergencyLink')}
            </Link>
          </div>
        </div>

        <div className="mt-14 flex flex-col gap-3 border-t border-white/10 pt-6 pb-[env(safe-area-inset-bottom)] text-sm text-white/75 md:flex-row md:items-center md:justify-between">
          <div>© {new Date().getFullYear()} Keiro</div>
          <div>{t('site.footer.built')}</div>
        </div>
      </div>
    </footer>
  )
}
