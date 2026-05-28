'use client'

import { useState } from 'react'
import { motion, useInView } from 'framer-motion'
import { useRef } from 'react'
import { LANGUAGES } from '@/lib/languages'
import { easeOutExpo } from '@/lib/motion'

export default function Languages() {
  const [search, setSearch] = useState('')
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, amount: 0.1 })

  const filtered = LANGUAGES.filter(
    (l) =>
      l.en.toLowerCase().includes(search.toLowerCase()) ||
      l.native.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <section id="languages" className="bg-keiro-surface py-24 md:py-32 px-4 md:px-8 relative overflow-hidden">
      <div className="absolute -top-20 -right-20 font-display text-[120px] md:text-[200px] text-keiro-border opacity-40 leading-none pointer-events-none select-none">
        Hola·नमस्ते·你好
      </div>
      <div ref={ref} className="max-w-[1400px] mx-auto relative">
        <motion.div
          initial={{ opacity: 0, y: 32 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, ease: easeOutExpo }}
          className="mb-12"
        >
          <div className="text-[11px] uppercase tracking-widest text-keiro-muted mb-4">— Languages</div>
          <h2 className="font-display text-[clamp(40px,7vw,72px)] leading-[0.95] tracking-tight text-[#0a1f12] max-w-[800px]">
            25+ languages.<br />
            <span className="italic text-keiro-mid font-normal">More every month.</span>
          </h2>
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search languages..."
            className="mt-8 w-full max-w-sm h-11 px-5 rounded-full border border-keiro-border bg-white text-sm outline-none focus:border-keiro-mid focus:ring-2 focus:ring-keiro-mid/10 transition"
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, ease: easeOutExpo, delay: 0.15 }}
          className="flex flex-wrap gap-3"
        >
          {filtered.map((lang) => (
            <div
              key={lang.code}
              className="group bg-white border border-keiro-border rounded-full px-5 py-3 flex items-center gap-3 hover:border-keiro-mid hover:bg-[#0a1f12] hover:text-white transition-all duration-300 cursor-default hover:-translate-y-0.5 hover:shadow-[var(--shadow-md)]"
            >
              <span className="text-[20px]">{lang.flag}</span>
              <span className="text-[14px] font-medium">{lang.en}</span>
              <span className="text-[14px] opacity-60 group-hover:opacity-100">{lang.native}</span>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
