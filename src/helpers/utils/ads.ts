import { H5_ADS_ACTIVE } from 'helpers/constants/ads'
import { trackEvent } from './analytics'

// H5 Games Ads (Ad Placement API): https://developers.google.com/ad-placement/apis
type TPlacementInfo = { breakStatus?: string }

type TAdBreakOptions = {
  type: 'next' | 'reward'
  name: string
  beforeAd?: () => void
  afterAd?: () => void
  beforeReward?: (showAdFn: () => void) => void
  adDismissed?: () => void
  adViewed?: () => void
  adBreakDone?: (placementInfo: TPlacementInfo) => void
}

type TAdConfigOptions = {
  preloadAdBreaks?: 'on' | 'auto'
  sound?: 'on' | 'off'
}

type TAdsWindow = Window & {
  adBreak?: (options: TAdBreakOptions) => void
  adConfig?: (options: TAdConfigOptions) => void
}

// If the ad script is blocked, no callback ever fires; give up after this long
const NO_RESPONSE_TIMEOUT_MS = 1500

const getAdsWindow = () => (typeof window === 'undefined' ? null : (window as TAdsWindow))

export const configureAds = (soundEnabled: boolean) => {
  if (!H5_ADS_ACTIVE) return
  try {
    getAdsWindow()?.adConfig?.({ preloadAdBreaks: 'on', sound: soundEnabled ? 'on' : 'off' })
  } catch {
    // Ads are optional
  }
}

// Resolves when the game can continue: right away when no ad shows, or after the ad closes
export const showInterstitial = (name: string) =>
  new Promise<void>((resolve) => {
    const adsWindow = getAdsWindow()
    if (!H5_ADS_ACTIVE || !adsWindow?.adBreak) return resolve()

    let adStarted = false
    let settled = false
    const finish = () => {
      if (settled) return
      settled = true
      clearTimeout(timeoutId)
      resolve()
    }
    const timeoutId = setTimeout(() => {
      if (!adStarted) finish()
    }, NO_RESPONSE_TIMEOUT_MS)

    try {
      adsWindow.adBreak({
        type: 'next',
        name,
        beforeAd: () => {
          adStarted = true
          trackEvent('interstitial_shown', { name })
        },
        adBreakDone: finish,
      })
    } catch {
      finish()
    }
  })

type TRewardedCallbacks = {
  // An ad is ready: show the reward prompt, call showAd when the player accepts
  onOffer: (showAd: () => void) => void
  onRewarded: () => void
  onDismissed: () => void
  // No ad could be offered (not approved yet, no fill, blocked)
  onUnavailable: () => void
  // The offered ad flow is over, whatever the outcome
  onDone: () => void
}

export const requestRewardedAd = (name: string, callbacks: TRewardedCallbacks) => {
  const adsWindow = getAdsWindow()
  if (!H5_ADS_ACTIVE || !adsWindow?.adBreak) return callbacks.onUnavailable()

  let offered = false
  let unavailable = false
  const reportUnavailable = () => {
    if (offered || unavailable) return
    unavailable = true
    callbacks.onUnavailable()
  }
  const timeoutId = setTimeout(reportUnavailable, NO_RESPONSE_TIMEOUT_MS)

  try {
    adsWindow.adBreak({
      type: 'reward',
      name,
      beforeReward: (showAdFn) => {
        if (unavailable) return
        offered = true
        clearTimeout(timeoutId)
        callbacks.onOffer(showAdFn)
      },
      adViewed: callbacks.onRewarded,
      adDismissed: callbacks.onDismissed,
      adBreakDone: () => {
        clearTimeout(timeoutId)
        if (offered) callbacks.onDone()
        else reportUnavailable()
      },
    })
  } catch {
    clearTimeout(timeoutId)
    reportUnavailable()
  }
}
