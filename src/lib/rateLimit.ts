import { SupabaseClient } from '@supabase/supabase-js'
import { logger } from '@/lib/logger'

interface RateLimitConfig {
  limit: number
  windowMs: number
}

// Per-session (user_id) limits. These are the primary rate-limit tier.
// Per-IP limits for shared-WiFi environments live in src/proxy.ts.
const ENDPOINT_CONFIGS: Record<string, RateLimitConfig> = {
  chat:         { limit: 30, windowMs: 2 * 60 * 60 * 1000 }, // 30 messages per 2-hour session
  report:       { limit: 3,  windowMs: 2 * 60 * 60 * 1000 }, // 3 report generations per session
  report_pdf:   { limit: 30, windowMs: 60 * 60 * 1000 },      // 30 PDF renders per hour (download/open/print, own report)
  translate:    { limit: 60, windowMs: 60 * 60 * 1000 },      // 60 translations per hour
  report_patch: { limit: 20, windowMs: 60 * 60 * 1000 },      // 20 note saves per hour
  transcribe:   { limit: 60, windowMs: 60 * 60 * 1000 },      // 60 Whisper transcriptions per hour (Groq API call)
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

// Per-IP limits — a durable, cross-instance safety net keyed on a hashed IP.
// A user can mint fresh anonymous accounts to reset the per-user tier above, but
// not change their IP, so this backstops that bypass. Ceilings are higher than the
// per-user limits because one IP (shared WiFi, clinic, NAT) may host several people.
const IP_ENDPOINT_CONFIGS: Record<string, RateLimitConfig> = {
  chat:         { limit: 200, windowMs: 60 * 60 * 1000 }, // 200 chat requests per IP/hour
  report:       { limit: 20,  windowMs: 60 * 60 * 1000 }, // 20 reports per IP/hour
  report_patch: { limit: 60,  windowMs: 60 * 60 * 1000 }, // 60 note saves per IP/hour
  translate:    { limit: 500, windowMs: 60 * 60 * 1000 }, // 500 translations per IP/hour
  transcribe:   { limit: 400, windowMs: 60 * 60 * 1000 }, // 400 transcriptions per IP/hour
  // Mic diagnostics are client-fired and unauthenticated, so this is the only
  // tier guarding the table. Generous enough for a genuinely broken device
  // (a patient may retry many times), low enough to bound flooding.
  mic_diagnostics: { limit: 60, windowMs: 60 * 60 * 1000 }, // 60 mic reports per IP/hour
}

const IP_DEFAULT_CONFIG: RateLimitConfig = { limit: 100, windowMs: 60 * 60 * 1000 }

/**
 * Durable per-IP rate limit, backed by the atomic check_and_record_ip_call RPC
 * (migration 007). Secondary to checkRateLimit (per user): it fails OPEN, so a
 * missing migration or a transient DB issue on the IP path can't lock users out —
 * the per-user tier stays the fail-closed primary guard.
 */
export async function checkIpRateLimit(
  ipHash: string,
  endpoint: string,
  supabase: SupabaseClient
): Promise<{ allowed: boolean }> {
  if (RATE_LIMIT_DISABLED) return { allowed: true }
  if (!ipHash || !endpoint) return { allowed: true }

  try {
    const { limit, windowMs } = IP_ENDPOINT_CONFIGS[endpoint] ?? IP_DEFAULT_CONFIG
    const { data: allowed, error } = await supabase.rpc('check_and_record_ip_call', {
      p_ip_hash: ipHash,
      p_endpoint: endpoint,
      p_limit: limit,
      p_window_ms: windowMs,
    })
    if (error) {
      // Fail open (secondary tier). Log so a missing 007 migration is visible.
      logger.warn('ip_rate_limit_rpc_error', endpoint)
      return { allowed: true }
    }
    return { allowed: !!allowed }
  } catch {
    return { allowed: true }
  }
}
