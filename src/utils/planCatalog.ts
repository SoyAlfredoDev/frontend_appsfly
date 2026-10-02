export const OPTICS_TRIAL_PLAN_ID = 'OPT-TRIAL'

const OPTICS_WELCOME = ['OPT-TRIAL', 'OPT-START', 'OPT-STANDARD', 'OPT-PRO']
const OPTICS_RENEWAL = ['OPT-START', 'OPT-STANDARD', 'OPT-PRO']
const LEGACY_WELCOME = ['P001', 'P002', 'P003']
const LEGACY_RENEWAL = ['P002', 'P003']

export function planIdsForBusiness(
  businessType: string | null | undefined,
  renewal = false,
): string[] {
  if (businessType === 'optics') return renewal ? OPTICS_RENEWAL : OPTICS_WELCOME
  return renewal ? LEGACY_RENEWAL : LEGACY_WELCOME
}

export function isTrialPlanId(planId: string): boolean {
  return planId === 'P001' || planId === OPTICS_TRIAL_PLAN_ID
}

export function displayedUfPrice(
  plan: {
    planListPriceUf?: number | string | null
    planOfferPriceUf?: number | string | null
    planOfferEndsAt?: string | Date | null
  },
  at: Date = new Date(),
): { current: number; list: number; promotional: boolean } | null {
  const list = Number(plan.planListPriceUf)
  if (!Number.isFinite(list) || list <= 0) return null
  const offer = Number(plan.planOfferPriceUf)
  const promotional =
    Number.isFinite(offer) &&
    offer > 0 &&
    !!plan.planOfferEndsAt &&
    at < new Date(plan.planOfferEndsAt)
  return { current: promotional ? offer : list, list, promotional }
}
