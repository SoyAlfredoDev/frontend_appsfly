type CampaignDeliveryPause = {
  code?: string | null
  resumeAt?: string | null
  message?: string | null
}

const chileDateTime = new Intl.DateTimeFormat('es-CL', {
  dateStyle: 'long',
  timeStyle: 'short',
  hour12: false,
  timeZone: 'America/Santiago',
})

export function campaignPauseNotice(pause?: CampaignDeliveryPause | null) {
  if (!pause) return null

  const resumeAt = pause.resumeAt ? new Date(pause.resumeAt) : null
  if (resumeAt && Number.isFinite(resumeAt.getTime())) {
    if (resumeAt.getTime() <= Date.now()) return null
    const reason =
      pause.code === 'CAMPAIGN_MONTHLY_QUOTA'
        ? ' por cupo mensual agotado'
        : pause.code === 'CAMPAIGN_DAILY_QUOTA'
          ? ' por cupo diario agotado'
          : ''
    return `Envío en pausa${reason} hasta el ${chileDateTime.format(resumeAt)} (hora de Chile).`
  }

  if (pause.code === 'CAMPAIGN_BATCH_QUEUED') {
    return pause.message || 'Hay correos pendientes para el próximo ciclo de envío.'
  }

  return pause.message || 'Envío en pausa mientras se comprueba el cupo de Resend.'
}
