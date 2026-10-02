'use client'

import { PostEditor } from '@/components/post-editor'
import { RequireAuth } from '@/components/require-auth'

export default function WritePage() {
  return (
    <RequireAuth message="You need an account to publish stories on Chronicle.">
      <PostEditor />
    </RequireAuth>
  )
}
