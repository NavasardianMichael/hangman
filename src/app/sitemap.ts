import type { MetadataRoute } from 'next'
import { SITE_URL } from 'helpers/constants/app'
import { INFO_PAGES_INDEXABLE } from 'helpers/constants/seo'

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: SITE_URL, changeFrequency: 'monthly', priority: 1 },
    ...(INFO_PAGES_INDEXABLE
      ? [
          { url: `${SITE_URL}/rules`, changeFrequency: 'yearly' as const, priority: 0.6 },
          { url: `${SITE_URL}/about`, changeFrequency: 'yearly' as const, priority: 0.5 },
          { url: `${SITE_URL}/privacy`, changeFrequency: 'yearly' as const, priority: 0.3 },
        ]
      : []),
  ]
}
