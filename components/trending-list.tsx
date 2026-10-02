'use client'

import { TrendingUp } from 'lucide-react'
import Link from 'next/link'
import { usePosts } from '@/lib/hooks'
import { readingMinutes } from '@/lib/utils'
import { Skeleton } from './states'

export function TrendingList() {
  const { data, isLoading } = usePosts({ sort: 'top' })
  return (
    <section aria-labelledby="trending-heading">
      <h2
        id="trending-heading"
        className="mb-space-md flex items-center gap-space-sm font-label text-label-sm font-semibold uppercase tracking-widest text-on-surface-variant"
      >
        <TrendingUp className="size-4 text-primary" aria-hidden />
        Trending on Chronicle
      </h2>
      <ol className="flex flex-col gap-space-md">
        {isLoading
          ? Array.from({ length: 4 }, (_, i) => (
              <li key={i}>
                <Skeleton className="h-12 w-full" />
              </li>
            ))
          : data?.slice(0, 5).map((post, i) => (
              <li key={post.id} className="flex gap-space-md">
                <span className="font-serif text-headline-md italic leading-none text-outline-variant">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <div className="min-w-0">
                  <p className="font-label text-label-md text-on-surface">{post.author.name}</p>
                  <Link
                    href={`/posts/${post.id}`}
                    className="line-clamp-2 font-serif text-body-md font-medium text-on-surface hover:text-primary"
                  >
                    {post.title}
                  </Link>
                  <p className="mt-0.5 font-label text-label-sm text-on-surface-variant">{`${readingMinutes(post.content)} min read`}</p>
                </div>
              </li>
            ))}
      </ol>
    </section>
  )
}
