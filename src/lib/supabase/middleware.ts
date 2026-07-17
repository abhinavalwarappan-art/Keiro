import { createServerClient } from '@supabase/ssr'
import { type NextRequest, NextResponse } from 'next/server'
import type { User } from '@supabase/supabase-js'
import { AUTH_COOKIE_OPTIONS } from './cookieOptions'

/**
 * Creates a Supabase client bound to the proxy request/response pair and
 * refreshes the session cookies. Returns the (possibly null) user plus the
 * response that must be returned so refreshed cookies reach the browser.
 */
export async function updateSession(
  request: NextRequest
): Promise<{ user: User | null; response: NextResponse }> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Missing Supabase environment variables: NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are required')
  }

  const response = NextResponse.next({ request })

  const supabase = createServerClient(
    supabaseUrl,
    supabaseAnonKey,
    {
      cookieOptions: AUTH_COOKIE_OPTIONS,
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  if (error && error.message !== 'Auth session missing!') {
    throw new Error(`Failed to retrieve user session: ${error.message}`)
  }

  return { user: error ? null : user, response }
}