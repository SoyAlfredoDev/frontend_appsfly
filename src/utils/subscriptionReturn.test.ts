import { describe, expect, it } from 'vitest'
import { planSubscriptionReturn } from './subscriptionReturn'

describe('subscription return', () => {
  it('syncs the local payment when Mercado Pago only sends the reference', () => {
    expect(
      planSubscriptionReturn({
        status: null,
        paymentId: null,
        externalReference: 'pay-1',
        preapprovalId: null,
      }),
    ).toEqual({ action: 'sync-preapproval', externalReference: 'pay-1' })
  })

  it('confirms a checkout payment when both ids are present', () => {
    expect(
      planSubscriptionReturn({
        status: 'approved',
        paymentId: 'mp-9',
        externalReference: 'pay-1',
        preapprovalId: null,
      }),
    ).toEqual({
      action: 'confirm-payment',
      paymentId: 'mp-9',
      externalReference: 'pay-1',
    })
  })

  it('waits for the webhook when only the preapproval id comes back', () => {
    expect(
      planSubscriptionReturn({
        status: 'success',
        paymentId: null,
        externalReference: null,
        preapprovalId: 'pre-1',
      }),
    ).toEqual({ action: 'pending' })
  })

  it('stops on a rejected return', () => {
    expect(
      planSubscriptionReturn({
        status: 'failure',
        paymentId: 'mp-9',
        externalReference: 'pay-1',
        preapprovalId: null,
      }),
    ).toEqual({ action: 'rejected' })
  })
})
