import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: '生活お金ナビ',
  description: '物価高・負担増に負けない家計術',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ja">
      <body>{children}</body>
    </html>
  )
}
