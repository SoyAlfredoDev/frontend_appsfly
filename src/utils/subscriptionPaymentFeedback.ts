export function subscriptionPaymentFeedback(data: {
  authorizationOnly?: boolean
  firstChargeAt?: string | null
  payment?: { status?: string }
}) {
  if (data.authorizationOnly)
    return {
      phase: 'authorized',
      message: data.firstChargeAt
        ? `Medio de pago autorizado. El primer cobro está programado a partir del ${new Date(data.firstChargeAt).toLocaleDateString('es-CL', { timeZone: 'America/Santiago' })}. Tu período vigente se mantiene.`
        : 'Medio de pago autorizado. Esperamos la confirmación del primer cobro para activar el plan.',
    }
  if (data.payment?.status === 'APPROVED')
    return {
      phase: 'success',
      message: 'Pago aprobado. La vigencia de tu suscripción ha sido actualizada.',
    }
  if (data.payment?.status === 'PENDING')
    return {
      phase: 'pending',
      message: 'Pago pendiente de confirmación. Te avisaremos cuando se acredite.',
    }
  return {
    phase: 'error',
    message: 'No fue posible confirmar el pago. Contacta a soporte si el cargo fue realizado.',
  }
}
