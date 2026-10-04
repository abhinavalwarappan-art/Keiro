'use client'

import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { Loader2 } from 'lucide-react'
import type { TranslateFn } from '@/i18n/useTranslations'

interface EndSessionDialogProps {
  open: boolean
  onCancel: () => void
  /** Clears the session and leaves. The dialog shows "Ending…" until it settles. */
  onConfirm: () => Promise<void>
  t: TranslateFn
}

/**
 * Ending a conversation clears it from the phone and can't be undone, so it gets
 * one plain question and a way back. A sheet from the bottom on phones (thumb
 * reach), centred on wider screens. Focus moves to the safe choice, Escape and
 * the scrim both cancel, and the destructive button reports progress instead of
 * going quiet while the sign-out request runs.
 */
export default function EndSessionDialog({ open, onCancel, onConfirm, t }: EndSessionDialogProps) {
  const reduceMotion = useReducedMotion()
  const [ending, setEnding] = useState(false)
  const cancelRef = useRef<HTMLButtonElement>(null)
  const returnFocusRef = useRef<HTMLElement | null>(null)

  useEffect(() => {
    if (!open) return
    returnFocusRef.current = document.activeElement as HTMLElement | null
    cancelRef.current?.focus()
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !ending) onCancel()
    }
    window.addEventListener('keydown', onKey)
    return () => {
      window.removeEventListener('keydown', onKey)
      returnFocusRef.current?.focus?.()
    }
  }, [open, ending, onCancel])

  const confirm = async () => {
    if (ending) return
    setEnding(true)
    try {
      await onConfirm()
    } finally {
      setEnding(false)
    }
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/30 p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] sm:items-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18 }}
          onClick={() => !ending && onCancel()}
          data-lenis-prevent
        >
          <motion.div
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="end-session-title"
            aria-describedby="end-session-body"
            className="w-full max-w-sm rounded-[1.75rem] bg-surface p-6 shadow-[0_30px_80px_-30px_rgba(12,34,23,0.45)]"
            initial={reduceMotion ? { opacity: 0 } : { y: 24, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={reduceMotion ? { opacity: 0 } : { y: 24, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 420, damping: 38 }}
            onClick={(e) => e.stopPropagation()}
          >
            <h2
              id="end-session-title"
              className="text-balance text-[1.375rem] font-semibold leading-tight tracking-[-0.025em] text-text-primary"
            >
              {t('chat.endTitle')}
            </h2>
            <p id="end-session-body" className="mt-2 text-pretty text-base leading-relaxed text-text-secondary">
              {t('chat.endBody')}
            </p>
            <div className="mt-6 flex flex-col gap-2">
              <button
                ref={cancelRef}
                type="button"
                onClick={onCancel}
                disabled={ending}
                className="min-h-13 rounded-full bg-brand-ink px-5 text-lg font-semibold text-white transition-[background-color,transform] duration-150 hover:bg-brand-ink-hover active:scale-[0.97] disabled:opacity-50"
              >
                {t('chat.endCancel')}
              </button>
              <button
                type="button"
                onClick={confirm}
                aria-busy={ending || undefined}
                className="inline-flex min-h-13 items-center justify-center gap-2 rounded-full px-5 text-lg font-semibold text-error-text transition-[background-color,transform] duration-150 hover:bg-error-subtle active:scale-[0.97]"
              >
                {ending && <Loader2 size={18} className="animate-spin motion-reduce:animate-none" aria-hidden />}
                {ending ? t('chat.ending') : t('chat.endConfirm')}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
