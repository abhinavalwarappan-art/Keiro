import type { MetadataRoute } from 'next'

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://keiro.app'

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date()
  return [
    { url: BASE_URL, lastModified, changeFrequency: 'weekly', priority: 1 },
    { url: `${BASE_URL}/onboarding`, lastModified, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${BASE_URL}/emergency`, lastModified, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${BASE_URL}/privacy`, lastModified, changeFrequency: 'monthly', priority: 0.3 },
    { url: `${BASE_URL}/terms`, lastModified, changeFrequency: 'monthly', priority: 0.3 },
  ]
}