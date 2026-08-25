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

// 文字列から安定した非負整数を作る（同じ記事には常に同じバリエーションを出すため）
function hashString(s: string): number {
  let h = 0
  for (let i = 0; i < s.length; i++) {
    h = (h * 31 + s.charCodeAt(i)) | 0
  }
  return Math.abs(h)
}

// AI失敗時のルールベースフォールバック（カテゴリごとに複数バリエーションを用意し、記事ごとにランダム風に選ぶ）
function fallbackAnalysis(item: RawNewsItem, profile: UserProfile): NewsImpact {
  const shienkin = getShienkin(profile)
  const fsLimit = getFsLimit(profile)
  const fam = FAMILY_LABELS[profile.family]

  const variantMap: Record<string, NewsImpact[]> = {
    burden: [
      {
        summary: `${item.title}に関するニュースです。詳細は元記事でご確認ください。`,
        impactLabel: 'negative',
        impactText: `年収${profile.income}万円・${fam}の場合、家計への負担増が見込まれます。支出の見直しを検討しましょう。`,
        actionHint: 'ふるさと納税や節税制度を活用して負担を軽減しましょう。',
      },
      {
        summary: `負担増に関するニュースです。今後の家計への影響に注意が必要です。`,
        impactLabel: 'negative',
        impactText: `こども・子育て支援金の負担は年間約${shienkin.toLocaleString()}円が目安です（年収${profile.income}万円の場合）。`,
        actionHint: '固定費（通信・電気・保険）の見直しで負担増分を吸収しましょう。',
      },
      {
        summary: `制度変更により負担が発生する可能性があるニュースです。`,
        impactLabel: 'negative',
        impactText: `${fam}のご家庭では、家計への影響が他の世帯構成より大きくなる場合があります。`,
        actionHint: '早めに家計の収支を見直し、影響額を試算しておきましょう。',
      },
    ],
    benefit: [
      {
        summary: `${item.title}に関する給付・支援情報です。`,
        impactLabel: 'positive',
        impactText: `年収${profile.income}万円・${fam}の場合、対象となる可能性があります。詳細を自治体窓口でご確認ください。`,
        actionHint: '申請期限がある場合が多いため、早めに確認を。',
      },
      {
        summary: `新しい給付・助成制度に関するニュースです。`,
        impactLabel: 'positive',
        impactText: `対象条件を満たせば、${fam}のご家庭にとってプラスになる制度です。`,
        actionHint: '申請不要（自動振込）か申請必要かを必ず確認しましょう。',
      },
      {
        summary: `支援制度の拡充・見直しに関する情報です。`,
        impactLabel: 'positive',
        impactText: `年収${profile.income}万円の方でも対象となるケースがあります。所得制限を確認してみましょう。`,
        actionHint: 'お住まいの自治体のWebサイトで最新の対象要件をチェックしましょう。',
      },
    ],
    tax: [
      {
        summary: `税制・ふるさと納税に関する情報です。`,
        impactLabel: 'neutral',
        impactText: `年収${profile.income}万円のあなたのふるさと納税控除限度額は年間約${fsLimit.toLocaleString()}円です。`,
        actionHint: '年末に向けてふるさと納税の計画を立てておきましょう。',
      },
      {
        summary: `税制改正に関するニュースです。控除や申告方法に変更がある可能性があります。`,
        impactLabel: 'neutral',
        impactText: `${fam}の場合、控除額や納税額が変わる可能性があります。詳細は国税庁の情報を確認しましょう。`,
        actionHint: '確定申告・年末調整の時期に慌てないよう、早めに情報収集を。',
      },
    ],
    price: [
      {
        summary: `物価に関するニュースです。家計の食費・光熱費への影響に注意が必要です。`,
        impactLabel: 'negative',
        impactText: `物価上昇が続いており、${fam}の場合は年間数万円の追加負担になる可能性があります。`,
        actionHint: '旬の食材・ふるさと納税の食品返礼品・電力比較で対策を。',
      },
      {
        summary: `物価・生活費の変動に関するニュースです。`,
        impactLabel: 'negative',
        impactText: `食料品・光熱費の値上がりが続くと、年収${profile.income}万円の家計にも影響が出やすくなります。`,
        actionHint: '固定費（通信・電力・保険）の見直しで、値上がり分を相殺しましょう。',
      },
    ],
    invest: [
      {
        summary: `資産形成（NISA・iDeCoなど）に関するニュースです。`,
        impactLabel: 'positive',
        impactText: `${fam}・年収${profile.income}万円の場合、非課税制度を活用することで長期的な節税効果が期待できます。`,
        actionHint: 'NISA・iDeCoの制度変更点を確認し、積立額の見直しを検討しましょう。',
      },
      {
        summary: `投資・資産形成に関する制度改正のニュースです。`,
        impactLabel: 'neutral',
        impactText: `制度の変更内容によっては、今のうちに口座開設や積立設定をしておくと有利になる場合があります。`,
        actionHint: '証券会社の公式サイトで最新の制度内容を確認しましょう。',
      },
    ],
    policy: [
      {
        summary: `政策・制度改正に関するニュースです。`,
        impactLabel: 'neutral',
        impactText: `${fam}のご家庭に影響する可能性がある制度変更です。詳細を確認しておきましょう。`,
        actionHint: '関連する省庁・自治体の公式発表を定期的にチェックしましょう。',
      },
    ],
    general: [
      {
        summary: `${item.title}についての情報です。`,
        impactLabel: 'neutral',
        impactText: '詳細は元記事をご確認ください。',
        actionHint: '気になる点は自治体窓口やファイナンシャルプランナーにご相談ください。',
      },
    ],
  }

  const variants = variantMap[item.category] ?? variantMap.general
  const idx = hashString(item.id) % variants.length
  return variants[idx]
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
