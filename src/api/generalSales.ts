import axios from './axios.js'

type SaleHeader = {
  saleId: string
  saleCustomerId: string
  documentType: 'RECEIPT' | 'BOLETA' | 'FACTURA'
  saleComment?: string | null
  saleImageUrl?: string | null
  saleDeliveryStatus?: string
}

type SaleFormLine = {
  saleDetailId: string
  saleDetailProductServiceId: string
  saleDetailType: 'PRODUCT' | 'SERVICE'
  saleDetailAmount: string | number
  saleDetailPrice: string | number
}

type SaleFormPayment = {
  paymentId: string
  methodId: string | number
  amount: string | number
}

export function createGeneralBusinessSale(
  header: SaleHeader,
  lines: SaleFormLine[],
  payments: SaleFormPayment[],
) {
  return axios.post<{ sale: { saleId: string; saleNumber: string } }>('/sales/general', {
    saleId: header.saleId,
    customerId: header.saleCustomerId,
    saleComment: header.saleComment,
    saleImageUrl: header.saleImageUrl,
    documentType: header.documentType,
    pendingDelivery: header.saleDeliveryStatus === 'PENDING',
    lines: lines.map((line) => ({
      detailId: line.saleDetailId,
      itemId: line.saleDetailProductServiceId,
      type: line.saleDetailType,
      quantity: Number(line.saleDetailAmount),
      price: Number(line.saleDetailPrice),
    })),
    payments: payments
      .filter((payment) => Number(payment.amount) > 0)
      .map((payment) => ({
        paymentId: payment.paymentId,
        paymentMethod: payment.methodId,
        paymentAmount: Number(payment.amount),
      })),
  })
}

export type Receivables = {
  rows: {
    saleId: string
    saleNumber: string | null
    createdAt: string
    saleTotal: number
    saleTotalPayments: number
    salePendingAmount: number
    customerPendingAmount: number
    customer: { customerFirstName: string; customerLastName: string | null }
  }[]
  totalPending: number
  pagination: { total: number; pages: number }
}

export function getGeneralReceivables(page: number, q: string, signal: AbortSignal) {
  return axios.get<Receivables>('/sales/receivables', { params: { page, q }, signal })
}
