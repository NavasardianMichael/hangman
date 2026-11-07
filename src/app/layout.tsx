import { Metadata, Viewport } from 'next'
import localFont from 'next/font/local'
import { GA_ENABLED, GA_INIT_SCRIPT, GA_SCRIPT_SRC } from 'helpers/constants/analytics'
import { SITE_URL } from 'helpers/constants/app'
import {
  AUTHOR_NAME,
  AUTHOR_NAME_LATIN,
  AUTHOR_URL,
  SHARE_IMAGE,
  SITE_DESCRIPTION,
  SITE_KEYWORDS,
  SITE_NAME,
  SITE_TITLE,
} from 'helpers/constants/seo'
import { CHALLENGE_OPENING_SCRIPT } from 'helpers/utils/challenge'
import { PageViewTracker } from 'components/pageViewTracker'
import './globals.css'

// Davel Aghvor by Levon Chkolyan (Davel Creative Agency), free for personal and commercial use: https://fonter.am/en/fonts/davel-aghvor
const appFont = localFont({
  src: '../assets/fonts/DavelAghvor.otf',
  display: 'swap',
  variable: '--font-app',
  adjustFontFallback: false,
  // Everything except A–Z and a–z, so English words fall through to the math family
  declarations: [{ prop: 'unicode-range', value: 'U+0000-0040, U+005B-0060, U+007B-10FFFF' }],
})

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  manifest: '/manifest.webmanifest',
  applicationName: SITE_NAME,
  title: SITE_TITLE,
  description: SITE_DESCRIPTION,
  keywords: SITE_KEYWORDS,
  // Lets Google show a large image and a full-length snippet. The game screens override this with noindex.
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, 'max-image-preview': 'large', 'max-snippet': -1, 'max-video-preview': -1 },
  },
  verification: {
    google: ['otJjduk66KdJqUVQWUMGb3RCg7U5NGhdFLCDpcjP5_U', '37FrbEo3yZ80_N8a0HtvFYWKmuSX9SKqme96v1pG1AM'],
  },
  alternates: {
    canonical: '/',
  },
  icons: {
    icon: [
      { url: '/images/favicon.svg', type: 'image/svg+xml' },
      { url: '/images/icon-192x192.png', sizes: '192x192', type: 'image/png' },
    ],
    apple: [{ url: '/images/icon-192x192.png', sizes: '192x192', type: 'image/png' }],
  },
  openGraph: {
    url: '/',
    type: 'website',
    locale: 'hy_AM',
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    siteName: SITE_NAME,
    images: [SHARE_IMAGE],
  },
  twitter: {
    card: 'summary_large_image',
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    images: [SHARE_IMAGE],
  },
  creator: AUTHOR_NAME,
  authors: [
    { name: AUTHOR_NAME, url: AUTHOR_URL },
    { name: AUTHOR_NAME_LATIN, url: AUTHOR_URL },
  ],
  category: 'game',
  // iOS has no fullscreen mode: the installed app draws under a see-through status bar instead
  appleWebApp: {
    capable: true,
    title: SITE_NAME,
    statusBarStyle: 'black-translucent',
  },
}

// The page draws edge to edge, under the notch, status bar and home indicator; the --safe-* insets keep content clear
export const viewport: Viewport = {
  viewportFit: 'cover',
  // The browser bar takes the grey of the title band and buttons (--secondary-color)
  themeColor: '#575757',
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    // The challenge script below may add an attribute to <html> before React takes over the page
    <html lang='hy' className={appFont.variable} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: CHALLENGE_OPENING_SCRIPT }} />
        {/* Plain tags so gtag exists before the app hydrates and sends its first page view */}
        {GA_ENABLED && (
          <>
            <script dangerouslySetInnerHTML={{ __html: GA_INIT_SCRIPT }} />
            <script async src={GA_SCRIPT_SRC} />
          </>
        )}
      </head>
      <body>
        {/* Behind the status bar, so its white text stays readable over the white game column */}
        <div className='pointer-events-none fixed inset-x-0 top-0 z-40 h-(--safe-top) bg-secondary' aria-hidden='true' />
        {children}
        {GA_ENABLED && <PageViewTracker />}
      </body>
    </html>
  )
}
