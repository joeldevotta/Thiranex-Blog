'use client'

import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react'
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

// Session lives in memory while the API is mocked. When wiring the FastAPI
// backend, persist the JWT (e.g. an httpOnly cookie) and hydrate via /auth/me.
export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<{ user: User; token: string } | null>(null)

  const login = useCallback(async (email: string, password: string) => {
    const res = await api.auth.login(email, password)
    setSession(res)
    return res.user
  }, [])

  const register = useCallback(async (name: string, email: string, password: string) => {
    const res = await api.auth.register(name, email, password)
    setSession(res)
    return res.user
  }, [])

  const updateProfile = useCallback(
    async (patch: Partial<Pick<User, 'name' | 'bio' | 'title'>>) => {
      if (!session) throw new Error('Not authenticated')
      const { user } = await api.auth.updateProfile(session.token, patch)
      setSession({ ...session, user })
      return user
    },
    [session],
  )

  const logout = useCallback(() => setSession(null), [])

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
