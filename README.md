# Keiro — Speak freely. Be understood.

Keiro is a free PWA that helps non-English speaking patients communicate with their doctors. Patients have a conversation with Kai — a friendly AI robot assistant — in their native language. Kai collects symptoms and medical history, then generates a professional English PDF report the patient hands to their doctor.

**Tagline:** "Speak freely. Be understood."

**100% Free. No ads. No paywalls. Ever.**

---

## Quick Start

### 1. Clone and Install

```bash
git clone <your-repo>
cd keiro
npm install
```

### 2. Set Up Environment Variables

Copy `.env.local.example` to `.env.local` and fill in your API keys:

```bash
cp .env.local.example .env.local
```

Required keys:

| Variable | Where to get it |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | [supabase.com](https://supabase.com) → Project Settings → API |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Same as above |
| `ANTHROPIC_API_KEY` | [console.anthropic.com](https://console.anthropic.com) |
| `OPENAI_API_KEY` | [platform.openai.com](https://platform.openai.com) (for Whisper voice) |
| `DEEPL_API_KEY` | [deepl.com/pro-api](https://www.deepl.com/pro-api) (optional) |
| `GOOGLE_TRANSLATE_KEY` | [console.cloud.google.com](https://console.cloud.google.com) (optional, fallback) |
| `RESEND_API_KEY` | [resend.com](https://resend.com) (for hospital contact form) |

### 3. Set Up Supabase

1. Create a new Supabase project at [supabase.com](https://supabase.com)
2. Go to SQL Editor
3. Run the migration file: `supabase/migrations/001_initial.sql`
4. Enable Phone Auth: Authentication → Providers → Phone → Enable
5. (Optional) Enable Google Auth: Authentication → Providers → Google

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## Hospital QR Code Setup

1. Go to Supabase → SQL Editor
2. Insert a hospital record:

```sql
insert into public.hospitals (name, location, qr_slug, contact_email)
values ('Your Hospital Name', 'City, State', 'your-hospital-slug', 'contact@hospital.com');
```

3. Create a QR code pointing to: `https://your-domain.com?hospital=your-hospital-slug`
4. Place QR codes in waiting rooms

---

## Architecture

```
src/
├── app/                    # Next.js App Router pages
│   ├── page.tsx            # Landing page
│   ├── onboarding/         # Language selection
│   ├── auth/               # Phone/anonymous sign in
│   ├── chat/               # Kai conversation
│   ├── report/             # Report view + PDF download
│   ├── emergency/          # SOS screen (zero auth required)
│   ├── history/            # Past visits
│   ├── settings/           # Preferences
│   └── api/                # Backend API routes
├── components/
│   ├── kai/                # Kai robot components
│   ├── chat/               # Chat UI components
│   ├── language/           # Language selector
│   ├── report/             # Report display
│   ├── ui/                 # Shared UI components
│   └── layout/             # Layout wrappers
├── lib/
│   ├── supabase/           # DB clients
│   ├── claude.ts           # Kai system prompt
│   ├── translate.ts        # DeepL + Google routing
│   ├── whisper.ts          # Voice transcription
│   ├── pdf.ts              # PDF generation
│   ├── rateLimit.ts        # Rate limiting
│   └── languages.ts        # 25+ language definitions
└── types/index.ts          # TypeScript interfaces
```

---

## Key Features

- **25+ Languages** — Spanish, Mandarin, Hindi, Arabic, Vietnamese, Korean, Tagalog, and more
- **Voice Input** — Whisper-powered transcription in any language
- **Voice Output** — Web Speech API reads Kai's messages aloud
- **PDF Reports** — Professional branded reports with jsPDF
- **Emergency Screen** — Zero auth, multilingual SOS screen
- **PWA** — Install on any device, works offline for emergency screen
- **Hospital Mode** — `?hospital=slug` QR code parameter
- **Anonymous Mode** — No account required for emergencies
- **Rate Limiting** — 20 API calls per minute per user
- **Security** — Row-level security, input sanitization, security headers

---

## Tech Stack

- **Framework:** Next.js 15 (App Router)
- **Styling:** Tailwind CSS + custom CSS variables
- **Animations:** Framer Motion
- **Database:** Supabase (PostgreSQL + Auth)
- **AI:** Anthropic Claude (Kai conversation + report generation)
- **Voice:** OpenAI Whisper (transcription) + Web Speech API (playback)
- **Translation:** DeepL (primary) + Google Translate (fallback)
- **PDF:** jsPDF
- **Email:** Resend

---

## Deployment (Vercel)

```bash
npm i -g vercel
vercel --prod
```

Add all `.env.local` variables to Vercel's environment variables.

---

## Free Forever

Keiro will always be free for patients. This is not a business. This is a tool built because language barriers in healthcare cost lives.

