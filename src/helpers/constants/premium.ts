// Premium: one payment unlocks unlimited hints and letter reveals for PREMIUM_DAYS. Not a subscription — nothing
// renews; once the month is over the player pays again from scratch (docs/PAYMENTS.md). Shared by the app and the
// server, so the price shown is the price charged.

export const PREMIUM_PRICE_AMD = 1000

export const PREMIUM_DAYS = 30

export const PREMIUM_DURATION_MS = PREMIUM_DAYS * 24 * 60 * 60 * 1000

// Without premium, counted on the local calendar day (single player)
export const FREE_HINTS_PER_DAY = 1
export const FREE_LETTERS_PER_DAY = 3

// The redirect after a payment lands on /?payment=<status>
export const PAYMENT_RESULT_PARAM = 'payment'

export const PAYMENT_RESULTS = ['succeeded', 'failed', 'pending'] as const
export type TPaymentResult = (typeof PAYMENT_RESULTS)[number]

// Plain digits: locale grouping differs between Node and browsers (1000 vs 1,000)
export const formatAmd = (amount: number) => `${amount} ֏`

export const PREMIUM_PRICE_TEXT = formatAmd(PREMIUM_PRICE_AMD)

export const API_PATHS = {
  premiumCheckout: '/api/premium/checkout',
  premiumStatus: '/api/premium/status',
  contact: '/api/contact',
} as const
