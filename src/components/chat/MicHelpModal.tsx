'use client'

import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Check, Loader2 } from 'lucide-react'
import { useTranslations, type MessageKey } from '@/i18n/useTranslations'
import { detectMicPlatform, type MicPermissionState, type MicPlatform } from '@/lib/micDiagnostics'

/**
 * Recovery instructions for a microphone the patient has actually blocked.
 *
 * Shown only for a confirmed denial — never for a device-busy or no-hardware
 * fault, whose fix is not in these settings. It stays in-app rather than
 * navigating: sending someone to another page mid-consultation loses the
 * conversation they were having, and an external help URL is unreachable for the
 * exact testers most likely to need it.
 *
 * "Try again" re-queries the live permission state instead of just closing, so a
 * patient who fixed the setting in another app gets told it worked.
 */

interface StepGroup {
  labelKey: MessageKey
  stepKeys: readonly MessageKey[]
}

const INSTRUCTIONS: Record<MicPlatform, StepGroup> = {
  'ios-safari': {
    labelKey: 'mic.help.tabSafari',
    stepKeys: [
      'mic.help.iosStep1',
      'mic.help.iosStep2',
      'mic.help.iosStep3',
      'mic.help.iosStep4',
      'mic.help.iosStep5',
    ],
  },
  'android-chrome': {
    labelKey: 'mic.help.tabChrome',
    stepKeys: [
      'mic.help.androidStep1',
      'mic.help.androidStep2',
      'mic.help.androidStep3',
      'mic.help.androidStep4',
      'mic.help.androidStep5',
    ],
  },
  other: {
    labelKey: 'mic.help.tabOther',
    stepKeys: [
      'mic.help.otherStep1',
      'mic.help.otherStep2',
      'mic.help.otherStep3',
      'mic.help.otherStep4',
    ],
  },
}

const PLATFORM_ORDER: readonly MicPlatform[] = ['ios-safari', 'android-chrome', 'other']

interface MicHelpModalProps {
  open: boolean
  onClose: () => void
  langCode: string
  /** Re-reads the live permission state. Resolves with the new value. */
  onRecheck: () => Promise<MicPermissionState>
}

export default function MicHelpModal({ open, onClose, langCode, onRecheck }: MicHelpModalProps) {
  // The dialog body is a separate component mounted only while open, so each
  // opening starts from fresh state via the useState initializers below —
  // no reset effect, and detectMicPlatform() only ever runs on the client.
  return (
    <AnimatePresence>
      {open && <MicHelpDialog onClose={onClose} langCode={langCode} onRecheck={onRecheck} />}
    </AnimatePresence>
  )
}

