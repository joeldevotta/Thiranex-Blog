import { Suspense } from 'react'
import { Feed } from '@/components/feed'
import { PostGridSkeleton } from '@/components/states'

export default function HomePage() {
  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-7xl px-margin-mobile py-space-xl sm:px-margin">
          <PostGridSkeleton />
        </div>
      }
    >
      <Feed />
    </Suspense>
  )
}
