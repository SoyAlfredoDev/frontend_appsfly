import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import ViewSalePage from './ViewSalePage.jsx'

const mocks = vi.hoisted(() => ({
  getSaleById: vi.fn(),
  getSaleDetailById: vi.fn(),
  getPaymentBySaleId: vi.fn(),
  updateSale: vi.fn(),
  createPayment: vi.fn(),
  markSaleDeliveredRequest: vi.fn(),
  sendSaleEmail: vi.fn(),
  getSaleShareLink: vi.fn(),
  getWorkOrdersBySaleId: vi.fn(),
  toast: { success: vi.fn(), error: vi.fn(), info: vi.fn() },
  isTenantAdmin: true,
}))

vi.mock('../../api/sale.js', () => ({
  getSaleById: mocks.getSaleById,
  updateSale: mocks.updateSale,
  markSaleDeliveredRequest: mocks.markSaleDeliveredRequest,
  sendSaleEmail: mocks.sendSaleEmail,
  getSaleShareLink: mocks.getSaleShareLink,
}))
vi.mock('../../api/saleDetail.js', () => ({ getSaleDetailById: mocks.getSaleDetailById }))
vi.mock('../../api/payment.js', () => ({
  getPaymentBySaleId: mocks.getPaymentBySaleId,
  createPayment: mocks.createPayment,
}))
vi.mock('../../api/workOrders.js', () => ({ getWorkOrdersBySaleId: mocks.getWorkOrdersBySaleId }))
vi.mock('../../context/authContext.jsx', () => ({
  useAuth: () => ({ business: { businessType: 'retail' } }),
}))
vi.mock('../../hooks/useTenantPermissions.js', () => ({
  default: () => ({ isTenantAdmin: mocks.isTenantAdmin }),
}))
vi.mock('../../hooks/useReceiptBusiness.js', () => ({ default: () => ({}) }))
vi.mock('../../context/ConfirmationContext.jsx', () => ({ useConfirm: () => vi.fn() }))
vi.mock('../../context/ToastContext.jsx', () => ({ useToast: () => mocks.toast }))
vi.mock('../../utils/businessReceiptSettings.js', () => ({ isDeliveryControlEnabled: () => false }))
vi.mock('../../utils/businessModality.js', () => ({ isOpticsBusiness: () => false }))
vi.mock('../../components/sales/SaleWorkOrdersSection.jsx', () => ({ default: () => null }))
vi.mock('../../components/sales/SalePurchaseCertificatesSection.jsx', () => ({
  default: () => null,
}))
vi.mock('../../components/sales/SaleDeliveryBadge.jsx', () => ({ default: () => null }))
vi.mock('../../components/layout/PageContainer.jsx', () => ({
  default: ({ children }) => children,
}))
vi.mock('../../components/Printables/SimpleTestPDF.jsx', () => ({ default: () => null }))
vi.mock('../../components/IconComponent.jsx', () => ({ IconPrinter: () => null }))
vi.mock('@react-pdf/renderer', () => ({
  PDFDownloadLink: ({ children }) => children({ loading: false }),
}))
vi.mock('framer-motion', () => ({
  motion: { div: 'div' },
  AnimatePresence: ({ children }) => children,
}))
vi.mock('react-router-dom', async (importOriginal) => ({
  ...(await importOriginal()),
  useParams: () => ({ id: 'sale-1' }),
}))

const sale = {
  saleId: 'sale-1',
  saleNumber: '1001',
  saleCustomerId: 'customer-1',
  createdAt: '2026-10-12T12:00:00.000Z',
  saleTotal: 200,
  saleTotalPayments: 200,
  salePendingAmount: 0,
  editability: { allowed: true },
  customer: { customerFirstName: 'Ana', customerLastName: 'Pérez' },
  user: { userFirstName: 'Vendedor', userLastName: 'Uno' },
}

