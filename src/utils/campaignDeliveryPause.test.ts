import { afterEach, describe, expect, it, vi } from 'vitest'
import { campaignPauseNotice } from './campaignDeliveryPause'

describe('aviso de pausa de una campaña', () => {
  afterEach(() => vi.useRealTimers())

  it('muestra la fecha de reinicio de Resend en horario de Chile', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-12-01T12:00:00Z'))

    const message = campaignPauseNotice({
      code: 'CAMPAIGN_MONTHLY_QUOTA',
      resumeAt: '2026-12-04T00:00:00Z',
    })

    expect(message).toMatch(/3 de diciembre de 2026/)
    expect(message).toContain('21:00')
    expect(message).toContain('cupo mensual agotado')
    expect(message).toContain('hora de Chile')
  })

  it('deja de mostrar la pausa cuando alcanza el horario de reinicio', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-12-04T00:00:00Z'))

    expect(campaignPauseNotice({ resumeAt: '2026-12-04T00:00:00Z' })).toBeNull()
    expect(campaignPauseNotice(null)).toBeNull()
  })

  it('muestra un aviso si el horario de reinicio es desconocido', () => {
    expect(campaignPauseNotice({ resumeAt: 'inválido' })).toContain('Envío en pausa')
    expect(campaignPauseNotice({ code: 'CAMPAIGN_BATCH_QUEUED' })).toContain('correos pendientes')
    expect(campaignPauseNotice({ message: 'Consulta de cupo pendiente.' })).toBe(
      'Consulta de cupo pendiente.',
    )
  })
})
