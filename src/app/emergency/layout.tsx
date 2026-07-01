import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Emergency',
  description: 'Multilingual emergency phrases. In an emergency, call 911.',
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return children
}