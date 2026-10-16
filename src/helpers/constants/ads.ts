// AdSense setup. Every ad feature stays off while ADSENSE_CLIENT is empty.
// Auto ads (top anchor, side rails, vignettes) are placed by Google; their settings live in the AdSense account
// (see docs/ADSENSE.md).
export const ADSENSE_CLIENT = 'pub-7566016209532706' // e.g. 'ca-pub-1234567890123456'

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
