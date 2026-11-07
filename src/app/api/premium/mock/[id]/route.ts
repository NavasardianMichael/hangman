import { serverConfig } from 'server/config'
import { readMockPayment } from 'server/payments/gateways/mock'
import { formatAmd } from 'helpers/constants/premium'

// The mock bank's payment page (PAYMENT_GATEWAY=mock, development only)

const isMockAvailable = () => serverConfig.payments.gateway === 'mock' && !serverConfig.isProduction

const escapeHtml = (value: string) => value.replace(/[&<>"']/g, (char) => `&#${char.charCodeAt(0)};`)

const mockPage = (id: string, amount: number) => `<!doctype html>
<html lang="hy"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="robots" content="noindex"><title>Փորձնական վճարում</title>
<style>
body{font-family:system-ui,sans-serif;background:#6f6f6f;display:grid;place-items:center;min-height:100vh;margin:0}
main{background:#f6f3ec;padding:32px;max-width:380px;text-align:center;box-shadow:0 10px 40px #0004}
a{display:block;margin-top:12px;padding:12px;text-decoration:none;font-weight:600}
.pay{background:#575757;color:#fff}.decline{background:#ddd;color:#333}
small{color:#888}
</style></head><body><main>
<h1>Փորձնական բանկ</h1>
<p>Սա մշակման ռեժիմի կեղծ վճարման էջ է։ Իրական գումար չի գանձվում։</p>
<p><strong>${escapeHtml(formatAmd(amount))}</strong></p>
<a class="pay" href="/api/premium/mock/${escapeHtml(id)}/approve">Վճարել</a>
<a class="decline" href="/api/premium/mock/${escapeHtml(id)}/decline">Մերժել</a>
<p><small>PAYMENT_GATEWAY=mock</small></p>
</main></body></html>`

export async function GET(_request: Request, ctx: RouteContext<'/api/premium/mock/[id]'>) {
  const { id } = await ctx.params
  const payment = isMockAvailable() ? readMockPayment(id) : undefined
  if (!payment) return new Response('Not found', { status: 404 })
  return new Response(mockPage(id, payment.amount), { headers: { 'Content-Type': 'text/html; charset=utf-8' } })
}
