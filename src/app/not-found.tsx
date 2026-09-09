import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-transparent px-6 text-center">
      <p
        className="select-none text-8xl font-bold tracking-tight text-text-tertiary"
        aria-hidden
      >
        404
      </p>

      <h1 className="mt-4 text-2xl font-semibold tracking-tight text-text-primary">
        Page not found
      </h1>
      <p className="mt-2 text-sm text-text-secondary">
        The page you&apos;re looking for doesn&apos;t exist.
      </p>

      <Link
        href="/"
        className="mt-8 inline-flex min-h-[44px] items-center justify-center rounded-md bg-brand-ink px-6 py-2.5 text-sm font-medium text-white shadow-xs transition-colors duration-150 hover:bg-brand-ink-hover"
      >
        Go home
      </Link>
    </div>
  )
}