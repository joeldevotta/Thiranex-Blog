'use client'

import { CheckCircle2, AlertCircle } from 'lucide-react'
import { createContext, useCallback, useContext, useRef, useState, type ReactNode } from 'react'

type Toast = { id: number; message: string; tone: 'success' | 'error' }

const ToastContext = createContext<((message: string, tone?: Toast['tone']) => void) | null>(null)

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])
  const nextId = useRef(0)

  const show = useCallback((message: string, tone: Toast['tone'] = 'success') => {
    const id = ++nextId.current
    setToasts((list) => [...list, { id, message, tone }])
    setTimeout(() => setToasts((list) => list.filter((t) => t.id !== id)), 3000)
  }, [])

  return (
    <ToastContext.Provider value={show}>
      {children}
      <div
        aria-live="polite"
        className="pointer-events-none fixed inset-x-0 bottom-space-lg z-[100] flex flex-col items-center gap-space-sm px-margin-mobile"
      >
        {toasts.map((t) => (
          <div
            key={t.id}
            role="status"
            className="pointer-events-auto flex items-center gap-space-sm rounded-xl bg-inverse-surface px-space-md py-space-sm font-label text-label-md text-inverse-on-surface shadow-lg"
          >
            {t.tone === 'success' ? (
              <CheckCircle2 className="size-4 text-secondary-fixed-dim" aria-hidden />
            ) : (
              <AlertCircle className="size-4 text-error-container" aria-hidden />
            )}
            {t.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be used within ToastProvider')
  return ctx
}
