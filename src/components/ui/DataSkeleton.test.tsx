import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import DataErrorPanel from './DataErrorPanel'
import { DetailFieldsSkeleton, PageDataSkeleton, TableRowsSkeleton } from './DataSkeleton'

describe('data loading regions', () => {
  it('keeps a page-shaped skeleton available while data is pending', () => {
    render(<PageDataSkeleton label="Cargando vista" />)

    expect(screen.getByLabelText('Cargando vista')).toHaveAttribute('aria-busy', 'true')
    expect(screen.getByLabelText('Cargando datos')).toBeInTheDocument()
    expect(screen.getByLabelText('Cargando filas')).toBeInTheDocument()
  })

  it('marks field and row placeholders as busy regions', () => {
    render(
      <>
        <DetailFieldsSkeleton label="Cargando ficha" />
        <TableRowsSkeleton label="Cargando filas" />
      </>,
    )

    expect(screen.getByLabelText('Cargando ficha')).toHaveAttribute('aria-busy', 'true')
    expect(screen.getByLabelText('Cargando filas')).toHaveAttribute('aria-busy', 'true')
  })

  it('keeps the error in place and retries without leaving the view', async () => {
    const user = userEvent.setup()
    const onRetry = vi.fn()

    render(<DataErrorPanel message="No se pudo cargar la compra." onRetry={onRetry} />)

    expect(screen.getByRole('alert')).toHaveTextContent('No se pudo cargar la compra.')
    await user.click(screen.getByRole('button', { name: 'Reintentar' }))
    expect(onRetry).toHaveBeenCalledOnce()
  })
})
