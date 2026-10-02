import type { AuthResponse, Comment, CommentInput, Post, PostInput, PostQuery, User } from './types'

export const API_BASE_URL = (process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000/api').replace(/\/$/, '')

export class ApiError extends Error {
  status: number
  constructor(status: number, message: string) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: { 'Content-Type': 'application/json', ...(options.headers ?? {}) },
    cache: 'no-store',
  })
  if (!response.ok) {
    let message = `Request failed (${response.status})`
    try {
      const body = await response.json()
      if (typeof body.detail === 'string') message = body.detail
      else if (Array.isArray(body.detail)) message = body.detail.map((e: { msg?: string }) => e.msg ?? 'Invalid request').join(', ')
    } catch {}
    throw new ApiError(response.status, message)
  }
  if (response.status === 204) return undefined as T
  return response.json() as Promise<T>
}

const authHeaders = (token: string) => ({ Authorization: `Bearer ${token}` })

export const api = {
  auth: {
    async login(email: string, password: string): Promise<AuthResponse> {
      return request('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) })
    },
    async register(name: string, email: string, password: string): Promise<AuthResponse> {
      return request('/auth/register', { method: 'POST', body: JSON.stringify({ name, email, password }) })
    },
    async me(token: string): Promise<{ user: User }> {
      return request('/auth/me', { headers: authHeaders(token) })
    },
    async updateProfile(_token: string, _patch: Partial<Pick<User, 'name' | 'bio' | 'title'>>): Promise<{ user: User }> {
      throw new ApiError(501, 'Profile editing is not available in the API yet')
    },
  },
  users: {
    async get(id: string): Promise<User | null> {
      try {
        return await request<User>(`/users/${encodeURIComponent(id)}`)
      } catch (error) {
        if (error instanceof ApiError && error.status === 404) return null
        throw error
      }
    },
  },
  posts: {
    async list(query: PostQuery = {}): Promise<Post[]> {
      const result = await request<Post[]>('/posts?skip=0&limit=50')
      const q = query.q?.toLowerCase().trim()
      let posts = result.filter((post) => {
        if (query.category && post.category !== query.category) return false
        if (query.authorId && post.author.id !== query.authorId) return false
        if (!q) return true
        return [post.title, post.excerpt, post.category, post.author.name, ...(post.tags ?? [])].join(' ').toLowerCase().includes(q)
      })
      if (query.sort === 'top') posts = posts.sort((a, b) => (b.likes ?? 0) - (a.likes ?? 0))
      return posts
    },
    async get(id: string): Promise<Post> {
      return request(`/posts/${encodeURIComponent(id)}`)
    },
    async create(token: string, input: PostInput): Promise<Post> {
      return request('/posts', { method: 'POST', headers: authHeaders(token), body: JSON.stringify(input) })
    },
    async update(token: string, id: string, input: PostInput): Promise<Post> {
      return request(`/posts/${encodeURIComponent(id)}`, { method: 'PUT', headers: authHeaders(token), body: JSON.stringify(input) })
    },
    async remove(token: string, id: string): Promise<void> {
      await request(`/posts/${encodeURIComponent(id)}`, { method: 'DELETE', headers: authHeaders(token) })
    },
  },
  comments: {
    async list(postId: string): Promise<Comment[]> {
      return request(`/posts/${encodeURIComponent(postId)}/comments`)
    },
    async create(token: string, postId: string, input: CommentInput): Promise<Comment> {
      return request(`/posts/${encodeURIComponent(postId)}/comments`, { method: 'POST', headers: authHeaders(token), body: JSON.stringify(input) })
    },
    async update(token: string, id: string, content: string): Promise<Comment> {
      return request(`/comments/${encodeURIComponent(id)}`, { method: 'PUT', headers: authHeaders(token), body: JSON.stringify({ content }) })
    },
    async remove(token: string, id: string): Promise<void> {
      await request(`/comments/${encodeURIComponent(id)}`, { method: 'DELETE', headers: authHeaders(token) })
    },
  },
}
