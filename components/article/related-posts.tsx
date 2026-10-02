'use client'

import Link from 'next/link'
import { usePosts } from '@/lib/hooks'
import type { Post } from '@/lib/types'
import { readingMinutes } from '@/lib/utils'

export function RelatedPosts({ post }: { post: Post }) {
  const { data } = usePosts()
  if (!data) return null
  const others = data.filter((p) => p.id !== post.id)
  const related = [...others.filter((p) => p.category === post.category), ...others.filter((p) => p.category !== post.category)].slice(0, 3)
  if (related.length === 0) return null
  return (
    <section aria-labelledby="related-heading">
      <h2 id="related-heading" className="mb-space-md font-label text-label-sm font-bold uppercase tracking-widest text-on-surface-variant">
        Keep reading
      </h2>
      <ul className="flex flex-col gap-space-md">
        {related.map((p) => (
          <li key={p.id}>
            <Link href={`/posts/${p.id}`} className="group block">
              <p className="font-serif text-body-md font-medium text-on-surface group-hover:text-primary">{p.title}</p>
              <p className="mt-0.5 font-label text-label-sm text-on-surface-variant">
                {`${p.author.name} · ${readingMinutes(p.content)} min read`}
              </p>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  )
}
