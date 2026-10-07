import type { Metadata, Viewport } from 'next'
import { cookies, headers } from 'next/headers'
import { normalizeLocale, getLanguageByCode } from '@/lib/languages'
import { getDictionary } from '@/i18n/dictionaries'
import { geistSans } from '@/lib/geistFont'
import './globals.css'
import '@/lib/env' // fail fast on misconfigured deploys

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
    default: 'Keiro — Explain how you feel in your language',
    template: '%s — Keiro',
  },
  description: 'Tell Kai how you feel in your language. Keiro creates a clear English summary you can show your healthcare provider. Free in 45 languages.',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Keiro',
  },
  openGraph: {
    title: 'Keiro — Explain how you feel in your language',
    description: 'Speak to Kai in your language and get an English summary for your healthcare provider.',
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
  // The on-screen keyboard shrinks the layout (Android Chrome) instead of
  // sliding over it, so the chat composer stays above the keyboard with the
  // conversation still visible. iOS ignores this and pans to the field itself.
  interactiveWidget: 'resizes-content',
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const locale = normalizeLocale((await headers()).get('x-keiro-locale'))
    ?? normalizeLocale((await cookies()).get('keiro-locale')?.value)
    ?? 'en-US'
  const dictionary = await getDictionary(locale)
  const dir = getLanguageByCode(locale)?.rtl ? 'rtl' : 'ltr'
  return (
    <html lang={locale} dir={dir} data-scroll-behavior="smooth" className={geistSans.variable}>
      <body className="bg-canvas">
        <div className="relative">
        {/* Skip-to-content link — first focusable element on every page (WCAG 2.4.1) */}
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[9999] focus:px-4 focus:py-2 focus:rounded-md focus:font-medium focus:text-sm focus:bg-brand-ink focus:text-white"
        >
          {dictionary['site.skip'] ?? 'Skip to content'}
        </a>

        <ErrorBoundary>
          <PostHogProvider>
            <LanguageProvider initialLocale={locale} initialDictionary={dictionary}>
              <LangUpdater />
              <ToastProvider>
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
