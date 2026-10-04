/* Shown while any route streams in. A quiet ring in the brand ink — no logo
   theatrics — and words for screen readers, since a spinner alone says nothing. */
export default function Loading() {
  return (
    <div
      className="flex min-h-dvh w-full items-center justify-center bg-canvas"
      role="status"
      aria-live="polite"
    >
      <span
        aria-hidden
        className="size-8 animate-spin rounded-full border-[2.5px] border-brand-border border-t-brand-ink motion-reduce:animate-none"
      />
      <span className="sr-only">Loading…</span>
    </div>
  )
}
