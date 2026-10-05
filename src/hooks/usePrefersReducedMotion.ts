'use client'

import { useSyncExternalStore } from 'react'

const QUERY = '(prefers-reduced-motion: reduce)'

function subscribe(onChange: () => void): () => void {
  const mql = window.matchMedia(QUERY)
  mql.addEventListener('change', onChange)
  return () => mql.removeEventListener('change', onChange)
}

/**
 * The reduced-motion preference, safe to branch on in server-rendered markup.
 *
 * Framer's `useReducedMotion()` reads matchMedia during the very first client
 * render, so for anyone with Reduce Motion on, the client's first render
 * disagreed with the server's (initial opacity 0 vs 1, tabindex present vs
 * absent) — a hydration error on every page that branched on it. Here the
 * server AND the hydrating client both see `false`; React then re-renders once
 * with the real value.
 */
export function usePrefersReducedMotion(): boolean {
  return useSyncExternalStore(
    subscribe,
    () => window.matchMedia(QUERY).matches,
    () => false,
  )
}
