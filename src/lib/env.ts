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

  // Required — Gemini is the sole AI provider (Kai chat, the clinical report, and
  // consult translation all route through it). This is validated here, at module
  // load, rather than at the call site: a deploy without it should fail loudly and
  // immediately instead of serving a site whose core feature 502s. Note the blast
  // radius — this schema is parsed in the root layout, so a missing key takes down
  // every route, including the static and emergency pages that never call Gemini.
  GEMINI_API_KEY: z.string(),

  // Other integrations — validated WHERE THEY'RE USED (their route throws a clear
  // error at request time), never at build, so a missing key degrades one feature
  // rather than the whole deploy.
  //
  // Both directions of voice run on ONE Fish Audio key: /api/transcribe (patient
  // speech in) and /api/tts (Kai's voice out). Optional on purpose, and the two
  // degrade differently — without the key transcription stops and the mic tells
  // the patient to type, while TTS (which also needs the voice id) falls back to
  // browser speech. So a deploy missing these loses voice INPUT outright but only
  // loses voice quality on output.
  FISH_AUDIO_API_KEY: z.string().optional(),
  FISH_AUDIO_VOICE: z.string().optional(), // Kai's voice model id (TTS only)
  GROQ_API_KEY: z.string().optional(), // legacy — transcription moved to Fish Audio
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