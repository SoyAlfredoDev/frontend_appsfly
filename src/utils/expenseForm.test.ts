import { describe, expect, it } from 'vitest'

import { toExpenseAmount, validateExpenseDraft } from './expenseForm'

const validDraft = {
  expenseDescription: 'Pago de luz',
  expenseAmount: '45000',
  expenseCategoryId: 'utilities',
}

describe('validateExpenseDraft', () => {
  it('accepts a complete expense', () => {
    expect(validateExpenseDraft(validDraft)).toBeNull()
    expect(toExpenseAmount(validDraft.expenseAmount)).toBe(45000)
  })

  it('requires a category before the expense can be saved', () => {
    expect(validateExpenseDraft({ ...validDraft, expenseCategoryId: '' })).toBe(
      'Selecciona una categoría.',
    )
  })

  it('rejects decimal amounts', () => {
    expect(validateExpenseDraft({ ...validDraft, expenseAmount: '10.5' })).toBe(
      'El monto debe ser un número entero mayor que cero.',
    )
  })
})
