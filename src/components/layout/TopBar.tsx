'use client'

import { useRouter } from 'next/navigation'
import { ChevronLeft } from 'lucide-react'
import { KaiState } from '@/components/kai/Kai'
import KaiAvatar from '@/components/kai/KaiAvatar'

interface TopBarProps {
  title?: string
  showBack?: boolean
  backHref?: string
  rightElement?: React.ReactNode
  kaiState?: KaiState
  language?: string
  langNative?: string
}

export default function TopBar({ showBack, backHref, rightElement, kaiState, language, langNative }: TopBarProps) {
  const router = useRouter()
  const isOnline = kaiState !== 'thinking'

  return (
    <header className="sticky top-0 z-20 flex min-h-16 items-center gap-3 border-b border-border-subtle/70 bg-white/80 px-4 backdrop-blur-xl backdrop-saturate-150">
      {showBack && (
        <button
          onClick={() => (backHref ? router.push(backHref) : router.back())}
          className="flex size-9 min-h-[44px] min-w-[44px] shrink-0 items-center justify-center rounded-md text-text-secondary transition-colors duration-150 hover:bg-sunken hover:text-text-primary"
          aria-label="Go back"
        >
          <ChevronLeft size={18} aria-hidden />
        </button>
      )}

      <div className="flex min-w-0 flex-1 items-center gap-3">
        <KaiAvatar pixels={40} state={kaiState ?? 'idle'} />

        <div>
          <div className="text-lg font-semibold leading-tight tracking-[-0.02em] text-text-primary">Kai</div>
          <div className="flex items-center gap-1.5">
            <span
              className={`size-1.5 shrink-0 rounded-full ${isOnline ? 'bg-success' : 'animate-pulse bg-warning'}`}
              aria-hidden
            />
            <span className="text-sm font-medium text-text-tertiary">
              {kaiState === 'thinking' ? 'Thinking…' : 'Online'}
            </span>
          </div>
        </div>
      </div>

      {language && (
        <span className="max-w-[140px] shrink-0 truncate text-base font-medium text-text-secondary">
          {langNative || language}
        </span>
      )}

      {rightElement}
    </header>
  )
}