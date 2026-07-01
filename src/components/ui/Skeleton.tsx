import { cn } from '@/lib/utils'

interface SkeletonProps {
  className?: string
  style?: React.CSSProperties
}

export function Skeleton({ className, style }: SkeletonProps) {
  return <div className={cn('skeleton', className)} style={style} aria-hidden />
}

export function SkeletonText({ className, style }: SkeletonProps) {
  return <Skeleton className={cn('h-4 rounded-sm', className)} style={style} />
}

export function SkeletonCard({ className, style }: SkeletonProps) {
  return (
    <div
      className={cn('rounded-lg border border-border-subtle bg-surface p-6 space-y-3', className)}
      style={style}
    >
      <div className="flex items-center gap-3">
        <Skeleton className="size-8 rounded-full shrink-0" />
        <div className="flex-1 space-y-2">
          <SkeletonText className="w-3/5" />
          <SkeletonText className="w-2/5 h-3" />
        </div>
      </div>
      <SkeletonText className="w-full h-3" />
      <SkeletonText className="w-4/5 h-3" />
    </div>
  )
}

/* Mirrors the chat layout: Kai messages are bubble-less text lines with a small
   mark; user messages are compact filled bubbles on the right. */
export function SkeletonChatBubble({ align = 'left', className }: { align?: 'left' | 'right'; className?: string }) {
  if (align === 'right') {
    return (
      <div className={cn('flex justify-end', className)}>
        <Skeleton className="h-10 w-44 rounded-lg rounded-br-sm" />
      </div>
    )
  }
  return (
    <div className={cn('space-y-2', className)}>
      <Skeleton className="size-6 rounded-full" />
      <SkeletonText className="w-72 max-w-full" />
      <SkeletonText className="w-56 max-w-full" />
    </div>
  )
}