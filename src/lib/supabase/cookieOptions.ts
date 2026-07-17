import type { CookieOptionsWithName } from '@supabase/ssr'

/**
 * Explicit attributes for the Supabase auth cookies (sb-*).
 *
 * @supabase/ssr's DEFAULT_COOKIE_OPTIONS never set `Secure`, so without this
 * override the session-token cookies could be sent over plaintext HTTP.
 * `httpOnly` stays false by design: createBrowserClient must read the session
 * cookie for client-side auth — flipping it breaks the SSR auth pattern.
 */
export const AUTH_COOKIE_OPTIONS: CookieOptionsWithName = {
  path: '/',
  sameSite: 'lax',
  // Secure only in production — localhost dev runs over http
  secure: process.env.NODE_ENV === 'production',
}