beforeEach(() => {
  vi.clearAllMocks()
  mocks.isTenantAdmin = true
  mocks.getSaleById.mockResolvedValue({ data: sale })
  mocks.getSaleDetailById.mockResolvedValue({
    data: [
      {
        saleDetailId: 'detail-1',
        saleDetailType: 'PRODUCT',
        saleDetailQuantity: 2,
        saleDetailPrice: 100,
        saleDetailTotal: 200,
        product: { productName: 'Producto variable', productPriceFixed: false },
      },
    ],
  })
  mocks.getPaymentBySaleId.mockResolvedValue({
    data: [
      { paymentId: 'payment-1', paymentMethod: '2', paymentAmount: 200, createdAt: sale.createdAt },
    ],
  })
  mocks.updateSale.mockResolvedValue({ data: { sale } })
})

describe('ViewSalePage sale editing', () => {
  it.each(['DAY_CLOSED', 'SALE_TOO_OLD'])('blocks editing for %s', async (reason) => {
    mocks.getSaleById.mockResolvedValue({
      data: { ...sale, editability: { allowed: false, reason } },
    })
    render(
      <MemoryRouter>
        <ViewSalePage />
      </MemoryRouter>,
    )
    await screen.findByText(
      reason === 'DAY_CLOSED'
        ? 'Día cerrado: edición bloqueada.'
        : 'Solo se editan ventas de hoy o ayer.',
    )
    expect(screen.queryByText('Editar venta')).not.toBeInTheDocument()
  })

  it('retains the edit form after an API rejection', async () => {
    mocks.updateSale.mockRejectedValueOnce({ response: { data: { message: 'Día cerrado.' } } })
    render(
      <MemoryRouter>
        <ViewSalePage />
      </MemoryRouter>,
    )
    fireEvent.click(await screen.findByText('Editar venta'))
    fireEvent.click(screen.getByText('Guardar cambios'))
    await waitFor(() =>
      expect(mocks.toast.error).toHaveBeenCalledWith('No se pudo actualizar', 'Día cerrado.'),
    )
    expect(screen.getByText('Guardar cambios')).toBeInTheDocument()
  })

  it('allows leaving the complete balance receivable', async () => {
    render(
      <MemoryRouter>
        <ViewSalePage />
      </MemoryRouter>,
    )
    fireEvent.click(await screen.findByText('Editar venta'))
    fireEvent.click(screen.getByText('Quitar'))
    fireEvent.click(screen.getByText('Guardar cambios'))
    await waitFor(() =>
      expect(mocks.updateSale).toHaveBeenCalledWith('sale-1', { details: [], payments: [] }),
    )
  })
  it('does not show the edit action to a non-administrator', async () => {
    mocks.isTenantAdmin = false
    render(
      <MemoryRouter>
        <ViewSalePage />
      </MemoryRouter>,
    )
    await screen.findByText('Detalle de Venta')
    expect(screen.queryByText('Editar venta')).not.toBeInTheDocument()
  })

  it('lets an administrator change a variable product price and split payments with a receivable balance', async () => {
    render(
      <MemoryRouter>
        <ViewSalePage />
      </MemoryRouter>,
    )

    await screen.findByText('Editar venta')
    fireEvent.click(screen.getByText('Editar venta'))
    fireEvent.change(screen.getByLabelText('Precio Producto variable'), { target: { value: '80' } })
    fireEvent.change(screen.getByLabelText('Monto del pago 1'), { target: { value: '70' } })
    fireEvent.click(screen.getByText('+ Añadir método'))
    fireEvent.change(screen.getByLabelText('Método de pago 2'), { target: { value: '3' } })
    fireEvent.change(screen.getByLabelText('Monto del pago 2'), { target: { value: '50' } })
    fireEvent.click(screen.getByText('Guardar cambios'))

    await waitFor(() =>
      expect(mocks.updateSale).toHaveBeenCalledWith('sale-1', {
        details: [{ saleDetailId: 'detail-1', saleDetailPrice: 80 }],
        payments: [
          { paymentMethod: '2', paymentAmount: 70 },
          { paymentMethod: '3', paymentAmount: 50 },
        ],
      }),
    )
    expect(mocks.toast.success).toHaveBeenCalledWith('Venta actualizada', expect.any(String))
  })
})
