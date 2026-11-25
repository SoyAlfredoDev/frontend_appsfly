import { describe, expect, it } from 'vitest'
import { sanitizeAppointmentTelemetry } from './sanitizeAppointmentTelemetry'

describe('sanitizeAppointmentTelemetry', () => {
  it('strips the private appointment token from full and relative event URLs', () => {
    const path = '/registarcita/qa-business'
    expect(
      sanitizeAppointmentTelemetry({
        url: `https://appsfly.cl${path}#gestionar=private-token`,
        type: 'pageview',
      }),
    ).toEqual({ url: `https://appsfly.cl${path}`, type: 'pageview' })
    expect(sanitizeAppointmentTelemetry({ url: `${path}#gestionar=private-token` }).url).toBe(path)
  })

  it('preserves unrelated navigation events', () => {
    const event = { url: '/appointments#configuracion', type: 'vital' }
    expect(sanitizeAppointmentTelemetry(event)).toBe(event)
  })
})
