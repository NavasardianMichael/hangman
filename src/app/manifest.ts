import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    id: '/',
    short_name: 'Կախաղան',
    name: 'Կախաղան | Hangman',
    theme_color: '#ffffff',
    background_color: '#575757',
    orientation: 'portrait',
    start_url: '/',
    scope: '/',
    display: 'standalone',
    display_override: ['fullscreen', 'minimal-ui'],
    description: 'Հայտնի ԿԱԽԱՂԱՆ (HANGMAN) Խաղի հայկական տարբերակն արդեն հասանելի է առցանց',
    screenshots: [
      {
        src: '/images/screenshot-narrow-home.png',
        type: 'image/png',
        sizes: '780x1560',
        form_factor: 'narrow',
        label: 'Գլխավոր էջ',
      },
      {
        src: '/images/screenshot-narrow-play.png',
        type: 'image/png',
        sizes: '780x1560',
        form_factor: 'narrow',
        label: 'Գուշակել բառը',
      },
      {
        src: '/images/screenshot-narrow-compose.png',
        type: 'image/png',
        sizes: '780x1560',
        form_factor: 'narrow',
        label: 'Գրել բառը',
      },
      {
        src: '/images/screenshot-narrow-settings.png',
        type: 'image/png',
        sizes: '780x1560',
        form_factor: 'narrow',
        label: 'Կարգավորումներ',
      },
      {
        src: '/images/screenshot-wide-home.png',
        type: 'image/png',
        sizes: '2560x1440',
        form_factor: 'wide',
        label: 'Գլխավոր էջ',
      },
      {
        src: '/images/screenshot-wide-play.png',
        type: 'image/png',
        sizes: '2560x1440',
        form_factor: 'wide',
        label: 'Գուշակել բառը',
      },
      {
        src: '/images/screenshot-wide-compose.png',
        type: 'image/png',
        sizes: '2560x1440',
        form_factor: 'wide',
        label: 'Գրել բառը',
      },
      {
        src: '/images/screenshot-wide-settings.png',
        type: 'image/png',
        sizes: '2560x1440',
        form_factor: 'wide',
        label: 'Կարգավորումներ',
      },
    ],
    icons: [
      {
        src: '/images/icon-48x48.png',
        sizes: '48x48',
        type: 'image/png',
      },
      {
        src: '/images/icon-72x72.png',
        sizes: '72x72',
        type: 'image/png',
      },
      {
        src: '/images/icon-96x96.png',
        sizes: '96x96',
        type: 'image/png',
      },
      {
        src: '/images/icon-128x128.png',
        sizes: '128x128',
        type: 'image/png',
      },
      {
        src: '/images/icon-144x144.png',
        sizes: '144x144',
        type: 'image/png',
      },
      {
        src: '/images/icon-152x152.png',
        sizes: '152x152',
        type: 'image/png',
      },
      {
        src: '/images/icon-192x192.png',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: '/images/icon-512x512.png',
        sizes: '512x512',
        type: 'image/png',
      },
      // {
      //   src: '/images/icon-192x192-maskable.png',
      //   sizes: '192x192',
      //   type: 'image/png',
      //   purpose: 'maskable',
      // },
      // {
      //   src: '/images/icon-512x512-maskable.png',
      //   sizes: '512x512',
      //   type: 'image/png',
      //   purpose: 'maskable',
      // },
    ],
  }
}
