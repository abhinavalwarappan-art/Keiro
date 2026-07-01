/* Footer — copy kept exactly. */

import Link from 'next/link'

export function Footer() {
  return (
    <footer className="relative overflow-hidden border-t border-white/[0.06] px-6 py-16 md:px-10 lg:px-16">
      <div
        className="absolute bottom-0 left-1/2 h-[520px] w-[760px] -translate-x-1/2 translate-y-1/2 rounded-full"
        style={{ background: 'radial-gradient(circle, rgba(0,200,150,0.11) 0%, transparent 70%)' }}
        aria-hidden
      />
      <div className="relative z-[1] mx-auto max-w-7xl">
        <div className="grid gap-10 lg:grid-cols-[1.25fr_0.75fr_0.75fr_0.75fr]">
          <div>
            <div className="font-display text-2xl font-bold tracking-[-0.03em] text-white">
              Keiro <span className="text-[var(--kx-accent)]">●</span>
            </div>
            <p className="mt-5 max-w-md text-sm leading-[1.8] text-white/55">
              Keiro helps you explain symptoms in the language you think in, then turns the conversation into a clear
              summary your doctor can read.
            </p>
          </div>

          <div>
            <h3 className="text-xs font-semibold uppercase tracking-[0.18em] text-white/35">For your visit</h3>
            <ul className="mt-5 space-y-3 text-sm text-white/55">
              <li>Speak naturally in your language</li>
              <li>Answer Kai&apos;s simple follow-up questions</li>
              <li>Bring a clear summary to the doctor</li>
              <li>No account needed to start</li>
            </ul>
          </div>

          <div>
            <h3 className="text-xs font-semibold uppercase tracking-[0.18em] text-white/35">Explore</h3>
            <nav className="mt-5 flex flex-col gap-3 text-sm text-white/55">
              <a href="#flow" className="cursor-pointer transition-colors duration-200 hover:text-[var(--kx-accent)]">
                Steps
              </a>
              <a href="#languages" className="cursor-pointer transition-colors duration-200 hover:text-[var(--kx-accent)]">
                Languages
              </a>
              <Link href="/privacy" className="cursor-pointer transition-colors duration-200 hover:text-[var(--kx-accent)]">
                Privacy
              </Link>
              <Link href="/terms" className="cursor-pointer transition-colors duration-200 hover:text-[var(--kx-accent)]">
                Terms
              </Link>
            </nav>
          </div>

          <div>
            <h3 className="text-xs font-semibold uppercase tracking-[0.18em] text-white/35">Important</h3>
            <p className="mt-5 text-sm leading-[1.8] text-white/55">
              Kai is an AI assistant, not a doctor. If this is an emergency or you may be in danger, call local emergency
              services right away.
            </p>
            <p className="mt-4 text-sm leading-[1.8] text-white/55">
              Free for patients. No credit card. No forms before you can start.
            </p>
          </div>
        </div>

        <div className="mt-14 flex flex-col gap-4 border-t border-white/[0.06] pt-6 text-xs text-white/35 md:flex-row md:items-center md:justify-between">
          <div>© {new Date().getFullYear()} Keiro. All rights reserved.</div>
          <div>Built for patients who need to be understood.</div>
        </div>
      </div>
    </footer>
  )
}