export type ExpenseDraft = {
  expenseDescription: string
  expenseAmount: string
  expenseCategoryId: string
}

export function validateExpenseDraft(draft: ExpenseDraft): string | null {
  if (draft.expenseDescription.trim() === '') {
    return 'Ingresa la descripción del gasto.'
  }

  if (draft.expenseDescription.trim().length > 500) {
    return 'La descripción no puede superar 500 caracteres.'
  }

  if (draft.expenseCategoryId.trim() === '') {
    return 'Selecciona una categoría.'
  }

  const amount = Number(draft.expenseAmount)
  if (!Number.isInteger(amount) || amount <= 0) {
    return 'El monto debe ser un número entero mayor que cero.'
  }

  return null
}

export function toExpenseAmount(value: string): number {
  return Number(value)
}
