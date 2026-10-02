// Mock implementation of the FastAPI REST API (see backend/README.md).
// Each method documents the real endpoint it stands in for, so swapping to
// `fetch(`${API_BASE_URL}/...`)` later only requires changing this file.
import { MOCK_PASSWORD, seedComments, seedPosts, seedUsers } from './mock-data'
import type { AuthResponse, Comment, CommentInput, Post, PostInput, PostQuery, User } from './types'

export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000/api'

export class ApiError extends Error {
  status: number
  constructor(status: number, message: string) {
    super(message)
    this.status = status
  }
}

const db = {
  users: [...seedUsers],
  passwords: new Map(seedUsers.map((u) => [u.email, MOCK_PASSWORD])),
  posts: [...seedPosts],
  comments: [...seedComments],
}

const delay = (ms = 400) => new Promise((resolve) => setTimeout(resolve, ms))
const uid = (prefix: string) => `${prefix}${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`
const clone = <T>(value: T): T => structuredClone(value)

function userFromToken(token: string | null | undefined) {
  const id = token?.startsWith('mock-token-') ? token.slice('mock-token-'.length) : null
  const user = db.users.find((u) => u.id === id)
  if (!user) throw new ApiError(401, 'Not authenticated')
  return user
}

function validatePost(input: PostInput) {
  if (!input.title.trim() || input.title.length > 180) throw new ApiError(422, 'Title must be 1-180 characters')
  if (!input.content.trim()) throw new ApiError(422, 'Content is required')
  if (input.excerpt.length > 500) throw new ApiError(422, 'Excerpt must be 500 characters or fewer')
}

export const api = {
  auth: {
    /** POST /api/auth/login */
    async login(email: string, password: string): Promise<AuthResponse> {
      await delay()
      const user = db.users.find((u) => u.email === email.toLowerCase().trim())
      if (!user || db.passwords.get(user.email) !== password) throw new ApiError(401, 'Invalid email or password')
      return { token: `mock-token-${user.id}`, user: clone(user) }
    },
    /** POST /api/auth/register */
    async register(name: string, email: string, password: string): Promise<AuthResponse> {
      await delay()
      const normalized = email.toLowerCase().trim()
      if (db.users.some((u) => u.email === normalized)) throw new ApiError(409, 'Email already registered')
      const user: User = { id: uid('u'), name: name.trim(), email: normalized }
      db.users.push(user)
      db.passwords.set(normalized, password)
      return { token: `mock-token-${user.id}`, user: clone(user) }
    },
    /** GET /api/auth/me */
    async me(token: string): Promise<{ user: User }> {
      await delay(150)
      return { user: clone(userFromToken(token)) }
    },
    /** frontend-only: no profile update endpoint exists yet */
    async updateProfile(token: string, patch: Partial<Pick<User, 'name' | 'bio' | 'title'>>): Promise<{ user: User }> {
      await delay()
      const user = userFromToken(token)
      Object.assign(user, patch)
      return { user: clone(user) }
    },
  },

  users: {
    /** frontend-only: public author profile */
    async get(id: string): Promise<User | null> {
      await delay(200)
      const user = db.users.find((u) => u.id === id)
      return user ? clone(user) : null
    },
  },

  posts: {
    /** GET /api/posts (search, category and sort are applied client-side for now) */
    async list(query: PostQuery = {}): Promise<Post[]> {
      await delay()
      const q = query.q?.toLowerCase().trim()
      let result = db.posts.filter((post) => {
        if (query.category && post.category !== query.category) return false
        if (query.authorId && post.author.id !== query.authorId) return false
        if (!q) return true
        return [post.title, post.excerpt, post.category, post.author.name, ...(post.tags ?? [])]
          .join(' ')
          .toLowerCase()
          .includes(q)
      })
      result =
        query.sort === 'top'
          ? result.sort((a, b) => (b.likes ?? 0) - (a.likes ?? 0))
          : result.sort((a, b) => b.created_at.localeCompare(a.created_at))
      return clone(result)
    },
    /** GET /api/posts/{id} */
    async get(id: string): Promise<Post> {
      await delay()
      const post = db.posts.find((p) => p.id === id)
      if (!post) throw new ApiError(404, 'Post not found')
      return clone(post)
    },
    /** POST /api/posts */
    async create(token: string, input: PostInput): Promise<Post> {
      await delay()
      const user = userFromToken(token)
      validatePost(input)
      const now = new Date().toISOString()
      const post: Post = {
        ...input,
        id: uid('p'),
        author: { id: user.id, name: user.name },
        created_at: now,
        updated_at: now,
        likes: 0,
      }
      db.posts.unshift(post)
      return clone(post)
    },
    /** PUT /api/posts/{id} */
    async update(token: string, id: string, input: PostInput): Promise<Post> {
      await delay()
      const user = userFromToken(token)
      validatePost(input)
      const post = db.posts.find((p) => p.id === id)
      if (!post) throw new ApiError(404, 'Post not found')
      if (post.author.id !== user.id) throw new ApiError(403, 'You can only edit your own posts')
      Object.assign(post, input, { updated_at: new Date().toISOString() })
      return clone(post)
    },
    /** DELETE /api/posts/{id} */
    async remove(token: string, id: string): Promise<void> {
      await delay()
      const user = userFromToken(token)
      const post = db.posts.find((p) => p.id === id)
      if (!post) throw new ApiError(404, 'Post not found')
      if (post.author.id !== user.id) throw new ApiError(403, 'You can only delete your own posts')
      db.posts = db.posts.filter((p) => p.id !== id)
      db.comments = db.comments.filter((c) => c.post_id !== id)
    },
  },

  comments: {
    /** GET /api/posts/{id}/comments */
    async list(postId: string): Promise<Comment[]> {
      await delay()
      return clone(db.comments.filter((c) => c.post_id === postId))
    },
    /** POST /api/posts/{id}/comments */
    async create(token: string, postId: string, input: CommentInput): Promise<Comment> {
      await delay(300)
      const user = userFromToken(token)
      const content = input.content.trim()
      if (!content || content.length > 2000) throw new ApiError(422, 'Comment must be 1-2000 characters')
      const comment: Comment = {
        id: uid('c'),
        post_id: postId,
        parent_id: input.parent_id ?? null,
        content,
        author: { id: user.id, name: user.name },
        created_at: new Date().toISOString(),
        likes: 0,
      }
      db.comments.push(comment)
      return clone(comment)
    },
    /** PUT /api/comments/{id} */
    async update(token: string, id: string, content: string): Promise<Comment> {
      await delay(300)
      const user = userFromToken(token)
      const comment = db.comments.find((c) => c.id === id)
      if (!comment) throw new ApiError(404, 'Comment not found')
      if (comment.author.id !== user.id) throw new ApiError(403, 'You can only edit your own comments')
      comment.content = content.trim()
      return clone(comment)
    },
    /** DELETE /api/comments/{id} — also removes nested replies */
    async remove(token: string, id: string): Promise<void> {
      await delay(300)
      const user = userFromToken(token)
      const comment = db.comments.find((c) => c.id === id)
      if (!comment) throw new ApiError(404, 'Comment not found')
      if (comment.author.id !== user.id) throw new ApiError(403, 'You can only delete your own comments')
      const doomed = new Set([id])
      let grew = true
      while (grew) {
        grew = false
        for (const c of db.comments) {
          if (c.parent_id && doomed.has(c.parent_id) && !doomed.has(c.id)) {
            doomed.add(c.id)
            grew = true
          }
        }
      }
      db.comments = db.comments.filter((c) => !doomed.has(c.id))
    },
  },
}
