import { Metadata, Viewport } from 'next'
import localFont from 'next/font/local'
import { AD_FREQUENCY_HINT, ADS_ENABLED, ADS_TEST_MODE, ADSENSE_CLIENT, ADSENSE_SCRIPT_SRC } from 'helpers/constants/ads'
import { GA_ENABLED, GA_INIT_SCRIPT, GA_SCRIPT_SRC } from 'helpers/constants/analytics'
import { SITE_URL } from 'helpers/constants/app'
import { AUTHOR_NAME, AUTHOR_URL, SITE_DESCRIPTION, SITE_TITLE } from 'helpers/constants/seo'
import { CHALLENGE_OPENING_SCRIPT } from 'helpers/utils/challenge'
import { combineClassNames } from 'helpers/utils/styles'
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

// Official H5 Games Ads initializer: https://developers.google.com/ad-placement/docs/example
const AD_PLACEMENT_INIT = 'window.adsbygoogle=window.adsbygoogle||[];window.adBreak=window.adConfig=function(o){adsbygoogle.push(o);};'

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  ...(ADS_ENABLED ? { other: { 'google-adsense-account': ADSENSE_CLIENT } } : {}),
  manifest: '/manifest.webmanifest',
  title: SITE_TITLE,
  description: SITE_DESCRIPTION,
  keywords: ['կախաղան', 'կախաղան խաղ', 'հայերեն կախաղան', 'hangman հայերեն', 'բառ գուշակել', 'виселица на армянском'],
  robots: 'index, follow',
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
    siteName: 'Կախաղան',
    images: [
      {
        url: '/images/icon-192x192.png',
        alt: 'Կախաղան - Armenian Hangman Game',
      },
    ],
  },
  creator: AUTHOR_NAME,
  authors: [
    { name: 'Michael Navasardyan', url: AUTHOR_URL },
    { name: AUTHOR_NAME, url: AUTHOR_URL },
  ],
  category: 'game',
  // iOS has no fullscreen mode: the installed app draws under a see-through status bar instead
  appleWebApp: {
    capable: true,
    title: 'Կախաղան',
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
    <html lang='hy' className={combineClassNames(appFont.variable, ADS_ENABLED && 'ads-enabled')} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: CHALLENGE_OPENING_SCRIPT }} />
        {/* Plain tags so gtag exists before the app hydrates and sends its first page view */}
        {GA_ENABLED && (
          <>
            <script dangerouslySetInnerHTML={{ __html: GA_INIT_SCRIPT }} />
            <script async src={GA_SCRIPT_SRC} />
          </>
        )}
        {ADS_ENABLED && (
          <>
            {/* A plain tag: next/script adds a data-nscript attribute that AdSense warns about */}
            <script
              async
              src={ADSENSE_SCRIPT_SRC}
              crossOrigin='anonymous'
              data-ad-frequency-hint={AD_FREQUENCY_HINT}
              data-adbreak-test={ADS_TEST_MODE ? 'on' : undefined}
            />
            <script dangerouslySetInnerHTML={{ __html: AD_PLACEMENT_INIT }} />
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
