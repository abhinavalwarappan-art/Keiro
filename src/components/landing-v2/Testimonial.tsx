'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion'

type Quote = {
  text: string
  name: string
  role: string
}

const QUOTES: Quote[] = [
  {
    text:
      'I used to lose the first ten minutes of every visit to a phone interpreter. Now I read the intake before I even walk into the room.',
    name: 'Dr. Lena Ortiz',
    role: 'Family Medicine · Community Health Clinic',
  },
  {
    text:
      'I described my mother\u2019s chest pain in Vietnamese and the doctor understood it exactly. For the first time in years, I wasn\u2019t the one translating for her.',
    name: 'Minh Tran',
    role: 'Caregiver · Houston, TX',
  },
  {
    text:
      'It asked about the rash spreading \u2014 the same follow-up I\u2019d ask. That one question changed how fast we got her seen.',
    name: 'Aisha Rahman',
    role: 'Registered Nurse · Urgent Care',
  },
]

const DURATION = 7000

export function Testimonial() {
  const reduce = useReducedMotion()
  const [index, setIndex] = useState(0)

  useEffect(() => {
    if (reduce) return
    const id = setInterval(() => setIndex((i) => (i + 1) % QUOTES.length), DURATION)
    return () => clearInterval(id)
  }, [reduce])

  const q = QUOTES[index]

  // Reset progress bar animation when index changes via button click
  const handleDotClick = (i: number) => {
    setIndex(i)
  }

  return (
    <section className="relative overflow-hidden border-t border-[var(--line)] py-32 md:py-44">
      {/* faint amber field behind the quote */}
      <div
        className="pointer-events-none absolute left-1/2 top-1/2 h-[420px] w-[420px] -translate-x-1/2 -translate-y-1/2 rounded-full"
        style={{ background: 'radial-gradient(circle, var(--amber-faint), transparent 70%)' }}
      />

      <div className="relative mx-auto max-w-[1000px] px-6 md:px-10">
        <span aria-hidden className="kx-serif block text-[6rem] leading-[0.5] text-[var(--amber)] opacity-40">
          &ldquo;
        </span>

        <div className="relative mt-2 min-h-[clamp(11rem,18vw,15rem)]">
          <AnimatePresence mode="wait">
            <motion.blockquote
              key={index}
              initial={{ opacity: 0, y: 18, filter: 'blur(6px)' }}
              animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              exit={{ opacity: 0, y: -18, filter: 'blur(6px)' }}
              transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            >
              <p className="kx-serif text-[clamp(1.7rem,1rem+2.6vw,3.1rem)] leading-[1.12] text-[var(--fg)]">
                {q.text}
              </p>
              <footer className="mt-9 flex items-center gap-3">
                <span className="h-px w-9 bg-[var(--amber)]" />
                <span>
                  <span className="block text-[0.98rem] text-[var(--fg)]">{q.name}</span>
                  <span className="kx-mono block text-[0.74rem] uppercase tracking-[0.12em] text-[var(--fg-3)]">
                    {q.role}
                  </span>
                </span>
              </footer>
            </motion.blockquote>
          </AnimatePresence>
        </div>

        {/* Progress hairline — advances, then resets. Not dots. */}
        <div className="mt-12 flex gap-2" role="tablist" aria-label="Testimonials">
          {QUOTES.map((_, i) => (
            <button
              key={i}
              onClick={() => handleDotClick(i)}
              className="relative h-px flex-1 overflow-hidden bg-[var(--line-strong)]"
              aria-label={`Show testimonial ${i + 1}`}
              aria-selected={i === index}
              role="tab"
            >
              {i === index && !reduce && (
                <motion.span
                  key={`progress-${index}`}
                  className="absolute inset-y-0 left-0 bg-[var(--amber)]"
                  initial={{ width: '0%' }}
                  animate={{ width: '100%' }}
                  transition={{ duration: DURATION / 1000, ease: 'linear' }}
                />
              )}
              {i === index && reduce && <span className="absolute inset-0 bg-[var(--amber)]" />}
            </button>
          ))}
        </div>
      </div>
    </section>
  )
}