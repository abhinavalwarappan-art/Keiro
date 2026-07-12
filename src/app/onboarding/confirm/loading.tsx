import { Skeleton, SkeletonText } from '@/components/ui/Skeleton'

/* Mirrors the confirm layout: header (Kai + greeting + romanization toggle),
   the centered language card, and the pinned Continue CTA. */
export default function ConfirmLoading() {
  return (
    <div className="mx-auto flex h-dvh min-h-0 w-full max-w-lg flex-col overflow-hidden bg-canvas">
      <header className="shrink-0 border-b border-border-subtle px-5 pb-3 pt-5">
        <div className="mb-3 flex items-center justify-between">
          <SkeletonText className="h-3 w-24" />
          <SkeletonText className="h-3 w-20" />
        </div>

        <div className="flex items-center gap-3">
          <Skeleton className="size-12 shrink-0 rounded-full" />
          <div className="min-w-0 flex-1 space-y-1.5">
            <SkeletonText className="h-6 w-40" />
            <SkeletonText className="h-4 w-56" />
          </div>
        </div>

        <SkeletonText className="mt-3 h-3 w-full" />

        <div className="mt-3 flex w-full items-center justify-between">
          <Skeleton className="h-11 w-32 rounded-md" />
          <SkeletonText className="h-3 w-20" />
        </div>
      </header>

      <section className="flex min-h-0 flex-1 flex-col items-center justify-center bg-surface px-6 py-5">
        <div className="w-full max-w-sm space-y-3 rounded-2xl border border-brand-border bg-brand-subtle p-6 text-center">
          <Skeleton className="mx-auto size-12 rounded-md" />
          <SkeletonText className="mx-auto h-7 w-36" />
          <SkeletonText className="mx-auto h-5 w-28" />
          <SkeletonText className="mx-auto mt-5 h-4 w-full" />
          <SkeletonText className="mx-auto h-4 w-4/5" />
        </div>
      </section>

      <footer className="z-20 shrink-0 border-t border-border-subtle bg-surface px-4 pb-5 pt-3">
        <Skeleton className="h-12 w-full rounded-md" />
      </footer>
    </div>
  )
}
