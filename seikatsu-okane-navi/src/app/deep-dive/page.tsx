import Navigation from '@/components/ui/Navigation'
import { DEEP_DIVE_ARTICLES, type DeepDiveArticle } from '@/lib/deep-dive-content'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: '事実！今の流行を調べてみた｜生活お金ナビ',
  description: '電気自動車がなぜ増えているのか、経済的にお得になる仕組み、どんな人に向いているかを、生活目線でゆるっと解説します。',
}

type DialogueGroup = NonNullable<DeepDiveArticle['dialogues']>[number]

function DialogueBlock({ lines }: { lines: DialogueGroup['lines'] }) {
  return (
    <div className="bg-surface rounded-2xl p-4 sm:p-5 space-y-3">
      {lines.map((line, i) => {
        const isTeacher = line.role === 'teacher'
        return (
          <div key={i} className={`flex gap-2 items-end ${isTeacher ? '' : 'flex-row-reverse'}`}>
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-base flex-shrink-0 ${
                isTeacher ? 'bg-primary text-white' : 'bg-navy-light text-navy'
              }`}
            >
              {isTeacher ? '💚' : '🙋'}
            </div>
            <div
              className={`max-w-[80%] rounded-2xl px-3.5 py-2 text-[13.5px] leading-relaxed ${
                isTeacher
                  ? 'bg-white border border-surface-border text-gray-700 rounded-bl-sm'
                  : 'bg-navy text-white rounded-br-sm'
              }`}
            >
              {line.text}
            </div>
          </div>
        )
      })}
    </div>
  )
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

        {DEEP_DIVE_ARTICLES.map(article => (
          <article key={article.slug} className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm">
            <div className="flex flex-wrap gap-1.5 mb-3">
              {article.tags.map(tag => (
                <span
                  key={tag}
                  className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-primary-light text-primary"
                >
                  #{tag}
                </span>
              ))}
            </div>

            <h2 className="text-2xl font-display font-bold text-gray-800 leading-snug mb-2">
              {article.emoji} {article.title}
            </h2>
            <p className="text-xs text-gray-400 mb-6">🖊 生活お金ナビ編集部 ・ 読了目安 5分</p>

            <div className="space-y-6 text-[15px] text-gray-700 leading-[1.9]">
              <p>{article.background}</p>
              <p>{article.mechanism}</p>

              {article.dialogues
                ?.filter(d => d.afterHeading === '__intro__')
                .map((d, i) => <DialogueBlock key={i} lines={d.lines} />)}

              {article.deepSections?.map(sec => (
                <div key={sec.heading}>
                  <h3 className="text-lg font-display font-bold text-gray-800 mt-2 mb-2 pl-3 border-l-4 border-primary">
                    {sec.heading}
                  </h3>
                  <p>{sec.body}</p>
                  {article.dialogues
                    ?.filter(d => d.afterHeading === sec.heading)
                    .map((d, i) => <DialogueBlock key={i} lines={d.lines} />)}
                  {sec.table && (
                    <div className="overflow-x-auto mt-3 rounded-xl border border-surface-border">
                      <table className="w-full text-[13px] border-collapse">
                        <thead>
                          <tr className="bg-surface">
                            {sec.table.cols.map(c => (
                              <th key={c} className="text-left font-bold text-gray-500 p-2.5 whitespace-nowrap">{c}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {sec.table.rows.map((row, i) => (
                            <tr key={i} className="border-t border-surface-border">
                              {row.map((cell, j) => (
                                <td key={j} className="p-2.5 text-gray-700 whitespace-nowrap">{cell}</td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="mt-8 bg-primary-light/60 rounded-2xl p-5">
              <p className="text-sm font-bold text-primary mb-3">🙋 こんな人には向いてそう</p>
              <ul className="space-y-2 mb-3">
                {article.goodFor.map(item => (
                  <li key={item} className="text-[14px] text-gray-700 flex gap-2">
                    <span className="text-primary flex-shrink-0">◎</span>{item}
                  </li>
                ))}
              </ul>
              <p className="text-sm font-bold text-gray-400 mb-2 mt-4">🤔 一方でこんな人はちょっと待った</p>
              <ul className="space-y-2">
                {article.notFor.map(item => (
                  <li key={item} className="text-[14px] text-gray-500 flex gap-2">
                    <span className="text-accent flex-shrink-0">△</span>{item}
                  </li>
                ))}
              </ul>
            </div>

            <div className="mt-6 flex gap-2.5 bg-warn-light rounded-2xl p-4">
              <span className="text-lg flex-shrink-0">⚠️</span>
              <p className="text-[13px] text-gray-600 leading-relaxed">{article.caution}</p>
            </div>

            {article.sources.length > 0 && (
              <div className="mt-6 pt-4 border-t border-surface-border text-[12px] text-gray-400 space-y-1">
                <p className="font-bold text-gray-400 mb-1">参考にした情報</p>
                {article.sources.map(s => (
                  <a
                    key={s.url}
                    href={s.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block hover:text-primary underline underline-offset-2"
                  >
                    {s.label}
                  </a>
                ))}
              </div>
            )}
          </article>
        ))}

        <div className="text-xs text-gray-400 leading-relaxed bg-gray-50 rounded-xl p-4 mt-6">
          <p className="font-medium mb-1">📡 このページについて</p>
          <p>補助金額・制度内容は変更されることがあります。実際に検討する際は、必ず各制度の公式サイトで最新情報をご確認ください。掲載内容は特定の商品・事業者を推奨するものではありません。</p>
        </div>
      </main>
    </>
  )
}
