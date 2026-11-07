import * as Sentry from '@sentry/nextjs'
import type { NextRequest } from 'next/server'
import { serverConfig } from 'server/config'
import { readRequestInfo } from 'server/http'
import { isGatewayId } from 'server/payments/gateways'
import { findPaymentForReturn, settlePayment } from 'server/payments/premium'
import { PAYMENT_RESULT_PARAM, TPaymentResult } from 'helpers/constants/premium'

/*
 * The buyer's return trip from the bank (the BackURL). A top-level navigation, so it answers with a redirect to the
 * game: /?payment=<succeeded|failed|pending>, where the app shows the result and reads its premium from the server.
 * The query only picks the row; it is settled from the bank's own record of the id we stored (settlePayment).
 */

const toGame = (status: TPaymentResult) => {
  const url = new URL('/', serverConfig.publicUrl)
  url.searchParams.set(PAYMENT_RESULT_PARAM, status)
  return Response.redirect(url, 303)
}

// The bank's spelling of its own names varies (`resposneCode`), so names match whatever their case
const queryParam = (request: NextRequest, name: string) => {
  for (const [key, value] of request.nextUrl.searchParams) if (key.toLowerCase() === name.toLowerCase()) return value
  return ''
}

export async function GET(request: NextRequest, ctx: RouteContext<'/api/premium/return/[gateway]'>) {
  const { gateway } = await ctx.params
  if (!isGatewayId(gateway)) return toGame('failed')

  let payment
  try {
    payment = findPaymentForReturn(gateway, queryParam(request, 'paymentID'), queryParam(request, 'opaque'))
  } catch (error) {
    console.error('[payments] return lookup failed', error)
    Sentry.captureException(error)
    return toGame('pending')
  }
  // Not "failed", which would tell the buyer nothing was charged
  if (!payment) {
    console.warn(`[payments] unmatched ${gateway} return: ${request.nextUrl.search}`)
    return toGame('pending')
  }

  let status = payment.status
  try {
    status = await settlePayment(payment, 'return', readRequestInfo(request))
  } catch (error) {
    console.error(`[payments] settle on return failed for #${payment.order_number}`, error)
    Sentry.captureException(error)
  }
  return toGame(status === 'succeeded' ? 'succeeded' : status === 'pending' ? 'pending' : 'failed')
}
