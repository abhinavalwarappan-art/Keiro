import { describe, it, expect, vi } from 'vitest'
import { checkRateLimit } from '@/lib/rateLimit'
import type { SupabaseClient } from '@supabase/supabase-js'

function makeSupabase(rpcResult: boolean, shouldError = false): SupabaseClient {
  const rpc = vi.fn().mockResolvedValue(
    shouldError
      ? { data: null, error: new Error('DB down') }
      : { data: rpcResult, error: null }
  )
  return { rpc } as unknown as SupabaseClient
}

describe('checkRateLimit', () => {
  it('allows requests when under the limit', async () => {
    const supabase = makeSupabase(true)
    const result = await checkRateLimit('user-123', 'chat', supabase)
    expect(result.allowed).toBe(true)
    expect(result.remaining).toBe(0) // RPC returns boolean only; remaining is always 0
  })

  it('blocks requests when at or over the limit', async () => {
    const supabase = makeSupabase(false)
    const result = await checkRateLimit('user-123', 'chat', supabase)
    expect(result.allowed).toBe(false)
    expect(result.remaining).toBe(0)
  })

  it('fails CLOSED when the DB throws — never bypasses rate limiting on error', async () => {
    const supabase = makeSupabase(false, true)
    const result = await checkRateLimit('user-123', 'chat', supabase)
    // Critical: DB failure must not open the gate
    expect(result.allowed).toBe(false)
    expect(result.remaining).toBe(0)
  })

  it('calls rpc with the correct endpoint and config for report', async () => {
    const supabase = makeSupabase(true)
    await checkRateLimit('user-123', 'report', supabase)
    expect(supabase.rpc).toHaveBeenCalledWith('check_and_record_api_call', expect.objectContaining({
      p_user_id: 'user-123',
      p_endpoint: 'report',
      p_limit: 3,
    }))
  })

  it('calls rpc with the correct endpoint and config for report_patch', async () => {
    const supabase = makeSupabase(true)
    await checkRateLimit('user-456', 'report_patch', supabase)
    expect(supabase.rpc).toHaveBeenCalledWith('check_and_record_api_call', expect.objectContaining({
      p_user_id: 'user-456',
      p_endpoint: 'report_patch',
      p_limit: 20,
    }))
  })

  it('uses the strict feedback submission limit', async () => {
    const supabase = makeSupabase(true)
    await checkRateLimit('user-456', 'feedback', supabase)
    expect(supabase.rpc).toHaveBeenCalledWith('check_and_record_api_call', expect.objectContaining({
      p_endpoint: 'feedback',
      p_limit: 5,
      p_window_ms: 15 * 60 * 1000,
    }))
  })

  it('uses DEFAULT_CONFIG for unknown endpoints', async () => {
    const supabase = makeSupabase(true)
    await checkRateLimit('user-123', 'unknown_endpoint', supabase)
    expect(supabase.rpc).toHaveBeenCalledWith('check_and_record_api_call', expect.objectContaining({
      p_limit: 20,
    }))
  })
})
