import { ArticleView } from '@/components/article/article-view'

export default async function PostPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  return <ArticleView id={id} />
}
