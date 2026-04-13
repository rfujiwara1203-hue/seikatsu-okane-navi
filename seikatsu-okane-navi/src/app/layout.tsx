import type { Metadata, Viewport } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: '生活お金ナビ｜物価高・負担増に負けない家計術',
  description: '年収・家族構成を入力するだけで、あなたに合ったお得情報・節税・給付金情報が一目でわかる。物価高騰対策から今日の家計ニュースまで、毎日更新。',
  keywords: ['ふるさと納税', '節税', '給付金', '物価高対策', '家計', 'iDeCo', 'NISA'],
  openGraph: {
    title: '生活お金ナビ',
    description: 'あなたの家計に影響する情報を毎日わかりやすく解説',
    type: 'website',
    locale: 'ja_JP',
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#2e7a42',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=M+PLUS+Rounded+1c:wght@400;700;800&family=Noto+Sans+JP:wght@400;500;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-surface text-gray-800 antialiased min-h-screen">
        {children}
      </body>
    </html>
  )
}
