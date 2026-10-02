'use client'

import Image from 'next/image'
import Link from 'next/link'
import { categoryTone } from '@/lib/categories'
import type { Post } from '@/lib/types'
import { cn, formatDate, readingMinutes } from '@/lib/utils'
import { Avatar } from './avatar'
import { BookmarkButton, LikeButton } from './reaction-buttons'

function Cover({ post, className, sizes, priority }: { post: Post; className?: string; sizes: string; priority?: boolean }) {
  return (
    <Link
      href={`/posts/${post.id}`}
      tabIndex={-1}
      aria-hidden
      className={cn('relative block overflow-hidden rounded-xl bg-surface-container', className)}
    >
      {post.cover_image ? (
        <Image
          src={post.cover_image}
          alt=""
          fill
          sizes={sizes}
          priority={priority}
          className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
        />
      ) : (
        <div className="flex h-full items-end bg-gradient-to-br from-primary-fixed to-surface-container-high p-space-md">
          <span className="line-clamp-3 font-serif text-headline-sm italic text-on-primary-fixed-variant/80">{post.title}</span>
        </div>
      )}
    </Link>
  )
}

function Meta({ post }: { post: Post }) {
  return (
    <div className="flex items-center gap-space-sm">
      <Avatar name={post.author.name} size="xs" />
      <span className="font-label text-label-md text-on-surface">{post.author.name}</span>
      <span className="text-outline-variant" aria-hidden>
        •
      </span>
      <time dateTime={post.created_at} className="font-label text-label-md text-on-surface-variant">
        {formatDate(post.created_at)}
      </time>
    </div>
  )
}

function CategoryLabel({ post }: { post: Post }) {
  return (
    <span className={cn('font-label text-label-sm font-semibold uppercase tracking-widest', categoryTone(post.category))}>
      {post.category}
    </span>
  )
}

export function PostCard({ post }: { post: Post }) {
  return (
    <article className="group flex flex-col">
      <Cover post={post} className="mb-space-md aspect-[16/10]" sizes="(min-width: 1024px) 380px, (min-width: 640px) 50vw, 100vw" />
      <div className="mb-space-xs flex items-center justify-between">
        <CategoryLabel post={post} />
        <span className="font-label text-label-sm text-on-surface-variant">{`${readingMinutes(post.content)} min read`}</span>
      </div>
      <h3 className="font-serif text-headline-sm text-on-surface">
        <Link href={`/posts/${post.id}`} className="transition-colors hover:text-primary">
          {post.title}
        </Link>
      </h3>
      <p className="mt-space-xs line-clamp-2 font-sans text-body-sm text-on-surface-variant">{post.excerpt}</p>
      <div className="mt-space-md flex items-center justify-between gap-space-sm">
        <Meta post={post} />
        <div className="flex items-center gap-space-md">
          <LikeButton post={post} className="[&_svg]:size-4" />
          <BookmarkButton postId={post.id} className="[&_svg]:size-4" />
        </div>
      </div>
    </article>
  )
}

export function FeaturedLead({ post }: { post: Post }) {
  return (
    <article className="group grid grid-cols-1 gap-space-lg md:grid-cols-5 md:items-center">
      <Cover
        post={post}
        priority
        className="aspect-[16/10] md:col-span-3"
        sizes="(min-width: 1024px) 720px, (min-width: 768px) 60vw, 100vw"
      />
      <div className="flex flex-col md:col-span-2">
        <div className="mb-space-sm flex items-center gap-space-sm">
          <span className="rounded-lg bg-primary-fixed px-space-sm py-0.5 font-label text-label-sm font-semibold uppercase tracking-widest text-on-primary-fixed-variant">
            Featured
          </span>
          <CategoryLabel post={post} />
        </div>
        <h2 className="font-serif text-headline-md text-on-surface lg:text-headline-lg">
          <Link href={`/posts/${post.id}`} className="transition-colors hover:text-primary">
            {post.title}
          </Link>
        </h2>
        <p className="mt-space-sm line-clamp-3 font-sans text-body-md text-on-surface-variant">{post.excerpt}</p>
        <div className="mt-space-lg flex flex-wrap items-center justify-between gap-space-sm">
          <Meta post={post} />
          <span className="font-label text-label-sm text-on-surface-variant">{`${readingMinutes(post.content)} min read`}</span>
        </div>
      </div>
    </article>
  )
}

export function FeaturedSecondary({ post }: { post: Post }) {
  return (
    <article className="group flex gap-space-md">
      <Cover post={post} className="aspect-square w-24 shrink-0 sm:w-32" sizes="128px" />
      <div className="flex min-w-0 flex-col justify-center">
        <CategoryLabel post={post} />
        <h3 className="mt-space-xs line-clamp-2 font-serif text-headline-sm text-on-surface">
          <Link href={`/posts/${post.id}`} className="transition-colors hover:text-primary">
            {post.title}
          </Link>
        </h3>
        <p className="mt-space-xs font-label text-label-md text-on-surface-variant">
          {`${post.author.name} · ${readingMinutes(post.content)} min read`}
        </p>
      </div>
    </article>
  )
}
