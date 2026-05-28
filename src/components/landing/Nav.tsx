'use client'

import { useEffect, useState } from 'react'

export default function Nav() {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24)
    window.addEventListener('scroll', onScroll, { passive: true })
    onScroll()
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <nav
      className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-white/85 backdrop-blur-xl border-b border-keiro-border'
          : 'bg-transparent'
      }`}
    >
      <div className="h-16 px-4 md:px-8 flex items-center justify-between max-w-[1400px] mx-auto">
        <div className="flex items-center gap-2">
          <div className="w-[30px] h-[30px] rounded-lg bg-keiro-dark flex items-center justify-center">
            <span className="text-white font-medium text-sm">K</span>
          </div>
          <span className="font-medium text-[15px] tracking-tight text-keiro-text">Keiro</span>
          <span className="hidden sm:inline text-[9px] uppercase tracking-widest text-keiro-mid bg-keiro-surface border border-keiro-border rounded-full px-3 py-1 font-medium">
            Free forever
          </span>
        </div>

        <div className="hidden md:flex items-center gap-8 text-[13px] text-keiro-muted">
          <button type="button" onClick={() => scrollTo('how')} className="hover:text-keiro-text transition-colors">
            How it works
          </button>
          <button type="button" onClick={() => scrollTo('languages')} className="hover:text-keiro-text transition-colors">
            Languages
          </button>
          <button type="button" onClick={() => scrollTo('hospitals')} className="hover:text-keiro-text transition-colors">
            For hospitals
          </button>
        </div>

        <a
          href="/onboarding"
          className="bg-keiro-dark text-white rounded-full px-5 py-2.5 text-[13px] font-medium hover:bg-keiro-mid transition-colors"
        >
          Open app →
        </a>
      </div>
    </nav>
  )
}
