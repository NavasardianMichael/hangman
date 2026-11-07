import { createHash, randomUUID } from 'node:crypto'
import { serverConfig } from 'server/config'
import { getDb, TPaymentRow, TPaymentStatus } from 'server/db'
import type { TRequestInfo } from 'server/http'
import { PREMIUM_DURATION_MS, PREMIUM_PRICE_AMD } from 'helpers/constants/premium'
import { GATEWAYS, isGatewayId } from './gateways'
import { notifyCheckoutStarted, notifyPaymentSucceeded, TSettleSource } from './notifications'

/*
 * Premium purchases (docs/PAYMENTS.md), on the same rules as cv-builder's server/src/services/payments.ts.
 *
 * - There are no accounts: a buyer is a random key the browser keeps (store/premium.ts). Only its SHA-256 is stored.
 * - `startCheckout` writes a `pending` row, asks the gateway for a payment page and returns its URL. Nothing is
 *   unlocked there.
 * - `settlePayment` is the only writer of `succeeded`. It asks the gateway, server to server, and moves the row out
 *   of `pending` by compare-and-set, so the bank's redirect and a status read racing each other settle it once.
 * - `readPremium` covers the buyer who paid and closed the tab before the redirect (reconcile-on-read), and takes
 *   premium back when the bank shows the payment refunded.
 */

const RECONCILE_WINDOW_MS = 3 * 24 * 60 * 60 * 1000
// How often an active payment is re-read from the bank for a refund
const REVERSAL_CHECK_MS = 6 * 60 * 60 * 1000

export class PremiumError extends Error {
  constructor(
    readonly status: number,
    readonly code: 'active' | 'init_failed',
    message: string
  ) {
    super(message)
  }
}

// 32 random bytes, base64url (store/premium.ts)
export const isBuyerKey = (value: unknown): value is string =>
  typeof value === 'string' && /^[A-Za-z0-9_-]{40,128}$/.test(value)

const hashBuyerKey = (key: string) => createHash('sha256').update(key).digest('hex')

export type TPremiumStatus = {
  // End of the latest paid month (past once it expired); null when this buyer has none
  until: number | null
  // A checkout the bank has not answered yet
  pending: boolean
}

const findPendingRows = (buyerHash: string) =>
  getDb()
    .prepare(
      `SELECT * FROM payments
       WHERE buyer_hash = ? AND status = 'pending' AND gateway_payment_id IS NOT NULL AND created_at >= ?
       ORDER BY created_at DESC LIMIT 3`
    )
    .all(buyerHash, Date.now() - RECONCILE_WINDOW_MS) as TPaymentRow[]

const findLatestPaid = (buyerHash: string) =>
  getDb()
    .prepare(`SELECT * FROM payments WHERE buyer_hash = ? AND status = 'succeeded' ORDER BY premium_until DESC LIMIT 1`)
    .get(buyerHash) as TPaymentRow | undefined

export const findPaymentForReturn = (gateway: string, gatewayPaymentId: string, opaque: string) => {
  const db = getDb()
  // The column compares case-insensitively: Ameria answers InitPayment's id in upper case
  const byGatewayId = gatewayPaymentId
    ? (db
        .prepare('SELECT * FROM payments WHERE gateway = ? AND gateway_payment_id = ?')
        .get(gateway, gatewayPaymentId) as TPaymentRow | undefined)
    : undefined
  if (byGatewayId) return byGatewayId
  return opaque
    ? (db.prepare('SELECT * FROM payments WHERE gateway = ? AND id = ?').get(gateway, opaque) as
        TPaymentRow | undefined)
    : undefined
}

export const settlePayment = async (
  payment: TPaymentRow,
  source: TSettleSource,
  request: TRequestInfo | null
): Promise<TPaymentStatus> => {
  if (payment.status !== 'pending' || !payment.gateway_payment_id || !isGatewayId(payment.gateway)) {
    return payment.status
  }

  const verdict = await GATEWAYS[payment.gateway].check(payment.gateway_payment_id, {
    orderNumber: payment.order_number,
    amount: payment.amount,
  })
  if (verdict.status === 'pending') return 'pending'

  const db = getDb()
  if (verdict.status === 'failed') {
    db.prepare(`UPDATE payments SET status = 'failed', failure_reason = ? WHERE id = ? AND status = 'pending'`).run(
      verdict.reason.slice(0, 500),
      payment.id
    )
    return 'failed'
  }

  // The month starts when the bank confirms, and never adds to an earlier one: each payment is a fresh month
  const now = Date.now()
  const until = now + PREMIUM_DURATION_MS
  const claimed = db
    .prepare(
      `UPDATE payments SET status = 'succeeded', paid_at = ?, premium_until = ?, checked_at = ?
       WHERE id = ? AND status = 'pending'`
    )
    .run(now, until, now, payment.id)
  // Only the settler that moved the row mails it, so a racing redirect and status read send one mail
  if (Number(claimed.changes) === 1) {
    void notifyPaymentSucceeded(
      { ...payment, status: 'succeeded', paid_at: now, premium_until: until },
      source,
      request
    )
  }
  return 'succeeded'
}

