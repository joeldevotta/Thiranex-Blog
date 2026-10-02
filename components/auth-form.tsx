'use client'

import { Loader2 } from 'lucide-react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { useState, type FormEvent } from 'react'
import { useAuth } from '@/lib/auth-context'
import { buttonClasses, inputClasses, labelClasses } from '@/lib/ui'

export function AuthForm({ mode }: { mode: 'login' | 'register' }) {
  const { login, register } = useAuth()
  const router = useRouter()
  const params = useSearchParams()
  const rawNext = params.get('next') ?? '/'
  const next = rawNext.startsWith('/') && !rawNext.startsWith('//') ? rawNext : '/'
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const isLogin = mode === 'login'

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const data = new FormData(e.currentTarget)
    const name = String(data.get('name') ?? '').trim()
    const email = String(data.get('email') ?? '').trim()
    const password = String(data.get('password') ?? '')
    if (!isLogin && name.length < 2) return setError('Please enter your name.')
    if (password.length < 6) return setError('Password must be at least 6 characters.')
    setSubmitting(true)
    setError(null)
    try {
      if (isLogin) await login(email, password)
      else await register(name, email, password)
      router.push(next)
    } catch (err) {
      setError((err as Error).message)
      setSubmitting(false)
    }
  }

  const otherHref = `${isLogin ? '/register' : '/login'}${next !== '/' ? `?next=${encodeURIComponent(next)}` : ''}`

  return (
    <div className="mx-auto flex max-w-md flex-col px-margin-mobile py-space-2xl">
      <p className="font-label text-label-sm font-semibold uppercase tracking-widest text-primary">Chronicle</p>
      <h1 className="mt-space-sm font-serif text-headline-lg text-on-surface">{isLogin ? 'Welcome back' : 'Join Chronicle'}</h1>
      <p className="mt-space-xs font-sans text-body-sm text-on-surface-variant">
        {isLogin ? 'Sign in to like, bookmark, respond and write stories.' : 'Create an account to start publishing your stories.'}
      </p>

      <form onSubmit={onSubmit} className="mt-space-xl flex flex-col gap-space-md" noValidate>
        {error && (
          <p role="alert" className="rounded-lg bg-error-container px-space-md py-space-sm font-sans text-body-sm text-on-error-container">
            {error}
          </p>
        )}
        {!isLogin && (
          <div className="flex flex-col gap-space-xs">
            <label htmlFor="name" className={labelClasses}>
              Name
            </label>
            <input id="name" name="name" autoComplete="name" required maxLength={80} className={inputClasses} />
          </div>
        )}
        <div className="flex flex-col gap-space-xs">
          <label htmlFor="email" className={labelClasses}>
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            defaultValue={isLogin ? 'elena@chronicle.dev' : ''}
            className={inputClasses}
          />
        </div>
        <div className="flex flex-col gap-space-xs">
          <label htmlFor="password" className={labelClasses}>
            Password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete={isLogin ? 'current-password' : 'new-password'}
            required
            minLength={6}
            defaultValue={isLogin ? 'password' : ''}
            className={inputClasses}
          />
        </div>
        <button type="submit" disabled={submitting} className={buttonClasses('primary', 'lg', 'mt-space-sm')}>
          {submitting && <Loader2 className="size-4 animate-spin" aria-hidden />}
          {isLogin ? 'Sign in' : 'Create account'}
        </button>
      </form>

      {isLogin && (
        <p className="mt-space-md rounded-lg bg-surface-container-low px-space-md py-space-sm font-label text-label-md text-on-surface-variant">
          {'Demo account is prefilled: elena@chronicle.dev / password'}
        </p>
      )}

      <p className="mt-space-lg text-center font-sans text-body-sm text-on-surface-variant">
        {isLogin ? 'New to Chronicle? ' : 'Already have an account? '}
        <Link href={otherHref} className="font-semibold text-primary hover:underline">
          {isLogin ? 'Create an account' : 'Sign in'}
        </Link>
      </p>
    </div>
  )
}
