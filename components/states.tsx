import { AlertTriangle, type LucideIcon } from 'lucide-react'
import type { ReactNode } from 'react'
import { buttonClasses } from '@/lib/ui'
import { cn } from '@/lib/utils'

export function Skeleton({ className }: { className?: string }) {
  return <div className={cn('animate-pulse rounded-xl bg-surface-container', className)} />
}

export function PostCardSkeleton() {
  return (
    <div className="flex flex-col gap-space-sm" aria-hidden>
      <Skeleton className="aspect-[16/10] w-full" />
      <Skeleton className="h-3 w-20" />
      <Skeleton className="h-6 w-11/12" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-2/3" />
    </div>
  )
}

export function PostGridSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div role="status" aria-label="Loading stories" className="grid grid-cols-1 gap-x-gutter gap-y-space-xl sm:grid-cols-2">
      {Array.from({ length: count }, (_, i) => (
        <PostCardSkeleton key={i} />
      ))}
    </div>
  )
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
}: {
  icon: LucideIcon
  title: string
  description: string
  action?: ReactNode
}) {
  return (
    <div className="flex flex-col items-center rounded-xl border border-dashed border-outline-variant px-space-lg py-space-2xl text-center">
      <span className="mb-space-md flex size-12 items-center justify-center rounded-full bg-surface-container text-primary">
        <Icon className="size-5" aria-hidden />
      </span>
      <h3 className="font-serif text-headline-sm text-on-surface">{title}</h3>
      <p className="mt-space-xs max-w-sm font-sans text-body-sm text-on-surface-variant">{description}</p>
      {action && <div className="mt-space-lg">{action}</div>}
    </div>
  )
}

export function ErrorState({
  title = 'Something went wrong',
  description = 'We could not load this content. Please try again.',
  onRetry,
}: {
  title?: string
  description?: string
  onRetry?: () => void
}) {
  return (
    <div
      role="alert"
      className="flex flex-col items-center rounded-xl border border-error-container bg-error-container/30 px-space-lg py-space-xl text-center"
    >
      <AlertTriangle className="mb-space-sm size-6 text-error" aria-hidden />
      <h3 className="font-serif text-headline-sm text-on-surface">{title}</h3>
      <p className="mt-space-xs max-w-sm font-sans text-body-sm text-on-surface-variant">{description}</p>
      {onRetry && (
        <button type="button" onClick={onRetry} className={buttonClasses('secondary', 'md', 'mt-space-md')}>
          Try again
        </button>
      )}
    </div>
  )
}
