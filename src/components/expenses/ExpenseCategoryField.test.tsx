import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import ExpenseCategoryField from './ExpenseCategoryField'

const categories = [
  { expenseCategoryId: 'rent', expenseCategoryName: 'Arriendo' },
  { expenseCategoryId: 'other', expenseCategoryName: 'Otros' },
]

describe('ExpenseCategoryField', () => {
  it('shows a loading state before categories are available', () => {
    render(
      <ExpenseCategoryField categories={[]} value="" onChange={() => undefined} status="loading" />,
    )

    expect(screen.getByRole('status')).toHaveTextContent('Cargando categorías...')
    expect(screen.getByLabelText('Categoría del gasto')).toBeDisabled()
  })

  it('shows an error state when categories cannot be loaded', () => {
    render(
      <ExpenseCategoryField
        categories={[]}
        value=""
        onChange={() => undefined}
        status="error"
        errorMessage="No se pudieron cargar las categorías."
      />,
    )

    expect(screen.getByRole('alert')).toHaveTextContent('No se pudieron cargar las categorías.')
  })

  it('requires choosing one of the available categories', async () => {
    const onChange = vi.fn()
    const user = userEvent.setup()

    render(
      <ExpenseCategoryField categories={categories} value="" onChange={onChange} status="ready" />,
    )

    await user.selectOptions(screen.getByLabelText('Categoría del gasto'), 'rent')

    expect(onChange).toHaveBeenCalledWith('rent')
    expect(screen.getByRole('option', { name: 'Arriendo' })).toBeInTheDocument()
  })

  it('explains when there are no categories to choose', () => {
    render(
      <ExpenseCategoryField categories={[]} value="" onChange={() => undefined} status="ready" />,
    )

    expect(screen.getByRole('status')).toHaveTextContent('No hay categorías disponibles.')
  })
})
