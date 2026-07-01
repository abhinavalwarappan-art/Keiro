import type { Metadata } from 'next'
import { StarrySkyBackground } from '@/components/ui/starry-sky-background'

export const metadata: Metadata = {
  title: 'Choose your language',
  description: 'Pick from 25+ languages to start your intake.',
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div id="main-content" className="relative min-h-dvh bg-black">
      <div className="pointer-events-none fixed inset-0 z-0" aria-hidden>
        <StarrySkyBackground />
      </div>
      <div className="relative z-[1]">{children}</div>
    </div>
  )
}