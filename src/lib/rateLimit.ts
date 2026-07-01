import { SupabaseClient } from '@supabase/supabase-js'

interface RateLimitConfig {
  limit: number
  windowMs: number
}

// Per-session (user_id) limits. These are the primary rate-limit tier.
// Per-IP limits for shared-WiFi environments live in src/proxy.ts.
const ENDPOINT_CONFIGS: Record<string, RateLimitConfig> = {
  chat:         { limit: 30, windowMs: 2 * 60 * 60 * 1000 }, // 30 messages per 2-hour session
  report:       { limit: 3,  windowMs: 2 * 60 * 60 * 1000 }, // 3 PDF generations per session
  translate:    { limit: 60, windowMs: 60 * 60 * 1000 },      // 60 translations per hour
  report_patch: { limit: 20, windowMs: 60 * 60 * 1000 },      // 20 note saves per hour
}

const DEFAULT_CONFIG: RateLimitConfig = { limit: 20, windowMs: 60 * 1000 }

// Dev/testing escape hatch. Set RATE_LIMIT_DISABLED=true in .env.local to bypass
// all per-user limits. Server-side only — never exposed to the client.
const RATE_LIMIT_DISABLED = process.env.RATE_LIMIT_DISABLED === 'true'

export async function checkRateLimit(
  userId: string,
  endpoint: string,
  supabase: SupabaseClient
): Promise<{ allowed: boolean; remaining: number }> {
  if (RATE_LIMIT_DISABLED) return { allowed: true, remaining: 999 }

  if (!userId || !endpoint) return { allowed: false, remaining: 0 }

  try {
    const { limit, windowMs } = ENDPOINT_CONFIGS[endpoint] ?? DEFAULT_CONFIG
    const { data: allowed, error } = await supabase.rpc('check_and_record_api_call', {
      p_user_id: userId,
      p_endpoint: endpoint,
      p_limit: limit,
      p_window_ms: windowMs,
    })
    if (error) return { allowed: false, remaining: 0 }
    // remaining is not returned by the atomic RPC — callers should not rely on it
    return { allowed: !!allowed, remaining: 0 }
  } catch {
    // Fail closed: deny the request rather than bypass rate limiting on DB failure
    return { allowed: false, remaining: 0 }
  }
}
