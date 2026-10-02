'use client'

import useSWR, { useSWRConfig } from 'swr'
import { api } from './api'
import type { PostQuery } from './types'

export function usePosts(query: PostQuery = {}) {
  const key = ['posts', query.q ?? '', query.category ?? '', query.authorId ?? '', query.sort ?? 'latest'] as const
  return useSWR(key, () => api.posts.list(query))
}

export function usePost(id: string | null) {
  return useSWR(id ? (['post', id] as const) : null, () => api.posts.get(id!), {
    shouldRetryOnError: false,
  })
}

export function useComments(postId: string) {
  return useSWR(['comments', postId] as const, () => api.comments.list(postId))
}

export function useAuthor(id: string | undefined) {
  return useSWR(id ? (['user', id] as const) : null, () => api.users.get(id!))
}

export function useRevalidatePosts() {
  const { mutate } = useSWRConfig()
  return () => mutate((key) => Array.isArray(key) && (key[0] === 'posts' || key[0] === 'post'))
}
