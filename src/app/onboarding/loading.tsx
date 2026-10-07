import { Skeleton, SkeletonText } from '@/components/ui/Skeleton'

/* Mirrors onboarding: compact header, search, language rows, CTA footer */
export default function OnboardingLoading() {
  return (
    <div className="mx-auto flex min-h-svh w-full max-w-lg flex-col bg-transparent">
      <div className="space-y-3 border-b border-border-subtle px-5 pb-4 pt-5">
        <div className="flex items-center gap-3">
          <Skeleton className="size-12 rounded-full" />
          <div className="flex-1 space-y-2">
            <SkeletonText className="h-5 w-32" />
            <SkeletonText className="h-3 w-56" />
          </div>
        </div>
        <SkeletonText className="h-3 w-3/4" />
      </div>

      <div className="border-b border-border-subtle bg-surface px-4 py-3">
        <Skeleton className="h-11 w-full rounded-md" />
      </div>

      <div className="flex-1 space-y-px bg-surface px-0 py-1">
        {[0, 1, 2, 3, 4, 5].map(i => (
          <div key={i} className="flex items-center gap-4 px-5 py-4" style={{ opacity: Math.max(1 - i * 0.12, 0) }}>
            <Skeleton className="size-7 rounded-full" />
            <SkeletonText className="h-4 w-40" />
          </div>
        ))}
      </div>

      <div className="border-t border-border-subtle bg-surface px-4 pb-5 pt-3">
        <Skeleton className="h-12 w-full rounded-md" />
      </div>
    </div>
  )
}