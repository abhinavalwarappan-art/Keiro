'use client'

import { useRouter } from 'next/navigation'
import { ChevronLeft } from 'lucide-react'
import Kai, { KaiState } from '@/components/kai/Kai'

interface TopBarProps {
  title?: string
  showBack?: boolean
  backHref?: string
  rightElement?: React.ReactNode
  kaiState?: KaiState
  language?: string
}

export default function TopBar({ title, showBack, backHref, rightElement, kaiState = 'idle', language }: TopBarProps) {
  const router = useRouter()

  return (
    <div className="flex items-center gap-3 px-4 py-3 sticky top-0 z-20 bg-white border-b border-keiro-border">
      {showBack && (
        <button
          onClick={() => (backHref ? router.push(backHref) : router.back())}
          className="w-8 h-8 rounded-lg flex items-center justify-center transition-all hover:bg-keiro-surface flex-shrink-0"
        >
          <ChevronLeft size={18} className="text-keiro-dark" />
        </button>
      )}

      <div className="flex items-center gap-2 flex-1 min-w-0">
        <Kai size="sm" state={kaiState} interactive={false} />
        <div className="min-w-0">
          <div className="font-semibold text-sm truncate text-keiro-text">{title || 'Kai'}</div>
          <div className="flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-keiro-mid" />
            <span className="text-xs text-keiro-muted">Online</span>
          </div>
        </div>
      </div>

      {language && (
        <div className="px-2.5 py-1 rounded-full text-xs font-medium flex-shrink-0 bg-keiro-surface text-keiro-dark border border-keiro-border">
          {language}
        </div>
      )}

      {rightElement}
    </div>
  )
}
