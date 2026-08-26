import { NextResponse } from 'next/server'
import { fetchNews } from '@/lib/news-fetcher'
import { CATEGORY_META } from '@/types'

export const revalidate = 3600 // 1時間キャッシュ

const SITE_URL = 'https://seikatsu-okane-navi.vercel.app'

function escapeXml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

// このサイトが拾った「今日のピックアップ」ニュースを標準的なRSS 2.0で配信するエンドポイント。
// Zapier / IFTTT / Buffer などの「RSS→SNS自動投稿」機能に登録すると、
// 新しいニュースが追加されるたびに半自動でX(旧Twitter)等に投稿できるようになる。
export async function GET() {
  const items = await fetchNews(10)

  const rssItems = items.map(item => {
    const label = CATEGORY_META[item.category]?.label ?? 'ニュース'
    const title = `【${label}】${item.title}`
    const desc = (item.content ?? '').slice(0, 200)
    return `
    <item>
      <title>${escapeXml(title)}</title>
      <link>${escapeXml(item.link)}</link>
      <guid isPermaLink="false">${escapeXml(item.id)}</guid>
      <pubDate>${new Date(item.pubDate).toUTCString()}</pubDate>
      <description>${escapeXml(desc)}</description>
      <source url="${escapeXml(SITE_URL)}">生活お金ナビ</source>
    </item>`
  }).join('')

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>生活お金ナビ｜今日のピックアップ</title>
    <link>${SITE_URL}</link>
    <description>年収・家族構成に関わる家計ニュースのピックアップ（生活お金ナビ）</description>
    <language>ja</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>${rssItems}
  </channel>
</rss>`

  return new NextResponse(xml, {
    headers: {
      'Content-Type': 'application/rss+xml; charset=utf-8',
      'Cache-Control': 's-maxage=3600, stale-while-revalidate=86400',
    },
  })
}
