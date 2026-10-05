import { describe, expect, it } from 'vitest'
import { checkoutUrlForPlan } from './subscriptionCheckoutLinks'

describe('subscription checkout links', () => {
  it('opens the Mercado Pago link for Start and Pro', () => {
    expect(checkoutUrlForPlan('P005')).toBe('https://mpago.la/1AFYzNQ')
    expect(checkoutUrlForPlan('P006')).toBe('https://mpago.la/2Zet5b1')
  })

  it('does not offer a link for Élite', () => {
    expect(checkoutUrlForPlan('P007')).toBeNull()
    expect(checkoutUrlForPlan('P007', 'https://example.com/no')).toBeNull()
  })

  it('prefers the official link returned by the API', () => {
    expect(checkoutUrlForPlan('P005', 'https://mpago.la/oficial')).toBe('https://mpago.la/oficial')
  })
})
