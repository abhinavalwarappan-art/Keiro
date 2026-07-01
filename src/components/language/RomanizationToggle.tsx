'use client'

import { motion } from 'framer-motion'
import { Type } from 'lucide-react'

interface RomanizationToggleProps {
  enabled: boolean
  onToggle: () => void
}

const TOOLTIP_TEXT =
  'Shows Kai\u2019s messages using English letters (A\u2013Z) instead of the native script \u2014 helpful if you can\u2019t read characters like \u4e2d\u6587, \u0939\u093f\u0928\u094d\u0926\u0940, or \u0627\u0644\u0639\u0631\u0628\u064a\u0629.'

export default function RomanizationToggle({ enabled, onToggle }: RomanizationToggleProps) {
  return (
    <div className="group relative">
      <button
        onClick={onToggle}
        className={`flex min-h-[44px] items-center gap-2 rounded-md border px-3 py-2 text-xs font-medium transition-colors duration-150 ${
          enabled
            ? 'border-brand-border bg-brand-subtle text-brand-ink'
            : 'border-border-subtle bg-surface text-text-secondary hover:border-border-default hover:bg-sunken'
        }`}
        aria-pressed={enabled}
        aria-label="Toggle romanized script"
        aria-describedby="romanization-tooltip"
      >
        <Type size={13} aria-hidden />
        <span>Romanized</span>
        <div
          className={`relative h-4 w-7 shrink-0 rounded-full transition-colors duration-150 ${
            enabled ? 'bg-brand-ink' : 'bg-border-default'
          }`}
          aria-hidden
        >
          <motion.div
            className="absolute top-0.5 size-3 rounded-full bg-white shadow-xs"
            animate={{ left: enabled ? '14px' : '2px' }}
            transition={{ type: 'spring', stiffness: 500, damping: 30 }}
          />
        </div>
      </button>

      <div
        id="romanization-tooltip"
        role="tooltip"
        className="pointer-events-none absolute bottom-[calc(100%+10px)] left-0 z-50 w-60 origin-bottom-left scale-95 rounded-xl bg-[#1C1917] px-3.5 py-2.5 text-[11px] leading-relaxed text-white opacity-0 shadow-lg transition-[opacity,transform] duration-200 ease-out group-hover:scale-100 group-hover:opacity-100 group-focus-within:scale-100 group-focus-within:opacity-100"
      >
        {TOOLTIP_TEXT}
        <span
          className="absolute -bottom-1.5 left-5 size-3 rotate-45 bg-[#1C1917]"
          aria-hidden
        />
      </div>
    </div>
  )
}