// A refund or void made in the bank's merchant panel takes the month back. A bank that cannot answer counts as
// still paid: an outage must not lock a buyer out.
const revalidate = async (payment: TPaymentRow): Promise<boolean> => {
  if (!payment.gateway_payment_id || !isGatewayId(payment.gateway)) return true
  if (payment.checked_at && Date.now() - payment.checked_at < REVERSAL_CHECK_MS) return true
  try {
    const reversed = await GATEWAYS[payment.gateway].isReversed(payment.gateway_payment_id)
    const db = getDb()
    if (reversed) {
      db.prepare(`UPDATE payments SET status = 'refunded' WHERE id = ? AND status = 'succeeded'`).run(payment.id)
      console.info(`[payments] #${payment.order_number} refunded at the bank: premium taken back`)
      return false
    }
    db.prepare('UPDATE payments SET checked_at = ? WHERE id = ?').run(Date.now(), payment.id)
  } catch (error) {
    console.error(
      `[payments] revalidate of #${payment.order_number} failed`,
      error instanceof Error ? error.message : error
    )
  }
  return true
}

export const readPremium = async (buyerKey: string, request: TRequestInfo | null): Promise<TPremiumStatus> => {
  const buyerHash = hashBuyerKey(buyerKey)

  let pending = false
  for (const payment of findPendingRows(buyerHash)) {
    try {
      if ((await settlePayment(payment, 'status', request)) === 'pending') pending = true
    } catch (error) {
      pending = true
      console.error(
        `[payments] reconcile of #${payment.order_number} failed`,
        error instanceof Error ? error.message : error
      )
    }
  }

  // A refunded payment drops out, and an earlier one may still be the latest
  for (let attempt = 0; attempt < 3; attempt++) {
    const latest = findLatestPaid(buyerHash)
    if (!latest) return { until: null, pending }
    const isActive = (latest.premium_until ?? 0) > Date.now()
    if (!isActive || (await revalidate(latest))) return { until: latest.premium_until, pending }
  }
  return { until: null, pending }
}

export const startCheckout = async (buyerKey: string, request: TRequestInfo): Promise<string> => {
  // Read first, so a buyer whose payment just went through is not charged for a month they already have
  const current = await readPremium(buyerKey, request)
  if (current.until && current.until > Date.now()) {
    throw new PremiumError(409, 'active', 'Premium is already active')
  }

  const gatewayId = serverConfig.payments.gateway
  const db = getDb()
  const id = randomUUID()
  const inserted = db
    .prepare('INSERT INTO payments (id, buyer_hash, amount, gateway, created_at) VALUES (?, ?, ?, ?, ?)')
    .run(id, hashBuyerKey(buyerKey), PREMIUM_PRICE_AMD, gatewayId, Date.now())
  const orderNumber = Number(inserted.lastInsertRowid)

  try {
    const { gatewayPaymentId, redirectUrl } = await GATEWAYS[gatewayId].init({
      orderNumber,
      amount: PREMIUM_PRICE_AMD,
      description: 'Կախաղան — պրեմիում մեկ ամսով (անսահմանափակ հուշումներ և տառեր)',
      backUrl: `${serverConfig.publicUrl}/api/premium/return/${gatewayId}`,
      opaque: id,
    })
    db.prepare('UPDATE payments SET gateway_payment_id = ? WHERE id = ?').run(gatewayPaymentId, id)
    void notifyCheckoutStarted({ orderNumber, gateway: gatewayId, failure: null }, request)
    return redirectUrl
  } catch (error) {
    const reason = error instanceof Error ? error.message : 'init failed'
    console.error(`[payments] init failed for #${orderNumber}: ${reason}`)
    db.prepare(`UPDATE payments SET status = 'failed', failure_reason = ? WHERE id = ?`).run(reason.slice(0, 500), id)
    void notifyCheckoutStarted({ orderNumber, gateway: gatewayId, failure: reason }, request)
    throw new PremiumError(502, 'init_failed', 'Payment could not be started')
  }
}
