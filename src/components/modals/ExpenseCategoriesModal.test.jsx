import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import ExpenseCategoriesModal from './ExpenseCategoriesModal.jsx'
import { createExpenseCategory } from '../../api/expense.js'

vi.mock('../../api/expense.js', () => ({
  createExpenseCategory: vi.fn(),
  deleteExpenseCategory: vi.fn(),
}))

vi.mock('../../context/ToastContext.jsx', () => ({
  useToast: () => ({ success: vi.fn(), error: vi.fn() }),
}))

describe('ExpenseCategoriesModal', () => {
  beforeEach(() => vi.clearAllMocks())

  it('blocks deletion of system and used categories while allowing empty ones', () => {
    render(
      <ExpenseCategoriesModal
        isOpen
        onClose={vi.fn()}
        onCategoriesChanged={vi.fn()}
        categories={[
          {
            expenseCategoryId: 'other',
            expenseCategoryName: 'Otros',
            isSystem: true,
            _count: { expenses: 0 },
          },
          {
            expenseCategoryId: 'rent',
            expenseCategoryName: 'Arriendo',
            isSystem: false,
            _count: { expenses: 3 },
          },
          {
            expenseCategoryId: 'supplies',
            expenseCategoryName: 'Insumos',
            isSystem: false,
            _count: { expenses: 0 },
          },
        ]}
      />,
    )

    expect(screen.getByRole('button', { name: 'Eliminar Otros' })).toBeDisabled()
    expect(screen.getByRole('button', { name: 'Eliminar Arriendo' })).toBeDisabled()
    expect(screen.getByRole('button', { name: 'Eliminar Insumos' })).toBeEnabled()
  })

  it('creates a category using the trimmed name', async () => {
    const onCategoriesChanged = vi.fn()
    render(
      <ExpenseCategoriesModal
        isOpen
        onClose={vi.fn()}
        onCategoriesChanged={onCategoriesChanged}
        categories={[]}
      />,
    )

    fireEvent.change(screen.getByRole('textbox', { name: 'Nueva categoría' }), {
      target: { value: '  Servicios  ' },
    })
    fireEvent.click(screen.getByRole('button', { name: /agregar/i }))

    await waitFor(() => {
      expect(createExpenseCategory).toHaveBeenCalledWith('Servicios')
      expect(onCategoriesChanged).toHaveBeenCalled()
    })
  })
})
