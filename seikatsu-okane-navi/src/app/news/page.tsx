import { fetchNews } from '@/lib/news-fetcher'
import { CATEGORY_META } from '@/types'
import { getNewsEmoji } from '@/lib/news-fetcher'
import Navigation from '@/components/ui/Navigation'
import { ProfileProvider } from '@/components/ui/ProfileContext'
import NewsSection from '@/components/news/NewsSection'
import ProfileForm from '@/components/ui/ProfileForm'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: '今日の身近なお金ニュース｜生活お金ナビ',
  description: '物価・給付・税制・負担増など、家計に影響する最新ニュースをわかりやすく解説。あなたの年収・家族構成に基づいた具体的な影響額もわかります。',
}

export const revalidate = 3600

export default async function NewsPage() {
  let initialNews = []
  try {
    const raw = await fetchNews(10)
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

        {/* ページヘッダー */}
        <header className="animate-fade-in">
          <h1 className="text-xl font-display font-bold text-gray-800 flex items-center gap-2">
            <span>📰</span>今日の身近なお金ニュース
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            家計に影響するニュースを毎日自動で取得・整理。あなたの状況に合わせた影響額もわかります。
          </p>
        </header>

        {/* プロフィール設定（コンパクト） */}
        <div className="card">
          <p className="text-xs font-bold text-gray-600 mb-2">👤 あなたの情報を設定するとより詳しく分析します</p>
          <ProfileForm compact />
        </div>

        {/* ニュース一覧 */}
        <NewsSection defaultItems={initialNews} />

        {/* 情報源について */}
        <div className="text-xs text-gray-400 leading-relaxed bg-gray-50 rounded-xl p-3">
          <p className="font-medium mb-1">📡 情報源について</p>
          <p>NHKニュース・こども家庭庁・総務省・経済産業省などの公的機関の情報を自動取得しています。
          AI要約は参考情報です。重要事項は必ず元記事・公式サイトでご確認ください。</p>
          <p className="mt-1">ニュースは約1時間ごとに自動更新されます。</p>
        </div>
      </main>
    </ProfileProvider>
  )
}
