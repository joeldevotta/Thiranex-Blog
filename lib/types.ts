// Shapes mirror the FastAPI serializers in backend/app.py (snake_case).
// Fields marked "frontend-only" are not returned by the API yet.

export type Author = {
  id: string
  name: string
}

export type User = {
  id: string
  name: string
  email: string
  /** frontend-only */
  bio?: string
  /** frontend-only */
  title?: string
}

export type Post = {
  id: string
  title: string
  content: string
  excerpt: string
  category: string
  cover_image: string
  author: Author
  created_at: string
  updated_at: string
  /** frontend-only */
  tags?: string[]
  /** frontend-only */
  featured?: boolean
  /** frontend-only */
  likes?: number
}

export type PostInput = {
  title: string
  content: string
  excerpt: string
  category: string
  cover_image: string
  tags?: string[]
}

export type Comment = {
  id: string
  post_id: string
  parent_id: string | null
  content: string
  author: Author
  created_at: string
  /** frontend-only */
  likes?: number
}

export type CommentInput = {
  content: string
  parent_id?: string | null
}

export type AuthResponse = {
  token: string
  user: User
}

export type PostQuery = {
  q?: string
  category?: string
  authorId?: string
  sort?: 'latest' | 'top'
}
