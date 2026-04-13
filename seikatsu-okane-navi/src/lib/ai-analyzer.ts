import Anthropic from '@anthropic-ai/sdk'
import { RawNewsItem, NewsImpact, UserProfile, FS_LIMITS, SHIENKIN, FAMILY_LABELS } from '@/types'

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

// ユーザープロフィールに基づく家計コンテキスト生成
function buildProfileContext(profile: UserProfile): string {
  const fsLimit = getFsLimit(profile)
  const shienkin = getShienkin(profile)
  const familyLabel = FAMILY_LABELS[profile.family]

  return `
ユーザー情報：
- 年収：${profile.income}万円
- 家族構成：${familyLabel}
- ふるさと納税控除限度額の目安：年間${fsLimit.toLocaleString()}円
- こども・子育て支援金の年間負担目安：${shienkin.toLocaleString()}円
`.trim()
}

// ふるさと納税限度額取得
function getFsLimit(profile: UserProfile): number {
  const table = FS_LIMITS[profile.family]
  if (!table) return 0
  const incomes = Object.keys(table).map(Number).sort((a, b) => a - b)
  let closest = incomes[0]
  for (const inc of incomes) {
    if (inc <= profile.income) closest = inc
    else break
  }
  return table[closest] ?? 0
}

// 支援金負担取得
function getShienkin(profile: UserProfile): number {
  const incomes = Object.keys(SHIENKIN).map(Number).sort((a, b) => a - b)
  let closest = incomes[0]
  for (const inc of incomes) {
    if (inc <= profile.income) closest = inc
    else break
  }
  return SHIENKIN[closest] ?? 4600
}

// AIによるニュース要約＋家計影響分析
export async function analyzeNewsImpact(
  item: RawNewsItem,
  profile: UserProfile
): Promise<NewsImpact> {
  const profileCtx = buildProfileContext(profile)

  const prompt = `
あなたは家計アドバイザーです。以下のニュースについて、指定されたユーザーの家計への影響を分析してください。

【ニュース】
タイトル：${item.title}
内容：${item.content ?? 'なし'}
情報源：${item.source}

【${FAMILY_LABELS[profile.family]}・年収${profile.income}万円のユーザー情報】
${profileCtx}

以下の形式でJSONのみを返してください（他のテキストは不要）：
{
  "summary": "ニュースの平易な要約（2〜4行、難しい言葉を使わず、中学生でもわかるように）",
  "impactLabel": "positive/negative/neutral/mixedのいずれか",
  "impactText": "このユーザーの家庭への具体的影響（例：月○円の負担増、年収○万円・○人家族の場合など。金額は具体的に。50〜100文字）",
  "actionHint": "今すぐできる対策ヒント1〜2行（ふるさと納税活用、節電、口座開設など具体的に）",
  "affectedAmount": 月間影響金額（プラスは恩恵、マイナスは負担。円単位の整数。不明な場合はnull）
}
`.trim()

  try {
    const message = await client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 400,
      messages: [{ role: 'user', content: prompt }],
    })

    const text = message.content
      .filter(b => b.type === 'text')
      .map(b => (b as { type: 'text'; text: string }).text)
      .join('')

    const clean = text.replace(/```json|```/g, '').trim()
    const parsed = JSON.parse(clean) as NewsImpact
    return parsed
  } catch (e) {
    console.error('AI analysis failed:', e)
    // フォールバック：ルールベースで簡易分析
    return fallbackAnalysis(item, profile)
  }
}

// AI失敗時のルールベースフォールバック
function fallbackAnalysis(item: RawNewsItem, profile: UserProfile): NewsImpact {
  const shienkin = getShienkin(profile)
  const fsLimit = getFsLimit(profile)

  const impactMap: Record<string, NewsImpact> = {
    burden: {
      summary: `${item.title}に関するニュースです。詳細は元記事でご確認ください。`,
      impactLabel: 'negative',
      impactText: `年収${profile.income}万円・${FAMILY_LABELS[profile.family]}の場合、家計への負担増が見込まれます。支出の見直しを検討しましょう。`,
      actionHint: 'ふるさと納税や節税制度を活用して負担を軽減しましょう。',
    },
    benefit: {
      summary: `${item.title}に関する給付・支援情報です。`,
      impactLabel: 'positive',
      impactText: `年収${profile.income}万円・${FAMILY_LABELS[profile.family]}の場合、対象となる可能性があります。詳細を自治体窓口でご確認ください。`,
      actionHint: '申請期限がある場合が多いため、早めに確認を。',
    },
    tax: {
      summary: `税制・ふるさと納税に関する情報です。`,
      impactLabel: 'neutral',
      impactText: `年収${profile.income}万円のあなたのふるさと納税控除限度額は年間約${fsLimit.toLocaleString()}円です。`,
      actionHint: '年末に向けてふるさと納税の計画を立てておきましょう。',
    },
    price: {
      summary: `物価に関するニュースです。家計の食費・光熱費への影響に注意が必要です。`,
      impactLabel: 'negative',
      impactText: `物価上昇が続いており、4人家族の場合は年間数万円の追加負担になる可能性があります。`,
      actionHint: '旬の食材・ふるさと納税の食品返礼品・電力比較で対策を。',
    },
  }

  return impactMap[item.category] ?? {
    summary: `${item.title}についての情報です。`,
    impactLabel: 'neutral',
    impactText: '詳細は元記事をご確認ください。',
    actionHint: '気になる点は自治体窓口やファイナンシャルプランナーにご相談ください。',
  }
}

// バッチ分析（並列制限付き）
export async function analyzeNewsBatch(
  items: RawNewsItem[],
  profile: UserProfile,
  concurrency = 3
): Promise<Array<RawNewsItem & { impact: NewsImpact }>> {
  const results: Array<RawNewsItem & { impact: NewsImpact }> = []

  for (let i = 0; i < items.length; i += concurrency) {
    const batch = items.slice(i, i + concurrency)
    const analyzed = await Promise.all(
      batch.map(async item => ({
        ...item,
        impact: await analyzeNewsImpact(item, profile),
      }))
    )
    results.push(...analyzed)
  }

  return results
}
