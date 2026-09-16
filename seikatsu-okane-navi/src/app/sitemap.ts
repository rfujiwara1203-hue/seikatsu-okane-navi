import { MetadataRoute } from 'next'
import { DEEP_DIVE_ARTICLES } from '@/lib/deep-dive-content'

const SITE_URL = 'https://seikatsu-okane-navi.vercel.app'

export default function sitemap(): MetadataRoute.Sitemap {
  const staticPages: MetadataRoute.Sitemap = [
    { url: `${SITE_URL}/`, changeFrequency: 'daily', priority: 1.0 },
    { url: `${SITE_URL}/news`, changeFrequency: 'daily', priority: 0.8 },
    { url: `${SITE_URL}/dashboard`, changeFrequency: 'weekly', priority: 0.6 },
    { url: `${SITE_URL}/deep-dive`, changeFrequency: 'weekly', priority: 0.9 },
    { url: `${SITE_URL}/privacy.html`, changeFrequency: 'yearly', priority: 0.2 },
    { url: `${SITE_URL}/tokushoho.html`, changeFrequency: 'yearly', priority: 0.2 },
  ]

  const articlePages: MetadataRoute.Sitemap = DEEP_DIVE_ARTICLES.map(article => ({
    url: `${SITE_URL}/deep-dive/${article.slug}`,
    changeFrequency: 'monthly',
    priority: 0.9,
  }))

  return [...staticPages, ...articlePages]
}
