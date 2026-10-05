import { describe, expect, it } from 'vitest'
import {
  CASH_PAYMENT_METHOD,
  QUICK_SALE_DOCUMENT_TYPES,
  QUICK_SALE_PAYMENT_METHODS,
  addProductToTicket,
  canChargeQuickSale,
  cashChangeDue,
  ticketTotal,
  undoLastScan,
} from './quickSale'

const lens = {
  productId: 'p1',
  productName: 'Líquido',
  productPrice: 3990,
  productStatus: 'ACTIVE',
  quantityOnHand: 4,
}

describe('quick sale ticket', () => {
  it('adds a scan, increments the same product and undoes the last scan', () => {
    const first = addProductToTicket([], [], lens)
    expect(first.ok).toBe(true)
    if (!first.ok) return
    const second = addProductToTicket(first.lines, first.history, lens)
    expect(second.ok).toBe(true)
    if (!second.ok) return
    expect(second.lines[0]?.quantity).toBe(2)
    expect(ticketTotal(second.lines)).toBe(7980)

    const undone = undoLastScan(second.lines, second.history)
    expect(undone.lines[0]?.quantity).toBe(1)
  })

  it('keeps lab work out of the counter', () => {
    const result = addProductToTicket([], [], { ...lens, productRequiresLabWork: true })
    expect(result.ok).toBe(false)
    if (result.ok) return
    expect(result.code).toBe('LAB_WORK')
  })

  it('requires full cash and exposes the four payment methods', () => {
    const added = addProductToTicket([], [], lens)
    expect(added.ok).toBe(true)
    if (!added.ok) return

    expect(QUICK_SALE_PAYMENT_METHODS.map((method) => method.id)).toEqual(['0', '1', '2', '3'])
    expect(QUICK_SALE_DOCUMENT_TYPES.map((document) => document.id)).toEqual(['RECEIPT', 'BOLETA'])
    expect(cashChangeDue(3990, 5000)).toBe(1010)
    expect(
      canChargeQuickSale({
        lines: added.lines,
        paymentMethod: CASH_PAYMENT_METHOD,
        cashTendered: 1000,
        blocked: false,
        submitting: false,
      }),
    ).toBe(false)
    expect(
      canChargeQuickSale({
        lines: added.lines,
        paymentMethod: '0',
        cashTendered: null,
        blocked: false,
        submitting: false,
      }),
    ).toBe(true)
  })
})
