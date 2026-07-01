'use client'

import { useEffect, useMemo, useState } from 'react'
import type { User } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase/client'

interface UseUserResult {
  user: User | null
  isLoading: boolean
  isAnonymous: boolean
}

/**
 * Reactive auth state. Subscribes to Supabase auth changes so the UI
 * updates immediately on sign-in/sign-out without a refresh.
 */
export function useUser(): UseUserResult {
  const supabase = useMemo(() => createClient(), [])
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    let cancelled = false

    supabase.auth.getUser().then(({ data, error }) => {
      if (cancelled) return
      if (error) {
        setUser(null)
      } else {
        setUser(data.user ?? null)
      }
      setIsLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (cancelled) return
      setUser(session?.user ?? null)
      setIsLoading(false)
    })

    return () => {
      cancelled = true
      subscription.unsubscribe()
    }
  }, [supabase])

  return { user, isLoading, isAnonymous: user?.is_anonymous ?? false }
}