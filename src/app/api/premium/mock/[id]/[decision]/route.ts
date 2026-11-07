import { serverConfig } from 'server/config'
import { decideMockPayment } from 'server/payments/gateways/mock'

// The buyer's click on the mock bank's page: back to the BackURL, as a bank's redirect would (development only)
export async function GET(_request: Request, ctx: RouteContext<'/api/premium/mock/[id]/[decision]'>) {
  const { id, decision } = await ctx.params
  const isMockAvailable = serverConfig.payments.gateway === 'mock' && !serverConfig.isProduction
  if (!isMockAvailable || (decision !== 'approve' && decision !== 'decline')) {
    return new Response('Not found', { status: 404 })
  }
  const backUrl = decideMockPayment(id, decision === 'approve')
  if (!backUrl) return new Response('Not found', { status: 404 })
  return Response.redirect(backUrl, 303)
}
