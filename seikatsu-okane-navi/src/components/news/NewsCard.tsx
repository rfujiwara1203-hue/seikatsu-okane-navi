'use client'
import { useState } from 'react'
import { NewsItem, CATEGORY_META } from '@/types'
import { formatCurrency } from '@/lib/profile'

interface Props {
  item: NewsItem
  index?: number
}

const IMPACT_CONFIG = {
  positive: { bg: 'bg-green-50',  border: 'border-green-200', dot: 'bg-green-500', label: '家計にプラス' },
  negative: { bg: 'bg-orange-50', border: 'border-orange-200', dot: 'bg-orange-500', label: '負担増の可能性' },
  neutral:  { bg: 'bg-gray-50',   border: 'border-gray-200',   dot: 'bg-gray-400',   label: '状況確認を' },
  mixed:    { bg: 'bg-blue-50',   border: 'border-blue-200',   dot: 'bg-blue-500',   label: 'メリット・デメリットあり' },
}

export default function NewsCard({ item, index = 0 }: Props) {
  const [expanded, setExpanded] = useState(false)
  const catMeta = CATEGORY_META[item.category]
  const impact = item.impact
  const impactCfg = impact ? IMPACT_CONFIG[impact.impactLabel] : null

  const pubDate = new Date(item.pubDate)
  const dateStr = `${pubDate.getFullYear()}/${String(pubDate.getMonth()+1).padStart(2,'0')}/${String(pubDate.getDate()).padStart(2,'0')}`

  return (
    <article
      className="card news-card-hover animate-slide-up cursor-pointer"
      style={{ animationDelay: `${index * 80}ms` }}
      onClick={() => setExpanded(e => !e)}
    >
      {/* ヘッダー */}
      <div className="flex items-start gap-3 mb-3">
        <span className="text-2xl flex-shrink-0 mt-0.5">{item.emoji}</span>
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-1.5 mb-1">
            <span className={`badge ${catMeta?.color ?? 'bg-gray-100 text-gray-700'}`}>
              {catMeta?.label ?? 'ニュース'}
            </span>
            {item.isNew && <span className="badge badge-new">NEW</span>}
            {impactCfg && (
              <span className={`badge ${
                impact!.impactLabel === 'positive' ? 'badge-positive' :
                impact!.impactLabel === 'negative' ? 'badge-negative' :
                impact!.impactLabel === 'mixed'    ? 'bg-blue-100 text-blue-800' :
                'badge-neutral'
              }`}>
                <span className={`w-1.5 h-1.5 rounded-full ${impactCfg.dot}`} />
                {impactCfg.label}
              </span>
            )}
          </div>
          <h3 className="text-sm font-bold text-gray-800 leading-snug line-clamp-2">
            {item.title}
          </h3>
          <p className="text-xs text-gray-400 mt-1">{item.source} · {dateStr} 更新</p>
        </div>
        <span className={`text-gray-300 text-sm transition-transform duration-200 flex-shrink-0 ${expanded ? 'rotate-180' : ''}`}>
          ▾
        </span>
      </div>

      {/* AI要約（常時表示） */}
      {impact?.summary && (
        <p className="text-sm text-gray-600 leading-relaxed mb-3 bg-gray-50 rounded-lg px-3 py-2">
          {impact.summary}
        </p>
      )}

      {/* 展開時：あなたの家庭への影響 */}
      {expanded && (
        <div className="space-y-3 animate-fade-in">
          {impact && (
            <div className={`rounded-xl p-3 border ${impactCfg?.bg} ${impactCfg?.border}`}>
              <p className="text-xs font-bold text-gray-700 mb-1">📊 あなたの家庭への影響</p>
              <p className="text-sm text-gray-700 leading-relaxed">{impact.impactText}</p>
              {impact.affectedAmount !== undefined && impact.affectedAmount !== null && (
                <div className="mt-2 flex items-center gap-1">
                  <span className="text-xs text-gray-500">月間影響額の目安：</span>
                  <span className={`text-sm font-bold ${impact.affectedAmount < 0 ? 'text-orange-600' : 'text-green-600'}`}>
                    {impact.affectedAmount < 0 ? '−' : '+'}{formatCurrency(Math.abs(impact.affectedAmount))}
                  </span>
                </div>
              )}
            </div>
          )}

          {impact?.actionHint && (
            <div className="bg-primary-light rounded-xl p-3 border border-green-200">
              <p className="text-xs font-bold text-primary mb-1">💡 おすすめ対策ヒント</p>
              <p className="text-sm text-gray-700 leading-relaxed">{impact.actionHint}</p>
            </div>
          )}

          {/* 元記事リンク */}
          <a
            href={item.link}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between text-xs text-navy hover:text-navy-dark transition-colors bg-navy-light rounded-lg px-3 py-2"
            onClick={e => e.stopPropagation()}
          >
            <span>🔗 元記事を読む（{item.source}）</span>
            <span>→</span>
          </a>

          <button
            onClick={e => { e.stopPropagation(); setExpanded(false) }}
            className="w-full text-xs text-gray-400 hover:text-gray-600 py-1"
          >
            閉じる ▲
          </button>
        </div>
      )}

      {/* 折りたたみ時のプレビュー */}
      {!expanded && !impact?.summary && item.content && (
        <p className="text-xs text-gray-500 line-clamp-2">{item.content}</p>
      )}
    </article>
  )
}
