import Link from 'next/link'
import { CATEGORIES } from '@/lib/categories'

export function SiteFooter() {
  return (
    <footer className="mt-space-2xl border-t border-outline-variant/40 bg-surface-container-low">
      <div className="mx-auto flex max-w-7xl flex-col gap-space-lg px-margin-mobile py-space-xl sm:px-margin md:flex-row md:items-start md:justify-between">
        <div className="max-w-sm">
          <p className="font-serif text-headline-sm font-semibold text-on-surface">Chronicle</p>
          <p className="mt-space-xs font-sans text-body-sm text-on-surface-variant">
            A quiet place for longform writing on engineering, design, and the craft of building products.
          </p>
        </div>
        <nav aria-label="Topics" className="flex flex-wrap gap-x-space-lg gap-y-space-sm">
          {CATEGORIES.slice(0, 6).map((c) => (
            <Link
              key={c}
              href={`/?category=${encodeURIComponent(c)}`}
              className="font-label text-label-md text-on-surface-variant hover:text-primary"
            >
              {c}
            </Link>
          ))}
        </nav>
      </div>
      <div className="border-t border-outline-variant/30">
        <p className="mx-auto max-w-7xl px-margin-mobile py-space-md font-label text-label-sm text-on-surface-variant sm:px-margin">
          {`© ${new Date().getFullYear()} Chronicle Journal`}
        </p>
      </div>
    </footer>
  )
}
