import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Choose your language',
  description: 'Choose from 45 languages, then learn how Kai can help you prepare an English summary for your healthcare provider.',
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    /* <main>, not <div>: the id alone satisfied the skip link but left the page
       with no main landmark for screen-reader navigation. */
    <main id="main-content" className="min-h-dvh bg-canvas">
      {children}
    </main>
  )
}
