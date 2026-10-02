'use client'

import { LockKeyhole } from 'lucide-react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import type { ReactNode } from 'react'
import { useAuth } from '@/lib/auth-context'
import { buttonClasses } from '@/lib/ui'
import { EmptyState } from './states'

export function useAuthAction() {
  const { user } = useAuth()
  const router = useRouter()
  const pathname = usePathname()
  return (action: () => void) => {
    if (!user) {
      router.push(`/login?next=${encodeURIComponent(pathname)}`)
      return
    }
    action()
  }
}

export function RequireAuth({ children, message }: { children: ReactNode; message: string }) {
  const { user } = useAuth()
  const pathname = usePathname()
  if (user) return <>{children}</>
  return (
    <div className="mx-auto max-w-xl py-space-2xl">
      <EmptyState
        icon={LockKeyhole}
        title="Sign in to continue"
        description={message}
        action={
          <div className="flex gap-space-sm">
            <Link href={`/login?next=${encodeURIComponent(pathname)}`} className={buttonClasses('primary')}>
              Sign in
            </Link>
            <Link href={`/register?next=${encodeURIComponent(pathname)}`} className={buttonClasses('secondary')}>
              Create account
            </Link>
          </div>
        }
      />
    </div>
  )
}
