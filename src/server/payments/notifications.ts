import { serverConfig } from 'server/config'
import type { TPaymentRow } from 'server/db'
import type { TRequestInfo } from 'server/http'
import { isMailConfigured, sendInternalMail } from 'server/mail'
import { formatAmd } from 'helpers/constants/premium'

/*
 * Admin mails about payments, through the mail engine's internal endpoint (as in cv-builder):
 * "checkout started" when the bank page was asked for, and "payment succeeded" once per payment, by whichever
 * settler won the claim. Best effort: never awaited by the caller, failures only logged. Without MAIL_API_* they
 * print to the server log.
 */

export type TSettleSource = 'return' | 'status'

const SOURCE_TEXT: Record<TSettleSource, string> = {
  return: 'the bank redirect',
  status: 'a status read (reconcile)',
}

// The engine's budget is shared with the contact form: at most this many "started" mails an hour
const STARTED_MAILS_PER_HOUR = 30
const startedSent: number[] = []

const formatTime = (time: number) => new Date(time).toLocaleString('en-GB', { timeZone: 'Asia/Yerevan' })

const describeRequest = (request: TRequestInfo | null) =>
  request ? [`IP: ${request.ip}`, `User agent: ${request.userAgent || '—'}`] : ['Request: —']

const deliver = async (subject: string, lines: string[]) => {
  const body = lines.join('\n')
  if (!isMailConfigured()) {
    if (!serverConfig.isProduction) console.log(`[payments mail] ${subject}\n${body}`)
    return
  }
  await sendInternalMail({ subject, body })
}

export const notifyCheckoutStarted = async (
  checkout: { orderNumber: number; gateway: string; failure: string | null },
  request: TRequestInfo
) => {
  try {
    const now = Date.now()
    while (startedSent.length && now - startedSent[0] > 60 * 60 * 1000) startedSent.shift()
    if (startedSent.length >= STARTED_MAILS_PER_HOUR) return
    startedSent.push(now)

    await deliver(`Hangman / Checkout started #${checkout.orderNumber}`, [
      `Order #: ${checkout.orderNumber}`,
      `Gateway: ${checkout.gateway}`,
      checkout.failure ? `The bank page did not open: ${checkout.failure}` : 'The bank page opened.',
      `Time: ${formatTime(now)}`,
      ...describeRequest(request),
    ])
  } catch (error) {
    console.error('[payments mail] checkout started not sent', error)
  }
}

export const notifyPaymentSucceeded = async (
  payment: TPaymentRow,
  source: TSettleSource,
  request: TRequestInfo | null
) => {
  try {
    await deliver(`Hangman / Payment succeeded #${payment.order_number}`, [
      `Order #: ${payment.order_number}`,
      `Amount: ${formatAmd(payment.amount)}`,
      `Gateway: ${payment.gateway} (${payment.gateway_payment_id ?? '—'})`,
      `Paid: ${payment.paid_at ? formatTime(payment.paid_at) : '—'}`,
      `Premium until: ${payment.premium_until ? formatTime(payment.premium_until) : '—'}`,
      `Settled by: ${SOURCE_TEXT[source]}`,
      ...describeRequest(request),
    ])
  } catch (error) {
    console.error('[payments mail] payment succeeded not sent', error)
  }
}
