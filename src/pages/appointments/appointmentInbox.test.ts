import { describe, expect, it } from 'vitest'
import { appointmentDay, formatAppointmentTime, groupActiveAppointments } from './appointmentInbox'

describe('appointment presentation in the business timezone', () => {
  it('keeps appointment instants at UTC midnight on the correct business date', () => {
    const startsAt = '2026-01-04T00:00:00.000Z'
    expect(appointmentDay(startsAt, 'America/Santiago')).toBe('2026-01-03')
    expect(formatAppointmentTime(startsAt, 'America/Santiago')).toContain('21:00')

    const appointments = [{ startsAt, status: 'CONFIRMED' }]
    const now = new Date('2026-01-04T01:00:00.000Z')
    expect(groupActiveAppointments(appointments, 'America/Santiago', now)).toEqual([
      { id: 'today', label: 'Citas de hoy', appointments },
    ])
  })
})
