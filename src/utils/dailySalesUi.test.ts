import { describe, expect, it } from 'vitest'
import {
  closureDayKey,
  closureRowsFromPayload,
  formatClosureDate,
  isDailySalesDayInCurrentMonth,
} from './dailySalesUi.js'

describe('daily sales view helpers', () => {
  it('reads a calendar day from date-only, ISO and timestamp text', () => {
    expect(closureDayKey('2026-10-08')).toBe('2026-10-08')
    expect(closureDayKey('2026-10-08T03:00:00.000Z')).toBe('2026-10-08')
    expect(closureDayKey('2026-10-08 00:00:00')).toBe('2026-10-08')
    expect(closureDayKey(null)).toBe('')
    expect(closureDayKey({ bad: true })).toBe('')
  })

  it('formats those days without throwing', () => {
    expect(formatClosureDate('2026-10-08T03:00:00.000Z')).toMatch(/8 de octubre de 2026/i)
    expect(formatClosureDate('2026-10-08 00:00:00')).toMatch(/8 de octubre de 2026/i)
    expect(formatClosureDate({ bad: true })).toBe('—')
  })

  it('counts an ISO day in the current month', () => {
    const october = new Date(2026, 9, 20)
    expect(isDailySalesDayInCurrentMonth('2026-10-08T03:00:00.000Z', october)).toBe(true)
    expect(isDailySalesDayInCurrentMonth({ bad: true }, october)).toBe(false)
  })

  it('rejects a list payload that is not an array', () => {
    expect(closureRowsFromPayload({ message: 'ok' })).toBeNull()
    expect(closureRowsFromPayload([null, { dailySalesId: '1' }])).toEqual([{ dailySalesId: '1' }])
  })
})
