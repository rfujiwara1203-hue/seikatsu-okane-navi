import { fetchNews } from '@/lib/news-fetcher'
import { CATEGORY_META, NewsItem } from '@/types'
import { getNewsEmoji } from '@/lib/news-fetcher'
import Navigation from '@/components/ui/Navigation'
import { ProfileProvider } from '@/components/ui/ProfileContext'
import HomeContent from './HomeContent'

export const revalidate = 3600

export default async function HomePage() {
  let initialNews: NewsItem[] = []
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
