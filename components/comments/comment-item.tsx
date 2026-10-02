'use client'

import { Heart, Reply } from 'lucide-react'
import { useState } from 'react'
import { useAuth } from '@/lib/auth-context'
import { useReactions } from '@/lib/reactions-context'
import type { Comment } from '@/lib/types'
import { cn, timeAgo } from '@/lib/utils'
import { Avatar } from '../avatar'
import { useAuthAction } from '../require-auth'
import { CommentForm } from './comment-form'

export type CommentNode = Comment & { replies: CommentNode[] }

type Handlers = {
  onReply: (parentId: string, content: string) => Promise<void>
  onEdit: (id: string, content: string) => Promise<void>
  onDelete: (id: string) => Promise<void>
}

const countReplies = (node: CommentNode): number => node.replies.reduce((n, r) => n + 1 + countReplies(r), 0)

export function CommentItem({
  node,
  postAuthorId,
  depth = 0,
  handlers,
}: {
  node: CommentNode
  postAuthorId: string
  depth?: number
  handlers: Handlers
}) {
  const { user } = useAuth()
  const { isLiked, toggleLike } = useReactions()
  const guard = useAuthAction()
  const [replying, setReplying] = useState(false)
  const [editing, setEditing] = useState(false)
  const [collapsed, setCollapsed] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)

  const liked = isLiked(node.id)
  const likes = (node.likes ?? 0) + (liked ? 1 : 0)
  const isOwn = user?.id === node.author.id
  const total = countReplies(node)

  return (
    <li className="flex gap-space-sm sm:gap-space-md">
      <Avatar name={node.author.name} size={depth === 0 ? 'md' : 'sm'} />
      <div className="min-w-0 flex-1">
        <div className="mb-space-xs flex flex-wrap items-center gap-x-space-sm gap-y-1">
          <span className="font-sans text-body-sm font-bold text-on-surface">{node.author.name}</span>
          {node.author.id === postAuthorId && (
            <span className="rounded bg-primary-fixed px-1.5 py-0.5 font-label text-[10px] font-bold uppercase tracking-wider text-on-primary-fixed-variant">
              Author
            </span>
          )}
          <time dateTime={node.created_at} className="font-label text-label-sm text-on-surface-variant">
            {timeAgo(node.created_at)}
          </time>
        </div>

        {editing ? (
          <CommentForm
            compact
            autoFocus
            initialValue={node.content}
            submitLabel="Save"
            onCancel={() => setEditing(false)}
            onSubmit={async (content) => {
              await handlers.onEdit(node.id, content)
              setEditing(false)
            }}
          />
        ) : (
          <p className="whitespace-pre-line break-words font-sans text-body-sm text-on-surface-variant">{node.content}</p>
        )}

        {!editing && (
          <div className="mt-space-sm flex flex-wrap items-center gap-space-md">
            <button
              type="button"
              onClick={() => guard(() => toggleLike(node.id))}
              aria-pressed={liked}
              aria-label={liked ? 'Unlike response' : 'Like response'}
              className={cn(
                'inline-flex items-center gap-1 font-label text-label-sm transition-colors',
                liked ? 'text-error' : 'text-on-surface-variant hover:text-error',
              )}
            >
              <Heart className={cn('size-3.5', liked && 'fill-current')} aria-hidden />
              <span className="tabular-nums">{likes}</span>
            </button>
            <button
              type="button"
              onClick={() => guard(() => setReplying((r) => !r))}
              className="inline-flex items-center gap-1 font-label text-label-sm font-semibold text-on-surface-variant hover:text-primary"
            >
              <Reply className="size-3.5" aria-hidden />
              Reply
            </button>
            {isOwn && !confirmDelete && (
              <>
                <button
                  type="button"
                  onClick={() => setEditing(true)}
                  className="font-label text-label-sm text-on-surface-variant hover:text-primary"
                >
                  Edit
                </button>
                <button
                  type="button"
                  onClick={() => setConfirmDelete(true)}
                  className="font-label text-label-sm text-on-surface-variant hover:text-error"
                >
                  Delete
                </button>
              </>
            )}
            {confirmDelete && (
              <span className="inline-flex items-center gap-space-sm font-label text-label-sm">
                <span className="text-on-surface-variant">{total > 0 ? 'Delete with replies?' : 'Delete?'}</span>
                <button type="button" onClick={() => handlers.onDelete(node.id)} className="font-semibold text-error hover:underline">
                  Yes
                </button>
                <button type="button" onClick={() => setConfirmDelete(false)} className="text-on-surface-variant hover:underline">
                  No
                </button>
              </span>
            )}
            {total > 0 && (
              <button
                type="button"
                onClick={() => setCollapsed((c) => !c)}
                aria-expanded={!collapsed}
                className="font-label text-label-sm text-primary hover:underline"
              >
                {collapsed ? `Show ${total} ${total === 1 ? 'reply' : 'replies'}` : 'Hide replies'}
              </button>
            )}
          </div>
        )}

        {replying && (
          <div className="mt-space-md">
            <CommentForm
              compact
              autoFocus
              submitLabel="Reply"
              placeholder={`Reply to ${node.author.name}...`}
              onCancel={() => setReplying(false)}
              onSubmit={async (content) => {
                await handlers.onReply(node.id, content)
                setReplying(false)
                setCollapsed(false)
              }}
            />
          </div>
        )}

        {!collapsed && node.replies.length > 0 && (
          <ul
            className={cn(
              'mt-space-md flex flex-col gap-space-lg',
              depth < 3 && 'border-l-2 border-outline-variant/30 pl-space-sm sm:pl-space-md',
            )}
          >
            {node.replies.map((child) => (
              <CommentItem key={child.id} node={child} postAuthorId={postAuthorId} depth={depth + 1} handlers={handlers} />
            ))}
          </ul>
        )}
      </div>
    </li>
  )
}
