import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Settings',
  description: 'Language, voice, privacy, and account preferences.',
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return children
}