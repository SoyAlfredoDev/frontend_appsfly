export const APPOINTMENTS_PLAN_IDS = ['P001', 'P002', 'P003', 'P006', 'P007'] as const

type SubscriptionSnapshot = {
  subscriptionPlanId?: string | null
  subscriptionStatus?: string | null
  subscriptionEndDate?: string | Date | null
}

const ACTIVE_SUBSCRIPTION_STATUSES = new Set(['ACTIVE', 'CANCELLED'])

function isSubscriptionCurrentlyActive(
  subscription: SubscriptionSnapshot | null | undefined,
  now: Date,
): boolean {
  if (!subscription?.subscriptionStatus) return false
  if (!ACTIVE_SUBSCRIPTION_STATUSES.has(subscription.subscriptionStatus)) return false
  const end = new Date(subscription.subscriptionEndDate ?? '')
  return !Number.isNaN(end.getTime()) && end > now
}

export function canUseAppointmentsPlan(planId: string | null | undefined): boolean {
  return planId != null && (APPOINTMENTS_PLAN_IDS as readonly string[]).includes(planId)
}

/** Prueba Pro, Pro, Élite y los planes pagos históricos. Start (P005) no habilita citas. */
export function hasAppointmentsPlan(
  subscriptions: SubscriptionSnapshot[] | null | undefined,
  now: Date = new Date(),
): boolean {
  return (subscriptions ?? []).some(
    (subscription) =>
      isSubscriptionCurrentlyActive(subscription, now) &&
      canUseAppointmentsPlan(subscription.subscriptionPlanId),
  )
}
