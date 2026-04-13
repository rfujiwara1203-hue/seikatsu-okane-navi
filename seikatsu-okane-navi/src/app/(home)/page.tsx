import { Suspense } from 'react'
import { fetchNews } from '@/lib/news-fetcher'
import { CATEGORY_META } from '@/types'
import { getNewsEmoji } from '@/lib/news-fetcher'
import Navigation from '@/components/ui/Navigation'
import { ProfileProvider } from '@/components/ui/ProfileContext'
import ProfileForm from '@/components/ui/ProfileForm'
import NewsSection from '@/components/news/NewsSection'
import { GainsSummaryCard, FurusatoCard, BurdenCard } from '@/components/dashboard/SummaryCards'
import HomeContent from './HomeContent'

// ISR: 1時間キャッシュ
export const revalidate = 3600

export default async function HomePage() {
  // サーバー側でニュースをプリフェッチ（フォールバック付き）
  let initialNews = []
  try {
    const raw = await fetchNews(5)
    initialNews = raw.map(item => ({
      ...item,
      emoji: getNewsEmoji(item),
      categoryLabel: CATEGORY_META[item.category]?.label ?? 'ニュース',
    }))
  } catch {}

  return (
    <ProfileProvider>
      <Navigation />
      <main className="max-w-2xl mx-auto px-4 py-6 space-y-6 pb-24 sm:pb-8">
        <HomeContent initialNews={initialNews} />
      </main>
    </ProfileProvider>
  )
}
