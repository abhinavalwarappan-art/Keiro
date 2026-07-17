'use client'

import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const buttonVariants = cva(
  [
    'inline-flex items-center justify-center gap-2 font-medium rounded-md select-none',
    'transition-[color,background-color,border-color,box-shadow,transform] duration-150',
    'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-ink',
    'disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none',
    'active:scale-[0.98]',
  ].join(' '),
  {
    variants: {
      variant: {
        primary:
          'bg-brand-ink text-white shadow-xs hover:bg-brand-ink-hover active:bg-brand-ink-active',
        secondary:
          'bg-surface text-text-secondary border border-border-subtle hover:bg-sunken hover:text-text-primary hover:border-border-default',
        ghost:
          'bg-transparent text-text-secondary hover:bg-sunken hover:text-text-primary',
        destructive:
          'bg-error text-white hover:bg-red-700',
        link:
          'bg-transparent text-brand-ink underline-offset-4 hover:underline p-0 h-auto active:scale-100',
      },
      /* Every size clears the 44px touch minimum and 14px text floor — the
         patient base skews older, so no variant is allowed to go smaller. */
      size: {
        sm: 'h-11 px-4 text-sm',
        md: 'h-12 px-5 text-base',
        lg: 'h-14 px-6 text-base',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
    },
  }
)

interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    Omit<VariantProps<typeof buttonVariants>, 'variant'> {
  /** `danger` kept as an alias of `destructive` for older call sites */
  variant?: 'primary' | 'secondary' | 'ghost' | 'destructive' | 'danger' | 'link'
  loading?: boolean
}

function Spinner() {
  return (
    <span
      aria-hidden
      className="inline-block size-4 shrink-0 rounded-full border-2 border-current border-t-transparent animate-spin"
    />
  )
}

export function Button({
  variant = 'primary',
  size,
  loading = false,
  disabled,
  className,
  children,
  ...props
}: ButtonProps) {
  const resolvedVariant = variant === 'danger' ? 'destructive' : variant

  return (
    <button
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      className={cn(buttonVariants({ variant: resolvedVariant, size }), className)}
      {...props}
    >
      {/* Spinner joins the label — width stays stable, label stays readable */}
      {loading && <Spinner />}
      {children}
    </button>
  )
}

export default Button

export { buttonVariants }