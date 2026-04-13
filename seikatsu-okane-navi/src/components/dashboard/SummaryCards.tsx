'use client'
import { useProfile } from '@/components/ui/ProfileContext'
import { getFsLimit, getShienkin, formatCurrency } from '@/lib/profile'
import { FAMILY_LABELS, FS_LIMITS } from '@/types'

// ふるさと納税カード
export function FurusatoCard() {
  const { profile } = useProfile()
  const limit = getFsLimit(profile)

  return (
    <div className="card-highlight">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-xl">🏘️</span>
        <h3 className="font-bold text-gray-800">ふるさと納税 控除限度額</h3>
      </div>
      <div className="text-center py-2">
        <p className="text-xs text-gray-500 mb-1">年収{profile.income}万円・{FAMILY_LABELS[profile.family]}の目安</p>
        <p className="text-4xl font-display font-bold text-navy">
          約{formatCurrency(limit)}
        </p>
        <p className="text-xs text-gray-500 mt-1">年間 / 自己負担2,000円のみ</p>
      </div>

      {/* 寄付済み額入力 */}
      <FurusatoProgress limit={limit} />

      <div className="mt-3 text-xs text-gray-400 leading-relaxed">
        ※控除限度額は目安です。詳細はふるさと納税各サイトの計算ツールでご確認ください。
      </div>
    </div>
  )
}

function FurusatoProgress({ limit }: { limit: number }) {
  const [used, setUsed] = useState(0)

  useEffect(() => {
    try {
      const saved = parseInt(localStorage.getItem('navi_fs_used') ?? '0') || 0
      setUsed(saved)
    } catch {}
  }, [])

  const handleChange = (val: number) => {
    setUsed(val)
    try { localStorage.setItem('navi_fs_used', String(val)) } catch {}
  }

  const remaining = Math.max(0, limit - used)
  const pct = Math.min(100, limit > 0 ? Math.round(used / limit * 100) : 0)

  return (
    <div className="bg-warn-light border border-yellow-200 rounded-xl p-3 mt-3">
      <p className="text-xs font-bold text-warn mb-2">📝 今年の寄付済み金額</p>
      <div className="flex items-center gap-2 mb-2">
        <input
          type="number"
          value={used || ''}
          min={0}
          max={limit}
          placeholder="例：20000"
          onChange={e => handleChange(parseInt(e.target.value) || 0)}
          className="input-field text-sm py-2 flex-1"
        />
        <span className="text-xs text-gray-500 flex-shrink-0">円</span>
      </div>
      <div className="progress-bar mb-2">
        <div className="progress-fill bg-warn" style={{ width: `${pct}%` }} />
      </div>
      {remaining > 0 ? (
        <p className="text-sm font-bold text-warn">
          まだ <span className="text-accent text-base">{formatCurrency(remaining)}</span> の余裕があります！
        </p>
      ) : (
        <p className="text-sm font-bold text-primary">🎉 今年の控除枠をフル活用中！</p>
      )}
    </div>
  )
}

// 負担増カード
export function BurdenCard() {
  const { profile } = useProfile()
  const shienkin = getShienkin(profile)
  const monthlyShienkin = Math.round(shienkin / 12)

  return (
    <div className="card border-orange-200 bg-orange-50">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-xl">⚠️</span>
        <h3 className="font-bold text-gray-800">2026年の主な負担増</h3>
      </div>
      <div className="space-y-2">
        <div className="flex justify-between items-center bg-white rounded-lg px-3 py-2">
          <div>
            <p className="text-xs font-medium text-gray-700">子ども・子育て支援金</p>
            <p className="text-xs text-gray-500">月{monthlyShienkin}円の保険料上乗せ</p>
          </div>
          <p className="text-sm font-bold text-accent">年{formatCurrency(shienkin)}</p>
        </div>
        <div className="flex justify-between items-center bg-white rounded-lg px-3 py-2">
          <div>
            <p className="text-xs font-medium text-gray-700">電気・ガス補助終了</p>
            <p className="text-xs text-gray-500">2026年4月請求分から</p>
          </div>
          <p className="text-sm font-bold text-accent">月+1,000〜2,000円</p>
        </div>
      </div>
      <div className="mt-3 text-xs text-gray-500 text-center">
        タップして詳しい対策を確認 →
      </div>
    </div>
  )
}

// お得情報サマリーカード
export function GainsSummaryCard() {
  const { profile } = useProfile()
  const fsLimit = getFsLimit(profile)
  const shienkin = getShienkin(profile)

  const gains = [
    { label: 'ふるさと納税（控除限度額）', value: fsLimit, positive: true },
  ]

  const totalGain = gains.reduce((s, g) => s + (g.positive ? g.value : 0), 0)
  const totalLoss = shienkin

  return (
    <div className="card bg-gradient-to-br from-primary-light to-white border-primary">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-xl">🎯</span>
        <h3 className="font-bold text-primary">あなたへのお得情報</h3>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="text-center bg-white rounded-xl p-3">
          <p className="text-xs text-gray-500 mb-1">節税の余地</p>
          <p className="text-xl font-display font-bold text-primary">
            約{Math.round(fsLimit / 10000)}万円
          </p>
          <p className="text-xs text-gray-400">ふるさと納税限度額</p>
        </div>
        <div className="text-center bg-white rounded-xl p-3">
          <p className="text-xs text-gray-500 mb-1">2026年の負担増</p>
          <p className="text-xl font-display font-bold text-accent">
            年{formatCurrency(shienkin)}
          </p>
          <p className="text-xs text-gray-400">支援金負担（目安）</p>
        </div>
      </div>
    </div>
  )
}

// React hooks のimport漏れ対策
import { useState, useEffect } from 'react'
