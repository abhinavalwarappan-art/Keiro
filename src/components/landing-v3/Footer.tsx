/* Footer — the document's colophon, and the page's one recurring dark surface.

   Navigation and safety information only: the CTA belongs to the page, and
   there is at most one. Dark on purpose: /onboarding renders on a dark
   background, so a paper footer would flash-bang straight into it on
   click-through.

   Server component — no hooks here, or the whole shell flips to client. */

import Link from 'next/link'

export function Footer() {
  return (
    /* Text tiers are the measured on-deep tokens (landing.css): deep-ink
       14.2:1, deep-body 10.4:1, deep-muted 7.9:1 — hierarchy comes from size
       and case, never from dimming text below legibility. */
    <footer className="relative bg-[var(--lx-deep)] px-5 py-14 text-[var(--lx-deep-body)] sm:px-8 md:py-16 lg:px-10">
      <div className="mx-auto max-w-6xl">
        {/* The colophon's specimen line — the product, restated in four
            scripts. Proof, not decoration. */}
        <p
          lang="mul"
          className="lx-native border-b border-[rgba(242,247,241,0.14)] pb-8 text-[clamp(1.05rem,2.4vw,1.5rem)] leading-[1.85] text-[var(--lx-deep-muted)]"
        >
          <span className="text-[var(--lx-deep-ink)]">Tell me what hurts.</span> Cuéntame qué te
          duele. <span dir="rtl">أخبرني بما يؤلمك.</span> बताइए कहाँ दर्द है। 告诉我哪里不舒服。
        </p>

        <div className="grid gap-10 pt-10 md:grid-cols-4">
          <div>
            <div className="lx-display text-xl text-[var(--lx-deep-ink)]">Keiro</div>
            <p className="mt-4 max-w-sm leading-[1.8]">
              Keiro helps you explain what&apos;s wrong in the language you think in, then turns
              that conversation into a summary your doctor can read.
            </p>
          </div>

          {/* Footer IA is flatter than the nav on purpose — every page, in one
              place, without the About grouping. */}
          <nav aria-label="Footer" className="grid gap-8 sm:grid-cols-2 md:col-span-2 md:grid-cols-2">
            <div>
              <h3 className="lx-label border-b border-[rgba(242,247,241,0.14)] pb-2 text-[0.65rem] text-[var(--lx-deep-muted)]">
                Keiro
              </h3>
              <ul className="mt-4 space-y-1">
                {[
                  { href: '/how-it-works', label: 'How it works' },
                  { href: '/languages', label: 'Languages' },
                  { href: '/meet-kai', label: 'Meet Kai' },
                  { href: '/about', label: 'Our mission' },
                ].map((item) => (
                  <li key={item.href}>
                    {/* Keyed on href, not label: "Privacy policy" and "Privacy & safety" both
                        match a /Privacy/i lookup, which made the E2E locator ambiguous. */}
                    <Link
                      href={item.href}
                      data-testid={`footer-link-${item.href.slice(1)}`}
                      className="lx-focus inline-flex min-h-11 items-center transition-colors duration-150 hover:text-[var(--lx-deep-ink)]"
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="lx-label border-b border-[rgba(242,247,241,0.14)] pb-2 text-[0.65rem] text-[var(--lx-deep-muted)]">
                Trust &amp; contact
              </h3>
              <ul className="mt-4 space-y-1">
                {[
                  { href: '/privacy-safety', label: 'Privacy & safety' },
                  { href: '/accessibility', label: 'Accessibility' },
                  { href: '/for-clinics', label: 'For clinics' },
                  { href: '/contact', label: 'Contact' },
                  { href: '/privacy', label: 'Privacy policy' },
                  { href: '/terms', label: 'Terms' },
                ].map((item) => (
                  <li key={item.href}>
                    {/* Keyed on href, not label — see note above. */}
                    <Link
                      href={item.href}
                      data-testid={`footer-link-${item.href.slice(1)}`}
                      className="lx-focus inline-flex min-h-11 items-center transition-colors duration-150 hover:text-[var(--lx-deep-ink)]"
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </nav>

          <div>
            <h3 className="lx-label border-b border-[rgba(242,247,241,0.14)] pb-2 text-[0.65rem] text-[var(--lx-deep-muted)]">
              Please read this
            </h3>
            <p className="mt-4 leading-[1.8]">
              Kai is not a doctor and does not diagnose. If this is an emergency, or you may be
              in danger, call your local emergency number now.
            </p>
            <Link
              href="/emergency"
              className="lx-focus mt-4 inline-flex min-h-11 items-center font-semibold text-[var(--lx-deep-mint)] underline underline-offset-4 hover:text-[var(--lx-deep-ink)]"
            >
              Get emergency help
            </Link>
          </div>
        </div>

        <div className="mt-14 flex flex-col gap-3 border-t border-[rgba(242,247,241,0.14)] pt-6 text-sm md:flex-row md:items-center md:justify-between">
          <div className="lx-mono text-[0.8rem] text-[var(--lx-deep-muted)]">
            © {new Date().getFullYear()} Keiro
          </div>
          <div className="text-[var(--lx-deep-muted)]">
            Built for patients who need to be understood.
          </div>
        </div>
      </div>
    </footer>
  )
}
