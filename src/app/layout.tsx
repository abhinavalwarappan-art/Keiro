import type { Metadata, Viewport } from 'next'
import { GeistSans } from 'geist/font/sans'
import './globals.css'
import '@/lib/env' // fail fast on misconfigured deploys

import { SmoothScroll } from '@/components/ui/SmoothScroll'
import { LanguageProvider } from '@/context/LanguageContext'
import { ToastProvider } from '@/components/ui/Toast'
import { ErrorBoundary } from '@/components/ErrorBoundary'
import { CookieConsent } from '@/components/ui/CookieConsent'
import { LangUpdater } from '@/components/ui/LangUpdater'
import { PostHogProvider } from '@/components/PostHogProvider'

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://keiro.space'

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: 'Keiro — Speak freely. Be understood.',
    template: '%s — Keiro',
  },
  description: 'Free medical intake in 25+ languages. Talk to Kai in your language, get a professional report your doctor can read.',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Keiro',
  },
  openGraph: {
    title: 'Keiro — Speak freely. Be understood.',
    description: 'Free medical intake in 25+ languages.',
    url: siteUrl,
    type: 'website',
  },
}

export const viewport: Viewport = {
  // Matches the canvas background so browser chrome blends with the page
  themeColor: '#FAFAF9',
  width: 'device-width',
  initialScale: 1,
  // No maximumScale: pinch-zoom must stay available (WCAG 1.4.4)
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" data-scroll-behavior="smooth" className={GeistSans.variable}>
      <body className="bg-canvas">
        <div className="relative">
        {/* Skip-to-content link — first focusable element on every page (WCAG 2.4.1) */}
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[9999] focus:px-4 focus:py-2 focus:rounded-md focus:font-medium focus:text-sm focus:bg-brand-ink focus:text-white"
        >
          Skip to content
        </a>

        <ErrorBoundary>
          <PostHogProvider>
            <LanguageProvider>
              <LangUpdater />
              <ToastProvider>
                <SmoothScroll />
                {children}
                <CookieConsent />
              </ToastProvider>
            </LanguageProvider>
          </PostHogProvider>
        </ErrorBoundary>
        </div>
      </body>
    </html>
  )
}