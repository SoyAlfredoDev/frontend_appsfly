import axios from './axios.js'

export type QuickSaleBootstrap = {
  walkInCustomer: {
    customerId: string
    displayName: string
    isWalkIn: boolean
  }
  defaultPaymentMethod: string
  defaultDocumentType: 'RECEIPT' | 'BOLETA'
  documentAdjusted: boolean
  boletaEnabled: boolean
  paymentMethods: { id: string; label: string }[]
}

export type QuickSalePayload = {
  saleId: string
  customerId: string | null
  paymentMethod: string
  documentType: 'RECEIPT' | 'BOLETA'
  cashTendered: number | null
  lines: { productId: string; quantity: number }[]
}

export const getQuickSaleBootstrap = (config?: { signal?: AbortSignal }) =>
  axios.get<QuickSaleBootstrap>('/sales/quick/bootstrap', config)

export const createQuickSale = (data: QuickSalePayload) => axios.post('/sales/quick', data)
