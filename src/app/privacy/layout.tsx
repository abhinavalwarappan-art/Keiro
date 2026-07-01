import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description: 'How Keiro handles your data — conversations are never stored.',
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return children
}