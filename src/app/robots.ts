import type { MetadataRoute } from 'next'
import { SITE_URL } from 'helpers/constants/app'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: '/getWord',
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  }
}
