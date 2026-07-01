import 'server-only'
import { z } from 'zod'

/**
 * Runtime env validation — imported by the root layout so a misconfigured
 * deploy fails at startup with a clear message instead of at request time.
 *
 * Required: app cannot function without these.
 * Optional: features degrade gracefully (their API routes return errors).
 */
const envSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1),
  ANTHROPIC_API_KEY: z.string().min(1),

  // Optional integrations
  OPENAI_API_KEY: z.string().optional(),
  DEEPL_API_KEY: z.string().optional(),
  GOOGLE_TRANSLATE_KEY: z.string().optional(),
  RESEND_API_KEY: z.string().optional(),
  NEXT_PUBLIC_SENTRY_DSN: z.string().url().optional(),
  NEXT_PUBLIC_POSTHOG_KEY: z.string().optional(),
  NEXT_PUBLIC_POSTHOG_HOST: z.string().url().optional(),
})

const parsed = envSchema.safeParse(process.env)

if (!parsed.success) {
  const missing = parsed.error.issues
    .map(i => `${i.path.join('.')} (${i.message})`)
    .join(', ')
  throw new Error(
    `Invalid or missing environment variables: ${missing}. ` +
    'Compare your .env.local against .env.example.'
  )
}

export const env = parsed.data