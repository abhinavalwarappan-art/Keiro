'use client'

import { useEffect, useState } from 'react'

/** Build a regional flag emoji from an ISO 3166-1 alpha-2 code (e.g. "US" → 🇺🇸). */
export function flagFromRegion(region: string): string {
  return [...region.toUpperCase()]
    .map((char) => String.fromCodePoint(0x1f1e6 - 65 + char.charCodeAt(0)))
    .join('')
}

/**
 * Flag emojis hydrate inconsistently across runtimes (Node vs browser ICU/fonts).
 * Render a fixed-width placeholder during SSR + hydration, then swap to the emoji
 * after mount so server and client text always match.
 */
export function FlagEmoji({
  region,
  className = 'inline-block w-[1.25em] shrink-0 text-center leading-none',
}: {
  region: string
  className?: string
}) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <span aria-hidden className={className}>
      {mounted ? flagFromRegion(region) : '\u00a0'}
    </span>
  )
}