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

/**
 * Normalize raw DOB digits into a valid MMDDYYYY sequence as the user types.
 * A leading digit that can only be a single-digit month or day is auto-zeroed
 * (typing "3" for March yields "03"), and any digit that could only form an
 * impossible month (>12) or day (>31) is dropped. The month therefore stays
 * valid by construction, so a DD/MM slip can never enter a bogus month.
 * Idempotent: re-running it on already-normalized digits returns them unchanged.
 */
const maskDobDigits = (raw: string): string => {
  const s = raw.replace(/\D/g, '')
  let i = 0
  let out = ''

  // Month → 01–12
  if (i < s.length) {
    const a = s[i]
    if (a >= '2') {
      out += `0${a}` // 2–9 can only be a single-digit month
      i += 1
    } else {
      out += a // 0 or 1 → wait for the ones digit
      i += 1
      if (i < s.length) {
        const b = s[i]
        const ok = a === '0' ? b !== '0' : b <= '2' // 01–09 or 10–12
        i += 1
        if (ok) out += b
      }
    }
  }

  // Day → 01–31, only once the month is complete
  if (out.length === 2 && i < s.length) {
    const a = s[i]
    if (a >= '4') {
      out += `0${a}` // 4–9 can only be a single-digit day
      i += 1
    } else {
      out += a
      i += 1
      if (i < s.length) {
        const b = s[i]
        const ok = a === '0' ? b !== '0' : a === '3' ? b <= '1' : true // 01–09, 10–29, 30–31
        i += 1
        if (ok) out += b
      }
    }
  }

  // Year → up to 4 digits, passed through untouched
  if (out.length === 4) {
    out += s.slice(i, i + 4)
  }

  return out.slice(0, 8)
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
    const digits = maskDobDigits(e.target.value)
    setDisplay(formatDisplay(digits))
    onChange(displayToIso(digits))
  }

  return (
    <div className="w-full">
      <label
        htmlFor={inputId}
        className="mb-1.5 block text-base font-medium text-text-primary"
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
          'h-11 w-full rounded-md border bg-surface px-3 text-base text-text-primary',
          'tabular-nums tracking-[0.02em] transition-[border-color,box-shadow] duration-150',
          'placeholder:tracking-normal placeholder:text-text-placeholder',
          'focus:outline-none focus:border-brand-ink focus:ring-2 focus:ring-brand-ink/25',
          'disabled:cursor-not-allowed disabled:opacity-50',
          error ? 'border-error focus:border-error focus:ring-error/20' : 'border-border-subtle',
          className,
        )}
      />
      {error ? (
        <p id={errorId} className="mt-1.5 text-sm text-error-text" role="alert" aria-live="polite">
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
