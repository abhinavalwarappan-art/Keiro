'use client'

import { useEffect, useState } from 'react'
import { Loader2 } from 'lucide-react'

interface CaptureStripProps {
  mode: 'requesting' | 'recording' | 'transcribing'
  /** Already-localized stop label, shown while recording. */
  stopLabel: string
}

const BAR_COUNT = 7
// Staggered so the bars read as a live level meter, not a synchronized pulse.
const BAR_DELAYS_MS = [0, 140, 60, 220, 100, 180, 40]

function formatElapsed(totalSeconds: number): string {
  const m = Math.floor(totalSeconds / 60)
  const s = totalSeconds % 60
  return `${m}:${s.toString().padStart(2, '0')}`
}

/** Sits exactly over the text field while Keiro is capturing, so starting and
 *  stopping a recording never moves anything on screen. Language-independent:
 *  a running timer + level bars say "I'm hearing you" with no words to read. */
export default function CaptureStrip({ mode, stopLabel }: CaptureStripProps) {
  const [elapsed, setElapsed] = useState(0)
  const recording = mode === 'recording'

  useEffect(() => {
    if (!recording) return
    const id = setInterval(() => setElapsed((s) => s + 1), 1000)
    return () => {
      clearInterval(id)
      setElapsed(0)
    }
  }, [recording])

  return (
    <div
      role="status"
      aria-live="polite"
      className="absolute inset-0 flex flex-col items-center justify-center gap-1 rounded-lg border border-brand-ink/40 bg-brand-subtle px-4"
    >
      {recording ? (
        <>
          <span className="flex items-center gap-3" aria-hidden>
            <span className="flex h-7 items-center gap-1">
              {Array.from({ length: BAR_COUNT }, (_, i) => (
                <span
                  key={i}
                  className="mic-bar h-full w-1 rounded-full bg-brand-ink"
                  style={{ animationDelay: `${BAR_DELAYS_MS[i]}ms` }}
                />
              ))}
            </span>
            <span className="font-mono text-lg font-medium tabular-nums text-brand-ink">
              {formatElapsed(elapsed)}
            </span>
          </span>
          <span dir="auto" className="max-w-full truncate text-sm font-medium text-text-secondary">
            {stopLabel}
          </span>
        </>
      ) : (
        <span className="flex items-center gap-3">
          <Loader2 size={22} className="animate-spin text-brand-ink" aria-hidden />
          <span className="flex gap-1.5" aria-hidden>
            {[0, 150, 300].map((d) => (
              <span
                key={d}
                className="size-2 animate-pulse rounded-full bg-brand-ink"
                style={{ animationDelay: `${d}ms` }}
              />
            ))}
          </span>
          <span className="sr-only">
            {mode === 'requesting' ? 'Requesting microphone access' : 'Transcribing'}
          </span>
        </span>
      )}
    </div>
  )
}
