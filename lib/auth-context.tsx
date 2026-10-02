'use client'

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { api } from './api'
import type { User } from './types'

type AuthContextValue = {
  user: User | null
  token: string | null
  login: (email: string, password: string) => Promise<User>
  register: (name: string, email: string, password: string) => Promise<User>
  updateProfile: (patch: Partial<Pick<User, 'name' | 'bio' | 'title'>>) => Promise<User>
  logout: () => void
}

const AuthContext = createContext<AuthContextValue | null>(null)
const STORAGE_KEY = 'thiranex_blog_session'

type StoredSession = { user: User; token: string }

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<StoredSession | null>(null)
  const [hydrated, setHydrated] = useState(false)

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY)
      if (raw) {
        const stored = JSON.parse(raw) as StoredSession
        if (stored?.token && stored?.user) {
          api.auth.me(stored.token).then((res) => {
            const next = { token: stored.token, user: res.user }
            setSession(next)
            window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
          }).catch(() => window.localStorage.removeItem(STORAGE_KEY))
        }
      }
    } finally {
      setHydrated(true)
    }
  }, [])

  const saveSession = useCallback((next: StoredSession) => {
    setSession(next)
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
  }, [])

  const login = useCallback(async (email: string, password: string) => {
    const res = await api.auth.login(email, password)
    saveSession(res)
    return res.user
  }, [saveSession])

  const register = useCallback(async (name: string, email: string, password: string) => {
    const res = await api.auth.register(name, email, password)
    saveSession(res)
    return res.user
  }, [saveSession])

  const updateProfile = useCallback(async (patch: Partial<Pick<User, 'name' | 'bio' | 'title'>>) => {
    if (!session) throw new Error('Not authenticated')
    const user = { ...session.user, ...patch }
    const next = { ...session, user }
    saveSession(next)
    return user
  }, [session, saveSession])

  const logout = useCallback(() => {
    setSession(null)
    window.localStorage.removeItem(STORAGE_KEY)
  }, [])

  const value = useMemo(
    () => ({ user: session?.user ?? null, token: session?.token ?? null, login, register, updateProfile, logout }),
    [session, login, register, updateProfile, logout],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
