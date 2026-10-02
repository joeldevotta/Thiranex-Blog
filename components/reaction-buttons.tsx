'use client'

import { Bookmark, Heart, Share2 } from 'lucide-react'
import { useReactions } from '@/lib/reactions-context'
import type { Post } from '@/lib/types'
import { cn } from '@/lib/utils'
import { useAuthAction } from './require-auth'
import { useToast } from './toast'

export function useLikeCount(post: Pick<Post, 'id' | 'likes'>) {
  const { isLiked } = useReactions()
  return (post.likes ?? 0) + (isLiked(post.id) ? 1 : 0)
}

export function LikeButton({ post, className, showCount = true }: { post: Post; className?: string; showCount?: boolean }) {
  const { isLiked, toggleLike } = useReactions()
  const guard = useAuthAction()
  const liked = isLiked(post.id)
  const count = useLikeCount(post)
  return (
    <button
      type="button"
      onClick={() => guard(() => toggleLike(post.id))}
      aria-pressed={liked}
      aria-label={liked ? 'Unlike story' : 'Like story'}
      className={cn(
        'inline-flex items-center gap-1.5 font-label text-label-md transition-colors',
        liked ? 'text-error' : 'text-on-surface-variant hover:text-error',
        className,
      )}
    >
      <Heart className={cn('size-5', liked && 'fill-current')} aria-hidden />
      {showCount && <span className="tabular-nums">{count}</span>}
    </button>
  )
}

export function BookmarkButton({ postId, className, label = false }: { postId: string; className?: string; label?: boolean }) {
  const { isBookmarked, toggleBookmark } = useReactions()
  const guard = useAuthAction()
  const toast = useToast()
  const saved = isBookmarked(postId)
  return (
    <button
      type="button"
      onClick={() =>
        guard(() => {
          toggleBookmark(postId)
          toast(saved ? 'Removed from bookmarks' : 'Saved to bookmarks')
        })
      }
      aria-pressed={saved}
      aria-label={saved ? 'Remove bookmark' : 'Bookmark story'}
      className={cn(
        'inline-flex items-center gap-1.5 font-label text-label-md transition-colors',
        saved ? 'text-primary' : 'text-on-surface-variant hover:text-primary',
        className,
      )}
    >
      <Bookmark className={cn('size-5', saved && 'fill-current')} aria-hidden />
      {label && <span>{saved ? 'Saved' : 'Save'}</span>}
    </button>
  )
}

export function ShareButton({ post, className, label = false }: { post: Post; className?: string; label?: boolean }) {
  const toast = useToast()
  const onShare = async () => {
    const url = `${window.location.origin}/posts/${post.id}`
    try {
      if (navigator.share) {
        await navigator.share({ title: post.title, text: post.excerpt, url })
        return
      }
      await navigator.clipboard.writeText(url)
      toast('Link copied to clipboard')
    } catch (err) {
      if ((err as Error).name !== 'AbortError') toast('Could not share this story', 'error')
    }
  }
  return (
    <button
      type="button"
      onClick={onShare}
      aria-label="Share story"
      className={cn(
        'inline-flex items-center gap-1.5 font-label text-label-md text-on-surface-variant transition-colors hover:text-primary',
        className,
      )}
    >
      <Share2 className="size-5" aria-hidden />
      {label && <span>Share</span>}
    </button>
  )
}
