'use client'

import { Eye, Loader2, PenLine } from 'lucide-react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { useState, type FormEvent } from 'react'
import { api } from '@/lib/api'
import { useAuth } from '@/lib/auth-context'
import { CATEGORIES } from '@/lib/categories'
import { useRevalidatePosts } from '@/lib/hooks'
import type { Post, PostInput } from '@/lib/types'
import { buttonClasses, inputClasses, labelClasses } from '@/lib/ui'
import { cn, readingMinutes } from '@/lib/utils'
import { ArticleBody } from './article/article-body'
import { useToast } from './toast'

const COVER_PRESETS = [
  '/images/cover-systems.png',
  '/images/cover-rust.png',
  '/images/cover-typography.png',
  '/images/cover-product.png',
  '/images/cover-ai.png',
  '/images/cover-career.png',
]

export function PostEditor({ post }: { post?: Post }) {
  const { token } = useAuth()
  const router = useRouter()
  const toast = useToast()
  const revalidate = useRevalidatePosts()
  const [tab, setTab] = useState<'write' | 'preview'>('write')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [form, setForm] = useState({
    title: post?.title ?? '',
    excerpt: post?.excerpt ?? '',
    category: post?.category ?? 'Engineering',
    cover_image: post?.cover_image ?? '',
    content: post?.content ?? '',
    tags: post?.tags?.join(', ') ?? '',
  })

  const set = (key: keyof typeof form) => (value: string) => setForm((f) => ({ ...f, [key]: value }))

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!form.title.trim() || !form.content.trim()) {
      setError('A title and some content are required.')
      return
    }
    setSubmitting(true)
    setError(null)
    const input: PostInput = {
      title: form.title.trim(),
      excerpt: form.excerpt.trim(),
      category: form.category,
      cover_image: form.cover_image.trim(),
      content: form.content,
      tags: form.tags
        .split(',')
        .map((t) => t.trim().replace(/^#/, ''))
        .filter(Boolean),
    }
    try {
      const saved = post ? await api.posts.update(token!, post.id, input) : await api.posts.create(token!, input)
      await revalidate()
      toast(post ? 'Story updated' : 'Story published')
      router.push(`/posts/${saved.id}`)
    } catch (err) {
      setError((err as Error).message)
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={onSubmit} className="mx-auto max-w-3xl px-margin-mobile py-space-xl sm:px-margin">
      <div className="mb-space-lg flex flex-wrap items-center justify-between gap-space-md">
        <div>
          <p className={labelClasses}>{post ? 'Editing story' : 'New story'}</p>
          <p className="mt-1 font-label text-label-md text-on-surface-variant">
            {form.content.trim() ? `${readingMinutes(form.content)} min read` : 'Start writing below'}
          </p>
        </div>
        <div className="flex items-center gap-space-sm">
          <button type="button" onClick={() => router.back()} className={buttonClasses('ghost')}>
            Cancel
          </button>
          <button type="submit" disabled={submitting} className={buttonClasses('primary')}>
            {submitting && <Loader2 className="size-4 animate-spin" aria-hidden />}
            {post ? 'Save changes' : 'Publish'}
          </button>
        </div>
      </div>

      {error && (
        <p role="alert" className="mb-space-lg rounded-lg bg-error-container px-space-md py-space-sm font-sans text-body-sm text-on-error-container">
          {error}
        </p>
      )}

      <label htmlFor="title" className="sr-only">
        Title
      </label>
      <textarea
        id="title"
        value={form.title}
        onChange={(e) => set('title')(e.target.value.replace(/\n/g, ''))}
        maxLength={180}
        rows={2}
        placeholder="Title"
        className="w-full resize-none border-0 bg-transparent font-serif text-headline-lg text-on-surface placeholder:text-outline-variant focus:outline-none md:text-display-hero"
      />
      <label htmlFor="excerpt" className="sr-only">
        Excerpt
      </label>
      <textarea
        id="excerpt"
        value={form.excerpt}
        onChange={(e) => set('excerpt')(e.target.value)}
        maxLength={500}
        rows={2}
        placeholder="A short summary that appears on cards and search results..."
        className="mb-space-lg w-full resize-none border-0 bg-transparent font-sans text-body-lg text-on-surface-variant placeholder:text-outline-variant focus:outline-none"
      />

      <div className="mb-space-lg grid grid-cols-1 gap-space-md rounded-xl border border-outline-variant/40 bg-surface-container-low p-space-md sm:grid-cols-2">
        <div className="flex flex-col gap-space-xs">
          <label htmlFor="category" className={labelClasses}>
            Category
          </label>
          <select id="category" value={form.category} onChange={(e) => set('category')(e.target.value)} className={inputClasses}>
            {CATEGORIES.map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
        </div>
        <div className="flex flex-col gap-space-xs">
          <label htmlFor="tags" className={labelClasses}>
            Tags
          </label>
          <input
            id="tags"
            value={form.tags}
            onChange={(e) => set('tags')(e.target.value)}
            placeholder="Engineering, Architecture"
            className={inputClasses}
          />
        </div>
        <div className="flex flex-col gap-space-xs sm:col-span-2">
          <label htmlFor="cover" className={labelClasses}>
            Cover image URL
          </label>
          <input
            id="cover"
            value={form.cover_image}
            onChange={(e) => set('cover_image')(e.target.value)}
            placeholder="https://... or pick one below"
            className={inputClasses}
          />
          <div className="mt-space-xs flex gap-space-sm overflow-x-auto pb-1" role="group" aria-label="Cover presets">
            {COVER_PRESETS.map((src) => (
              <button
                key={src}
                type="button"
                onClick={() => set('cover_image')(form.cover_image === src ? '' : src)}
                aria-pressed={form.cover_image === src}
                aria-label={`Use cover ${src.split('/').pop()}`}
                className={cn(
                  'relative h-12 w-20 shrink-0 overflow-hidden rounded-lg border-2 transition-colors',
                  form.cover_image === src ? 'border-primary' : 'border-transparent hover:border-outline-variant',
                )}
              >
                <Image src={src} alt="" fill sizes="80px" className="object-cover" />
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-outline-variant/40 bg-surface-container-lowest">
        <div className="flex items-center justify-between border-b border-outline-variant/30 bg-surface-container-low px-space-sm">
          <div role="tablist" aria-label="Editor mode" className="flex">
            {(
              [
                ['write', 'Write', PenLine],
                ['preview', 'Preview', Eye],
              ] as const
            ).map(([key, label, Icon]) => (
              <button
                key={key}
                type="button"
                role="tab"
                aria-selected={tab === key}
                onClick={() => setTab(key)}
                className={cn(
                  'inline-flex items-center gap-1.5 border-b-2 px-space-md py-space-sm font-label text-label-md transition-colors',
                  tab === key ? 'border-primary text-primary' : 'border-transparent text-on-surface-variant hover:text-on-surface',
                )}
              >
                <Icon className="size-4" aria-hidden />
                {label}
              </button>
            ))}
          </div>
          <span className="hidden font-mono text-[11px] text-on-surface-variant sm:block">{'## heading  > quote  - list  **bold**  ```code'}</span>
        </div>
        {tab === 'write' ? (
          <>
            <label htmlFor="content" className="sr-only">
              Story content
            </label>
            <textarea
              id="content"
              value={form.content}
              onChange={(e) => set('content')(e.target.value)}
              rows={18}
              placeholder="Tell your story..."
              className="block min-h-96 w-full resize-y border-0 bg-transparent p-space-lg font-serif text-body-lg text-on-surface placeholder:text-outline-variant focus:outline-none"
            />
          </>
        ) : (
          <div className="min-h-96 p-space-lg">
            {form.content.trim() ? (
              <ArticleBody content={form.content} />
            ) : (
              <p className="font-sans text-body-sm text-on-surface-variant">Nothing to preview yet.</p>
            )}
          </div>
        )}
      </div>
    </form>
  )
}
