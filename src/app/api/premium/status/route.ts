import * as Sentry from '@sentry/nextjs'
import { serverConfig } from 'server/config'
import { createRateLimiter, getClientIp, jsonError, readJsonBody, readRequestInfo } from 'server/http'
import { isBuyerKey, readPremium } from 'server/payments/premium'

// POST { key } → { until, pending }. A POST, so the key stays out of URLs and access logs. Reading settles the
// buyer's recent pending payments with the bank (a tab closed before the bank's redirect).
const isAllowed = createRateLimiter(60, 60 * 1000)

export async function POST(request: Request) {
  if (!isAllowed(getClientIp(request))) return jsonError(429, 'Too many requests')

  const body = await readJsonBody(request)
  if (!isBuyerKey(body?.key)) return jsonError(400, 'A buyer key is required')
  if (!serverConfig.dataDir) return jsonError(503, 'Payments are not configured')

  try {
    const status = await readPremium(body.key, readRequestInfo(request))
    return Response.json(status, { headers: { 'Cache-Control': 'no-store' } })
  } catch (error) {
    console.error('[payments] status read failed', error)
    Sentry.captureException(error)
    return jsonError(500, 'Status read failed')
  }
}
