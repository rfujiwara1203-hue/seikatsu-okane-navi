import { NextResponse } from 'next/server'

export const revalidate = 86400 // 1日1回で十分（CPIは月次更新のため）

// 2025年基準消費者物価指数（総務省統計局 / e-Stat）
const ESTAT_STATS_DATA_ID = '0004052037'
const ESTAT_ENDPOINT = 'https://api.e-stat.go.jp/rest/3.0/app/json/getStatsData'

// 品目分類コード（cat01）。e-StatのgetMetaInfoで確認済み。
const FOOD_ITEMS: { id: string; label: string; emoji: string; catCode: string }[] = [
  { id: 'rice', label: 'コメ・パックご飯', emoji: '🍚', catCode: '0004' },
  { id: 'fish', label: '魚介類', emoji: '🐟', catCode: '0008' },
  { id: 'dairy_egg', label: '乳製品・卵', emoji: '🥛', catCode: '0016' },
  { id: 'veg', label: '生鮮野菜', emoji: '🥦', catCode: '0022' },
  { id: 'fruit', label: '生鮮果物', emoji: '🍎', catCode: '0028' },
  { id: 'oil_season', label: '油脂・調味料', emoji: '🧴', catCode: '0030' },
  { id: 'sweets', label: '菓子類（チョコ等）', emoji: '🍫', catCode: '0033' },
  { id: 'coffee', label: 'コーヒー・ココア', emoji: '☕', catCode: '0039' },
  { id: 'eating_out', label: '外食・テイクアウト', emoji: '🍜', catCode: '0042' },
]

interface EstatValue {
  '@time': string // 例: 2026000707 → 2026年7月
  '$': string // 前年同月比（%）
}

function parseTime(t: string): string {
  const year = t.slice(0, 4)
  const month = parseInt(t.slice(6, 8), 10)
  return `${year}年${month}月`
}

async function fetchItemTrend(appId: string, catCode: string, months = 6) {
  const params = new URLSearchParams({
    appId,
    statsDataId: ESTAT_STATS_DATA_ID,
    cdCat01: catCode,
    cdArea: '00000', // 全国
    cdTab: '3', // 前年同月比
    limit: String(months),
  })
  const res = await fetch(`${ESTAT_ENDPOINT}?${params}`, { next: { revalidate: 86400 } })
  if (!res.ok) throw new Error(`e-Stat HTTP ${res.status}`)
  const json = await res.json()
  const result = json?.GET_STATS_DATA?.RESULT
  if (result?.STATUS !== 0) throw new Error(`e-Stat error: ${result?.ERROR_MSG}`)
  const values: EstatValue[] = json?.GET_STATS_DATA?.STATISTICAL_DATA?.DATA_INF?.VALUE ?? []
  // e-Statは新しい月が先頭
  return values.map(v => ({ month: parseTime(v['@time']), yoyPercent: parseFloat(v['$']) }))
}

export async function GET() {
  const appId = process.env.ESTAT_APP_ID
  if (!appId) {
    return NextResponse.json(
      { error: 'ESTAT_APP_ID が未設定です', items: [] },
      { status: 200 }
    )
  }

  try {
    const items = await Promise.all(
      FOOD_ITEMS.map(async item => {
        const trend = await fetchItemTrend(appId, item.catCode)
        const latest = trend[0]
        return {
          id: item.id,
          label: item.label,
          emoji: item.emoji,
          latestMonth: latest?.month ?? null,
          latestYoyPercent: latest?.yoyPercent ?? null,
          trend, // 直近6ヶ月分（新しい順）。上昇/下落の推移表示に使う
        }
      })
    )
    return NextResponse.json({
      items,
      source: '総務省統計局 消費者物価指数（2025年基準・e-Stat API）',
      fetchedAt: new Date().toISOString(),
    })
  } catch (e) {
    console.error('food-prices API error:', e)
    return NextResponse.json(
      { error: '取得に失敗しました', items: [] },
      { status: 500 }
    )
  }
}
