import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { LayoutContent } from '@/components/layout/layout-content'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Verdura AI',
  description: 'Your local food and wellness companion',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <LayoutContent>
          {children}
        </LayoutContent>
      </body>
    </html>
  )
}
