import Link from 'next/link'
import Navigation from '@/components/ui/Navigation'
import { DEEP_DIVE_ARTICLES } from '@/lib/deep-dive-content'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: '事実！今の流行を調べてみた｜生活お金ナビ',
  description: '電気自動車や0円ソーラーなど、今話題のテーマがなぜ広がっているのか、経済的にお得になる仕組み、どんな人に向いているかを、生活目線でゆるっと解説します。',
}

function excerpt(text: string, len = 68) {
  return text.length > len ? text.slice(0, len) + '…' : text
}

export default function DeepDivePage() {
  return (
    <>
      <Navigation />
      <main className="max-w-2xl mx-auto px-4 py-8 pb-24 sm:pb-10">
        <header className="animate-fade-in mb-6">
          <h1 className="text-2xl font-display font-bold text-gray-800">
            🔍 事実！今の流行を調べてみた
          </h1>
          <p className="text-sm text-gray-500 mt-2 leading-relaxed">
            「なんでこれ、最近よく聞くんだろう？」を調べて、ゆるく深掘りしていくコーナーです。
            人によって向き不向きはあるので、あくまで検討のきっかけとしてどうぞ。
          </p>
        </header>

        <div className="space-y-3">
          {DEEP_DIVE_ARTICLES.map(article => (
            <Link
              key={article.slug}
              href={`/deep-dive/${article.slug}`}
              className="block bg-white rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow"
            >
              {article.featured && (
                <div className="text-[11px] font-bold text-primary mb-1.5">🏆 今週のピックアップ</div>
              )}
              <div className="flex flex-wrap gap-1.5 mb-2">
                {article.tags.map(tag => (
                  <span
                    key={tag}
                    className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-primary-light text-primary"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
              <h2 className="text-lg font-display font-bold text-gray-800 leading-snug mb-1.5">
                {article.emoji} {article.title}
              </h2>
              <p className="text-[13px] text-gray-500 leading-relaxed mb-2">
                {excerpt(article.background)}
              </p>
              <p className="text-[12px] font-bold text-primary">続きを読む →</p>
            </Link>
          ))}
        </div>

        <div className="text-xs text-gray-400 leading-relaxed bg-gray-50 rounded-xl p-4 mt-6">
          <p className="font-medium mb-1">📡 このページについて</p>
          <p>補助金額・制度内容は変更されることがあります。実際に検討する際は、必ず各制度の公式サイトで最新情報をご確認ください。掲載内容は特定の商品・事業者を推奨するものではありません。</p>
        </div>
      </main>
    </>
  )
}
