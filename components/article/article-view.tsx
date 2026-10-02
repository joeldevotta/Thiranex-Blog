'use client'

import { ArrowLeft, FileX2, MessageSquare, PenLine } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { ApiError } from '@/lib/api'
import { useAuth } from '@/lib/auth-context'
import { categoryTone } from '@/lib/categories'
import { useComments, usePost } from '@/lib/hooks'
import type { Post } from '@/lib/types'
import { buttonClasses } from '@/lib/ui'
import { cn, formatDate, readingMinutes } from '@/lib/utils'
import { Avatar } from '../avatar'
import { CommentsSection } from '../comments/comments-section'
import { BookmarkButton, LikeButton, ShareButton } from '../reaction-buttons'
import { EmptyState, ErrorState, Skeleton } from '../states'
import { ArticleBody, getHeadings } from './article-body'
import { AuthorCard } from './author-card'
import { ReadingProgress } from './reading-progress'
import { RelatedPosts } from './related-posts'

function CommentCountLink({ postId, className }: { postId: string; className?: string }) {
  const { data } = useComments(postId)
  return (
    <a
      href="#comments"
      aria-label="Jump to responses"
      className={cn('inline-flex items-center gap-1.5 font-label text-label-md text-on-surface-variant hover:text-primary', className)}
    >
      <MessageSquare className="size-5" aria-hidden />
      <span className="tabular-nums">{data?.length ?? 0}</span>
    </a>
  )
}

function ActionRail({ post }: { post: Post }) {
  return (
    <div className="sticky top-32 flex flex-col items-center gap-space-lg rounded-xl border border-outline-variant/30 bg-surface-container-lowest py-space-md shadow-sm">
      <LikeButton post={post} className="flex-col gap-1 text-label-sm" />
      <CommentCountLink postId={post.id} className="flex-col gap-1 text-label-sm" />
      <span className="h-px w-6 bg-outline-variant/40" aria-hidden />
      <BookmarkButton postId={post.id} />
      <ShareButton post={post} />
    </div>
  )
}

function ArticleSkeleton() {
  return (
    <div role="status" aria-label="Loading story" className="mx-auto max-w-3xl px-margin-mobile py-space-xl sm:px-margin">
      <Skeleton className="h-4 w-32" />
      <Skeleton className="mt-space-md h-12 w-full" />
      <Skeleton className="mt-space-sm h-12 w-3/4" />
      <Skeleton className="mt-space-lg h-10 w-64" />
      <Skeleton className="mt-space-xl aspect-[21/9] w-full" />
      <div className="mt-space-xl flex flex-col gap-space-sm">
        {Array.from({ length: 6 }, (_, i) => (
          <Skeleton key={i} className="h-5 w-full" />
        ))}
      </div>
    </div>
  )
}

