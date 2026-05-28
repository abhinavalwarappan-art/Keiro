import type { Metadata, Viewport } from 'next'
import './globals.css'
import { SmoothScroll } from '@/components/ui/SmoothScroll'
import { CustomCursor } from '@/components/ui/CustomCursor'
import { LanguageProvider } from '@/context/LanguageContext'
import { ToastProvider } from '@/components/ui/Toast'

export const metadata: Metadata = {
  title: 'Keiro — Speak freely. Be understood.',
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
    type: 'website',
  },
}

export const viewport: Viewport = {
  themeColor: '#1a3d2b',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body>
        <LanguageProvider>
          <ToastProvider>
            <SmoothScroll />
            <CustomCursor />
            <div className="grain" />
            {children}
          </ToastProvider>
        </LanguageProvider>
      </body>
    </html>
  )
}
