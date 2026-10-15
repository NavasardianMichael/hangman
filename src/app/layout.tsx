import { Metadata } from 'next'
import localFont from 'next/font/local'
import Script from 'next/script'
import { AD_FREQUENCY_HINT, ADS_ENABLED, ADS_TEST_MODE, ADSENSE_CLIENT, ADSENSE_SCRIPT_SRC } from 'helpers/constants/ads'
import { SITE_URL } from 'helpers/constants/app'
import { combineClassNames } from 'helpers/utils/styles'
import 'styles/variables.css'
import './app.css'
import 'styles/commons.css'

// Davel Aghvor by Levon Chkolyan (Davel Creative Agency), free for personal and commercial use: https://fonter.am/en/fonts/davel-aghvor
const appFont = localFont({
  src: '../assets/fonts/DavelAghvor.otf',
  display: 'swap',
  variable: '--font-app',
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
      {ADS_ENABLED && (
        <head>
          {/* A plain tag: next/script adds a data-nscript attribute that AdSense warns about */}
          <script
            async
            src={ADSENSE_SCRIPT_SRC}
            crossOrigin='anonymous'
            data-ad-frequency-hint={AD_FREQUENCY_HINT}
            data-adbreak-test={ADS_TEST_MODE ? 'on' : undefined}
          />
          <script dangerouslySetInnerHTML={{ __html: AD_PLACEMENT_INIT }} />
        </head>
      )}
      <body>
        <noscript>
          <iframe
            src='https://www.googletagmanager.com/ns.html?id=GTM-NFWCRW7P'
            height='0'
            width='0'
            style={{ display: 'none', visibility: 'hidden' }}
          ></iframe>
        </noscript>
        {children}
        <Script id='gtm-script' strategy='afterInteractive'>
          {`
    (function(w,d,s,l,i){
      w[l]=w[l]||[];
      w[l].push({'gtm.start': new Date().getTime(),event:'gtm.js'});
      var f=d.getElementsByTagName(s)[0],
          j=d.createElement(s),
          dl=l!='dataLayer'?'&l='+l:'';
      j.async=true;
      j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;
      f.parentNode.insertBefore(j,f);
    })(window,document,'script','dataLayer','GTM-NFWCRW7P');
  `}
        </Script>
      </body>
    </html>
  )
}
