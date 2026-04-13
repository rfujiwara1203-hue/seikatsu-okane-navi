import { NewsCategory, RawNewsItem, CATEGORY_META } from '@/types'

// RSS取得先リスト（信頼性の高い公的機関）
const RSS_SOURCES = [
  {
    url: 'https://www3.nhk.or.jp/rss/news/cat1.xml', // NHK社会
    category: 'general' as NewsCategory,
    source: 'NHK',
    keywords: ['物価', '給付', '支援金', '保険料', '税', '年金', '補助', '家計', '食料', 'ガス', '電気'],
  },
  {
    url: 'https://www.e-gov.go.jp/rss/news.rss',
    category: 'policy' as NewsCategory,
    source: 'e-Gov',
    keywords: ['給付金', '控除', '支援', '保険'],
  },
]

// カテゴリ分類キーワード
function classifyCategory(title: string, content: string): NewsCategory {
  const text = (title + ' ' + content).toLowerCase()
  if (/支援金|保険料|年金|社会保険|扶養|103万|178万/.test(text)) return 'burden'
  if (/給付金|補助金|助成|給付|支援給付/.test(text)) return 'benefit'
  if (/物価|食料|電気代|ガス代|値上|インフレ/.test(text)) return 'price'
  if (/ふるさと納税|確定申告|控除|税制|所得税|住民税/.test(text)) return 'tax'
  if (/nisa|iDeCo|積立|投資|資産形成/.test(text.replace(/\s/g, ''))) return 'invest'
  if (/政策|制度|法改正|閣議|国会/.test(text)) return 'policy'
  return 'general'
}

// テキストからHTMLタグを除去
function stripHtml(html: string): string {
  return html
    .replace(/<[^>]*>/g, '')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, ' ')
    .trim()
}

// RSS XMLをパース（rss-parserの代わりに軽量実装）
function parseRssXml(xml: string, source: string, defaultCategory: NewsCategory): RawNewsItem[] {
  const items: RawNewsItem[] = []
  const itemRegex = /<item>([\s\S]*?)<\/item>/g
  let match

  while ((match = itemRegex.exec(xml)) !== null) {
    const itemXml = match[1]
    const title   = stripHtml(/<title><!\[CDATA\[(.*?)\]\]>|<title>(.*?)<\/title>/s.exec(itemXml)?.[1] ?? '')
    const link    = /<link>(.*?)<\/link>|<link\s+href="(.*?)"/.exec(itemXml)?.[1]?.trim() ?? ''
    const pubDate = /<pubDate>(.*?)<\/pubDate>/.exec(itemXml)?.[1]?.trim() ?? new Date().toISOString()
    const desc    = stripHtml(/<description><!\[CDATA\[([\s\S]*?)\]\]>|<description>([\s\S]*?)<\/description>/s.exec(itemXml)?.[1] ?? '')
    const guid    = /<guid[^>]*>(.*?)<\/guid>/.exec(itemXml)?.[1]?.trim() ?? link

    if (!title || !link) continue

    const category = classifyCategory(title, desc)
    items.push({
      id: `rss-${Buffer.from(guid).toString('base64').slice(0, 16)}`,
      title: title.slice(0, 120),
      link,
      pubDate,
      source,
      content: desc.slice(0, 600),
      category,
    })
  }
  return items
}

// RSS取得（タイムアウト付き）
async function fetchRss(url: string, source: string, category: NewsCategory, keywords: string[]): Promise<RawNewsItem[]> {
  try {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 8000)

    const res = await fetch(url, {
      signal: controller.signal,
      next: { revalidate: 3600 },
      headers: { 'User-Agent': 'SeikatsuOkaneNavi/1.0' },
    })
    clearTimeout(timeout)

    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const xml = await res.text()
    const all = parseRssXml(xml, source, category)

    // 家計に関連するニュースだけフィルタ
    return all.filter(item => {
      const text = item.title + ' ' + (item.content ?? '')
      return keywords.some(kw => text.includes(kw))
    })
  } catch (e) {
    console.warn(`RSS fetch failed: ${url}`, e)
    return []
  }
}

// フォールバック静的データ読み込み
async function loadFallbackNews(): Promise<RawNewsItem[]> {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'}/data/fallback-news.json`,
      { next: { revalidate: 86400 } }
    )
    if (res.ok) return await res.json()
  } catch {}

  // 環境によっては直接importする
  const fallback = await import('../../public/data/fallback-news.json')
  return (fallback.default as RawNewsItem[])
}

// メイン：ニュース取得（RSS優先 → fallback）
export async function fetchNews(maxItems = 10): Promise<RawNewsItem[]> {
  const results = await Promise.allSettled(
    RSS_SOURCES.map(src => fetchRss(src.url, src.source, src.category, src.keywords))
  )

  const rssItems = results
    .filter((r): r is PromiseFulfilledResult<RawNewsItem[]> => r.status === 'fulfilled')
    .flatMap(r => r.value)

  // 重複除去・日付降順ソート
  const unique = Array.from(
    new Map(rssItems.map(item => [item.id, item])).values()
  ).sort((a, b) => new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime())

  if (unique.length >= 3) {
    return unique.slice(0, maxItems)
  }

  // RSSが少ない場合はfallbackで補完
  const fallback = await loadFallbackNews()
  const merged = [...unique, ...fallback.filter(f => !unique.some(u => u.id === f.id))]
  return merged.slice(0, maxItems)
}

// emoji割り当て
export function getNewsEmoji(item: RawNewsItem): string {
  return CATEGORY_META[item.category]?.emoji ?? '📰'
}
