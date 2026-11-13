import { describe, expect, it } from 'vitest'
import { PUBLIC_PLANS, resolvePublicPlans, publicPlanTotal } from './publicPlans'
const rows = PUBLIC_PLANS.map((p) => ({
  planId: p.id,
  planPrice: p.net,
  planDuration: p.months,
  planCurrency: 'CLP',
  planActive: true,
}))
describe('verified public offers', () => {
  it('matches the monthly totals charged with Chilean IVA', () => {
    expect(publicPlanTotal(24990)).toBe(29738)
    expect(publicPlanTotal(39990)).toBe(47588)
  })
  it('uses reviewed features rather than stale optical-only or unverified marketing text', () => {
    const plans = resolvePublicPlans(
      rows.map((row) => ({
        ...row,
        planFeatures: ['WhatsApp automático', 'Sucursales ilimitadas'],
        planName: 'Plan antiguo',
      })),
    )
    expect(plans.map((p) => p.name)).toEqual(['Prueba Pro', 'Start', 'Pro'])
    expect(plans[1]?.features).toContain('Cuentas por cobrar y abonos')
    expect(plans[2]?.features).toContain('Asistente con IA para consultas')
    expect(plans.flatMap((p) => p.features)).not.toContain('Sucursales ilimitadas')
  })
  it('does not offer retired, inactive or absent plans', () => {
    expect(
      resolvePublicPlans([
        ...rows.map((row) => ({ ...row, planActive: false })),
        { planId: 'P007', planActive: true },
      ]),
    ).toEqual([])
    expect(resolvePublicPlans([])).toEqual([])
  })
  it.each([
    null,
    {},
    [rows[0], rows[0]],
    [{ ...rows[0], planDuration: 1 }],
    [{ ...rows[1], planPrice: 9990 }],
    [{ ...rows[2], planCurrency: 'USD' }],
  ])('does not advertise unverified terms for %j', (payload) => {
    expect(() => resolvePublicPlans(payload)).toThrow()
  })
})
