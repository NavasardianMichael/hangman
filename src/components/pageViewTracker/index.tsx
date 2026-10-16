'use client'

import { FC, useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { trackPageView } from 'helpers/utils/analytics'

// One GA4 page view per screen. The game router's history calls go through Next.js, so usePathname follows them;
// a dialog's history entry keeps the same path and adds no view.
export const PageViewTracker: FC = () => {
  const pathname = usePathname()

  useEffect(() => {
    trackPageView(pathname)
  }, [pathname])

  return null
}
