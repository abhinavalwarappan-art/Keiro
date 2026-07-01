import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Chat with Kai',
  description: 'Describe your symptoms in your own language.',
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return children
}