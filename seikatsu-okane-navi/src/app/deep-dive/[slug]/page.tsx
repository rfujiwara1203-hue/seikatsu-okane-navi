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
  const title = `${article.title}｜事実！今の流行を調べてみた｜生活お金ナビ`
  const description = article.background.slice(0, 100)
  return {
    title,
    description,
    alternates: { canonical: `/deep-dive/${article.slug}` },
    openGraph: { type: 'article', title, description },
    twitter: { card: 'summary', title, description },
  }
}

const SITE_URL = 'https://seikatsu-okane-navi.vercel.app'

export default function DeepDiveArticlePage({ params }: { params: { slug: string } }) {
  const article = DEEP_DIVE_ARTICLES.find(a => a.slug === params.slug)
  if (!article) notFound()

  const articleJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: article.title,
    description: article.background.slice(0, 150),
    author: { '@type': 'Organization', name: '生活お金ナビ編集部' },
    publisher: { '@type': 'Organization', name: '生活お金ナビ' },
    mainEntityOfPage: `${SITE_URL}/deep-dive/${article.slug}`,
    keywords: article.tags.join(', '),
  }

  const faqJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: `${article.title.replace(/[「」]/g, '')}のメリット・デメリットは？`,
        acceptedAnswer: { '@type': 'Answer', text: article.mechanism },
      },
      {
        '@type': 'Question',
        name: 'どんな人に向いている？',
        acceptedAnswer: { '@type': 'Answer', text: article.goodFor.join('、') },
      },
      {
        '@type': 'Question',
        name: '注意すべき点は？',
        acceptedAnswer: { '@type': 'Answer', text: article.caution },
      },
    ],
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
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
