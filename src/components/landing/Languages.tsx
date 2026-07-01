'use client'

import { useState } from 'react'
import { motion, useInView } from 'framer-motion'
import { useRef } from 'react'
import { LANGUAGES } from '@/lib/languages'
import { easeOutExpo } from '@/lib/motion'

export default function Languages() {
  const [search, setSearch] = useState('')
  const headerRef = useRef(null)
  const headerInView = useInView(headerRef, { once: true, margin: '-60px' })

  const searchLower = search.toLowerCase()
  const filtered = LANGUAGES.filter(l =>
    l.en.toLowerCase().includes(searchLower) ||
    l.native.toLowerCase().includes(searchLower)
  )

  return (
    <section id="languages" className="relative overflow-hidden bg-canvas px-6 py-28 md:px-12 md:py-36">
      <div className="pointer-events-none absolute inset-0" aria-hidden
        style={{ background: 'radial-gradient(ellipse at 80% 20%, rgb(20 184 166 / 0.06) 0%, transparent 70%)' }}
      />

      <div className="relative mx-auto max-w-[1200px]">

        {/* Label + Headline (animate in) */}
        <div ref={headerRef}>
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={headerInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, ease: easeOutExpo, delay: 0.07 }}
            className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 mb-14"
          >
            <h2 className="font-display leading-[0.95] tracking-[-0.035em] text-text-primary"
              style={{ fontSize: 'clamp(36px,5vw,64px)' }}
            >
              25+ languages.<br />
              <span className="font-light text-text-tertiary">More every month.</span>
            </h2>

            <input
              type="search"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search…"
              className="h-11 w-full flex-shrink-0 rounded-full border border-border-subtle bg-surface px-5 text-sm text-text-primary transition-[border-color,box-shadow] duration-150 placeholder:text-text-placeholder focus:border-brand-strong focus:outline-none focus:ring-2 focus:ring-brand-strong/25 lg:w-56"
              aria-label="Search languages"
            />
          </motion.div>
        </div>

        {/* Language chips — always visible, no inView gate */}
        <div className="flex flex-wrap gap-2.5">
          {filtered.map(lang => (
            <div
              key={lang.code}
              className="flex cursor-default items-center gap-2 rounded-full border border-border-subtle bg-surface px-4 py-2.5 transition-colors duration-150 hover:border-brand-border hover:bg-brand-subtle"
            >
              <span className="text-[17px] leading-none" role="img" aria-label={lang.en}>{lang.flag}</span>
              <span className="text-sm font-medium text-text-primary">{lang.en}</span>
              <span className="text-[13px] text-text-tertiary">{lang.native}</span>
            </div>
          ))}
          {filtered.length === 0 && (
            <p className="text-sm text-text-tertiary">No languages match your search.</p>
          )}
        </div>

      </div>
    </section>
  )
}