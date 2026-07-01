export default function Loading() {
  return (
    <div
      className="flex min-h-dvh w-full items-center justify-center bg-transparent"
      aria-busy="true"
      aria-label="Loading"
    >
      <div className="animate-logo-pulse flex size-12 items-center justify-center rounded-lg bg-brand-ink">
        <svg width="20" height="20" viewBox="0 0 14 14" fill="none" aria-hidden="true">
          <path d="M2 2h4v4L2 12V2z" fill="white" opacity="0.9" />
          <path d="M7 2h5L7 12H4.5L7 2z" fill="white" />
        </svg>
      </div>
    </div>
  )
}