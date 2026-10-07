import { Skeleton, SkeletonText } from '@/components/ui/Skeleton'

/* Mirrors the report page: header bar, two action buttons, ruled sections */
export default function ReportLoading() {
  return (
    <div className="mx-auto flex min-h-svh w-full max-w-2xl flex-col bg-transparent">
      <div className="flex min-h-14 items-center gap-3 border-b border-border-subtle bg-surface px-4">
        <Skeleton className="size-9 rounded-md" />
        <div className="flex-1 space-y-1.5">
          <SkeletonText className="h-3 w-24" />
          <SkeletonText className="h-4 w-44" />
        </div>
        <Skeleton className="h-6 w-16 rounded-full" />
      </div>

      <div className="flex-1 space-y-6 p-4">
        <div className="space-y-2.5">
          <Skeleton className="h-14 w-full rounded-lg" />
          <Skeleton className="h-12 w-full rounded-lg" />
        </div>

        {[0, 1, 2].map(i => (
          <div key={i} className="space-y-2">
            <SkeletonText className="h-3 w-36" />
            <div className="h-px bg-border-subtle" />
            <SkeletonText className="h-4 w-full" />
            <SkeletonText className="h-4 w-5/6" />
            <SkeletonText className="h-4 w-3/4" />
          </div>
        ))}
      </div>
    </div>
  )
}