import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createSaleGeneral } from './createSale.js'

const mocks = vi.hoisted(() => ({
  post: vi.fn(),
}))

vi.mock('../api/axios.js', () => ({ default: { post: mocks.post } }))
vi.mock('../api/mercadopago/mpService.js', () => ({ getAdminSubscriptionPayments: vi.fn() }))

const header = { saleId: 'sale-a', saleCustomerId: 'customer-a', documentType: 'RECEIPT' }
const line = {
  saleDetailId: 'line-a',
  saleDetailType: 'PRODUCT',
  saleDetailProductServiceId: 'product-a',
  saleDetailPrice: 30000,
  saleDetailAmount: 1,
}
const payment = { paymentId: 'payment-a', methodId: 2, amount: 10000 }

describe('guardar la venta según el rubro', () => {
  beforeEach(() => {
    vi.resetAllMocks()
    mocks.post.mockResolvedValue({ data: { sale: header } })
  })

  it('envía la venta general con líneas y pagos juntos', async () => {
    const result = await createSaleGeneral(header, [line], [payment], { atomic: true })
    expect(result.dataSale).toEqual(header)
    expect(mocks.post).toHaveBeenCalledExactlyOnceWith('/sales/general', {
      saleId: 'sale-a',
      customerId: 'customer-a',
      saleComment: undefined,
      saleImageUrl: undefined,
      documentType: 'RECEIPT',
      pendingDelivery: false,
      lines: [
        { detailId: 'line-a', itemId: 'product-a', type: 'PRODUCT', quantity: 1, price: 30000 },
      ],
      payments: [{ paymentId: 'payment-a', paymentMethod: 2, paymentAmount: 10000 }],
    })
  })

  it('conserva la secuencia de venta, detalle y pago que usa óptica', async () => {
    await createSaleGeneral(header, [line], [payment])
    expect(mocks.post.mock.calls.map(([path]) => path)).toEqual([
      '/sales',
      '/saleDetails',
      '/payments',
    ])
  })
})
