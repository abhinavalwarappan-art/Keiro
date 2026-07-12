import { Skeleton, SkeletonText } from '@/components/ui/Skeleton'

/* Mirrors the auth layout: back-button row + language chip, then the
   centered max-w-sm form column — so the real page lands without shift. */
export default function AuthLoading() {
  return (
    <div className="flex h-dvh min-h-0 w-full flex-col bg-transparent">
      <div className="z-10 flex shrink-0 items-center gap-3 px-4 py-3">
        <Skeleton className="size-11 rounded-md" />
        <span className="flex-1" />
        <Skeleton className="h-7 w-20 rounded-full" />
      </div>

      <div className="min-h-0 flex-1 overflow-hidden px-6 py-8">
        <div className="mx-auto w-full max-w-sm space-y-6">
          <div className="space-y-2">
            <SkeletonText className="h-7 w-40" />
            <SkeletonText className="h-4 w-56" />
          </div>

          <div className="space-y-3">
            <Skeleton className="h-12 w-full rounded-md" />
            <Skeleton className="h-12 w-full rounded-md" />
          </div>

          <Skeleton className="h-12 w-full rounded-md" />
          <SkeletonText className="mx-auto h-4 w-44" />
        </div>
      </div>
    </div>
  )
}
