'use client'

import { ShieldAlert } from 'lucide-react'
import Link from 'next/link'
import { useAuth } from '@/lib/auth-context'
import { usePost } from '@/lib/hooks'
import { buttonClasses } from '@/lib/ui'
import { PostEditor } from './post-editor'
import { RequireAuth } from './require-auth'
import { EmptyState, ErrorState, Skeleton } from './states'

function EditInner({ id }: { id: string }) {
  const { user } = useAuth()
  const { data: post, error, isLoading, mutate } = usePost(id)

  if (isLoading)
    return (
      <div className="mx-auto max-w-3xl px-margin-mobile py-space-xl sm:px-margin" role="status" aria-label="Loading story">
        <Skeleton className="h-14 w-full" />
        <Skeleton className="mt-space-lg h-96 w-full" />
      </div>
    )
  if (error || !post)
    return (
      <div className="mx-auto max-w-xl px-margin-mobile py-space-2xl">
        <ErrorState title="Story unavailable" description="This story could not be loaded for editing." onRetry={() => mutate()} />
      </div>
    )
  if (post.author.id !== user?.id)
    return (
      <div className="mx-auto max-w-xl px-margin-mobile py-space-2xl">
        <EmptyState
          icon={ShieldAlert}
          title="You can only edit your own stories"
          description="This story belongs to another author."
          action={
            <Link href={`/posts/${post.id}`} className={buttonClasses('secondary')}>
              View story
            </Link>
          }
        />
      </div>
    )
  return <PostEditor key={post.id} post={post} />
}

export function EditPostView({ id }: { id: string }) {
  return (
    <RequireAuth message="Sign in to edit your story.">
      <EditInner id={id} />
    </RequireAuth>
  )
}
