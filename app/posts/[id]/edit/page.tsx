import { EditPostView } from '@/components/edit-post-view'

export default async function EditPostPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  return <EditPostView id={id} />
}
