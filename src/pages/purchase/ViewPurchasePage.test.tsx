import type { ReactNode } from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import ViewPurchasePage from './ViewPurchasePage.jsx'

const getPurchaseById = vi.fn()

vi.mock('@react-pdf/renderer', () => ({
  PDFDownloadLink: ({ children }: { children: (state: { loading: boolean }) => ReactNode }) =>
    children({ loading: false }),
}))

vi.mock('../../components/Printables/PurchaseReceiptPDF.jsx', () => ({
  default: () => null,
}))

vi.mock('../../api/purchase.js', () => ({
  getPurchaseById: (...args: unknown[]) => getPurchaseById(...args),
  cancelPurchaseRequest: vi.fn(),
}))

vi.mock('../../context/ToastContext.jsx', () => ({
  useToast: () => ({ error: vi.fn(), success: vi.fn() }),
}))

vi.mock('../../context/ConfirmationContext.jsx', () => ({
  useConfirm: () => vi.fn(),
}))

function renderPurchase() {
  return render(
    <MemoryRouter initialEntries={['/purchase/view/9']}>
      <Routes>
        <Route path="/purchase/view/:id" element={<ViewPurchasePage />} />
        <Route path="/purchase" element={<h1>Listado de compras</h1>} />
      </Routes>
    </MemoryRouter>,
  )
}

describe('ViewPurchasePage', () => {
  beforeEach(() => {
    getPurchaseById.mockReset()
  })

  it('shows the purchase frame and data placeholders while the request is pending', () => {
    getPurchaseById.mockReturnValue(new Promise(() => undefined))

    renderPurchase()

    expect(screen.getByRole('heading', { name: 'Detalle de compra' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /Volver/i })).toHaveAttribute('href', '/purchase')
    expect(screen.getByLabelText('Cargando compra')).toHaveAttribute('aria-busy', 'true')
  })

  it('keeps the frame and offers retry when the purchase cannot be loaded', async () => {
    const user = userEvent.setup()
    getPurchaseById.mockRejectedValueOnce(new Error('network'))
    getPurchaseById.mockReturnValueOnce(new Promise(() => undefined))

    renderPurchase()

    expect(await screen.findByRole('alert')).toHaveTextContent('No se pudo cargar la compra.')
    expect(screen.getByRole('heading', { name: 'Detalle de compra' })).toBeInTheDocument()
    expect(screen.queryByRole('heading', { name: 'Listado de compras' })).not.toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Reintentar' }))
    expect(getPurchaseById).toHaveBeenCalledTimes(2)
    expect(screen.getByLabelText('Cargando compra')).toBeInTheDocument()
  })
})
