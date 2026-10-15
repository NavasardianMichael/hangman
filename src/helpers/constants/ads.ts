// AdSense setup. Every ad feature stays off while ADSENSE_CLIENT is empty.
// Fill these in from the AdSense account (see README → Ads).
export const ADSENSE_CLIENT = '' // e.g. 'ca-pub-1234567890123456'

// Display ad units for the desktop side rails
export const RAIL_SLOTS = {
  left: '',
  right: '',
} as const

// H5 Games Ads (interstitials between rounds, rewarded hints) is a beta that Google approves separately.
// Set to true once approved; until then those calls are skipped so rounds don't wait for ads that can't come.
export const H5_GAMES_ADS_APPROVED = false

// H5 Games Ads: minimum average time between interstitials
export const AD_FREQUENCY_HINT = '120s'

// Google serves test ads for interstitials/rewarded outside production
export const ADS_TEST_MODE = process.env.NODE_ENV !== 'production'

export const ADS_ENABLED = ADSENSE_CLIENT.length > 0

// Test ads still work in development before approval
export const H5_ADS_ACTIVE = ADS_ENABLED && (H5_GAMES_ADS_APPROVED || ADS_TEST_MODE)

export const ADSENSE_SCRIPT_SRC = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADSENSE_CLIENT}`

// Rails need 150px clear of the 600px game column on both sides (Google's game-page guidance)
export const RAIL_MEDIA_QUERY = '(min-width: 1232px) and (min-height: 720px)'
