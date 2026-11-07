import type { MetadataRoute } from 'next'
import { SITE_URL } from 'helpers/constants/app'

// Only the home page is indexed (see helpers/constants/seo.ts)
export default function sitemap(): MetadataRoute.Sitemap {
  return [{ url: SITE_URL, changeFrequency: 'monthly', priority: 1 }]
}
