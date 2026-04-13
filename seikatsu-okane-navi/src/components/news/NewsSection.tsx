'use client'
import { useEffect, useState, useCallback } from 'react'
import { useProfile } from '@/components/ui/ProfileContext'
import NewsCard from './NewsCard'
import { NewsItem } from '@/types'

interface NewsResponse {
  items: NewsItem[]
  analyzed: boolean
  fetchedAt: string
  error?: string
}

export default function NewsSection({ defaultItems }: { defaultItems?: NewsItem[] }) {
  const { profile, isLoaded } = useProfile()
  const [data, setData] = useState<NewsResponse | null>(
    defaultItems ? { items: defaultItems, analyzed: false, fetchedAt: new Date().toISOString() } : null
  )
  const [loading, setLoading] = useState(!defaultItems)
  const [error, setError] = useState<string | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)

  const fetchNews = useCallback(async (withAI = false) => {
    setLoading(true)
    setError(null)
    try {
      const params = new URLSearchParams({
        income: String(profile.income),
        family: profile.family,
        analyze: String(withAI),
      })
      const res = await fetch(`/api/news?${params}`, {
        next: { revalidate: 3600 }
      })
      if (!res.ok) throw new Error('取得失敗')
      const json = await res.json()
      setData(json)
    } catch (e) {
      setError('ニュースの読み込みに失敗しました。しばらく待ってから再度お試しください。')
    } finally {
      setLoading(false)
      setIsAnalyzing(false)
    }
  }, [profile.income, profile.family])

  // プロフィールが読み込まれたら自動fetch
  useEffect(() => {
    if (isLoaded) fetchNews(false)
  }, [isLoaded, fetchNews])

  const handleAnalyze = async () => {
    setIsAnalyzing(true)
    await fetchNews(true)
  }

  const fetchedDate = data?.fetchedAt
    ? new Date(data.fetchedAt).toLocaleString('ja-JP', { month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit' })
    : null

  return (
    <section className="space-y-3">
      {/* ヘッダー */}
      <div className="flex items-center justify-between">
        <h2 className="section-title">
          <span>📰</span>
          今日の身近なお金ニュース
        </h2>
        {fetchedDate && (
          <span className="text-xs text-gray-400">{fetchedDate} 更新</span>
        )}
      </div>

      {/* AI分析ボタン（未分析時のみ） */}
      {data && !data.analyzed && !loading && (
        <div className="bg-navy-light border border-blue-200 rounded-xl p-3 flex items-center justify-between gap-3">
          <div>
            <p className="text-sm font-bold text-navy">🤖 あなたの家庭への影響を分析する</p>
            <p className="text-xs text-gray-600 mt-0.5">
              年収{profile.income}万円・{profile.family}の情報でAIが詳しく解説します
            </p>
          </div>
          <button
            onClick={handleAnalyze}
            disabled={isAnalyzing}
            className="btn-primary text-xs py-2 px-3 flex-shrink-0 whitespace-nowrap"
          >
            {isAnalyzing ? '分析中…' : '分析する'}
          </button>
        </div>
      )}

      {/* ローディング */}
      {loading && (
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="card space-y-3">
              <div className="flex gap-3">
                <div className="skeleton w-8 h-8 rounded-full flex-shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="skeleton h-3 w-24 rounded" />
                  <div className="skeleton h-4 rounded" />
                  <div className="skeleton h-4 w-3/4 rounded" />
                </div>
              </div>
              <div className="skeleton h-12 rounded-lg" />
            </div>
          ))}
        </div>
      )}

      {/* エラー */}
      {error && (
        <div className="card bg-orange-50 border-orange-200 text-center py-6">
          <p className="text-2xl mb-2">📡</p>
          <p className="text-sm text-orange-700 font-medium">{error}</p>
          <button onClick={() => fetchNews(false)} className="btn-secondary mt-3 text-sm py-2 px-4">
            再読み込み
          </button>
        </div>
      )}

      {/* ニュースリスト */}
      {!loading && !error && data?.items && (
        <>
          <div className="space-y-3">
            {data.items.map((item, i) => (
              <NewsCard key={item.id} item={item} index={i} />
            ))}
          </div>

          {data.items.length === 0 && (
            <div className="card text-center py-8 text-gray-400">
              <p className="text-3xl mb-2">📭</p>
              <p className="text-sm">現在、新しいニュースはありません</p>
            </div>
          )}

          {/* フッター */}
          <div className="text-center">
            <button
              onClick={() => fetchNews(false)}
              className="text-xs text-gray-400 hover:text-gray-600 transition-colors"
            >
              🔄 最新ニュースを取得
            </button>
          </div>
        </>
      )}
    </section>
  )
}
