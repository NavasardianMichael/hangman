import { Metadata } from 'next'
import localFont from 'next/font/local'
import { AD_FREQUENCY_HINT, ADS_ENABLED, ADS_TEST_MODE, ADSENSE_CLIENT, ADSENSE_SCRIPT_SRC } from 'helpers/constants/ads'
import { GA_ENABLED, GA_INIT_SCRIPT, GA_SCRIPT_SRC } from 'helpers/constants/analytics'
import { SITE_URL } from 'helpers/constants/app'
import { combineClassNames } from 'helpers/utils/styles'
import { PageViewTracker } from 'components/pageViewTracker'
import 'styles/variables.css'
import './app.css'
import 'styles/commons.css'

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
  ...(ADS_ENABLED && { other: { 'google-adsense-account': ADSENSE_CLIENT } }),
  manifest: '/manifest.webmanifest',
  title: 'Կախաղան | Hangman',
  description:
    'Գուշակիր արհեստական բանականության մտապահած բառը: Հայտնի ԿԱԽԱՂԱՆ (HANGMAN) Խաղի հայկական տարբերակն արդեն հասանելի է առցանց',
  keywords: [
    'Hangman',
    'Armenian',
    'game',
    'online',
    'multiplayer',
    'виселица',
    'на армянском',
    'армянский',
    'игра',
    'կախաղան',
    'խաղ',
    'Միքայել Նավասարդյան',
    'հայերեն',
    'գուշակել բառ',
    'երկու հոգանոց խաղ',
    'կախամարդ',
    'կախաղան խաղ',
    'հայկական խաղ',
  ],
  robots: 'index, follow',
  verification: {
    google: 'otJjduk66KdJqUVQWUMGb3RCg7U5NGhdFLCDpcjP5_U',
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
    title: 'Կախաղան | Hangman',
    description:
      'Գուշակիր արհեստական բանականության մտապահած բառը: Հայտնի ԿԱԽԱՂԱՆ (HANGMAN) Խաղի հայկական տարբերակն արդեն հասանելի է առցանց',
    siteName: 'Կախաղան | Hangman',
    images: [
      {
        url: '/images/icon-192x192.png',
        alt: 'Կախաղան - Armenian Hangman Game',
      },
    ],
  },
  creator: 'Միքայել Նավասարդյան',
  authors: [
    {
      name: 'Michael Navasardyan',
      url: 'https://www.linkedin.com/in/michael-navasardyan/',
    },
    {
      name: 'Միքայել Նավասարդյան',
      url: 'https://www.linkedin.com/in/michael-navasardyan/',
    },
  ],
  category: 'game',
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang='hy' className={combineClassNames(appFont.variable, ADS_ENABLED && 'ads-enabled')}>
      <head>
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
        {children}
        {GA_ENABLED && <PageViewTracker />}
      </body>
    </html>
  )
}
