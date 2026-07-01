import { Skeleton, SkeletonText } from '@/components/ui/Skeleton'

function SettingsRowSkeleton() {
  return (
    <div className="flex items-center justify-between border-b border-border-subtle/60 px-4 py-4 last:border-0">
      <div className="flex items-center gap-3">
        <Skeleton className="size-9 rounded-md" />
        <div className="space-y-1.5">
          <SkeletonText className="h-4 w-24" />
          <SkeletonText className="h-3 w-16" />
        </div>
      </div>
      <Skeleton className="size-4 rounded-sm" />
    </div>
  )
}

/* Mirrors the settings layout: header bar + section cards of rows */
export default function SettingsLoading() {
  return (
    <div className="flex min-h-screen flex-col bg-transparent">
      <div className="flex min-h-14 items-center gap-3 border-b border-border-subtle bg-surface px-4">
        <Skeleton className="size-9 rounded-md" />
        <SkeletonText className="h-4 w-20" />
      </div>

      <div className="mx-auto w-full max-w-2xl flex-1 space-y-4 p-4">
        <div className="overflow-hidden rounded-lg border border-border-subtle bg-surface">
          <div className="border-b border-border-subtle bg-canvas px-4 py-3">
            <SkeletonText className="h-3 w-16" />
          </div>
          <SettingsRowSkeleton />
        </div>

        <div className="overflow-hidden rounded-lg border border-border-subtle bg-surface">
          <div className="border-b border-border-subtle bg-canvas px-4 py-3">
            <SkeletonText className="h-3 w-20" />
          </div>
          <SettingsRowSkeleton />
          <SettingsRowSkeleton />
          <SettingsRowSkeleton />
        </div>

        <div className="space-y-2 pt-2">
          <Skeleton className="h-12 w-full rounded-md" />
          <Skeleton className="h-12 w-full rounded-md" />
        </div>
      </div>
    </div>
  )
}