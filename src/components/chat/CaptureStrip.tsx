'use client'

import { useEffect, useState } from 'react'
import { Loader2 } from 'lucide-react'

interface CaptureStripProps {
  mode: 'requesting' | 'recording' | 'transcribing'
  /** Already-localized caption for the current mode. */
  caption: string
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
 *  stopping a recording never moves anything on screen. The timer and level
 *  bars say "I'm hearing you" without words; the caption says what is happening
 *  in the patient's language, because a spinner alone during the 2–5s of
 *  transcription reads as "frozen". */
export default function CaptureStrip({ mode, caption }: CaptureStripProps) {
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
      className="absolute inset-0 flex flex-col items-center justify-center gap-1 rounded-[1.25rem] border border-brand-ink/30 bg-brand-subtle px-4"
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
            {caption}
          </span>
        </>
      ) : (
        <>
          <Loader2 size={22} className="animate-spin text-brand-ink motion-reduce:animate-none" aria-hidden />
          <span dir="auto" className="max-w-full truncate text-sm font-medium text-text-secondary">
            {caption}
          </span>
        </>
      )}
    </div>
  )
}
