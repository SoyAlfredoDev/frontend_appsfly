import { describe, expect, it } from 'vitest'
import { subscriptionPaymentFeedback } from './subscriptionPaymentFeedback'
describe('subscription payment feedback', () => {
  it('does not call an authorized card a paid month', () => {
    const result = subscriptionPaymentFeedback({
      authorizationOnly: true,
      firstChargeAt: '2026-12-14T15:00:00Z',
      payment: { status: 'PENDING' },
    })
    expect(result.phase).toBe('authorized')
    expect(result.message).toContain('14-12-2026')
    expect(result.message).not.toContain('Pago aprobado')
  })
  it('waits for a payment for immediate plans', () =>
    expect(subscriptionPaymentFeedback({ authorizationOnly: true }).message).toContain('Esperamos'))
  it('confirms only an approved payment', () =>
    expect(subscriptionPaymentFeedback({ payment: { status: 'APPROVED' } }).phase).toBe('success'))
  it('keeps pending and rejected distinct', () => {
    expect(subscriptionPaymentFeedback({ payment: { status: 'PENDING' } }).phase).toBe('pending')
    expect(subscriptionPaymentFeedback({ payment: { status: 'REJECTED' } }).phase).toBe('error')
  })
})