export function ArticleView({ id }: { id: string }) {
  const { data: post, error, isLoading, mutate } = usePost(id)
  const { user } = useAuth()

  if (isLoading) return <ArticleSkeleton />
  if (error || !post) {
    const notFound = error instanceof ApiError && error.status === 404
    return (
      <div className="mx-auto max-w-xl px-margin-mobile py-space-2xl">
        {notFound ? (
          <EmptyState
            icon={FileX2}
            title="Story not found"
            description="This story may have been deleted or the link is incorrect."
            action={
              <Link href="/" className={buttonClasses('primary')}>
                Back to the feed
              </Link>
            }
          />
        ) : (
          <ErrorState description="We could not load this story." onRetry={() => mutate()} />
        )}
      </div>
    )
  }

  const headings = getHeadings(post.content)
  const isAuthor = user?.id === post.author.id

  return (
    <>
      <ReadingProgress />
      <div className="mx-auto max-w-7xl px-margin-mobile pb-space-2xl pt-space-xl sm:px-margin">
        <div className="grid grid-cols-1 gap-gutter lg:grid-cols-12">
          <aside className="hidden lg:col-span-1 lg:block" aria-label="Story actions">
            <ActionRail post={post} />
          </aside>

          <article className="lg:col-span-8">
            <Link
              href="/"
              className="mb-space-lg inline-flex items-center gap-1 font-label text-label-md text-on-surface-variant hover:text-primary"
            >
              <ArrowLeft className="size-4" aria-hidden />
              All stories
            </Link>

            <header className="mb-space-xl">
              <div className="mb-space-md flex flex-wrap items-center gap-space-sm">
                <Link
                  href={`/?category=${encodeURIComponent(post.category)}`}
                  className={cn('font-label text-label-sm font-bold uppercase tracking-widest hover:underline', categoryTone(post.category))}
                >
                  {post.category}
                </Link>
                <span className="text-outline-variant" aria-hidden>
                  •
                </span>
                <span className="font-label text-label-md text-on-surface-variant">{`${readingMinutes(post.content)} min read`}</span>
              </div>

              <h1 className="mb-space-lg text-balance font-serif text-headline-lg text-on-surface md:text-display-hero">{post.title}</h1>
              {post.excerpt && <p className="mb-space-lg font-sans text-body-md text-on-surface-variant md:text-body-lg">{post.excerpt}</p>}

              <div className="flex flex-col justify-between gap-space-md border-y border-outline-variant/30 py-space-md sm:flex-row sm:items-center">
                <div className="flex items-center gap-space-md">
                  <Avatar name={post.author.name} size="lg" />
                  <div>
                    <p className="font-sans text-body-md font-semibold text-on-surface">{post.author.name}</p>
                    <p className="font-label text-label-md text-on-surface-variant">
                      {`Published ${formatDate(post.created_at)}`}
                      {post.updated_at !== post.created_at && ` · Updated ${formatDate(post.updated_at)}`}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-space-lg">
                  <div className="flex items-center gap-space-lg lg:hidden">
                    <LikeButton post={post} />
                    <CommentCountLink postId={post.id} />
                    <BookmarkButton postId={post.id} />
                    <ShareButton post={post} />
                  </div>
                  {isAuthor && (
                    <Link href={`/posts/${post.id}/edit`} className={buttonClasses('secondary', 'sm')}>
                      <PenLine className="size-3.5" aria-hidden />
                      Edit
                    </Link>
                  )}
                </div>
              </div>
            </header>

            {post.cover_image && (
              <figure className="mb-space-xl overflow-hidden rounded-xl border border-outline-variant/20 shadow-sm">
                <div className="relative aspect-[21/9] w-full bg-surface-container">
                  <Image src={post.cover_image} alt="" fill priority sizes="(min-width: 1024px) 800px, 100vw" className="object-cover" />
                </div>
              </figure>
            )}

            <ArticleBody content={post.content} />

            {post.tags && post.tags.length > 0 && (
              <ul className="mt-space-xl flex flex-wrap gap-space-sm border-t border-outline-variant/30 pt-space-lg" aria-label="Tags">
                {post.tags.map((tag) => (
                  <li key={tag}>
                    <Link
                      href={`/?q=${encodeURIComponent(tag)}`}
                      className="inline-block rounded-full bg-surface-container px-space-md py-space-xs font-label text-label-md text-on-surface-variant transition-colors hover:bg-primary-fixed hover:text-on-primary-fixed"
                    >
                      {`#${tag}`}
                    </Link>
                  </li>
                ))}
              </ul>
            )}

            <div className="mt-space-xl lg:hidden">
              <AuthorCard authorId={post.author.id} name={post.author.name} />
            </div>

            <CommentsSection post={post} />
          </article>

          <aside className="hidden lg:col-span-3 lg:block">
            <div className="sticky top-32 flex flex-col gap-space-xl">
              {headings.length > 0 && (
                <nav aria-label="Table of contents">
                  <h2 className="mb-space-md font-label text-label-sm font-bold uppercase tracking-widest text-on-surface-variant">
                    In this article
                  </h2>
                  <ul className="flex flex-col gap-space-sm border-l border-outline-variant/40 pl-space-md">
                    {headings.map((h) => (
                      <li key={h.id}>
                        <a href={`#${h.id}`} className="block font-sans text-body-sm text-on-surface-variant hover:text-primary">
                          {h.text}
                        </a>
                      </li>
                    ))}
                    <li>
                      <a href="#comments" className="block font-sans text-body-sm text-on-surface-variant hover:text-primary">
                        Responses
                      </a>
                    </li>
                  </ul>
                </nav>
              )}
              <AuthorCard authorId={post.author.id} name={post.author.name} />
              <RelatedPosts post={post} />
            </div>
          </aside>
        </div>
      </div>
    </>
  )
}
