/* Footer — the page's one dark surface.

   This is deliberate: /onboarding renders on a dark starry background, so a
   cream-white footer would flash-bang straight into it on click-through. Landing
   the page on --lx-ink first makes that handoff read as a step down rather than
   a seam. (The real fix is to reconcile the two surfaces, but onboarding/ is out
   of scope here.) */

import Link from 'next/link'
import { Kai } from '@/components/kai/Kai'

export function Footer() {
  return (
    <footer className="relative bg-[var(--lx-ink)] px-5 py-16 text-white/70 sm:px-8 md:py-20 lg:px-16">
      <div className="mx-auto max-w-6xl">
        {/* Final invitation */}
        <div className="flex flex-col items-center gap-6 border-b border-white/10 pb-14 text-center">
          <Kai size="sm" state="waving" />
          <h2 className="lx-display max-w-2xl text-[clamp(1.6rem,4vw,2.4rem)] font-semibold leading-[1.2] text-white">
            Whenever you&apos;re ready. There&apos;s no rush.
          </h2>
          <Link
            href="/onboarding?fresh=1"
            className="lx-focus inline-flex min-h-12 items-center justify-center rounded-full bg-[var(--lx-sage)] px-7 font-semibold text-[var(--lx-ink)] transition-colors duration-200 hover:bg-white"
          >
            Start talking to Kai
          </Link>
          <p className="text-sm text-white/60">Free. No account. Nothing to fill in first.</p>
        </div>

        <div className="grid gap-10 pt-14 md:grid-cols-4">
          <div>
            <div className="lx-display text-xl font-semibold text-white">Keiro</div>
            <p className="mt-4 max-w-sm leading-[1.8]">
              Keiro helps you explain what&apos;s wrong in the language you think in, then turns
              that conversation into a summary your doctor can read.
            </p>
          </div>

          {/* Footer IA is flatter than the nav on purpose — every page, in one
              place, without the About grouping. */}
          <nav aria-label="Footer" className="grid gap-8 sm:grid-cols-2 md:col-span-2 md:grid-cols-2">
            <div>
              <h3 className="text-sm font-semibold uppercase tracking-[0.14em] text-white/50">
                Keiro
              </h3>
              <ul className="mt-5 space-y-1">
                {[
                  { href: '/how-it-works', label: 'How it works' },
                  { href: '/languages', label: 'Languages' },
                  { href: '/meet-kai', label: 'Meet Kai' },
                  { href: '/about', label: 'Our mission' },
                ].map((item) => (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className="lx-focus inline-flex min-h-11 items-center transition-colors duration-200 hover:text-white"
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="text-sm font-semibold uppercase tracking-[0.14em] text-white/50">
                Trust &amp; contact
              </h3>
              <ul className="mt-5 space-y-1">
                {[
                  { href: '/privacy-safety', label: 'Privacy & safety' },
                  { href: '/accessibility', label: 'Accessibility' },
                  { href: '/for-clinics', label: 'For clinics' },
                  { href: '/contact', label: 'Contact' },
                  { href: '/privacy', label: 'Privacy policy' },
                  { href: '/terms', label: 'Terms' },
                ].map((item) => (
                  <li key={item.href}>
                    <Link
                      href={item.href}
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
            <h3 className="text-sm font-semibold uppercase tracking-[0.14em] text-white/50">
              Please read this
            </h3>
            <p className="mt-5 leading-[1.8]">
              Kai is not a doctor and does not diagnose. If this is an emergency, or you may be
              in danger, call your local emergency number now.
            </p>
            <Link
              href="/emergency"
              className="lx-focus mt-4 inline-flex min-h-11 items-center font-semibold text-[var(--lx-sage)] underline underline-offset-4 hover:text-white"
            >
              Get emergency help
            </Link>
          </div>
        </div>

        <div className="mt-14 flex flex-col gap-3 border-t border-white/10 pt-6 text-sm text-white/45 md:flex-row md:items-center md:justify-between">
          <div>© {new Date().getFullYear()} Keiro</div>
          <div>Built for patients who need to be understood.</div>
        </div>
      </div>
    </footer>
  )
}
