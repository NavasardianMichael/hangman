import * as Sentry from '@sentry/nextjs'
import { isPaymentConfigured } from 'server/config'
import { createRateLimiter, getClientIp, jsonError, readJsonBody, readRequestInfo } from 'server/http'
import { isBuyerKey, PremiumError, readPremium, startCheckout } from 'server/payments/premium'

// POST { key } → { url } of the bank's payment page. 409 { until } when premium is already active.
const isAllowed = createRateLimiter(10, 60 * 60 * 1000)

export async function POST(request: Request) {
  if (!isAllowed(getClientIp(request))) return jsonError(429, 'Too many requests')
  if (!isPaymentConfigured()) return jsonError(503, 'Payments are not configured')

  const body = await readJsonBody(request)
  if (!isBuyerKey(body?.key)) return jsonError(400, 'A buyer key is required')

  try {
    const url = await startCheckout(body.key, readRequestInfo(request))
    return Response.json({ url }, { headers: { 'Cache-Control': 'no-store' } })
  } catch (error) {
    if (error instanceof PremiumError) {
      if (error.code === 'active') {
        const { until } = await readPremium(body.key, null)
        return jsonError(409, error.code, { until })
      }
      return jsonError(error.status, error.code)
    }
    console.error('[payments] checkout failed', error)
    Sentry.captureException(error)
    return jsonError(500, 'Checkout failed')
  }
}
