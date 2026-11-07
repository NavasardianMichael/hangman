import type { TPaymentGatewayId } from 'server/config'
import { ameriaGateway } from './ameria'
import { mockGateway } from './mock'
import type { PaymentGatewayClient } from './types'

export const GATEWAYS: Record<TPaymentGatewayId, PaymentGatewayClient> = {
  ameria: ameriaGateway,
  mock: mockGateway,
}

export const isGatewayId = (value: unknown): value is TPaymentGatewayId =>
  typeof value === 'string' && Object.hasOwn(GATEWAYS, value)
