import { useEffect } from 'react'
import { isPremiumActive, usePremiumStore } from 'store/premium'
import { useUiStore } from 'store/ui'
import { trackEvent } from 'helpers/utils/analytics'
import { refreshPremium } from 'helpers/utils/premium'

// Once per finished month: premium is not a subscription, so the player is told that another month means paying again
const showExpiryNotice = () => {
  const { until, expiryNoticeFor, setPremium } = usePremiumStore.getState()
  if (!until || isPremiumActive(until) || expiryNoticeFor === until) return
  const ui = useUiStore.getState()
  if (ui.premiumDialog) return
  setPremium({ expiryNoticeFor: until })
  ui.setPremiumDialog('expired')
  trackEvent('premium_expired_shown')
}

// Keeps this browser's premium in step with the server: read when the app opens (a refund, or a payment settled
// after the tab closed), and again whenever the app comes back to the front while a checkout is unanswered — the
// installed app may have sent the player to the bank in another browser.
export const usePremiumSync = () => {
  const isRouterReady = useUiStore((state) => state.isRouterReady)

  useEffect(() => {
    if (!isRouterReady) return
    let isMounted = true
    refreshPremium().then(() => {
      if (isMounted) showExpiryNotice()
    })

    const handleVisibilityChange = () => {
      if (document.visibilityState !== 'visible' || !usePremiumStore.getState().checkoutPending) return
      refreshPremium()
    }
    document.addEventListener('visibilitychange', handleVisibilityChange)
    return () => {
      isMounted = false
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [isRouterReady])
}
