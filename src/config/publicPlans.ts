/** Approved public offer. Update alongside the backend billing catalog when prices change. */
export const START_NET_MONTHLY_CLP = 24990
export const PRO_NET_MONTHLY_CLP = 39990
export const TRIAL_MONTHS = 2
export const TAX_REQUIREMENTS =
  'La emisión de boletas y facturas electrónicas requiere habilitar y configurar la cuenta de facturación de tu negocio. No se activa solo por contratar el plan.'
export const TRIAL_CONDITIONS =
  'Para negocios nuevos sin historial de suscripción ni pagos. Dos meses calendario desde la activación, una sola vez por negocio y sin tarjeta.'
export const RENEWAL_CONDITIONS =
  'Solo habrá cobros si eliges y autorizas un plan de pago. Si lo autorizas durante la prueba, el primer cobro se programa para su término.'

export function formatPlanClp(amount: number) {
  return `$${String(amount).replace(/\B(?=(\d{3})+(?!\d))/g, '.')}`
}
export function publicPlanTotal(net: number) {
  return net + Math.round(net * 0.19)
}
export type PublicPlanId = 'P001' | 'P005' | 'P006'
export type PublicPlan = {
  id: PublicPlanId
  name: string
  subtitle: string
  net: number
  months: number
  features: readonly string[]
}
export const PUBLIC_PLANS: readonly PublicPlan[] = [
  {
    id: 'P001',
    name: 'Prueba Pro',
    subtitle: 'Conoce el sistema con tu negocio',
    net: 0,
    months: TRIAL_MONTHS,
    features: [
      'Funciones de Pro durante 2 meses',
      'Hasta 5 usuarios',
      'Ventas, clientes e inventario',
      'Cuentas por cobrar y abonos',
      'Sin tarjeta para empezar',
    ],
  },
  {
    id: 'P005',
    name: 'Start',
    subtitle: 'Para quien administra su negocio',
    net: START_NET_MONTHLY_CLP,
    months: 1,
    features: [
      '1 usuario',
      'Ventas y clientes',
      'Cuentas por cobrar y abonos',
      'Productos, servicios e inventario',
      'Cotizaciones y compras',
      'Cierres de caja, gastos y reportes',
    ],
  },
  {
    id: 'P006',
    name: 'Pro',
    subtitle: 'Para trabajar con tu equipo',
    net: PRO_NET_MONTHLY_CLP,
    months: 1,
    features: [
      'Todo lo incluido en Start',
      'Hasta 5 usuarios',
      'Agenda de citas',
      'Asistente con IA para consultas',
      'Boleta y factura electrónica con configuración previa',
    ],
  },
]

/** Never sell a retired plan or silently replace a failed API call with an active offer. */
export function resolvePublicPlans(payload: unknown): PublicPlan[] {
  if (!Array.isArray(payload)) throw new Error('No se pudo verificar el catálogo de planes.')
  return PUBLIC_PLANS.filter((plan) => {
    const matches = payload.filter(
      (row: unknown) =>
        typeof row === 'object' && row !== null && 'planId' in row && row.planId === plan.id,
    ) as Record<string, unknown>[]
    if (matches.length > 1) throw new Error('No se pudo verificar el catálogo de planes.')
    const remote = matches[0]
    if (!remote || remote.planActive === false) return false
    if (
      remote.planPrice !== plan.net ||
      remote.planDuration !== plan.months ||
      (remote.planCurrency !== undefined && remote.planCurrency !== 'CLP')
    ) {
      throw new Error(
        'El catálogo se está actualizando. Vuelve a consultar los planes en unos momentos.',
      )
    }
    return true
  })
}
