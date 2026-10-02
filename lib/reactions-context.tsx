'use client'

import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react'

// Likes and bookmarks have no API endpoints yet, so they are tracked client-side.
type ReactionsContextValue = {
  isLiked: (id: string) => boolean
  isBookmarked: (id: string) => boolean
  toggleLike: (id: string) => void
  toggleBookmark: (id: string) => void
  bookmarkedIds: string[]
}

const ReactionsContext = createContext<ReactionsContextValue | null>(null)

function toggleIn(set: Set<string>, id: string) {
  const next = new Set(set)
  if (next.has(id)) next.delete(id)
  else next.add(id)
  return next
}

export function ReactionsProvider({ children }: { children: ReactNode }) {
  const [liked, setLiked] = useState<Set<string>>(new Set())
  const [bookmarked, setBookmarked] = useState<Set<string>>(new Set())

  const toggleLike = useCallback((id: string) => setLiked((s) => toggleIn(s, id)), [])
  const toggleBookmark = useCallback((id: string) => setBookmarked((s) => toggleIn(s, id)), [])

  const value = useMemo(
    () => ({
      isLiked: (id: string) => liked.has(id),
      isBookmarked: (id: string) => bookmarked.has(id),
      toggleLike,
      toggleBookmark,
      bookmarkedIds: [...bookmarked],
    }),
    [liked, bookmarked, toggleLike, toggleBookmark],
  )

  return <ReactionsContext.Provider value={value}>{children}</ReactionsContext.Provider>
}

export function useReactions() {
  const ctx = useContext(ReactionsContext)
  if (!ctx) throw new Error('useReactions must be used within ReactionsProvider')
  return ctx
}
