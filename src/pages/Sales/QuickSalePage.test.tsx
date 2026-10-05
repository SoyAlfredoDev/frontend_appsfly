import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import QuickSalePage from './QuickSalePage'

const getQuickSaleBootstrap = vi.fn()
const createQuickSale = vi.fn()
const getProducts = vi.fn()
const resolveScanCode = vi.fn()
const getClosureStatus = vi.fn()
const getCustomers = vi.fn()
const toast = { success: vi.fn(), error: vi.fn(), info: vi.fn() }

vi.mock('../../api/quickSale', () => ({
  getQuickSaleBootstrap: (...args: unknown[]) => getQuickSaleBootstrap(...args),
  createQuickSale: (...args: unknown[]) => createQuickSale(...args),
}))

vi.mock('../../api/product.js', () => ({
  getProducts: (...args: unknown[]) => getProducts(...args),
}))

vi.mock('../../api/scan.js', () => ({
  resolveScanCode: (...args: unknown[]) => resolveScanCode(...args),
}))

vi.mock('../../api/dailySales.js', () => ({
  getClosureStatus: (...args: unknown[]) => getClosureStatus(...args),
}))

vi.mock('../../api/customers.js', () => ({
  getCustomers: (...args: unknown[]) => getCustomers(...args),
}))

vi.mock('../../context/ToastContext.jsx', () => ({
  useToast: () => toast,
}))

vi.mock('../../components/scan/BarcodeScanListener.jsx', () => ({
  default: ({ onScan, placeholder }: { onScan: (code: string) => void; placeholder?: string }) => (
    <input
      aria-label={placeholder}
      onKeyDown={(event) => {
        if (event.key === 'Enter') onScan((event.target as HTMLInputElement).value)
      }}
    />
  ),
}))

const bootstrap = {
  walkInCustomer: {
    customerId: 'walk-in',
    displayName: 'Consumidor final',
    isWalkIn: true,
  },
  defaultPaymentMethod: '0',
  defaultDocumentType: 'RECEIPT' as const,
  documentAdjusted: false,
  boletaEnabled: false,
  paymentMethods: [],
}

describe('QuickSalePage', () => {
  beforeEach(() => {
    getQuickSaleBootstrap.mockReset().mockResolvedValue({ data: bootstrap })
    getClosureStatus.mockReset().mockResolvedValue({ data: { blocked: false } })
    getProducts.mockReset()
    resolveScanCode.mockReset()
    getCustomers.mockReset()
    createQuickSale.mockReset()
    toast.success.mockReset()
    toast.error.mockReset()
  })

  it('opens on consumidor final and charges a scanned product with the preset payment', async () => {
    const user = userEvent.setup()
    resolveScanCode.mockResolvedValue({
      data: {
        product: {
          productId: 'prod-1',
          productName: 'Líquido',
          productPrice: 3990,
          productStatus: 'ACTIVE',
          quantityOnHand: 5,
        },
      },
    })
    createQuickSale.mockResolvedValue({
      data: { sale: { saleNumber: 'a00012' }, changeDue: 0, dte: null },
    })

    render(
      <MemoryRouter>
        <QuickSalePage />
      </MemoryRouter>,
    )

    expect(await screen.findByRole('heading', { name: 'Caja rápida' })).toBeInTheDocument()
    expect(screen.getByText('Consumidor final · Comprobante interno')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Débito' })).toHaveAttribute('aria-pressed', 'true')

    await user.type(screen.getByLabelText('Escanear barcode / QR / SKU…'), '780123{Enter}')
    expect(await screen.findByText('Líquido')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Cobrar $3.990' }))

    expect(createQuickSale).toHaveBeenCalledWith(
      expect.objectContaining({
        customerId: null,
        paymentMethod: '0',
        documentType: 'RECEIPT',
        lines: [{ productId: 'prod-1', quantity: 1 }],
      }),
    )
    expect(toast.success).toHaveBeenCalled()
    expect(screen.getByText('Escanea un producto para empezar la venta.')).toBeInTheDocument()
  })

  it('shows cash change and keeps an empty counter distinct from a load error', async () => {
    const user = userEvent.setup()
    getProducts.mockResolvedValue({
      data: {
        rows: [
          {
            productId: 'prod-2',
            productName: 'Estuche',
            productPrice: 2000,
            productStatus: 'ACTIVE',
            quantityOnHand: 3,
          },
        ],
      },
    })

    render(
      <MemoryRouter>
        <QuickSalePage />
      </MemoryRouter>,
    )

    expect(
      await screen.findByText('Escanea un producto para empezar la venta.'),
    ).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Efectivo' }))
    await user.type(screen.getByLabelText('Buscar producto por nombre'), 'Est')
    await user.click(await screen.findByRole('button', { name: /Estuche/ }))
    await user.type(screen.getByLabelText('Monto recibido'), '5000')
    expect(screen.getByText('Vuelto $3.000')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Cobrar $2.000' })).toBeEnabled()
  })

  it('blocks charging when the daily closure is pending', async () => {
    getClosureStatus.mockResolvedValue({
      data: { blocked: true, message: 'Cierra el día anterior antes de vender.' },
    })

    render(
      <MemoryRouter>
        <QuickSalePage />
      </MemoryRouter>,
    )

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Cierra el día anterior antes de vender.',
    )
    expect(screen.getByRole('button', { name: 'Cobrar $0' })).toBeDisabled()
  })

  it('keeps a lab product out of the ticket and points to the full sale', async () => {
    const user = userEvent.setup()
    resolveScanCode.mockResolvedValue({
      data: {
        product: {
          productId: 'lens-1',
          productName: 'Cristal monofocal',
          productPrice: 45000,
          productStatus: 'ACTIVE',
          productRequiresLabWork: true,
        },
      },
    })

    render(
      <MemoryRouter>
        <QuickSalePage />
      </MemoryRouter>,
    )

    await screen.findByRole('heading', { name: 'Caja rápida' })
    await user.type(screen.getByLabelText('Escanear barcode / QR / SKU…'), 'LENS{Enter}')

    expect(await screen.findByRole('status')).toHaveTextContent('orden de trabajo')
    expect(screen.getByRole('link', { name: 'Ir a Nueva Venta' })).toHaveAttribute(
      'href',
      '/sales/register',
    )
    expect(screen.queryByText('Cristal monofocal')).not.toBeInTheDocument()
    expect(toast.error).toHaveBeenCalled()
  })

  it('shows a retry when the counter cannot load, distinct from an empty ticket', async () => {
    getQuickSaleBootstrap.mockRejectedValue({
      response: { data: { message: 'No hay conexión con la caja.' } },
    })

    render(
      <MemoryRouter>
        <QuickSalePage />
      </MemoryRouter>,
    )

    expect(await screen.findByRole('alert')).toHaveTextContent('No hay conexión con la caja.')
    expect(screen.getByRole('button', { name: 'Reintentar' })).toBeInTheDocument()
    expect(screen.queryByText('Escanea un producto para empezar la venta.')).not.toBeInTheDocument()
  })
})
