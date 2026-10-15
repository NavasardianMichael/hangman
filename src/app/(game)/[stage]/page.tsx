import { Metadata } from 'next'
import { STAGE_SLUGS } from 'helpers/constants/routes'

// Game screens (/settings, /discovery, …) are static copies of the game page so reloads and direct links work
export const dynamicParams = false

export const generateStaticParams = () => STAGE_SLUGS.map((stage) => ({ stage }))

export const metadata: Metadata = {
  robots: { index: false, follow: true },
  alternates: { canonical: '/' },
}

export default function StagePage() {
  return null
}
