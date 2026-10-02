'use client'

import { Loader2 } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState, type FormEvent, type KeyboardEvent } from 'react'
import { useAuth } from '@/lib/auth-context'
import { buttonClasses } from '@/lib/ui'
import { Avatar } from '../avatar'

export function CommentForm({
  onSubmit,
  onCancel,
  initialValue = '',
  placeholder = 'Share your thoughts...',
  submitLabel = 'Respond',
  autoFocus,
  compact,
}: {
  onSubmit: (content: string) => Promise<void>
  onCancel?: () => void
  initialValue?: string
  placeholder?: string
  submitLabel?: string
  autoFocus?: boolean
  compact?: boolean
}) {
  const { user } = useAuth()
  const pathname = usePathname()
  const [value, setValue] = useState(initialValue)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  if (!user) {
    return (
      <div className="flex flex-col items-start gap-space-sm rounded-xl border border-outline-variant/40 bg-surface-container-lowest p-space-md sm:flex-row sm:items-center sm:justify-between">
        <p className="font-sans text-body-sm text-on-surface-variant">Sign in to join the conversation.</p>
        <Link href={`/login?next=${encodeURIComponent(`${pathname}#comments`)}`} className={buttonClasses('primary', 'sm')}>
          Sign in to respond
        </Link>
      </div>
    )
  }

  const submit = async (e?: FormEvent) => {
    e?.preventDefault()
    if (!value.trim() || submitting) return
    setSubmitting(true)
    setError(null)
    try {
      await onSubmit(value)
      setValue('')
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setSubmitting(false)
    }
  }

  const onKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.nativeEvent.isComposing || e.keyCode === 229) return
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) submit()
    if (e.key === 'Escape') onCancel?.()
  }

  return (
    <form onSubmit={submit} className="flex gap-space-md">
      {!compact && <Avatar name={user.name} size="md" className="hidden sm:inline-flex" />}
      <div className="flex-1 overflow-hidden rounded-xl border border-outline-variant/40 bg-surface-container-lowest shadow-sm focus-within:border-primary focus-within:ring-1 focus-within:ring-primary">
        <label className="sr-only" htmlFor={`comment-${submitLabel}-${compact ? 'reply' : 'root'}`}>
          {placeholder}
        </label>
        <textarea
          id={`comment-${submitLabel}-${compact ? 'reply' : 'root'}`}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={onKeyDown}
          rows={compact ? 2 : 3}
          maxLength={2000}
          autoFocus={autoFocus}
          placeholder={placeholder}
          className="block w-full resize-none border-0 bg-transparent p-space-md font-sans text-body-sm text-on-surface placeholder:text-on-surface-variant/60 focus:outline-none"
        />
        <div className="flex items-center justify-between gap-space-sm bg-surface-container-low/60 px-space-md py-space-sm">
          <span className="font-label text-label-sm text-on-surface-variant">
            {error ? <span className="text-error">{error}</span> : `${value.length}/2000`}
          </span>
          <div className="flex gap-space-sm">
            {onCancel && (
              <button type="button" onClick={onCancel} className={buttonClasses('ghost', 'sm')}>
                Cancel
              </button>
            )}
            <button type="submit" disabled={!value.trim() || submitting} className={buttonClasses('primary', 'sm')}>
              {submitting && <Loader2 className="size-3.5 animate-spin" aria-hidden />}
              {submitLabel}
            </button>
          </div>
        </div>
      </div>
    </form>
  )
}
