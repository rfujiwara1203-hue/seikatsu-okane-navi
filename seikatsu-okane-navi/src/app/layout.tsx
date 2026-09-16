import type { Metadata } from 'next'
import './globals.css'

const SITE_URL = 'https://seikatsu-okane-navi.vercel.app'

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: '生活お金ナビ',
  description: '物価高・負担増に負けない家計術',
  openGraph: {
    type: 'website',
    siteName: '生活お金ナビ',
    title: '生活お金ナビ',
    description: '物価高・負担増に負けない家計術',
    locale: 'ja_JP',
  },
  twitter: {
    card: 'summary',
    title: '生活お金ナビ',
    description: '物価高・負担増に負けない家計術',
  },
}

const siteJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: '生活お金ナビ',
  url: SITE_URL,
  description: '年収・家族構成・お住まいの都道府県に応じた節税・給付金情報と、家計に関わる今日のニュースをまとめる情報サイト',
  publisher: {
    '@type': 'Organization',
    name: '生活お金ナビ',
    url: SITE_URL,
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ja">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(siteJsonLd) }}
        />
      </head>
      <body>{children}</body>
    </html>
  )
}
