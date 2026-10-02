'use client'

import { Menu, PenSquare, Search, X } from 'lucide-react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useEffect, useRef, useState, type FormEvent } from 'react'
import { useAuth } from '@/lib/auth-context'
import { buttonClasses } from '@/lib/ui'
import { cn } from '@/lib/utils'
import { UserMenu } from './user-menu'

const NAV = [
  { href: '/', label: 'Explore' },
  { href: '/?sort=top', label: 'Top Stories' },
  { href: '/dashboard', label: 'My Stories' },
]

export function Logo() {
  return (
    <Link href="/" className="flex items-center gap-space-sm" aria-label="Chronicle home">
      <span className="flex size-8 items-center justify-center rounded-xl bg-primary font-serif text-headline-sm italic text-on-primary">
        C
      </span>
      <span className="font-serif text-headline-sm font-semibold tracking-tight text-on-surface">Chronicle</span>
    </Link>
  )
}

export function SiteHeader() {
  const { user } = useAuth()
  const pathname = usePathname()
  const router = useRouter()
  const [mobileOpen, setMobileOpen] = useState(false)
  const searchRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        searchRef.current?.focus()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  const onSearch = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const q = String(new FormData(e.currentTarget).get('q') ?? '').trim()
    setMobileOpen(false)
    router.push(q ? `/?q=${encodeURIComponent(q)}` : '/')
  }

  const isActive = (href: string) => (href === '/' ? pathname === '/' : pathname.startsWith(href.split('?')[0]))

  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-outline-variant/40 bg-surface/90 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-space-md px-margin-mobile sm:px-margin">
        <div className="flex items-center gap-space-xl">
          <Logo />
          <nav aria-label="Main" className="hidden items-center gap-space-lg lg:flex">
            {NAV.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className={cn(
                  'font-label text-label-md font-medium transition-colors',
                  item.label !== 'Top Stories' && isActive(item.href)
                    ? 'text-primary'
                    : 'text-on-surface-variant hover:text-on-surface',
                )}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-space-sm">
          <form onSubmit={onSearch} role="search" className="relative hidden md:block">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-on-surface-variant" aria-hidden />
            <label htmlFor="header-search" className="sr-only">
              Search stories
            </label>
            <input
              ref={searchRef}
              id="header-search"
              name="q"
              type="search"
              placeholder="Search stories..."
              className="h-9 w-56 rounded-lg border border-outline-variant/50 bg-surface-container-low pl-9 pr-10 font-label text-label-md text-on-surface placeholder:text-on-surface-variant/70 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary lg:w-64"
            />
            <kbd className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 rounded border border-outline-variant/60 bg-surface px-1 font-mono text-[10px] text-on-surface-variant">
              ⌘K
            </kbd>
          </form>

          <Link href="/write" className={buttonClasses('primary', 'md', 'hidden sm:inline-flex')}>
            <PenSquare className="size-4" aria-hidden />
            Write
          </Link>

          {user ? (
            <UserMenu user={user} />
          ) : (
            <Link href="/login" className={buttonClasses('ghost', 'md', 'hidden sm:inline-flex')}>
              Sign in
            </Link>
          )}

          <button
            type="button"
            onClick={() => setMobileOpen((o) => !o)}
            className={buttonClasses('ghost', 'md', 'px-space-sm lg:hidden')}
            aria-expanded={mobileOpen}
            aria-controls="mobile-nav"
            aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
          >
            {mobileOpen ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div id="mobile-nav" className="border-t border-outline-variant/40 bg-surface px-margin-mobile py-space-md lg:hidden">
          <form onSubmit={onSearch} role="search" className="relative mb-space-md md:hidden">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-on-surface-variant" aria-hidden />
            <label htmlFor="mobile-search" className="sr-only">
              Search stories
            </label>
            <input
              id="mobile-search"
              name="q"
              type="search"
              placeholder="Search stories..."
              className="h-10 w-full rounded-lg border border-outline-variant/50 bg-surface-container-low pl-9 pr-3 font-label text-label-md text-on-surface focus:border-primary focus:outline-none"
            />
          </form>
          <nav aria-label="Mobile" className="flex flex-col">
            {[...NAV, { href: '/write', label: 'Write a story' }].map((item) => (
              <Link
                key={item.label}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className="rounded-lg px-space-sm py-space-sm font-label text-body-sm text-on-surface hover:bg-surface-container"
              >
                {item.label}
              </Link>
            ))}
            {!user && (
              <Link
                href="/login"
                onClick={() => setMobileOpen(false)}
                className={buttonClasses('primary', 'lg', 'mt-space-sm')}
              >
                Sign in
              </Link>
            )}
          </nav>
        </div>
      )}
    </header>
  )
}
