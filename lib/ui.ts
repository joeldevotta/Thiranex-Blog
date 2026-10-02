import { cn } from './utils'

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger'
type Size = 'sm' | 'md' | 'lg'

const VARIANTS: Record<Variant, string> = {
  primary: 'bg-primary text-on-primary hover:bg-primary-container shadow-sm',
  secondary: 'bg-surface-container text-on-surface hover:bg-surface-container-high',
  ghost: 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container',
  danger: 'bg-error text-on-error hover:opacity-90',
}

const SIZES: Record<Size, string> = {
  sm: 'h-8 px-space-sm text-label-md gap-1',
  md: 'h-9 px-space-md text-label-md gap-space-xs',
  lg: 'h-11 px-space-lg text-body-sm gap-space-sm',
}

export function buttonClasses(variant: Variant = 'primary', size: Size = 'md', className?: string) {
  return cn(
    'inline-flex items-center justify-center rounded-lg font-label font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-surface disabled:opacity-50 disabled:pointer-events-none',
    VARIANTS[variant],
    SIZES[size],
    className,
  )
}

export const inputClasses =
  'w-full rounded-lg border border-outline-variant/60 bg-surface-container-lowest px-space-sm py-space-sm font-sans text-body-sm text-on-surface placeholder:text-on-surface-variant/60 transition-colors focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary'

export const labelClasses = 'font-label text-label-sm font-semibold uppercase tracking-wider text-on-surface-variant'
