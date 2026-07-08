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
  // Required — the app cannot render a single page without these (the Supabase
  // client is created in the root layout / middleware on every request).
  NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1),

  // AI + integrations — validated WHERE THEY'RE USED (their route throws a clear
  // error at request time), never at build. A missing server key must not fail the
  // whole production build, which also takes down the static, intake, and emergency
  // pages that don't touch it. DEEPSEEK_API_KEY powers Kai chat + reports; without
  // it those routes 500 while the rest of the site works. GROQ_API_KEY powers voice.
  DEEPSEEK_API_KEY: z.string().optional(),
  GROQ_API_KEY: z.string().optional(), // voice transcription (Whisper on Groq)
  ANTHROPIC_API_KEY: z.string().optional(), // legacy — no longer used by Kai
  OPENAI_API_KEY: z.string().optional(), // legacy — transcription moved to Groq
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