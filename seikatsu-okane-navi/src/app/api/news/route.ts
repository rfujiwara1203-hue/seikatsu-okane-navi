import { NextRequest, NextResponse } from 'next/server'
import { fetchNews } from '@/lib/news-fetcher'
import { analyzeNewsBatch } from '@/lib/ai-analyzer'
import { UserProfile, CATEGORY_META } from '@/types'
import { getNewsEmoji } from '@/lib/news-fetcher'

export const revalidate = 3600 // 1時間キャッシュ

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const income = parseInt(searchParams.get('income') ?? '500')
  const family = (searchParams.get('family') ?? 'single') as UserProfile['family']
  const analyze = searchParams.get('analyze') === 'true'

  const profile: UserProfile = { income, family }

  try {
    const rawNews = await fetchNews(8)

    if (!analyze || !process.env.ANTHROPIC_API_KEY) {
      // AI分析なし（高速・フォールバック）
      return NextResponse.json({
        items: rawNews.map(item => ({
          ...item,
          emoji: getNewsEmoji(item),
          categoryLabel: CATEGORY_META[item.category]?.label ?? 'ニュース',
        })),
        analyzed: false,
        fetchedAt: new Date().toISOString(),
      })
    }

    // AI分析あり（最大3件に絞って速度確保）
    const priorityItems = rawNews.slice(0, 3)
    const rest = rawNews.slice(3)

    const analyzedItems = await analyzeNewsBatch(priorityItems, profile, 2)

    return NextResponse.json({
      items: [
        ...analyzedItems.map(item => ({
          ...item,
          emoji: getNewsEmoji(item),
          categoryLabel: CATEGORY_META[item.category]?.label ?? 'ニュース',
        })),
        ...rest.map(item => ({
          ...item,
          emoji: getNewsEmoji(item),
          categoryLabel: CATEGORY_META[item.category]?.label ?? 'ニュース',
        })),
      ],
      analyzed: true,
      fetchedAt: new Date().toISOString(),
    })
  } catch (error) {
    console.error('News API error:', error)
    return NextResponse.json(
      { error: 'ニュースの取得に失敗しました', items: [], analyzed: false },
      { status: 500 }
    )
  }
}
