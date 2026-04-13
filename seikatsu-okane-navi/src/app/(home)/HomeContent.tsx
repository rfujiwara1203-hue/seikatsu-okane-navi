'use client'
import { useState } from 'react'
import { useProfile } from '@/components/ui/ProfileContext'
import ProfileForm from '@/components/ui/ProfileForm'
import NewsSection from '@/components/news/NewsSection'
import { GainsSummaryCard, FurusatoCard, BurdenCard } from '@/components/dashboard/SummaryCards'
import { FAMILY_LABELS } from '@/types'
import { NewsItem } from '@/types'
import Link from 'next/link'

type Step = 'input' | 'result'

export default function HomeContent({ initialNews }: { initialNews: NewsItem[] }) {
  const { profile, isLoaded } = useProfile()
  const [step, setStep] = useState<Step>('input')

  // 保存済みプロフィールがあればresultへ
  if (isLoaded && profile.income && step === 'input') {
    // 自動遷移（初回以外）
  }

  return (
    <>
      {/* ヒーローヘッダー */}
      <header className="text-center py-4 animate-fade-in">
        <div className="inline-flex items-center justify-center w-14 h-14 bg-primary-light rounded-2xl mb-3">
          <span className="text-3xl">💰</span>
        </div>
        <h1 className="text-2xl font-display font-bold text-gray-800 mb-1">
          生活お金ナビ
        </h1>
        <p className="text-sm text-gray-500 leading-relaxed">
          物価高・負担増に負けない家計術を、<br />あなたの状況に合わせて毎日お届け
        </p>
      </header>

      {step === 'input' ? (
        /* ===== 入力ステップ ===== */
        <div className="space-y-4 animate-slide-up">
          <div className="card">
            <h2 className="font-bold text-gray-700 mb-4 flex items-center gap-2">
              <span className="bg-primary text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">1</span>
              まず情報を教えてください
            </h2>
            <ProfileForm onSubmit={() => setStep('result')} />
          </div>

          {/* プレビュー：今日のニュース */}
          <div className="opacity-75">
            <NewsSection defaultItems={initialNews} />
          </div>
        </div>
      ) : (
        /* ===== 結果ステップ ===== */
        <div className="space-y-4 animate-slide-up">
          {/* プロフィール確認バー */}
          <div className="bg-primary-light border border-green-200 rounded-xl px-4 py-2 flex items-center justify-between">
            <span className="text-sm text-primary font-medium">
              👋 年収{profile.income}万円・{FAMILY_LABELS[profile.family]}として表示中
            </span>
            <button
              onClick={() => setStep('input')}
              className="text-xs text-primary underline"
            >
              変更
            </button>
          </div>

          {/* お得サマリー */}
          <GainsSummaryCard />

          {/* 今日のニュース（プロフィール連動） */}
          <NewsSection defaultItems={initialNews} />

          {/* ふるさと納税 */}
          <FurusatoCard />

          {/* 負担増 */}
          <BurdenCard />

          {/* ダッシュボードへのリンク */}
          <Link
            href="/dashboard"
            className="card flex items-center justify-between hover:border-primary transition-colors group"
          >
            <div>
              <p className="font-bold text-gray-800">📊 マイ家計ダッシュボード</p>
              <p className="text-xs text-gray-500 mt-0.5">NISA・iDeCo・固定費見直しなど詳細を確認</p>
            </div>
            <span className="text-gray-400 group-hover:text-primary transition-colors">→</span>
          </Link>
        </div>
      )}
    </>
  )
}
