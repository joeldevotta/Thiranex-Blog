import { Compass } from 'lucide-react'
import Link from 'next/link'
import { EmptyState } from '@/components/states'
import { buttonClasses } from '@/lib/ui'

export default function NotFound() {
  return (
    <div className="mx-auto max-w-xl px-margin-mobile py-space-2xl">
      <EmptyState
        icon={Compass}
        title="Page not found"
        description="The page you are looking for does not exist."
        action={
          <Link href="/" className={buttonClasses('primary')}>
            Back to the feed
          </Link>
        }
      />
    </div>
  )
}
