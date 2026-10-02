'use client'

import { ErrorState } from '@/components/states'

export default function Error({ reset }: { error: Error; reset: () => void }) {
  return (
    <div className="mx-auto max-w-xl px-margin-mobile py-space-2xl">
      <ErrorState description="An unexpected error occurred while rendering this page." onRetry={reset} />
    </div>
  )
}
