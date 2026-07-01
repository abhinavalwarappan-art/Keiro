import { Skeleton, SkeletonText } from '@/components/ui/Skeleton'

/* Mirrors the loaded report rows in /history exactly */
function HistoryCardSkeleton() {
  return (
    <div className="flex items-start gap-3 rounded-lg border border-border-subtle bg-surface p-4">
      <Skeleton className="size-10 shrink-0 rounded-md" />
      <div className="flex-1 space-y-2">
        <SkeletonText className="h-3 w-24" />
        <SkeletonText className="h-4 w-2/3" />
        <SkeletonText className="h-3 w-1/3" />
      </div>
    </div>
  )
}

export default function HistoryLoading() {
  return (
    <div className="flex min-h-screen flex-col bg-transparent">
      <div className="flex min-h-14 items-center gap-3 border-b border-border-subtle bg-surface px-4">
        <Skeleton className="size-9 rounded-md" />
        <SkeletonText className="h-4 w-24" />
      </div>

      <div className="mx-auto w-full max-w-2xl flex-1 space-y-3 px-4 py-6">
        {[0, 1, 2, 3].map(i => (
          <HistoryCardSkeleton key={i} />
        ))}
      </div>
    </div>
  )
}