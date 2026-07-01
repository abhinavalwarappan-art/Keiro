'use client'

import { createContext, useCallback, useContext, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle2, AlertCircle, AlertTriangle, Info, X } from 'lucide-react'

type ToastVariant = 'success' | 'error' | 'warning' | 'info'

type ToastOptions = {
  variant?: ToastVariant
  description?: string
}

type ToastMessage = {
  id: number
  text: string
  variant: ToastVariant
  description?: string
}

const MAX_VISIBLE = 3
const SUCCESS_DISMISS_MS = 4000

const ICONS: Record<ToastVariant, React.ReactNode> = {
  success: <CheckCircle2 size={16} className="text-success" />,
  error: <AlertCircle size={16} className="text-error" />,
  warning: <AlertTriangle size={16} className="text-warning" />,
  info: <Info size={16} className="text-brand-strong" />,
}

const ToastContext = createContext<(text: string, options?: ToastOptions) => void>(() => {})

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastMessage[]>([])
  const counterRef = useRef(0)
  const timersRef = useRef<Map<number, ReturnType<typeof setTimeout>>>(new Map())

  const dismiss = useCallback((id: number) => {
    const timer = timersRef.current.get(id)
    if (timer !== undefined) {
      clearTimeout(timer)
      timersRef.current.delete(id)
    }
    setToasts((t) => t.filter((x) => x.id !== id))
  }, [])

  const showToast = useCallback((text: string, options?: ToastOptions) => {
    counterRef.current += 1
    const id = counterRef.current
    const variant = options?.variant ?? 'info'
    setToasts((t) => [...t.slice(-(MAX_VISIBLE - 1)), { id, text, variant, description: options?.description }])
    // Errors stay until dismissed; everything else auto-clears
    if (variant !== 'error') {
      const timer = setTimeout(() => {
        timersRef.current.delete(id)
        setToasts((t) => t.filter((x) => x.id !== id))
      }, SUCCESS_DISMISS_MS)
      timersRef.current.set(id, timer)
    }
  }, [])

  return (
    <ToastContext.Provider value={showToast}>
      {children}
      <div
        aria-live="polite"
        className="fixed bottom-4 right-4 z-[10000] flex flex-col items-end gap-2"
      >
        <AnimatePresence>
          {toasts.map((t) => (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 8 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
              className="pointer-events-auto flex w-full max-w-sm items-start gap-3 rounded-lg border border-border-subtle bg-surface p-4 shadow-sm"
            >
              <span className="mt-0.5 shrink-0">{ICONS[t.variant]}</span>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-text-primary">{t.text}</p>
                {t.description && (
                  <p className="mt-0.5 text-sm text-text-secondary">{t.description}</p>
                )}
              </div>
              <button
                onClick={() => dismiss(t.id)}
                aria-label="Dismiss notification"
                className="shrink-0 rounded-sm p-1 text-text-tertiary transition-colors duration-150 hover:bg-sunken hover:text-text-primary"
              >
                <X size={14} />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  )
}

export function useToast() {
  return useContext(ToastContext)
}