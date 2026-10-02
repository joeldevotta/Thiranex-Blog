'use client'

import { Bookmark, LayoutDashboard, LogOut, PenSquare, UserRound } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'
import { useAuth } from '@/lib/auth-context'
import type { User } from '@/lib/types'
import { Avatar } from './avatar'

export function UserMenu({ user }: { user: User }) {
  const { logout } = useAuth()
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const onClick = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false)
    }
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false)
    document.addEventListener('mousedown', onClick)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onClick)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  const items = [
    { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/write', label: 'Write a story', icon: PenSquare },
    { href: '/dashboard?tab=bookmarks', label: 'Bookmarks', icon: Bookmark },
    { href: '/dashboard?tab=profile', label: 'Profile', icon: UserRound },
  ]

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label="Account menu"
        className="rounded-full ring-offset-2 ring-offset-surface transition-shadow hover:ring-2 hover:ring-outline-variant focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
      >
        <Avatar name={user.name} size="sm" />
      </button>
      {open && (
        <div
          role="menu"
          className="absolute right-0 mt-space-sm w-64 overflow-hidden rounded-xl border border-outline-variant/40 bg-surface-container-lowest shadow-xl"
        >
          <div className="flex items-center gap-space-sm border-b border-outline-variant/30 p-space-md">
            <Avatar name={user.name} size="md" />
            <div className="min-w-0">
              <p className="truncate font-sans text-body-sm font-semibold text-on-surface">{user.name}</p>
              <p className="truncate font-label text-label-md text-on-surface-variant">{user.email}</p>
            </div>
          </div>
          <div className="p-space-xs">
            {items.map(({ href, label, icon: Icon }) => (
              <Link
                key={label}
                href={href}
                role="menuitem"
                onClick={() => setOpen(false)}
                className="flex items-center gap-space-sm rounded-lg px-space-sm py-space-sm font-label text-label-md text-on-surface hover:bg-surface-container"
              >
                <Icon className="size-4 text-on-surface-variant" aria-hidden />
                {label}
              </Link>
            ))}
          </div>
          <div className="border-t border-outline-variant/30 p-space-xs">
            <button
              type="button"
              role="menuitem"
              onClick={() => {
                logout()
                setOpen(false)
                router.push('/')
              }}
              className="flex w-full items-center gap-space-sm rounded-lg px-space-sm py-space-sm font-label text-label-md text-error hover:bg-error-container/40"
            >
              <LogOut className="size-4" aria-hidden />
              Sign out
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
