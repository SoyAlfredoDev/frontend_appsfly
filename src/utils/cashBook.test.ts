import { describe, expect, it } from 'vitest'
import { MANUAL_MOVEMENT_OPTIONS, transactionSourcePath } from './cashBook'

describe('transactionSourcePath', () => {
  it('opens the sale behind a cash collection', () => {
    expect(
      transactionSourcePath({
        transactionTable: 'Payment',
        transactionRecordId: 'payment-1',
        transactionNewValue: { amount: 1000, direction: 'IN', saleId: 'sale-9' },
      }),
    ).toBe('/sales/view/sale-9')
  })

  it('opens the purchase even when the ledger row is a cancellation', () => {
    expect(
      transactionSourcePath({
        transactionTable: 'Purchase',
        transactionRecordId: 'purchase-1:cancel',
      }),
    ).toBe('/purchase/view/purchase-1')
  })

  it('sends expenses to the expense book and ignores manual cash notes', () => {
    expect(
      transactionSourcePath({ transactionTable: 'Expense', transactionRecordId: 'expense-1' }),
    ).toBe('/expenses')
    expect(
      transactionSourcePath({ transactionTable: 'Transactions', transactionRecordId: 'note-1' }),
    ).toBeNull()
  })
})

describe('manual cash movements', () => {
  it('keeps opening float and bank withdrawals in the cash drawer', () => {
    const opening = MANUAL_MOVEMENT_OPTIONS.find((option) => option.id === 'OPENING')
    const withdrawal = MANUAL_MOVEMENT_OPTIONS.find((option) => option.id === 'WITHDRAWAL')
    expect(opening).toMatchObject({ direction: 'IN', lockCash: true })
    expect(withdrawal).toMatchObject({ direction: 'OUT', lockCash: true })
  })
})
