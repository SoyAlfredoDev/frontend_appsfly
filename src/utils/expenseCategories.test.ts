import { describe, expect, it } from 'vitest'
import { readExpenseCategories } from './expenseCategories.js'

describe('expense category API response', () => {
  const category = { expenseCategoryId: 'c1', expenseCategoryName: 'Cristales' }

  it('reads the backend response and the earlier array response', () => {
    expect(readExpenseCategories({ categories: [category] })).toEqual([category])
    expect(readExpenseCategories([category])).toEqual([category])
  })

  it('does not treat an invalid response as a category', () => {
    expect(readExpenseCategories(null)).toEqual([])
    expect(readExpenseCategories({ categories: null })).toEqual([])
  })
})
