import type { MetadataRoute } from 'next'
import { SITE_URL } from 'helpers/constants/app'

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: SITE_URL, changeFrequency: 'monthly', priority: 1 },
    { url: `${SITE_URL}/rules`, changeFrequency: 'yearly', priority: 0.6 },
    { url: `${SITE_URL}/about`, changeFrequency: 'yearly', priority: 0.5 },
    { url: `${SITE_URL}/privacy`, changeFrequency: 'yearly', priority: 0.3 },
  ]
}
