import type { MetadataRoute } from 'next'

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://keiro.app'

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date()
  return [
    { url: BASE_URL, lastModified, changeFrequency: 'weekly', priority: 1 },
    { url: `${BASE_URL}/onboarding`, lastModified, changeFrequency: 'monthly', priority: 0.8 },

    // Informational pages. These are how press, clinics, investors and judges
    // find their way in, so they rank above the legal pages.
    { url: `${BASE_URL}/how-it-works`, lastModified, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${BASE_URL}/languages`, lastModified, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${BASE_URL}/meet-kai`, lastModified, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${BASE_URL}/about`, lastModified, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${BASE_URL}/privacy-safety`, lastModified, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${BASE_URL}/accessibility`, lastModified, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${BASE_URL}/for-clinics`, lastModified, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${BASE_URL}/contact`, lastModified, changeFrequency: 'monthly', priority: 0.5 },

    { url: `${BASE_URL}/emergency`, lastModified, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${BASE_URL}/privacy`, lastModified, changeFrequency: 'monthly', priority: 0.3 },
    { url: `${BASE_URL}/terms`, lastModified, changeFrequency: 'monthly', priority: 0.3 },
  ]
}