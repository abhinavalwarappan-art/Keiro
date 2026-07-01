import { Skeleton, SkeletonChatBubble } from '@/components/ui/Skeleton'

/* Mirrors the chat layout exactly — TopBar, bubble-less Kai messages,
   user bubbles right, input row — so the real page lands without shift. */
export default function ChatLoading() {
  return (
    <div className="flex h-dvh flex-col bg-transparent">
      {/* TopBar skeleton */}
      <div className="flex min-h-14 shrink-0 items-center gap-3 border-b border-border-subtle bg-surface px-4">
        <Skeleton className="size-10 rounded-full" />
        <div className="flex-1 space-y-1.5">
          <Skeleton className="h-3.5 w-20 rounded-sm" />
          <Skeleton className="h-2.5 w-14 rounded-sm" />
        </div>
        <Skeleton className="h-8 w-16 rounded-md" />
      </div>

      {/* Messages area */}
      <div className="flex-1 overflow-hidden">
        <div className="mx-auto w-full max-w-2xl space-y-6 px-4 py-6 md:px-8">
          <SkeletonChatBubble align="left" />
          <SkeletonChatBubble align="right" />
          <SkeletonChatBubble align="left" />
        </div>
      </div>

      {/* Input area skeleton */}
      <div className="border-t border-border-subtle bg-surface">
        <div className="mx-auto flex w-full max-w-2xl items-center gap-2 px-4 pb-4 pt-3">
          <Skeleton className="h-12 flex-1 rounded-lg" />
          <Skeleton className="size-12 shrink-0 rounded-lg" />
          <Skeleton className="size-12 shrink-0 rounded-lg" />
        </div>
      </div>
    </div>
  )
}