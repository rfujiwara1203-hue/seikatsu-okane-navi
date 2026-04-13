// ユーザープロフィール
export type FamilyType =
  | 'single'
  | 'couple'
  | 'couple_dep'
  | 'child1'
  | 'child2'
  | 'child3'
  | 'single_parent'

export interface UserProfile {
  income: number        // 万円
  family: FamilyType
  pref?: string
}

// ニュース
export type NewsCategory =
  | 'burden'     // 負担増
  | 'benefit'    // 給付・支援
  | 'price'      // 物価
  | 'tax'        // 税制
  | 'invest'     // 資産形成
  | 'policy'     // 政策
  | 'general'    // その他

export interface RawNewsItem {
  id: string
  title: string
  link: string
  pubDate: string
  source: string
  content?: string
  category: NewsCategory
}

export interface NewsImpact {
  summary: string           // AI要約（2〜4行）
  impactLabel: 'positive' | 'negative' | 'neutral' | 'mixed'
  impactText: string        // ユーザー入力に基づく具体的影響
  actionHint: string        // おすすめ対策ヒント
  affectedAmount?: number   // 影響金額（円/月）
}

export interface NewsItem extends RawNewsItem {
  impact?: NewsImpact
  emoji: string
  categoryLabel: string
  isNew?: boolean
}

// ふるさと納税
export const FS_LIMITS: Record<FamilyType, Record<number, number>> = {
  single:      { 150:14000,200:15000,300:28000,400:42000,500:61000,600:77000,700:108000,800:129000,1000:180000,1200:252000 },
  couple:      { 150:18000,200:20000,300:34000,400:51000,500:72000,600:93000,700:124000,800:144000,1000:200000,1200:280000 },
  couple_dep:  { 150:11000,200:14000,300:27000,400:40000,500:57000,600:75000,700:106000,800:127000,1000:176000,1200:248000 },
  child1:      { 150:9000, 200:12000,300:26000,400:38000,500:55000,600:71000,700:102000,800:122000,1000:172000,1200:240000 },
  child2:      { 150:4000, 200:7000, 300:22000,400:33000,500:48000,600:63000,700:93000, 800:113000,1000:163000,1200:230000 },
  child3:      { 150:0,    200:2000, 300:15000,400:26000,500:40000,600:54000,700:85000, 800:105000,1000:155000,1200:222000 },
  single_parent:{ 150:9000,200:12000,300:25000,400:37000,500:52000,600:67000,700:97000, 800:117000,1000:167000,1200:235000 },
}

// こども・子育て支援金（2026年度）
export const SHIENKIN: Record<number, number> = {
  150: 2100, 200: 2300, 300: 3500, 400: 4600,
  500: 5800, 600: 6900, 700: 8100, 800: 9200,
  1000: 11500, 1200: 13800,
}

export const FAMILY_LABELS: Record<FamilyType, string> = {
  single:       '独身',
  couple:       '夫婦（共働き）',
  couple_dep:   '夫婦（片働き）',
  child1:       '夫婦＋子1人',
  child2:       '夫婦＋子2人',
  child3:       '夫婦＋子3人以上',
  single_parent:'ひとり親',
}

export const CATEGORY_META: Record<NewsCategory, { label: string; emoji: string; color: string }> = {
  burden:  { label: '負担増',   emoji: '⚠️',  color: 'bg-orange-100 text-orange-800' },
  benefit: { label: '給付・支援', emoji: '🎁', color: 'bg-green-100 text-green-800' },
  price:   { label: '物価',     emoji: '📈',  color: 'bg-red-100 text-red-800' },
  tax:     { label: '税制',     emoji: '📋',  color: 'bg-blue-100 text-blue-800' },
  invest:  { label: '資産形成', emoji: '💹',  color: 'bg-purple-100 text-purple-800' },
  policy:  { label: '政策',     emoji: '🏛️', color: 'bg-gray-100 text-gray-800' },
  general: { label: 'ニュース', emoji: '📰',  color: 'bg-gray-100 text-gray-700' },
}
