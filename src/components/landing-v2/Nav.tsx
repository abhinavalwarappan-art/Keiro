'use client'

import { useEffect, useState } from 'react'
import { SpringButton } from './SpringButton'

const LINKS = [
  { label: 'How it works', id: 'how' },
  { label: 'Languages', id: 'languages' },
]

export function Nav() {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40)
    window.addEventListener('scroll', onScroll, { passive: true })
    onScroll()
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <nav
      className={`fixed inset-x-0 top-0 z-50 transition-[background-color,border-color,backdrop-filter] duration-300 ${
        scrolled
          ? 'border-b border-[var(--line)] bg-[rgba(10,11,15,0.72)] backdrop-blur-xl'
          : 'border-b border-transparent bg-transparent'
      }`}
    >
      <div className="mx-auto flex h-16 max-w-[1240px] items-center justify-between px-6 md:px-10">
        {/* Wordmark — serif K, small mono tag */}
        <a
          href="#top"
          className="group inline-flex items-baseline gap-2"
          onClick={(e) => {
            e.preventDefault()
            window.scrollTo({ top: 0, behavior: 'smooth' })
          }}
        >
          <span className="kx-serif text-[1.65rem] leading-none text-[var(--fg)]">Keiro</span>
          <span
            aria-hidden
            className="h-1.5 w-1.5 translate-y-[-1px] rounded-full bg-[var(--amber)] shadow-[0_0_12px_var(--amber-glow)] transition-transform duration-300 group-hover:scale-125"
          />
        </a>

        <div className="hidden items-center gap-8 md:flex">
          {LINKS.map((l) => (
            <button
              key={l.id}
              type="button"
              onClick={() => scrollTo(l.id)}
              className="kx-mono text-[0.78rem] uppercase tracking-[0.12em] text-[var(--fg-2)] transition-colors hover:text-[var(--fg)]"
            >
              {l.label}
            </button>
          ))}
        </div>

        <SpringButton href="#waitlist" variant="primary" className="!px-5 !py-2.5 !text-[0.85rem]">
          Get early access
        </SpringButton>
      </div>
    </nav>
  )
}