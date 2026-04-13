'use client'
import { useState } from 'react'
import { useProfile } from '@/components/ui/ProfileContext'
import { getFsLimit, getShienkin, formatCurrency } from '@/lib/profile'
import { FAMILY_LABELS } from '@/types'
import { FurusatoCard } from '@/components/dashboard/SummaryCards'
import ProfileForm from '@/components/ui/ProfileForm'

type Tab = 'overview' | 'furusato' | 'nisa' | 'fixed' | 'benefit'

const TABS: { id: Tab; label: string; emoji: string }[] = [
  { id: 'overview',  label: '概要',        emoji: '📊' },
  { id: 'furusato',  label: 'ふるさと納税', emoji: '🏘️' },
  { id: 'nisa',      label: 'NISA・iDeCo', emoji: '📈' },
  { id: 'fixed',     label: '固定費',      emoji: '💡' },
  { id: 'benefit',   label: '給付金',      emoji: '🎁' },
]

export default function DashboardContent() {
  const { profile } = useProfile()
  const [tab, setTab] = useState<Tab>('overview')
  const [showProfileEdit, setShowProfileEdit] = useState(false)

  const fsLimit = getFsLimit(profile)
  const shienkin = getShienkin(profile)

  return (
    <div className="space-y-4">
      {/* ヘッダー */}
      <div className="flex items-center justify-between animate-fade-in">
        <div>
          <h1 className="text-xl font-display font-bold text-gray-800">📊 マイ家計ダッシュボード</h1>
          <p className="text-xs text-gray-500 mt-0.5">
            年収{profile.income}万円・{FAMILY_LABELS[profile.family]}
            <button onClick={() => setShowProfileEdit(e => !e)} className="ml-1 text-primary underline">変更</button>
          </p>
        </div>
      </div>

      {/* プロフィール編集パネル */}
      {showProfileEdit && (
        <div className="card animate-slide-up">
          <h2 className="font-bold text-sm text-gray-700 mb-3">プロフィールを変更</h2>
          <ProfileForm compact onSubmit={() => setShowProfileEdit(false)} />
        </div>
      )}

      {/* タブ */}
      <div className="flex gap-1 overflow-x-auto hide-scrollbar pb-1">
        {TABS.map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
              tab === t.id
                ? 'bg-primary text-white'
                : 'bg-white text-gray-600 border border-surface-border hover:border-primary'
            }`}
          >
            {t.emoji} {t.label}
          </button>
        ))}
      </div>

      {/* タブコンテンツ */}
      <div className="animate-fade-in" key={tab}>
        {tab === 'overview'  && <OverviewTab />}
        {tab === 'furusato'  && <FurusatoTab />}
        {tab === 'nisa'      && <NisaTab />}
        {tab === 'fixed'     && <FixedTab />}
        {tab === 'benefit'   && <BenefitTab />}
      </div>
    </div>
  )
}

/* ========== 概要タブ ========== */
function OverviewTab() {
  const { profile } = useProfile()
  const fsLimit = getFsLimit(profile)
  const shienkin = getShienkin(profile)

  const items = [
    { label: 'ふるさと納税 控除限度額', value: `約${formatCurrency(fsLimit)}`, note: '年間・自己負担2,000円', positive: true },
    { label: 'こども・子育て支援金', value: `年${formatCurrency(shienkin)}`, note: `月${formatCurrency(Math.round(shienkin/12))}の負担増`, positive: false },
    { label: '電気・ガス補助終了影響', value: '月+1,000〜2,000円', note: '2026年4月から', positive: false },
  ]

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-1 gap-3">
        {items.map((item, i) => (
          <div key={i} className={`card flex justify-between items-center ${item.positive ? 'border-primary bg-primary-light' : 'border-orange-200 bg-orange-50'}`}>
            <div>
              <p className="text-sm font-medium text-gray-700">{item.label}</p>
              <p className="text-xs text-gray-500">{item.note}</p>
            </div>
            <p className={`text-base font-bold ${item.positive ? 'text-primary' : 'text-accent'}`}>
              {item.value}
            </p>
          </div>
        ))}
      </div>
      <div className="card bg-gray-50">
        <p className="text-xs text-gray-500 leading-relaxed">
          ※数値はすべて目安です。実際の金額は自治体・保険の種類・年収の正確な値により異なります。
        </p>
      </div>
    </div>
  )
}

/* ========== ふるさと納税タブ ========== */
function FurusatoTab() {
  return (
    <div className="space-y-3">
      <FurusatoCard />
      <div className="card">
        <h3 className="font-bold text-sm text-gray-700 mb-3">🛒 返礼品選びのコツ</h3>
        <div className="space-y-2 text-sm text-gray-600">
          {[
            '🍚 コメ・食品類：毎月の食費を実質削減できる',
            '🐟 魚介・肉類：高単価で値上がり中の食材がお得',
            '🧴 日用品・消耗品：ティッシュ・トイレットペーパーなど',
            '📦 まとめ買いで送料・梱包コストを下げる',
          ].map((tip, i) => (
            <p key={i} className="bg-gray-50 rounded-lg px-3 py-2">{tip}</p>
          ))}
        </div>
        <div className="mt-3 text-xs text-gray-400">
          ポイント付与は2025年10月から禁止。返礼品の品質・量で選びましょう。
        </div>
      </div>
      <AdBanner title="さとふる｜スマホで簡単申し込み" sub="ワンストップ特例もアプリで完結 →" />
    </div>
  )
}

/* ========== NISA・iDeCoタブ ========== */
function NisaTab() {
  const { profile } = useProfile()
  const [monthlyAmount, setMonthlyAmount] = useState(30000)
  const [years, setYears] = useState(20)
  const annual = 0.05
  const totalInput = monthlyAmount * 12 * years
  const result = monthlyAmount * (((1 + annual / 12) ** (years * 12) - 1) / (annual / 12))
  const gain = result - totalInput
  const taxSaved = Math.round(gain * 0.2031)

  return (
    <div className="space-y-3">
      {/* 資産形成が大事な理由 */}
      <div className="card bg-navy-light border-blue-200">
        <h3 className="font-bold text-sm text-navy mb-2">💭 貯金だけでいいの？正直な話</h3>
        <div className="space-y-2">
          {[
            { title: '物価が上がると貯金の価値が下がる', desc: '年2%の物価上昇が続くと、10年後の100万円は実質82万円の価値に' },
            { title: '年金だけでは月約5万円の赤字', desc: '老後20年で1,000〜2,000万円の不足（厚生労働省・家計調査）' },
            { title: '複利は早く始めるほど差が大きい', desc: '月3万円を30歳から始めると40歳から始めるより約800万円多くなる（年利5%想定）' },
          ].map((item, i) => (
            <div key={i} className="bg-white rounded-lg px-3 py-2">
              <p className="text-xs font-bold text-navy">{item.title}</p>
              <p className="text-xs text-gray-500 mt-0.5">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* NISAシミュレーター */}
      <div className="card">
        <h3 className="font-bold text-sm text-gray-700 mb-3">📈 NISAシミュレーター（年利5%想定）</h3>
        <div className="space-y-3">
          <div>
            <label className="text-xs text-gray-600 mb-1 block">月々の積立額</label>
            <div className="flex items-center gap-2">
              <input
                type="range" min={5000} max={100000} step={5000}
                value={monthlyAmount}
                onChange={e => setMonthlyAmount(Number(e.target.value))}
                className="flex-1"
              />
              <span className="text-sm font-bold text-navy w-20 text-right">
                {formatCurrency(monthlyAmount)}
              </span>
            </div>
          </div>
          <div>
            <label className="text-xs text-gray-600 mb-1 block">積立期間</label>
            <div className="flex items-center gap-2">
              <input
                type="range" min={5} max={35} step={5}
                value={years}
                onChange={e => setYears(Number(e.target.value))}
                className="flex-1"
              />
              <span className="text-sm font-bold text-navy w-16 text-right">{years}年</span>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2 pt-2 border-t border-surface-border">
            <div className="text-center bg-gray-50 rounded-xl p-3">
              <p className="text-xs text-gray-500 mb-1">元本</p>
              <p className="text-sm font-bold">{(totalInput / 10000).toFixed(0)}万円</p>
            </div>
            <div className="text-center bg-primary-light rounded-xl p-3">
              <p className="text-xs text-primary mb-1">運用後（NISA）</p>
              <p className="text-sm font-bold text-primary">{Math.round(result / 10000)}万円</p>
              <p className="text-xs text-green-600">税金ゼロで{Math.round(gain / 10000)}万円増！</p>
            </div>
          </div>
          <p className="text-xs text-gray-400">※年利5%は一定の想定値。実際の運用成果は保証されません。</p>
        </div>
      </div>
      <AdBanner title="SBI証券｜NISA口座開設（無料）" sub="業界最安水準の手数料・つみたて銘柄充実 →" />
    </div>
  )
}

/* ========== 固定費タブ ========== */
function FixedTab() {
  const items = [
    { icon: '📱', label: 'スマホを格安SIMに乗り換え', save: 72000, tip: 'UQモバイル・ワイモバイルなら速度も安定' },
    { icon: '⚡', label: '電力会社の見直し', save: 37000, tip: 'エネチェンジで郵便番号入力だけで比較' },
    { icon: '🌐', label: 'ネット回線の見直し', save: 12000, tip: 'スマホとのセット割で月1,100円引きも' },
    { icon: '💳', label: 'クレカを高還元カードに集約', save: 15000, tip: 'リクルートカードで固定費1.2%還元' },
    { icon: '🏥', label: '生命保険の保障内容を見直し', save: 20000, tip: '不要な特約を外すだけで保険料が下がる' },
    { icon: '📺', label: 'NHKを2年前払い（クレカ）に', save: 3500, tip: 'クレカポイントも同時に獲得できる' },
  ]

  return (
    <div className="space-y-3">
      <p className="text-sm text-gray-600">チェックした項目の合計節約額が計算されます。</p>
      <FixedCostChecklist items={items} />
      <AdBanner title="ほけんの窓口｜無料の保険相談" sub="プロが中立的に保険を見直し・提案 →" />
    </div>
  )
}

function FixedCostChecklist({ items }: { items: { icon: string; label: string; save: number; tip: string }[] }) {
  const [checked, setChecked] = useState<Set<number>>(new Set())
  const total = [...checked].reduce((s, i) => s + (items[i]?.save ?? 0), 0)

  return (
    <div className="space-y-2">
      {items.map((item, i) => (
        <label key={i} className={`card flex items-start gap-3 cursor-pointer transition-colors ${checked.has(i) ? 'border-primary bg-primary-light' : ''}`}>
          <input
            type="checkbox"
            checked={checked.has(i)}
            onChange={() => setChecked(prev => {
              const next = new Set(prev)
              next.has(i) ? next.delete(i) : next.add(i)
              return next
            })}
            className="mt-0.5 w-4 h-4 accent-primary flex-shrink-0"
          />
          <div className="flex-1">
            <div className="flex justify-between items-start">
              <p className="text-sm font-medium">{item.icon} {item.label}</p>
              <p className="text-sm font-bold text-primary ml-2 flex-shrink-0">年{(item.save / 10000).toFixed(1)}万円</p>
            </div>
            <p className="text-xs text-gray-500 mt-0.5">{item.tip}</p>
          </div>
        </label>
      ))}
      {checked.size > 0 && (
        <div className="card bg-primary text-white text-center animate-slide-up">
          <p className="text-xs opacity-80 mb-1">選択した項目の年間節約目安</p>
          <p className="text-2xl font-display font-bold">{formatCurrency(total)}</p>
        </div>
      )}
    </div>
  )
}

/* ========== 給付金タブ ========== */
function BenefitTab() {
  const { profile } = useProfile()

  const benefits = [
    { name: '低所得世帯向け給付金（物価高対策）', amt: '3万円/世帯', condition: (i: number) => i <= 300, family: 'all', urgent: true, desc: '住民税非課税・均等割のみ世帯が対象' },
    { name: '子育て世帯生活支援特別給付金', amt: '5万円/子', condition: (i: number) => i <= 500, family: 'child', urgent: false, desc: '低所得ふたり親・ひとり親世帯の18歳以下の子ども対象' },
    { name: '高額療養費制度', amt: '超過分を還付', condition: () => true, family: 'all', urgent: false, desc: '月の医療費が自己負担限度額を超えた分は申請で戻ります' },
    { name: '子どもの医療費助成', amt: '窓口無料〜', condition: () => true, family: 'child', urgent: false, desc: '多くの自治体で中学・高校まで助成。所得制限あり' },
  ]

  const hasChild = ['child1','child2','child3','single_parent'].includes(profile.family)

  const matched = benefits.filter(b => {
    if (!b.condition(profile.income)) return false
    if (b.family === 'child' && !hasChild) return false
    return true
  })

  return (
    <div className="space-y-3">
      <p className="text-sm text-gray-600">
        年収{profile.income}万円・{FAMILY_LABELS[profile.family]}の場合、
        <span className="font-bold text-primary">{matched.length}件</span>の給付金・制度が対象になる可能性があります。
      </p>
      {matched.map((b, i) => (
        <div key={i} className={`card ${b.urgent ? 'border-accent bg-accent-light' : ''}`}>
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <p className="text-sm font-bold text-gray-800">{b.name}</p>
              <p className="text-xs text-gray-500 mt-0.5">{b.desc}</p>
            </div>
            <span className="text-sm font-bold text-primary ml-2 flex-shrink-0">{b.amt}</span>
          </div>
          {b.urgent && (
            <span className="inline-block mt-1 badge badge-negative text-xs">⏰ 期限注意</span>
          )}
        </div>
      ))}
      {matched.length === 0 && (
        <div className="card text-center py-6 text-gray-400">
          <p className="text-2xl mb-2">🔍</p>
          <p className="text-sm">現在の条件で対象となる給付金が見当たりません</p>
        </div>
      )}
    </div>
  )
}

/* ========== 広告コンポーネント ========== */
function AdBanner({ title, sub }: { title: string; sub: string }) {
  return (
    <div className="border border-surface-border rounded-xl px-4 py-3 flex items-center justify-between bg-gray-50 cursor-pointer hover:border-primary transition-colors">
      <div>
        <span className="text-xs text-gray-400 font-medium">PR・広告</span>
        <p className="text-sm font-bold text-gray-700">{title}</p>
        <p className="text-xs text-gray-500">{sub}</p>
      </div>
      <span className="text-gray-400 text-sm flex-shrink-0 ml-2">→</span>
    </div>
  )
}
