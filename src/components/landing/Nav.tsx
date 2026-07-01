'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

export default function Nav() {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60)
    window.addEventListener('scroll', onScroll, { passive: true })
    onScroll()
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <nav
      className={`fixed inset-x-0 top-0 z-50 transition-[background-color,border-color,box-shadow] duration-300 ${
        scrolled
          ? 'border-b border-border-subtle bg-surface/90 shadow-xs backdrop-blur-xl'
          : 'border-b border-transparent bg-transparent'
      }`}
    >
      <div className="mx-auto flex h-16 max-w-[1200px] items-center justify-between px-6 md:px-12">

        {/* Wordmark */}
        <Link href="/" className="group flex items-center gap-2.5">
          <div className="flex size-8 items-center justify-center rounded-md bg-brand-ink">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
              <path d="M2 2h4v4L2 12V2z" fill="white" opacity="0.9"/>
              <path d="M7 2h5L7 12H4.5L7 2z" fill="white"/>
            </svg>
          </div>
          <span className="text-base font-semibold tracking-tight text-text-primary">
            Keiro
          </span>
        </Link>

        {/* Links */}
        <div className="hidden items-center gap-7 text-sm font-medium md:flex">
          {[
            { label: 'How it works', id: 'how' },
            { label: 'Languages', id: 'languages' },
            { label: 'Meet Kai', id: 'meet-kai' },
            { label: 'For clinics', id: 'hospitals' },
          ].map(({ label, id }) => (
            <button
              key={id}
              type="button"
              onClick={() => scrollTo(id)}
              className="rounded-sm text-text-secondary transition-colors duration-150 hover:text-text-primary"
            >
              {label}
            </button>
          ))}
        </div>

        {/* CTA */}
        <Link
          href="/onboarding?fresh=1"
          className="inline-flex h-9 items-center gap-2 rounded-md bg-brand-ink px-4 text-sm font-medium text-white shadow-xs transition-colors duration-150 hover:bg-brand-ink-hover"
        >
          Open app →
        </Link>
      </div>
    </nav>
  )
}