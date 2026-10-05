import { describe, expect, it } from 'vitest'

import { hasAppointmentsPlan } from './appointmentPlanAccess'

const now = new Date('2026-10-03T12:00:00.000Z')

describe('hasAppointmentsPlan', () => {
  it('opens citas for the Pro trial and keeps Start closed', () => {
    expect(
      hasAppointmentsPlan(
        [
          {
            subscriptionPlanId: 'P001',
            subscriptionStatus: 'ACTIVE',
            subscriptionEndDate: '2026-12-01T00:00:00.000Z',
          },
        ],
        now,
      ),
    ).toBe(true)
    expect(
      hasAppointmentsPlan(
        [
          {
            subscriptionPlanId: 'P005',
            subscriptionStatus: 'ACTIVE',
            subscriptionEndDate: '2026-12-01T00:00:00.000Z',
          },
        ],
        now,
      ),
    ).toBe(false)
  })

  it('opens citas for commercial and professional plans', () => {
    expect(
      hasAppointmentsPlan(
        [
          {
            subscriptionPlanId: 'P002',
            subscriptionStatus: 'ACTIVE',
            subscriptionEndDate: '2026-12-01T00:00:00.000Z',
          },
        ],
        now,
      ),
    ).toBe(true)
    expect(
      hasAppointmentsPlan(
        [
          {
            subscriptionPlanId: 'P003',
            subscriptionStatus: 'ACTIVE',
            subscriptionEndDate: '2026-12-01T00:00:00.000Z',
          },
        ],
        now,
      ),
    ).toBe(true)
  })

  it('ignores a paid plan that already ended', () => {
    expect(
      hasAppointmentsPlan(
        [
          {
            subscriptionPlanId: 'P002',
            subscriptionStatus: 'ACTIVE',
            subscriptionEndDate: '2026-09-01T00:00:00.000Z',
          },
        ],
        now,
      ),
    ).toBe(false)
  })
})
