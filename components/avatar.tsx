import { cn, initials } from '@/lib/utils'

const TONES = [
  'bg-primary-fixed text-on-primary-fixed',
  'bg-secondary-fixed text-on-secondary-fixed',
  'bg-tertiary-fixed text-on-tertiary-fixed',
  'bg-surface-container-highest text-on-surface',
]

const SIZES = {
  xs: 'size-6 text-[10px]',
  sm: 'size-8 text-label-sm',
  md: 'size-10 text-label-md',
  lg: 'size-14 text-body-md',
  xl: 'size-20 text-headline-sm',
}

export function Avatar({ name, size = 'md', className }: { name: string; size?: keyof typeof SIZES; className?: string }) {
  const tone = TONES[[...name].reduce((sum, ch) => sum + ch.charCodeAt(0), 0) % TONES.length]
  return (
    <span
      aria-hidden
      className={cn(
        'inline-flex shrink-0 select-none items-center justify-center rounded-full font-label font-semibold',
        tone,
        SIZES[size],
        className,
      )}
    >
      {initials(name)}
    </span>
  )
}
