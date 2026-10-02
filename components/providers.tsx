'use client'

import type { ReactNode } from 'react'
import { SWRConfig } from 'swr'
import { AuthProvider } from '@/lib/auth-context'
import { ReactionsProvider } from '@/lib/reactions-context'
import { ToastProvider } from './toast'

export function Providers({ children }: { children: ReactNode }) {
  return (
    <SWRConfig value={{ revalidateOnFocus: false }}>
      <AuthProvider>
        <ReactionsProvider>
          <ToastProvider>{children}</ToastProvider>
        </ReactionsProvider>
      </AuthProvider>
    </SWRConfig>
  )
}
