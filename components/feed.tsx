'use client'

import { FileSearch, PenSquare, Search, X } from 'lucide-react'
import Link from 'next/link'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import type { FormEvent } from 'react'
import { CATEGORIES } from '@/lib/categories'
import { usePosts } from '@/lib/hooks'
import { buttonClasses } from '@/lib/ui'
import { cn } from '@/lib/utils'
import { FeaturedLead, FeaturedSecondary, PostCard } from './post-card'
import { EmptyState, ErrorState, PostGridSkeleton, Skeleton } from './states'
import { TrendingList } from './trending-list'

export function Feed() {
  const params = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()
  const q = params.get('q') ?? ''
  const category = params.get('category') ?? ''
  const sort = params.get('sort') === 'top' ? 'top' : 'latest'
  const { data: posts, error, isLoading, mutate } = usePosts({ q, category, sort })

  const setParam = (key: string, value: string) => {
    const next = new URLSearchParams(params)
    if (value) next.set(key, value)
    else next.delete(key)
    const qs = next.toString()
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false })
  }

  const onSearch = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setParam('q', String(new FormData(e.currentTarget).get('q') ?? '').trim())
  }

  const showFeatured = !q && !category && sort === 'latest'
  const featured = showFeatured ? (posts ?? []).filter((p) => p.featured).slice(0, 3) : []
  const rest = (posts ?? []).filter((p) => !featured.includes(p))
  const [lead, ...secondary] = featured

  return (
    <div className="mx-auto max-w-7xl px-margin-mobile sm:px-margin">
      <section className="border-b border-outline-variant/40 pb-space-xl pt-space-xl">
        <p className="font-label text-label-sm font-semibold uppercase tracking-widest text-primary">The Chronicle Journal</p>
        <h1 className="mt-space-sm max-w-3xl text-balance font-serif text-headline-lg text-on-surface md:text-display-hero">
          Stories on engineering, design, and the craft of building.
        </h1>
        <form onSubmit={onSearch} role="search" className="relative mt-space-lg max-w-md md:hidden">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-on-surface-variant" aria-hidden />
          <label htmlFor="feed-search" className="sr-only">
            Search stories
          </label>
          <input
            key={q}
            id="feed-search"
            name="q"
            type="search"
            defaultValue={q}
            placeholder="Search stories..."
            className="h-11 w-full rounded-lg border border-outline-variant/50 bg-surface-container-lowest pl-9 pr-3 font-label text-body-sm text-on-surface focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </form>
      </section>

      {showFeatured && (
        <section aria-labelledby="featured-heading" className="border-b border-outline-variant/40 py-space-xl">
          <h2 id="featured-heading" className="sr-only">
            Featured stories
          </h2>
          {isLoading ? (
            <div className="grid gap-space-lg md:grid-cols-5">
              <Skeleton className="aspect-[16/10] md:col-span-3" />
              <div className="flex flex-col gap-space-sm md:col-span-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-4 w-full" />
              </div>
            </div>
          ) : (
            lead && (
              <>
                <FeaturedLead post={lead} />
                {secondary.length > 0 && (
                  <div className="mt-space-xl grid grid-cols-1 gap-space-lg border-t border-outline-variant/30 pt-space-lg md:grid-cols-2">
                    {secondary.map((p) => (
                      <FeaturedSecondary key={p.id} post={p} />
                    ))}
                  </div>
                )}
              </>
            )
          )}
        </section>
      )}

      <div className="grid grid-cols-1 gap-space-xl py-space-xl lg:grid-cols-12">
        <section aria-labelledby="stories-heading" className="lg:col-span-8">
          <div className="mb-space-lg flex flex-col gap-space-md">
            <div className="flex flex-wrap items-end justify-between gap-space-sm">
              <h2 id="stories-heading" className="font-serif text-headline-md text-on-surface">
                {q ? `Results for "${q}"` : category || (sort === 'top' ? 'Top stories' : 'Latest stories')}
              </h2>
              <div className="flex items-center gap-space-xs rounded-lg bg-surface-container-low p-1" role="group" aria-label="Sort">
                {(['latest', 'top'] as const).map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setParam('sort', s === 'top' ? 'top' : '')}
                    aria-pressed={sort === s}
                    className={cn(
                      'rounded-md px-space-sm py-1 font-label text-label-md capitalize transition-colors',
                      sort === s ? 'bg-surface-container-lowest text-on-surface shadow-sm' : 'text-on-surface-variant hover:text-on-surface',
                    )}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            <div
              role="group"
              aria-label="Filter by category"
              className="-mx-margin-mobile flex gap-space-sm overflow-x-auto px-margin-mobile pb-1 [scrollbar-width:none] sm:mx-0 sm:flex-wrap sm:px-0"
            >
              {['', ...CATEGORIES].map((c) => (
                <button
                  key={c || 'all'}
                  type="button"
                  onClick={() => setParam('category', c)}
                  aria-pressed={category === c}
                  className={cn(
                    'shrink-0 rounded-full border px-space-md py-1.5 font-label text-label-md transition-colors',
                    category === c
                      ? 'border-primary bg-primary text-on-primary'
                      : 'border-outline-variant/60 text-on-surface-variant hover:border-primary hover:text-primary',
                  )}
                >
                  {c || 'All'}
                </button>
              ))}
            </div>

            {(q || category) && posts && (
              <div className="flex items-center gap-space-sm font-label text-label-md text-on-surface-variant">
                <span>{`${posts.length} ${posts.length === 1 ? 'story' : 'stories'}`}</span>
                <button
                  type="button"
                  onClick={() => router.replace(pathname, { scroll: false })}
                  className="inline-flex items-center gap-1 text-primary hover:underline"
                >
                  <X className="size-3.5" aria-hidden />
                  Clear filters
                </button>
              </div>
            )}
          </div>

          {error ? (
            <ErrorState description="We could not load stories right now." onRetry={() => mutate()} />
          ) : isLoading ? (
            <PostGridSkeleton />
          ) : rest.length === 0 && featured.length === 0 ? (
            <EmptyState
              icon={FileSearch}
              title="No stories found"
              description={q ? 'Try a different search term or browse another category.' : 'Nothing has been published in this category yet.'}
              action={
                <Link href="/write" className={buttonClasses('primary')}>
                  <PenSquare className="size-4" aria-hidden />
                  Write the first one
                </Link>
              }
            />
          ) : (
            <div className="grid grid-cols-1 gap-x-gutter gap-y-space-xl sm:grid-cols-2">
              {rest.map((post) => (
                <PostCard key={post.id} post={post} />
              ))}
            </div>
          )}
        </section>

        <aside className="lg:col-span-4">
          <div className="flex flex-col gap-space-xl lg:sticky lg:top-24">
            <TrendingList />
            <div className="rounded-xl border border-primary-fixed bg-primary-fixed/30 p-space-lg">
              <h2 className="font-serif text-headline-sm text-on-surface">Share what you&apos;re learning</h2>
              <p className="mt-space-xs font-sans text-body-sm text-on-surface-variant">
                Publish a story and start a conversation with engineers and designers.
              </p>
              <Link href="/write" className={buttonClasses('primary', 'md', 'mt-space-md')}>
                <PenSquare className="size-4" aria-hidden />
                Start writing
              </Link>
            </div>
          </div>
        </aside>
      </div>
    </div>
  )
}
