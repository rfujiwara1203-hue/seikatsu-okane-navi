import Link from 'next/link'
import { notFound } from 'next/navigation'
import Navigation from '@/components/ui/Navigation'
import ArticleView from '@/components/deepdive/ArticleView'
import { DEEP_DIVE_ARTICLES } from '@/lib/deep-dive-content'
import type { Metadata } from 'next'

export function generateStaticParams() {
  return DEEP_DIVE_ARTICLES.map(a => ({ slug: a.slug }))
}

export function generateMetadata({ params }: { params: { slug: string } }): Metadata {
  const article = DEEP_DIVE_ARTICLES.find(a => a.slug === params.slug)
  if (!article) return {}
  return {
    title: `${article.title}｜事実！今の流行を調べてみた｜生活お金ナビ`,
    description: article.background.slice(0, 100),
  }
}

export default function DeepDiveArticlePage({ params }: { params: { slug: string } }) {
  const article = DEEP_DIVE_ARTICLES.find(a => a.slug === params.slug)
  if (!article) notFound()

  return (
    <>
      <Navigation />
      <main className="max-w-2xl mx-auto px-4 py-8 pb-24 sm:pb-10">
        <Link href="/deep-dive" className="text-sm text-primary font-bold mb-4 inline-block">
          ← 一覧に戻る
        </Link>
        <ArticleView article={article} />
      </main>
    </>
  )
}
