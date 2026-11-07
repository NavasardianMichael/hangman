import { isPremiumActive, usePremiumStore } from 'store/premium'
import { TPremiumDialog, useUiStore } from 'store/ui'
import { API_PATHS, PAYMENT_RESULT_PARAM, PAYMENT_RESULTS, TPaymentResult } from 'helpers/constants/premium'
import { trackEvent } from './analytics'
import { toast } from './toast'

// The app's half of the premium purchase (docs/PAYMENTS.md): the buyer key, checkout and the status read.

type TStatusResponse = { until: number | null; pending: boolean }

// 32 random bytes as base64url
const createBuyerKey = () => {
  const bytes = crypto.getRandomValues(new Uint8Array(32))
  return btoa(String.fromCharCode(...bytes))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '')
}

const postJson = (url: string, body: unknown) =>
  fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })

let refreshing: Promise<void> | null = null

// Asks the server for this browser's premium; reading also settles a payment the bank hasn't redirected back from.
// Without a buyer key there is nothing to ask. Offline, the last answer stays.
export const refreshPremium = (): Promise<void> => {
  const { buyerKey } = usePremiumStore.getState()
  if (!buyerKey || !navigator.onLine) return Promise.resolve()

  refreshing ??= (async () => {
    try {
      const response = await postJson(API_PATHS.premiumStatus, { key: buyerKey })
      if (!response.ok) return
      const { until, pending } = (await response.json()) as TStatusResponse
      usePremiumStore.getState().setPremium({ until, checkoutPending: pending })
    } catch {
      // Network trouble: try again on the next visit
    } finally {
      refreshing = null
    }
  })()
  return refreshing
}

export const openPremiumDialog = (dialog: TPremiumDialog) => {
  useUiStore.getState().setPremiumDialog(dialog)
  if (dialog === 'hint-limit' || dialog === 'letter-limit' || dialog === 'offer') {
    trackEvent('premium_offer_shown', { reason: dialog })
  }
}

// Sends the player to the bank's payment page. Resolves only when that failed (the page is leaving otherwise).
export const startCheckout = async (source: TPremiumDialog) => {
  const store = usePremiumStore.getState()
  const buyerKey = store.buyerKey ?? createBuyerKey()
  // Saved before leaving: the bank sends the player back to this browser, which must still hold the key
  if (!store.buyerKey) store.setPremium({ buyerKey })

  try {
    const response = await postJson(API_PATHS.premiumCheckout, { key: buyerKey })
    if (response.status === 409) {
      // Already paid (another tab, or a payment that only now went through)
      const { until } = (await response.json()) as { until: number | null }
      usePremiumStore.getState().setPremium({ until, checkoutPending: false })
      if (isPremiumActive(until)) useUiStore.getState().setPremiumDialog('result-succeeded')
      return
    }
    if (!response.ok) throw new Error(`checkout answered ${response.status}`)
    const { url } = (await response.json()) as { url: string }
    usePremiumStore.getState().setPremium({ checkoutPending: true })
    trackEvent('premium_checkout_started', { source })
    window.location.assign(url)
  } catch {
    trackEvent('premium_checkout_failed', { source })
    toast.error(navigator.onLine ? 'Չհաջողվեց բացել վճարման էջը։ Փորձեք կրկին։' : 'Վճարելու համար միացեք համացանցին։')
  }
}

// The bank's redirect lands on /?payment=<status>. Read once, when the app starts; the router drops the parameter.
export const takePaymentResultFromUrl = (): TPaymentResult | null => {
  const value = new URL(window.location.href).searchParams.get(PAYMENT_RESULT_PARAM)
  const result = PAYMENT_RESULTS.find((item) => item === value) ?? null
  if (result) useUiStore.getState().setPremiumDialog(`result-${result}`)
  return result
}

// Genitive month names: "6 դեկտեմբերի, 2026թ.". Written out, because not every browser carries Armenian locale data.
const MONTHS = [
  'հունվարի',
  'փետրվարի',
  'մարտի',
  'ապրիլի',
  'մայիսի',
  'հունիսի',
  'հուլիսի',
  'օգոստոսի',
  'սեպտեմբերի',
  'հոկտեմբերի',
  'նոյեմբերի',
  'դեկտեմբերի',
]

export const formatPremiumDate = (time: number) => {
  const date = new Date(time)
  return `${date.getDate()} ${MONTHS[date.getMonth()]}, ${date.getFullYear()}թ.`
}
