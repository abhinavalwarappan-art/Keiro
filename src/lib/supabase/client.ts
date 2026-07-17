import { createBrowserClient } from '@supabase/ssr'
import { AUTH_COOKIE_OPTIONS } from './cookieOptions'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY')
}

export function createClient() {
  return createBrowserClient(supabaseUrl as string, supabaseAnonKey as string, {
    cookieOptions: AUTH_COOKIE_OPTIONS,
  })
}