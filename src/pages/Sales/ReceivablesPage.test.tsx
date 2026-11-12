import { fireEvent, render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import ReceivablesPage from './ReceivablesPage'

const { load } = vi.hoisted(() => ({ load: vi.fn() }))
vi.mock('../../api/generalSales', () => ({ getGeneralReceivables: load }))
vi.mock('../../context/authContext.jsx', () => ({
  useAuth: () => ({
    activeBusinessId: 'general-a',
    business: { businessTimezone: 'America/Santiago' },
  }),
}))

describe('Cuentas por cobrar', () => {
  beforeEach(() => vi.resetAllMocks())

  it('distingue la carga, el error recuperable y la cartera vacía', async () => {
    load.mockRejectedValueOnce(new Error('API no disponible')).mockResolvedValueOnce({
      data: { rows: [], totalPending: 0, pagination: { total: 0, pages: 1 } },
    })
    render(<ReceivablesPage />, { wrapper: MemoryRouter })
    expect(screen.getByLabelText('Cargando cuentas por cobrar')).toBeVisible()
    expect(await screen.findByRole('alert')).toHaveTextContent('No se pudieron cargar')
    fireEvent.click(screen.getByRole('button', { name: 'Reintentar' }))
    expect(await screen.findByText('No hay ventas con saldo pendiente.')).toBeVisible()
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
  })
})
