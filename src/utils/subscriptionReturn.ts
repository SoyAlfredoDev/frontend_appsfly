export type SubscriptionReturnInput = {
  status: string | null
  paymentId: string | null
  externalReference: string | null
  preapprovalId: string | null
}

export type SubscriptionReturnPlan =
  | { action: 'rejected' }
  | { action: 'confirm-payment'; paymentId: string; externalReference: string }
  | { action: 'sync-preapproval'; externalReference: string }
  | { action: 'pending' }
  | { action: 'missing' }

export function planSubscriptionReturn(input: SubscriptionReturnInput): SubscriptionReturnPlan {
  const status = input.status?.toLowerCase() ?? ''
  if (status === 'failure' || status === 'rejected') {
    return { action: 'rejected' }
  }

  if (input.paymentId && input.externalReference) {
    return {
      action: 'confirm-payment',
      paymentId: input.paymentId,
      externalReference: input.externalReference,
    }
  }

  if (input.externalReference) {
    return { action: 'sync-preapproval', externalReference: input.externalReference }
  }

  if (input.preapprovalId) {
    return { action: 'pending' }
  }

  return { action: 'missing' }
}
