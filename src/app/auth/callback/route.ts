import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/chat'

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
      const path = (next.startsWith('/') && !next.startsWith('//') && !next.includes('\\')) ? next : '/chat'
      return NextResponse.redirect(`${origin}${path}`)
    }
  }

  return NextResponse.redirect(`${origin}/auth?error=oauth_failed`)
}