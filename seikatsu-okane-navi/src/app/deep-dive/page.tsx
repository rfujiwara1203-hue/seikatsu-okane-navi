import Navigation from '@/components/ui/Navigation'
import { DEEP_DIVE_ARTICLES } from '@/lib/deep-dive-content'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: '事実！今の流行を調べてみた｜生活お金ナビ',
  description: '電気自動車や太陽光、断熱リフォームなど、今話題のテーマがなぜ広がっているのか、経済的にお得になる仕組み、どんな人に向いているかを解説します。',
}

export default function DeepDivePage() {
  return (
    <>
      <Navigation />
      <main className="max-w-2xl mx-auto px-4 py-6 space-y-6 pb-24 sm:pb-8">
        <header className="animate-fade-in">
          <h1 className="text-xl font-display font-bold text-gray-800 flex items-center gap-2">
            <span>🔍</span>事実！今の流行を調べてみた
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            「なぜ今これが流行っているのか」「お得になる仕組み」「どんな人に向いているか」を一歩踏み込んで解説します。
            条件は人によって異なるため、あくまで検討のヒントとしてご覧ください。
          </p>
        </header>

        <div className="space-y-4">
          {DEEP_DIVE_ARTICLES.map(article => (
            <article
              key={article.slug}
              className={`bg-white rounded-2xl p-5 shadow-sm ${
                article.featured ? 'border-2 border-primary' : 'border border-surface-border'
              }`}
            >
              {article.featured && (
                <div className="text-[11px] font-bold text-primary mb-2">🏆 今週の徹底解説</div>
              )}
              <div className="flex flex-wrap gap-1.5 mb-2">
                {article.tags.map(tag => (
                  <span
                    key={tag}
                    className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-primary-light text-primary"
                  >
                    {tag}
                  </span>
                ))}
              </div>

              <h2 className="text-base font-display font-bold text-gray-800 flex items-start gap-2 mb-3">
                <span className="text-xl leading-none">{article.emoji}</span>
                <span>{article.title}</span>
              </h2>

              <section className="mb-3">
                <h3 className="text-xs font-bold text-gray-500 mb-1">📌 なぜ広がっている？</h3>
                <p className="text-[13px] text-gray-700 leading-relaxed">{article.background}</p>
              </section>

              <section className="mb-3">
                <h3 className="text-xs font-bold text-gray-500 mb-1">💡 お得になる仕組み</h3>
                <p className="text-[13px] text-gray-700 leading-relaxed">{article.mechanism}</p>
              </section>

              {article.deepSections?.map(sec => (
                <section key={sec.heading} className="mb-3">
                  <h3 className="text-xs font-bold text-navy mb-1">{sec.heading}</h3>
                  <p className="text-[13px] text-gray-700 leading-relaxed">{sec.body}</p>
                  {sec.table && (
                    <div className="overflow-x-auto mt-2">
                      <table className="w-full text-[12px] border-collapse">
                        <thead>
                          <tr>
                            {sec.table.cols.map(c => (
                              <th key={c} className="text-left font-bold text-gray-500 border-b border-surface-border pb-1 pr-2 whitespace-nowrap">{c}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {sec.table.rows.map((row, i) => (
                            <tr key={i}>
                              {row.map((cell, j) => (
                                <td key={j} className="py-1.5 pr-2 text-gray-700 whitespace-nowrap">{cell}</td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </section>
              ))}

              <section className="mb-3 bg-surface rounded-xl p-3">
                <h3 className="text-xs font-bold text-gray-500 mb-2">こんな人におすすめ</h3>
                <ul className="space-y-1 mb-2">
                  {article.goodFor.map(item => (
                    <li key={item} className="text-[13px] text-gray-700 flex gap-1.5">
                      <span className="text-primary flex-shrink-0">✅</span>{item}
                    </li>
                  ))}
                </ul>
                <ul className="space-y-1">
                  {article.notFor.map(item => (
                    <li key={item} className="text-[13px] text-gray-500 flex gap-1.5">
                      <span className="text-accent flex-shrink-0">❌</span>{item}
                    </li>
                  ))}
                </ul>
              </section>

              <section className="mb-1">
                <h3 className="text-xs font-bold text-warn mb-1">⚠️ 注意点</h3>
                <p className="text-[12px] text-gray-500 leading-relaxed">{article.caution}</p>
              </section>

              {article.sources.length > 0 && (
                <div className="mt-3 pt-3 border-t border-surface-border text-[11px] text-gray-400 space-y-0.5">
                  {article.sources.map(s => (
                    <a
                      key={s.url}
                      href={s.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block hover:text-primary"
                    >
                      出典：{s.label} →
                    </a>
                  ))}
                </div>
              )}
            </article>
          ))}
        </div>

        <div className="text-xs text-gray-400 leading-relaxed bg-gray-50 rounded-xl p-3">
          <p className="font-medium mb-1">📡 このページについて</p>
          <p>補助金額・制度内容は変更されることがあります。実際に検討する際は、必ず各制度の公式サイトで最新情報をご確認ください。掲載内容は特定の商品・事業者を推奨するものではありません。</p>
        </div>
      </main>
    </>
  )
}
