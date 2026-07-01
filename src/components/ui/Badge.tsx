import { cn } from '@/lib/utils'

type BadgeVariant = 'default' | 'brand' | 'success' | 'warning' | 'error'

const VARIANTS: Record<BadgeVariant, string> = {
  default: 'bg-sunken text-text-secondary border border-border-subtle',
  brand: 'bg-brand-subtle text-brand-ink border border-brand-muted',
  success: 'bg-success-subtle text-success-text border border-success/15',
  warning: 'bg-warning-subtle text-warning-text border border-warning/15',
  error: 'bg-error-subtle text-error-text border border-error/15',
}

interface BadgeProps {
  variant?: BadgeVariant
  className?: string
  children: React.ReactNode
}

export function Badge({ variant = 'default', className, children }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium',
        VARIANTS[variant],
        className
      )}
    >
      {children}
    </span>
  )
}