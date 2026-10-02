import type { Metadata, Viewport } from 'next'
import { Inter, JetBrains_Mono, Newsreader, Plus_Jakarta_Sans } from 'next/font/google'
import type { ReactNode } from 'react'
import { Providers } from '@/components/providers'
import { SiteFooter } from '@/components/site-footer'
import { SiteHeader } from '@/components/site-header'
import './globals.css'

const newsreader = Newsreader({ subsets: ['latin'], style: ['normal', 'italic'], variable: '--font-newsreader' })
const jakarta = Plus_Jakarta_Sans({ subsets: ['latin'], variable: '--font-jakarta' })
const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })
const jetbrains = JetBrains_Mono({ subsets: ['latin'], variable: '--font-jetbrains' })

export const metadata: Metadata = {
  title: { default: 'Chronicle — Stories on engineering & design', template: '%s · Chronicle' },
  description: 'A calm, editorial blog for longform writing on engineering, design, product, and the craft of building.',
}

export const viewport: Viewport = {
  themeColor: '#faf8ff',
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={`${newsreader.variable} ${jakarta.variable} ${inter.variable} ${jetbrains.variable}`}>
      <body className="min-h-screen bg-surface font-sans text-on-surface antialiased">
        <Providers>
          <SiteHeader />
          <main className="min-h-[70vh] pt-16">{children}</main>
          <SiteFooter />
        </Providers>
      </body>
    </html>
  )
}
