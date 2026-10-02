'use client'

import { Bookmark, FileText, Heart, Loader2, PenLine, PenSquare, Trash2 } from 'lucide-react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { useState, type FormEvent } from 'react'
import { api } from '@/lib/api'
import { useAuth } from '@/lib/auth-context'
import { usePosts, useRevalidatePosts } from '@/lib/hooks'
import { useReactions } from '@/lib/reactions-context'
import type { Post, User } from '@/lib/types'
import { buttonClasses, inputClasses, labelClasses } from '@/lib/ui'
import { cn, formatDate, readingMinutes } from '@/lib/utils'
import { Avatar } from './avatar'
import { PostCard } from './post-card'
import { useLikeCount } from './reaction-buttons'
import { RequireAuth } from './require-auth'
import { EmptyState, ErrorState, PostGridSkeleton, Skeleton } from './states'
import { useToast } from './toast'

const TABS = [
  { key: 'stories', label: 'My stories' },
  { key: 'bookmarks', label: 'Bookmarks' },
  { key: 'profile', label: 'Profile' },
] as const

function StoryRow({ post }: { post: Post }) {
  const { token } = useAuth()
  const toast = useToast()
  const revalidate = useRevalidatePosts()
  const likes = useLikeCount(post)
  const [confirming, setConfirming] = useState(false)
  const [deleting, setDeleting] = useState(false)

  const onDelete = async () => {
    setDeleting(true)
    try {
      await api.posts.remove(token!, post.id)
      await revalidate()
      toast('Story deleted')
    } catch (err) {
      toast((err as Error).message, 'error')
      setDeleting(false)
    }
  }

  return (
    <li className="flex flex-col gap-space-sm py-space-md sm:flex-row sm:items-center sm:justify-between">
      <div className="min-w-0">
        <Link href={`/posts/${post.id}`} className="font-serif text-headline-sm text-on-surface hover:text-primary">
          {post.title}
        </Link>
        <p className="mt-1 flex flex-wrap items-center gap-x-space-sm font-label text-label-md text-on-surface-variant">
          <span>{post.category}</span>
          <span aria-hidden>·</span>
          <span>{formatDate(post.created_at)}</span>
          <span aria-hidden>·</span>
          <span>{`${readingMinutes(post.content)} min`}</span>
          <span aria-hidden>·</span>
          <span className="inline-flex items-center gap-1">
            <Heart className="size-3.5" aria-hidden />
            {likes}
          </span>
        </p>
      </div>
      <div className="flex shrink-0 items-center gap-space-sm">
        {confirming ? (
          <>
            <span className="font-label text-label-md text-on-surface-variant">Delete this story?</span>
            <button type="button" onClick={onDelete} disabled={deleting} className={buttonClasses('danger', 'sm')}>
              {deleting && <Loader2 className="size-3.5 animate-spin" aria-hidden />}
              Delete
            </button>
            <button type="button" onClick={() => setConfirming(false)} className={buttonClasses('ghost', 'sm')}>
              Cancel
            </button>
          </>
        ) : (
          <>
            <Link href={`/posts/${post.id}/edit`} className={buttonClasses('secondary', 'sm')}>
              <PenLine className="size-3.5" aria-hidden />
              Edit
            </Link>
            <button
              type="button"
              onClick={() => setConfirming(true)}
              aria-label={`Delete ${post.title}`}
              className={buttonClasses('ghost', 'sm', 'hover:text-error')}
            >
              <Trash2 className="size-3.5" aria-hidden />
            </button>
          </>
        )}
      </div>
    </li>
  )
}

function MyStories({ posts, isLoading, error, retry }: { posts?: Post[]; isLoading: boolean; error: unknown; retry: () => void }) {
  if (error) return <ErrorState onRetry={retry} />
  if (isLoading)
    return (
      <div className="flex flex-col gap-space-md" role="status" aria-label="Loading stories">
        {Array.from({ length: 3 }, (_, i) => (
          <Skeleton key={i} className="h-16 w-full" />
        ))}
      </div>
    )
  if (!posts?.length)
    return (
      <EmptyState
        icon={FileText}
        title="You haven't published yet"
        description="Your stories will appear here once you publish them."
        action={
          <Link href="/write" className={buttonClasses('primary')}>
            <PenSquare className="size-4" aria-hidden />
            Write your first story
          </Link>
        }
      />
    )
  return (
    <ul className="divide-y divide-outline-variant/30">
      {posts.map((p) => (
        <StoryRow key={p.id} post={p} />
      ))}
    </ul>
  )
}

function Bookmarks() {
  const { bookmarkedIds } = useReactions()
  const { data, isLoading, error, mutate } = usePosts()
  if (error) return <ErrorState onRetry={() => mutate()} />
  if (isLoading) return <PostGridSkeleton count={2} />
  const saved = (data ?? []).filter((p) => bookmarkedIds.includes(p.id))
  if (!saved.length)
    return (
      <EmptyState
        icon={Bookmark}
        title="No bookmarks yet"
        description="Tap the bookmark icon on any story to save it for later."
        action={
          <Link href="/" className={buttonClasses('secondary')}>
            Browse stories
          </Link>
        }
      />
    )
  return (
    <div className="grid grid-cols-1 gap-x-gutter gap-y-space-xl sm:grid-cols-2">
      {saved.map((p) => (
        <PostCard key={p.id} post={p} />
      ))}
    </div>
  )
}

