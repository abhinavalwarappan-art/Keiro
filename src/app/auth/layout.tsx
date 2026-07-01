import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Sign in',
  description: 'Save your reports with a free account, or continue as a guest.',
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return children
}