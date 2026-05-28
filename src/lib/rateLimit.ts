import { SupabaseClient } from '@supabase/supabase-js'

export async function checkRateLimit(
  userId: string,
  endpoint: string,
  supabase: SupabaseClient
): Promise<{ allowed: boolean; remaining: number }> {
  const windowStart = new Date(Date.now() - 60 * 1000).toISOString()

  const { count } = await supabase
    .from('api_calls')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('endpoint', endpoint)
    .gte('created_at', windowStart)

  const limit = 20
  const allowed = (count || 0) < limit

  if (allowed) {
    await supabase
      .from('api_calls')
      .insert({ user_id: userId, endpoint })
  }

  return { allowed, remaining: Math.max(0, limit - (count || 0)) }
}
