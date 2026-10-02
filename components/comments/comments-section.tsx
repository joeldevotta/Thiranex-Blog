'use client'

import { MessagesSquare } from 'lucide-react'
import { useState } from 'react'
import { api } from '@/lib/api'
import { useAuth } from '@/lib/auth-context'
import { useComments } from '@/lib/hooks'
import type { Comment, Post } from '@/lib/types'
import { buttonClasses } from '@/lib/ui'
import { EmptyState, ErrorState, Skeleton } from '../states'
import { useToast } from '../toast'
import { CommentForm } from './comment-form'
import { CommentItem, type CommentNode } from './comment-item'

const PAGE_SIZE = 5

function buildTree(comments: Comment[], sort: 'top' | 'recent') {
  const nodes = new Map<string, CommentNode>(comments.map((c) => [c.id, { ...c, replies: [] }]))
  const roots: CommentNode[] = []
  for (const node of nodes.values()) {
    const parent = node.parent_id ? nodes.get(node.parent_id) : undefined
    if (parent) parent.replies.push(node)
    else roots.push(node)
  }
  for (const node of nodes.values()) node.replies.sort((a, b) => a.created_at.localeCompare(b.created_at))
  return roots.sort((a, b) =>
    sort === 'top' ? (b.likes ?? 0) - (a.likes ?? 0) || b.created_at.localeCompare(a.created_at) : b.created_at.localeCompare(a.created_at),
  )
}

export function CommentsSection({ post }: { post: Post }) {
  const { token } = useAuth()
  const toast = useToast()
  const { data: comments, error, isLoading, mutate } = useComments(post.id)
  const [sort, setSort] = useState<'top' | 'recent'>('top')
  const [visible, setVisible] = useState(PAGE_SIZE)

  const roots = buildTree(comments ?? [], sort)

  const handlers = {
    onReply: async (parentId: string, content: string) => {
      await api.comments.create(token!, post.id, { content, parent_id: parentId })
      await mutate()
    },
    onEdit: async (id: string, content: string) => {
      await api.comments.update(token!, id, content)
      await mutate()
    },
    onDelete: async (id: string) => {
      try {
        await api.comments.remove(token!, id)
        await mutate()
        toast('Response deleted')
      } catch (err) {
        toast((err as Error).message, 'error')
      }
    },
  }

  return (
    <section id="comments" aria-labelledby="comments-heading" className="mt-space-2xl border-t border-outline-variant/40 pt-space-xl">
      <div className="mb-space-lg flex items-center justify-between gap-space-md">
        <h2 id="comments-heading" className="font-serif text-headline-md text-on-surface">
          {`Responses (${comments?.length ?? 0})`}
        </h2>
        <label className="flex items-center gap-space-sm font-label text-label-md text-on-surface-variant">
          <span className="hidden sm:inline">Sort by</span>
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as 'top' | 'recent')}
            className="rounded-lg border border-outline-variant/50 bg-surface-container-lowest px-space-sm py-1 font-label text-label-md text-on-surface focus:border-primary focus:outline-none"
          >
            <option value="top">Top</option>
            <option value="recent">Most recent</option>
          </select>
        </label>
      </div>

      <div className="mb-space-xl">
        <CommentForm
          onSubmit={async (content) => {
            await api.comments.create(token!, post.id, { content })
            await mutate()
            setSort('recent')
          }}
        />
      </div>

      {error ? (
        <ErrorState description="Responses could not be loaded." onRetry={() => mutate()} />
      ) : isLoading ? (
        <div className="flex flex-col gap-space-lg" role="status" aria-label="Loading responses">
          {Array.from({ length: 3 }, (_, i) => (
            <div key={i} className="flex gap-space-md">
              <Skeleton className="size-10 rounded-full" />
              <div className="flex flex-1 flex-col gap-space-sm">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-4 w-full" />
              </div>
            </div>
          ))}
        </div>
      ) : roots.length === 0 ? (
        <EmptyState icon={MessagesSquare} title="No responses yet" description="Be the first to share what you think." />
      ) : (
        <>
          <ul className="flex flex-col gap-space-xl">
            {roots.slice(0, visible).map((node) => (
              <CommentItem key={node.id} node={node} postAuthorId={post.author.id} handlers={handlers} />
            ))}
          </ul>
          {roots.length > visible && (
            <button
              type="button"
              onClick={() => setVisible((v) => v + PAGE_SIZE)}
              className={buttonClasses('secondary', 'lg', 'mt-space-xl w-full')}
            >
              {`Show more responses (${roots.length - visible})`}
            </button>
          )}
        </>
      )}
    </section>
  )
}
