import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Confirm your language',
  description: 'Review your language choice before starting your intake with Kai.',
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative min-h-dvh bg-white">
      <div className="pointer-events-none fixed inset-0 z-0 bg-white" aria-hidden />
      <div className="relative z-1">{children}</div>
    </div>
  )
}