function ProfileForm({ user }: { user: User }) {
  const { updateProfile } = useAuth()
  const toast = useToast()
  const [saving, setSaving] = useState(false)

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const data = new FormData(e.currentTarget)
    setSaving(true)
    try {
      await updateProfile({
        name: String(data.get('name') ?? '').trim() || user.name,
        title: String(data.get('title') ?? '').trim(),
        bio: String(data.get('bio') ?? '').trim(),
      })
      toast('Profile updated')
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={onSubmit} className="flex max-w-xl flex-col gap-space-md">
      <div className="flex flex-col gap-space-xs">
        <label htmlFor="p-name" className={labelClasses}>
          Name
        </label>
        <input id="p-name" name="name" defaultValue={user.name} maxLength={80} className={inputClasses} />
      </div>
      <div className="flex flex-col gap-space-xs">
        <label htmlFor="p-email" className={labelClasses}>
          Email
        </label>
        <input id="p-email" value={user.email} disabled className={cn(inputClasses, 'opacity-60')} />
      </div>
      <div className="flex flex-col gap-space-xs">
        <label htmlFor="p-title" className={labelClasses}>
          Headline
        </label>
        <input id="p-title" name="title" defaultValue={user.title} placeholder="e.g. Product Engineer" className={inputClasses} />
      </div>
      <div className="flex flex-col gap-space-xs">
        <label htmlFor="p-bio" className={labelClasses}>
          Bio
        </label>
        <textarea id="p-bio" name="bio" defaultValue={user.bio} rows={4} maxLength={400} className={inputClasses} />
      </div>
      <button type="submit" disabled={saving} className={buttonClasses('primary', 'md', 'self-start')}>
        {saving && <Loader2 className="size-4 animate-spin" aria-hidden />}
        Save profile
      </button>
    </form>
  )
}

function DashboardInner({ user }: { user: User }) {
  const params = useSearchParams()
  const router = useRouter()
  const tab = TABS.find((t) => t.key === params.get('tab'))?.key ?? 'stories'
  const { bookmarkedIds, isLiked } = useReactions()
  const { data: posts, isLoading, error, mutate } = usePosts({ authorId: user.id })

  const totalLikes = (posts ?? []).reduce((sum, p) => sum + (p.likes ?? 0) + (isLiked(p.id) ? 1 : 0), 0)
  const totalWords = (posts ?? []).reduce((sum, p) => sum + p.content.split(/\s+/).length, 0)
  const stats = [
    { label: 'Stories', value: posts?.length ?? 0 },
    { label: 'Total likes', value: totalLikes },
    { label: 'Words written', value: totalWords.toLocaleString() },
    { label: 'Bookmarks', value: bookmarkedIds.length },
  ]

  return (
    <div className="mx-auto max-w-5xl px-margin-mobile py-space-xl sm:px-margin">
      <header className="flex flex-col gap-space-lg sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-space-md">
          <Avatar name={user.name} size="xl" />
          <div>
            <p className={labelClasses}>Dashboard</p>
            <h1 className="font-serif text-headline-lg text-on-surface">{user.name}</h1>
            {user.title && <p className="font-label text-label-md text-on-surface-variant">{user.title}</p>}
          </div>
        </div>
        <Link href="/write" className={buttonClasses('primary', 'lg', 'self-start sm:self-auto')}>
          <PenSquare className="size-4" aria-hidden />
          New story
        </Link>
      </header>

      <dl className="mt-space-xl grid grid-cols-2 gap-space-md md:grid-cols-4">
        {stats.map((s) => (
          <div key={s.label} className="rounded-xl border border-outline-variant/40 bg-surface-container-lowest p-space-md">
            <dt className="font-label text-label-sm uppercase tracking-wider text-on-surface-variant">{s.label}</dt>
            <dd className="mt-space-xs font-serif text-headline-md text-on-surface">{isLoading ? '–' : s.value}</dd>
          </div>
        ))}
      </dl>

      <div role="tablist" aria-label="Dashboard sections" className="mt-space-xl flex gap-space-lg border-b border-outline-variant/40">
        {TABS.map((t) => (
          <button
            key={t.key}
            type="button"
            role="tab"
            aria-selected={tab === t.key}
            onClick={() => router.replace(t.key === 'stories' ? '/dashboard' : `/dashboard?tab=${t.key}`, { scroll: false })}
            className={cn(
              '-mb-px border-b-2 pb-space-sm font-label text-label-md font-medium transition-colors',
              tab === t.key ? 'border-primary text-primary' : 'border-transparent text-on-surface-variant hover:text-on-surface',
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="pt-space-lg" role="tabpanel">
        {tab === 'stories' && <MyStories posts={posts} isLoading={isLoading} error={error} retry={() => mutate()} />}
        {tab === 'bookmarks' && <Bookmarks />}
        {tab === 'profile' && <ProfileForm user={user} />}
      </div>
    </div>
  )
}

export function DashboardView() {
  const { user } = useAuth()
  return (
    <RequireAuth message="Sign in to manage your stories, bookmarks and profile.">
      {user && <DashboardInner user={user} />}
    </RequireAuth>
  )
}
