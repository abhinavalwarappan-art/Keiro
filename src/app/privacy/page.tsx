'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export default function PrivacyPage() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col min-h-screen"
      style={{ maxWidth: 640, margin: '0 auto', background: 'white' }}
    >
      <div className="flex items-center gap-3 px-6 py-4 sticky top-0 z-10" style={{ background: 'white', borderBottom: '1px solid #c5edd8' }}>
        <Link href="/" className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: '#f8fffe' }}>
          <ArrowLeft size={16} style={{ color: '#1a3d2b' }} />
        </Link>
        <h1 className="font-bold text-base" style={{ color: '#0f2419' }}>Privacy Policy</h1>
      </div>

      <div className="px-6 py-8 prose prose-sm max-w-none">
        <div className="text-xs mb-8" style={{ color: '#3B6D11' }}>Last updated: January 2026</div>

        {[
          {
            title: 'Our Commitment',
            content: 'Keiro is built for patients who deserve to be understood. We handle your health information with the utmost care. We never sell your data. We never show you ads. We never monetize your medical information.'
          },
          {
            title: 'What We Collect',
            content: 'Phone number or Google account (for authentication only). Medical intake information you share with Kai during your session. Preferred language and accessibility settings. Anonymous usage data to improve the service (no personal identifiers).'
          },
          {
            title: 'How We Use Your Data',
            content: 'Your medical intake information is used exclusively to generate your doctor report. Conversation data is processed by Anthropic\'s Claude API to power Kai. We do not store your raw conversation transcripts beyond what is needed to generate your report. Generated reports are stored securely and associated only with your anonymous user ID.'
          },
          {
            title: 'Third-Party Services',
            content: 'Anthropic (Claude AI) — powers Kai\'s conversations. All data is processed per Anthropic\'s enterprise privacy terms. OpenAI (Whisper) — optional voice transcription only. Supabase — secure database and authentication. None of these providers are permitted to use your data for their own training.'
          },
          {
            title: 'Data Retention',
            content: 'Your reports are stored until you delete them or delete your account. You can delete all your data at any time from Settings → Delete all my data. We will permanently delete all your data within 30 days of account deletion.'
          },
          {
            title: 'Your Rights',
            content: 'Access all your data. Delete your data at any time. Export your reports as PDF. Use Keiro as a guest without creating an account. Guests\' session data is not stored after the session ends.'
          },
          {
            title: 'Security',
            content: 'All data is encrypted in transit (TLS) and at rest. Row-level security ensures you can only access your own data. API keys are never exposed to the client. We follow OWASP security best practices.'
          },
          {
            title: 'Contact',
            content: 'For privacy questions or data requests, contact us at keiro.contact@gmail.com.'
          },
        ].map((section, i) => (
          <div key={i} className="mb-8">
            <h2 className="text-base font-bold mb-3" style={{ color: '#1a3d2b' }}>{section.title}</h2>
            <p className="text-sm leading-relaxed" style={{ color: '#3B6D11' }}>{section.content}</p>
          </div>
        ))}

        <div className="mt-8 pt-6 border-t" style={{ borderColor: '#c5edd8' }}>
          <p className="text-xs text-center" style={{ color: '#3B6D11' }}>
            <Link href="/terms" className="underline">Terms of Service</Link>
            {' · '}
            Keiro · Free forever
          </p>
        </div>
      </div>
    </motion.div>
  )
}
