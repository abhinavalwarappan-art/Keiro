'use client'

import { useId } from 'react'
import { cn } from '@/lib/utils'

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string
  /** Visually hide the label while keeping it for screen readers */
  hideLabel?: boolean
  error?: string
  helper?: string
}

export function Input({ label, hideLabel, error, helper, className, id, ...props }: InputProps) {
  const autoId = useId()
  const inputId = id ?? autoId
  const errorId = `${inputId}-error`
  const helperId = `${inputId}-helper`

  return (
    <div className="w-full">
      <label
        htmlFor={inputId}
        className={cn(
          'mb-1.5 block text-xs font-medium uppercase tracking-wide text-text-secondary',
          hideLabel && 'sr-only'
        )}
      >
        {label}
      </label>
      <input
        id={inputId}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? errorId : helper ? helperId : undefined}
        className={cn(
          // h-11 = 44px touch target; focus colours are brand-ink because
          // brand-strong measured 1.75:1 on white — an invisible focus state.
          'h-11 w-full rounded-md border bg-surface px-3 text-base text-text-primary',
          'transition-[border-color,box-shadow] duration-150',
          'placeholder:text-text-placeholder',
          'focus:outline-none focus:border-brand-ink focus:ring-2 focus:ring-brand-ink/25',
          'disabled:cursor-not-allowed disabled:opacity-50',
          error ? 'border-error focus:border-error focus:ring-error/20' : 'border-border-subtle',
          className
        )}
        {...props}
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