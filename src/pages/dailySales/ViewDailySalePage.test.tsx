import { StrictMode } from 'react'
import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import ViewDailySalePage from './ViewDailySalePage.jsx'

const getDailySaleDetail = vi.fn()

vi.mock('../../api/dailySales.js', () => ({
  getDailySaleDetail: (...args: unknown[]) => getDailySaleDetail(...args),
}))

const detail = {
  closure: {
    dailySalesId: 'c1',
    dailySalesDay: '2026-10-08',
    dailySalesDetailIncome: { '0': 2000, '1': 0, '2': 8000, '3': 1000 },
    dailySalesExpectedCash: 48000,
    dailySalesCountedCash: 45000,
    dailySalesCashDifference: -3000,
    createdAt: '2026-10-08T18:30:00.000Z',
    user: { userFirstName: 'Ana', userLastName: 'Pérez' },
  },
  totals: { sales: 12000, income: 11000, pending: 1000, transactions: 1 },
  sales: [
    {
      saleId: 's1',
      saleNumber: '41',
      createdAt: '2026-10-08T15:10:00.000Z',
      customerName: 'Cliente Demo',
      saleTotal: 12000,
      paid: 11000,
      pending: 1000,
      itemsCount: 2,
    },
  ],
  hourlySales: [{ hour: 15, label: '15:00', total: 12000, count: 1 }],
}

describe('ViewDailySalePage', () => {
  beforeEach(() => {
    getDailySaleDetail.mockReset().mockResolvedValue({ data: detail })
  })

  it('shows the closure after it was recorded', async () => {
    render(
      <StrictMode>
        <MemoryRouter initialEntries={['/sales/dailySales/view/c1']}>
          <Routes>
            <Route path="/sales/dailySales/view/:id" element={<ViewDailySalePage />} />
          </Routes>
        </MemoryRouter>
      </StrictMode>,
    )

    expect(await screen.findByText(/8 de octubre de 2026/i)).toBeInTheDocument()
    expect(screen.getByText('Efectivo esperado')).toBeInTheDocument()
    expect(screen.getByText('Efectivo contado')).toBeInTheDocument()
    expect(screen.getByText('Diferencia')).toBeInTheDocument()
    expect(screen.getByText('Cliente Demo')).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Detalle de Cierre Diario' })).toBeInTheDocument()
  })

  it('shows the day when it arrives as an ISO timestamp and skips broken sales', async () => {
    getDailySaleDetail.mockResolvedValue({
      data: {
        ...detail,
        closure: { ...detail.closure, dailySalesDay: '2026-10-08T03:00:00.000Z' },
        sales: [null, { saleId: '', createdAt: 'not-a-date' }, detail.sales[0]],
        hourlySales: { not: 'a list' },
      },
    })

    render(
      <MemoryRouter initialEntries={['/sales/dailySales/view/c1']}>
        <Routes>
          <Route path="/sales/dailySales/view/:id" element={<ViewDailySalePage />} />
        </Routes>
      </MemoryRouter>,
    )

    expect(await screen.findByText(/8 de octubre de 2026/i)).toBeInTheDocument()
    expect(screen.getByText('Cliente Demo')).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Detalle de Cierre Diario' })).toBeInTheDocument()
  })
})
