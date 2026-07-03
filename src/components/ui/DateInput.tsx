'use client'

import { useId, useState } from 'react'
import { cn } from '@/lib/utils'

interface DateInputProps {
  label: string
  /** ISO date string (YYYY-MM-DD), or '' while incomplete */
  value: string
  /** Emits an ISO date once all 8 digits are entered, otherwise '' */
  onChange: (isoDate: string) => void
  error?: string
  helper?: string
  required?: boolean
  className?: string
  id?: string
}

/** '2008-03-25' -> '03/25/2008' (US order); '' for anything unparseable. */
const isoToDisplay = (iso: string): string => {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso)
  if (!m) return ''
  const [, y, mo, d] = m
  return `${mo}/${d}/${y}`
}

/** Insert slashes as MM/DD/YYYY from raw digits. */
const formatDisplay = (digits: string): string => {
  const d = digits.slice(0, 8)
  return [d.slice(0, 2), d.slice(2, 4), d.slice(4, 8)].filter(Boolean).join('/')
}

/** 'MMDDYYYY' digits -> ISO 'YYYY-MM-DD'; '' until all 8 are present. */
const displayToIso = (digits: string): string => {
  if (digits.length < 8) return ''
  return `${digits.slice(4, 8)}-${digits.slice(0, 2)}-${digits.slice(2, 4)}`
}

export function DateInput({
  label,
  value,
  onChange,
  error,
  helper,
  required,
  className,
  id,
}: DateInputProps) {
  const autoId = useId()
  const inputId = id ?? autoId
  const errorId = `${inputId}-error`
  const helperId = `${inputId}-helper`

  const [display, setDisplay] = useState(() => isoToDisplay(value))

  // Resync the visible text when the ISO value changes from the outside
  // (e.g. an existing profile loads). Adjusting state during render — rather
  // than in an effect — keeps our partial text intact while the user types,
  // since the guard ignores values the current text already represents.
  const [prevValue, setPrevValue] = useState(value)
  if (value !== prevValue) {
    setPrevValue(value)
    if (value !== displayToIso(display.replace(/\D/g, ''))) {
      setDisplay(isoToDisplay(value))
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const digits = e.target.value.replace(/\D/g, '').slice(0, 8)
    setDisplay(formatDisplay(digits))
    onChange(displayToIso(digits))
  }

  return (
    <div className="w-full">
      <label
        htmlFor={inputId}
        className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-text-secondary"
      >
        {label}
      </label>
      <input
        id={inputId}
        type="text"
        inputMode="numeric"
        autoComplete="bday"
        placeholder="mm/dd/yyyy"
        value={display}
        onChange={handleChange}
        required={required}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? errorId : helper ? helperId : undefined}
        className={cn(
          'h-10 w-full rounded-md border bg-surface px-3 text-base text-text-primary',
          'transition-[border-color,box-shadow] duration-150',
          'placeholder:text-text-placeholder',
          'focus:outline-none focus:border-brand-strong focus:ring-2 focus:ring-brand-strong/25',
          'disabled:cursor-not-allowed disabled:opacity-50',
          error ? 'border-error focus:border-error focus:ring-error/20' : 'border-border-subtle',
          className,
        )}
      />
      {error ? (
        <p id={errorId} className="mt-1 text-xs text-error-text" role="alert" aria-live="polite">
          {error}
        </p>
      ) : helper ? (
        <p id={helperId} className="mt-1 text-xs text-text-tertiary">
          {helper}
        </p>
      ) : null}
    </div>
  )
}
