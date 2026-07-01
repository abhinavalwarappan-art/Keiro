import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Your reports',
  description: 'Your saved medical intake reports.',
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return children
}