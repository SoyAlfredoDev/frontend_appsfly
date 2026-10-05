import { describe, expect, it } from 'vitest'
import {
  buildMonthCells,
  formatDateLabel,
  formatMonthTitle,
  shiftMonth,
} from './appointmentBookingCalendar'

describe('appointmentBookingCalendar', () => {
  it('starts the month on Monday and keeps full weeks', () => {
    const cells = buildMonthCells('2026-10')
    expect(cells[3]).toBe('2026-10-01')
    expect(cells.length % 7).toBe(0)
    expect(cells.filter((cell) => cell === '2026-10-05')).toHaveLength(1)
  })

  it('moves across year boundaries', () => {
    expect(shiftMonth('2026-10', 1)).toBe('2026-11')
    expect(shiftMonth('2026-01', -1)).toBe('2025-12')
  })

  it('labels days and months in Spanish', () => {
    expect(formatDateLabel('2026-10-05')).toBe('lunes 5 de octubre')
    expect(formatMonthTitle('2026-10')).toBe('octubre 2026')
  })
})
