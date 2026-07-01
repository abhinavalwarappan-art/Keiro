'use client'

import { useEffect } from 'react'
import { smoothScrollTo } from '@/components/ui/SmoothScroll'

/** Keep fresh visits at the hero; only honor explicit #section hashes. */
export function LandingScrollReset() {
  useEffect(() => {
    if ('scrollRestoration' in history) {
      history.scrollRestoration = 'manual'
    }

    const hash = window.location.hash
    if (!hash) {
      window.scrollTo(0, 0)
      return
    }

    const id = hash.replace(/^#/, '')
    if (!id) {
      window.scrollTo(0, 0)
      return
    }

    // Sanitize: only allow alphanumeric, hyphens, and underscores
    if (!/^[\w-]+$/.test(id)) {
      window.scrollTo(0, 0)
      return
    }

    const target = document.getElementById(id)
    if (target) {
      requestAnimationFrame(() => {
        smoothScrollTo(target)
      })
    }
  }, [])

  return null
}