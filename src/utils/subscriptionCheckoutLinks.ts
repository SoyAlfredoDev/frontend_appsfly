/** Links de cobro confirmados en Mercado Pago. Élite no tiene link. */
export const SUBSCRIPTION_CHECKOUT_LINKS = {
  P005: 'https://mpago.la/1AFYzNQ',
  P006: 'https://mpago.la/2Zet5b1',
} as const

export function checkoutUrlForPlan(
  planId: string | null | undefined,
  fromApi?: string | null,
): string | null {
  if (!planId) return null
  const known = SUBSCRIPTION_CHECKOUT_LINKS[planId as keyof typeof SUBSCRIPTION_CHECKOUT_LINKS]
  if (!known) return null
  if (typeof fromApi === 'string' && fromApi.startsWith('https://mpago.la/')) {
    return fromApi
  }
  return known
}
