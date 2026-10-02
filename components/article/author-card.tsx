'use client'

import { useAuthor, usePosts } from '@/lib/hooks'
import { Avatar } from '../avatar'

export function AuthorCard({ authorId, name }: { authorId: string; name: string }) {
  const { data: author } = useAuthor(authorId)
  const { data: posts } = usePosts({ authorId })
  return (
    <section aria-label="About the author" className="rounded-xl border border-outline-variant/30 bg-surface-container-low p-space-lg">
      <p className="mb-space-md font-label text-label-sm font-bold uppercase tracking-widest text-on-surface-variant">About the author</p>
      <div className="mb-space-md flex items-center gap-space-md">
        <Avatar name={name} size="lg" />
        <div className="min-w-0">
          <p className="font-sans text-body-md font-bold text-on-surface">{name}</p>
          {author?.title && <p className="font-label text-label-md text-on-surface-variant">{author.title}</p>}
        </div>
      </div>
      {author?.bio && <p className="font-sans text-body-sm text-on-surface-variant">{author.bio}</p>}
      {posts && (
        <p className="mt-space-md font-label text-label-md text-primary">
          {`${posts.length} ${posts.length === 1 ? 'story' : 'stories'} published`}
        </p>
      )}
    </section>
  )
}
