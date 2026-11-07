import path from 'node:path'
import { SITE_URL } from 'helpers/constants/app'

// Server-only settings (route handlers under src/app/api). The only reader of process.env for payments and mail.

export type TPaymentGatewayId = 'ameria' | 'mock'

const env = process.env
const isProduction = env.NODE_ENV === 'production'

export const serverConfig = {
  isProduction,
  // This site's public origin: the bank's BackURL and the redirect after a payment are built on it
  publicUrl: (env.PUBLIC_URL || (isProduction ? SITE_URL : 'http://localhost:7005')).replace(/\/+$/, ''),
  // Where the SQLite file lives. Production must set it outside the releases, which every deploy rotates away
  // (the systemd unit sets APP_DIR/shared/data); without it, payments stay off rather than lose their records.
  dataDir: env.DATA_DIR || (isProduction ? '' : path.join(process.cwd(), '.data')),
  payments: {
    gateway: (env.PAYMENT_GATEWAY === 'ameria' ? 'ameria' : 'mock') as TPaymentGatewayId,
    // Ameriabank vPOS 3.1. The three credentials are read only by server/payments/gateways/ameria.ts
    ameria: {
      clientId: env.AMERIA_CLIENT_ID ?? '',
      username: env.AMERIA_USERNAME ?? '',
      password: env.AMERIA_PASSWORD ?? '',
      // Only the exact value "false" uses the live terminal
      testMode: env.AMERIA_TEST_MODE !== 'false',
      orderIdOffset: Number(env.AMERIA_ORDER_ID_OFFSET ?? 0) || 0,
      // The test terminal accepts only 10 AMD; null charges the real price
      amountOverride: env.AMERIA_AMOUNT_OVERRIDE ? Number(env.AMERIA_AMOUNT_OVERRIDE) : null,
    },
  },
  // The mail engine (the same one cv-builder uses): contact form and payment alerts to the admin inbox
  mail: {
    apiUrl: (env.MAIL_API_URL ?? '').replace(/\/+$/, ''),
    apiKey: env.MAIL_API_KEY ?? '',
  },
}

// The mock bank hands out premium for a click, so it never runs in production whatever the env says
export const isPaymentConfigured = (): boolean => {
  const { gateway, ameria } = serverConfig.payments
  if (!serverConfig.dataDir) return false
  if (gateway === 'mock') return !isProduction
  return Boolean(ameria.clientId && ameria.username && ameria.password)
}
