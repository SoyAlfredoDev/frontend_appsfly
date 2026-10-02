export type ExpenseCategory = {
  expenseCategoryId: string
  expenseCategoryName: string
  isSystem?: boolean
  _count?: { expenses: number }
}

export function readExpenseCategories(payload: unknown): ExpenseCategory[] {
  const value = Array.isArray(payload)
    ? payload
    : payload && typeof payload === 'object' && 'categories' in payload
      ? payload.categories
      : null
  return Array.isArray(value) ? value : []
}
