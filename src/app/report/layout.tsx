import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Your intake report',
  description: 'The English summary of your conversation with Kai, ready to show your doctor.',
  robots: { index: false, follow: false },
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return children
}