function MicHelpDialog({ onClose, langCode, onRecheck }: Omit<MicHelpModalProps, 'open'>) {
  const t = useTranslations(langCode)
  const dialogRef = useRef<HTMLDivElement>(null)

  // Preselect the detected browser, but always leave the other options reachable
  // — user-agent detection is a guess, and a wrong guess would otherwise strand
  // the patient on instructions that don't match what's on their screen.
  const [platform, setPlatform] = useState<MicPlatform>(detectMicPlatform)
  const [checking, setChecking] = useState(false)
  const [result, setResult] = useState<'fixed' | 'still-blocked' | null>(null)

  useEffect(() => {
    const previousFocus = document.activeElement as HTMLElement | null
    dialogRef.current?.focus()
    return () => { previousFocus?.focus() }
  }, [])

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
      if (e.key === 'Tab') {
        const dialog = dialogRef.current
        const controls = dialog?.querySelectorAll<HTMLElement>('button:not(:disabled), a[href], input:not(:disabled), [tabindex="0"]')
        if (!dialog || !controls?.length) return
        const first = controls[0]
        const last = controls[controls.length - 1]
        if (!dialog.contains(document.activeElement)) {
          e.preventDefault()
          ;(e.shiftKey ? last : first).focus()
        } else if (e.shiftKey && (document.activeElement === first || document.activeElement === dialog)) {
          e.preventDefault()
          last.focus()
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault()
          first.focus()
        }
      }
    }
    const onFocusIn = (event: FocusEvent) => {
      const dialog = dialogRef.current
      if (dialog && !dialog.contains(event.target as Node)) dialog.focus()
    }
    window.addEventListener('keydown', onKeyDown)
    document.addEventListener('focusin', onFocusIn)
    return () => {
      window.removeEventListener('keydown', onKeyDown)
      document.removeEventListener('focusin', onFocusIn)
    }
  }, [onClose])

  const handleTryAgain = async () => {
    setChecking(true)
    try {
      const state = await onRecheck()
      // 'prompt' and 'unsupported' both mean "no longer a known denial", so the
      // patient gets to retry the mic rather than being told it's still off.
      setResult(state === 'denied' ? 'still-blocked' : 'fixed')
    } finally {
      setChecking(false)
    }
  }

  const steps = INSTRUCTIONS[platform].stepKeys

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.15 }}
      className="fixed inset-0 z-[70] flex items-end justify-center bg-black/40 p-4 backdrop-blur-sm sm:items-center"
      onClick={onClose}
    >
      <motion.div
        ref={dialogRef}
        tabIndex={-1}
        initial={{ y: 24, scale: 0.97 }}
        animate={{ y: 0, scale: 1 }}
        exit={{ y: 24, opacity: 0 }}
        transition={{ ease: [0.16, 1, 0.3, 1], duration: 0.25 }}
        role="dialog"
        aria-modal="true"
        aria-labelledby="mic-help-title"
        // Lenis hijacks the wheel globally; without this the steps can't be
        // scrolled on a short screen.
        data-lenis-prevent
        className="flex max-h-[85vh] w-full max-w-md flex-col gap-4 overflow-y-auto rounded-lg bg-surface p-6 shadow-md focus:outline-none"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-3">
          <h2 id="mic-help-title" className="text-lg font-semibold text-text-primary">
            {t('mic.help.title')}
          </h2>
          <button
            onClick={onClose}
            className="-mr-2 -mt-2 flex size-11 shrink-0 items-center justify-center rounded-md text-text-secondary transition-colors duration-150 hover:bg-sunken hover:text-text-primary"
            aria-label={t('mic.help.close')}
          >
            <X size={20} aria-hidden />
          </button>
        </div>

        <p className="text-sm leading-relaxed text-text-secondary">{t('mic.help.intro')}</p>

        {/* Browser picker. Plain toggle buttons rather than an ARIA tablist:
            the roving-focus contract of real tabs is a needless obstacle for
            the elderly testers this modal exists for. */}
        <div className="flex flex-wrap gap-2" role="group" aria-label={t('mic.help.pickBrowser')}>
          {PLATFORM_ORDER.map(option => {
            const selected = option === platform
            return (
              <button
                key={option}
                onClick={() => {
                  setPlatform(option)
                  setResult(null)
                }}
                aria-pressed={selected}
                className={`min-h-[44px] rounded-md border px-3 py-2 text-sm font-medium transition-colors duration-150 ${
                  selected
                    ? 'border-brand bg-brand-subtle text-brand-ink'
                    : 'border-border-subtle bg-surface text-text-secondary hover:border-border-default hover:bg-sunken'
                }`}
              >
                {t(INSTRUCTIONS[option].labelKey)}
              </button>
            )
          })}
        </div>

        <ol className="flex list-none flex-col gap-3">
          {steps.map((key, index) => (
            <li key={key} className="flex items-start gap-3">
              <span
                className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full bg-brand-subtle text-xs font-semibold text-brand-ink"
                aria-hidden
              >
                {index + 1}
              </span>
              <span className="text-sm leading-relaxed text-text-primary">{t(key)}</span>
            </li>
          ))}
        </ol>

        {result && (
          <p
            className={`rounded-md px-3 py-2.5 text-sm leading-relaxed ${
              result === 'fixed'
                ? 'bg-brand-subtle text-brand-ink'
                : 'bg-sunken text-text-secondary'
            }`}
            role="status"
            aria-live="polite"
          >
            {result === 'fixed' ? (
              <span className="flex items-center gap-2">
                <Check size={16} aria-hidden />
                {t('mic.help.fixed')}
              </span>
            ) : (
              t('mic.help.stillBlocked')
            )}
          </p>
        )}

        <div className="flex flex-col gap-2">
          <button
            onClick={result === 'fixed' ? onClose : handleTryAgain}
            disabled={checking}
            className="flex min-h-[48px] w-full items-center justify-center gap-2 rounded-md bg-brand-ink py-3 text-base font-medium text-white transition-colors duration-150 hover:bg-brand-ink-hover active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {checking && <Loader2 size={16} className="animate-spin" aria-hidden />}
            {checking
              ? t('mic.help.checking')
              : result === 'fixed'
                ? t('mic.help.close')
                : t('mic.help.tryAgain')}
          </button>
          <p className="text-center text-xs leading-relaxed text-text-tertiary">
            {t('mic.help.typeInstead')}
          </p>
        </div>
      </motion.div>
    </motion.div>
  )
}
