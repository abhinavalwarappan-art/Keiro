'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

const LAST_UPDATED = 'June 10, 2026'

export default function PrivacyPage() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col min-h-screen"
      style={{ maxWidth: 640, margin: '0 auto', background: 'white' }}
    >
      <div
        className="flex items-center gap-3 px-6 py-4 sticky top-0 z-10"
        style={{ background: 'white', borderBottom: '1px solid var(--border-subtle)' }}
      >
        <Link
          href="/"
          className="w-8 h-8 rounded-lg flex items-center justify-center"
          style={{ background: 'var(--brand-subtle)' }}
          aria-label="Back to home"
        >
          <ArrowLeft size={16} style={{ color: 'var(--brand-ink)' }} aria-hidden />
        </Link>
        <h1 className="font-bold text-base" style={{ color: 'var(--text-primary)' }}>
          Privacy Policy
        </h1>
      </div>

      <div className="px-6 py-8 max-w-none">
        <p className="text-xs mb-8" style={{ color: 'var(--text-secondary)' }}>
          Last updated: {LAST_UPDATED}
        </p>

        <Section title="The short version">
          <p>
            <strong>Keiro never keeps your chat with Kai.</strong> Conversations are processed in
            the moment and are gone when your session ends — we cannot read them back, retrieve
            them, or share them with anyone.
          </p>
          <p>
            If you use Keiro <strong>as a guest</strong>, we store nothing about you at all. If you{' '}
            <strong>sign in</strong> (phone, Google, or email), we store only your sign-in details,
            your language preferences, and the medical reports Kai prepares for you — so you can
            find them again. You can download or delete everything, any time, in Settings.
          </p>
        </Section>

        <Section title="Your conversations are never stored">
          <p>
            Everything you type or say to Kai stays in your browser while you use the app. Messages
            are sent to our AI provider to generate Kai&apos;s reply and are not written to our
            database — not for guests, not for signed-in users. We have no way to look up what you
            told Kai.
          </p>
        </Section>

        <Section title="What we store if you sign in">
          <ul>
            <li>
              <strong>Account details</strong> — the phone number, email address, or Google account
              ID you signed in with, and the name you gave us (if any).
            </li>
            <li>
              <strong>Preferences</strong> — your chosen language, voice, and display settings.
            </li>
            <li>
              <strong>Your reports</strong> — the structured medical summary Kai prepares (symptoms,
              medications, and similar details you chose to include). This is health information,
              and we treat it that way: it is stored encrypted, visible only to your account, never
              shared, and deleted the moment you ask.
            </li>
            <li>
              <strong>Usage counters</strong> — how many requests your account made recently, used
              only to prevent abuse.
            </li>
          </ul>
          <p>
            We process this health information only with your explicit consent, which you give when
            you start a conversation. You can withdraw it at any time by deleting your data in
            Settings — deletion is immediate and permanent.
          </p>
        </Section>

        <Section title="Guests — anonymous session tokens">
          <p>
            When you use Keiro without signing in, we create a random token (like a temporary ID
            number) so the app works correctly during your visit. It has no name, no birthday, no
            phone number attached, and it cannot be used to identify you. Your report exists only in
            your browser tab and disappears when you close it — if you download the PDF, that file
            stays on your own device.
          </p>
        </Section>

        <Section title="Cookies & analytics — your choice">
          <p>
            Keiro uses one essential session cookie that makes sign-in work. It cannot be turned
            off because the app would not function without it.
          </p>
          <p>
            If — and only if — you tap &quot;Allow analytics&quot; in the cookie banner, we also
            collect anonymous usage events through PostHog: which pages were visited, which language
            was chosen, and how many messages were sent. <strong>Never the content of anything you
            typed or said.</strong> Session recording is disabled. If you decline, analytics stays
            completely off, and you can change your mind any time in Settings.
          </p>
          <p>
            <strong>We do not use advertising cookies. We do not sell your data. We do not follow
            you around the internet.</strong>
          </p>
        </Section>

        <Section title="Keiro is not a medical service">
          <p>
            Kai is an AI assistant that helps you describe your symptoms in your own language. Kai
            is <strong>not a doctor</strong>. Keiro does not diagnose conditions, recommend
            treatments, or replace professional medical care. Always talk to a real healthcare
            provider about your health.
          </p>
        </Section>

        <Section title="The AI may make mistakes">
          <p>
            Kai is powered by an AI system. AI can misunderstand things or make errors. The report
            it creates is a starting point for your doctor — not a final medical opinion. Your
            doctor will ask you their own questions and make their own decisions.
          </p>
        </Section>

        <Section title="HIPAA notice">
          <p>
            Because Keiro does not store health information on its servers, it does not fall under
            HIPAA (the US health privacy law). If your clinic uses Keiro, the clinic is responsible
            for its own HIPAA obligations.
          </p>
        </Section>

        <Section title="How long we keep things">
          <ul>
            <li>Chat messages — never stored.</li>
            <li>Guest sessions — expire automatically after 2 hours.</li>
            <li>Reports and account details — kept until you delete them or your account.</li>
            <li>Anti-abuse usage counters — deleted on a rolling basis after a few days.</li>
            <li>Error logs (Sentry) — kept 90 days, never contain message content.</li>
          </ul>
        </Section>

        <Section title="For users in the European Union (GDPR)">
          <p>
            Health information is &quot;special category&quot; data under GDPR Article 9. We process
            it only on the basis of your explicit consent, given before your first conversation, and
            you can withdraw that consent at any moment. Your rights:
          </p>
          <ul>
            <li>Right to access — see everything we hold (Settings → Download my data).</li>
            <li>Right to portability — the download is machine-readable JSON plus your PDF reports.</li>
            <li>Right to deletion — Settings → Delete all my data removes everything immediately.</li>
            <li>Right to correction — you may ask us to correct inaccurate data.</li>
            <li>Right to object / withdraw consent — stop using the app, decline analytics, or delete your data.</li>
            <li>Right to complain — you may lodge a complaint with your local supervisory authority.</li>
          </ul>
          <p>
            For anything you cannot do in Settings, contact us and we will respond within 30 days.
          </p>
        </Section>

        <Section title="For users in California (CCPA)">
          <p>
            If you are a California resident, you have rights under CCPA. We do not sell your
            personal information. We do not share it for cross-context advertising. Because we
            collect almost no personal data, there is very little we hold about you. You may contact
            us to ask what we have and request deletion at any time.
          </p>
        </Section>

        <Section title="For children (COPPA)">
          <p>
            Keiro is not designed for children under 13. We do not knowingly collect information
            from children under 13. If a child needs help at a medical appointment, a parent,
            guardian, or clinic staff member should use the app on their behalf.
          </p>
          <p>
            If you believe a child under 13 has provided us information, please contact us at{' '}
            <a href="mailto:privacy@keiro.app" style={{ color: 'var(--brand-ink)' }}>
              privacy@keiro.app
            </a>{' '}
            and we will delete it immediately.
          </p>
        </Section>

        <Section title="Third-party services we use">
          <ul>
            <li>
              <strong>DeepSeek</strong> — processes your messages during your session to create
              Kai&apos;s responses and your report. DeepSeek is operated from China and processes
              your messages on servers located there; under its privacy policy it may retain inputs
              and use them to improve its services and models.
            </li>
            <li>
              <strong>Groq (Whisper)</strong> — if you use voice input, your audio clip is
              transcribed and immediately discarded.
            </li>
            <li>
              <strong>DeepL / Google Translate</strong> — translate interface text and, where
              needed, parts of your report so your doctor can read it.
            </li>
            <li>
              <strong>Supabase</strong> — runs our database and sign-in. Stores account details and
              reports for signed-in users (encrypted, row-level security).
            </li>
            <li>
              <strong>Sentry</strong> — records technical errors (like app crashes) so we can fix
              bugs. Error reports never include anything you typed or said to Kai.
            </li>
            <li>
              <strong>PostHog</strong> — anonymous usage analytics, only if you opted in via the
              cookie banner.
            </li>
            <li>
              <strong>Resend</strong> — delivers contact-form emails if you write to us.
            </li>
          </ul>
          <p>
            None of these providers may use your information for their own advertising or
            commercial purposes.
          </p>
        </Section>

        <Section title="Security">
          <p>
            All connections to Keiro use encryption (HTTPS / TLS). Data at rest is also encrypted.
            Our database uses row-level security so each session can only access its own data.
          </p>
        </Section>

        <Section title="Contact us about privacy">
          <p>
            If you have any question about this policy, or want to exercise any of your rights,
            email us at:{' '}
            <a href="mailto:privacy@keiro.app" style={{ color: 'var(--brand-ink)' }}>
              privacy@keiro.app
            </a>
            . We will reply within 10 business days.
          </p>
        </Section>

        <div className="mt-8 pt-6" style={{ borderTop: '1px solid var(--border-subtle)' }}>
          <p className="text-xs text-center" style={{ color: 'var(--text-secondary)' }}>
            <Link href="/terms" className="underline">
              Terms of Use
            </Link>
            {' · '}Keiro · Free forever
          </p>
        </div>
      </div>
    </motion.div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-8">
      <h2 className="text-base font-bold mb-3" style={{ color: 'var(--brand-ink)' }}>
        {title}
      </h2>
      <div className="text-sm leading-relaxed space-y-3" style={{ color: 'var(--text-primary)' }}>
        {children}
      </div>
    </div>
  )
}