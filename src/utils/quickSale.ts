export const QUICK_SALE_PAYMENT_METHODS = [
  { id: '0', label: 'Débito' },
  { id: '1', label: 'Crédito' },
  { id: '2', label: 'Efectivo' },
  { id: '3', label: 'Transferencia' },
] as const

export const QUICK_SALE_DOCUMENT_TYPES = [
  { id: 'RECEIPT', label: 'Comprobante interno' },
  { id: 'BOLETA', label: 'Boleta electrónica' },
] as const

export const CASH_PAYMENT_METHOD = '2'
export const WALK_IN_LABEL = 'Consumidor final'

export type QuickSalePaymentMethodId = (typeof QUICK_SALE_PAYMENT_METHODS)[number]['id']

export type QuickSaleProduct = {
  productId: string
  productName: string
  productSKU?: string | null
  productPrice: number
  productStatus?: string | null
  productRequiresLabWork?: boolean | null
  productAllowZeroStock?: boolean | null
  quantityOnHand?: number | null
}

export type QuickSaleLine = {
  productId: string
  name: string
  sku: string
  unitPrice: number
  quantity: number
  allowZeroStock: boolean
  quantityOnHand: number | null
}

export type AddProductResult =
  | { ok: true; lines: QuickSaleLine[]; history: string[] }
  | { ok: false; code: 'LAB_WORK' | 'INACTIVE'; message: string }

export function ticketTotal(lines: QuickSaleLine[]) {
  return lines.reduce((sum, line) => sum + line.unitPrice * line.quantity, 0)
}

export function cashChangeDue(total: number, tendered: number) {
  if (!Number.isFinite(tendered) || tendered < total) return 0
  return tendered - total
}

export function lineStockShortfall(line: QuickSaleLine) {
  if (line.allowZeroStock || line.quantityOnHand == null) return false
  return line.quantity > line.quantityOnHand
}

export function addProductToTicket(
  lines: QuickSaleLine[],
  history: string[],
  product: QuickSaleProduct,
): AddProductResult {
  if (product.productRequiresLabWork) {
    return {
      ok: false,
      code: 'LAB_WORK',
      message: `"${product.productName}" requiere una orden de trabajo. Regístralo en Nueva Venta.`,
    }
  }
  if (product.productStatus && product.productStatus !== 'ACTIVE') {
    return {
      ok: false,
      code: 'INACTIVE',
      message: `"${product.productName}" no está activo.`,
    }
  }

  const existing = lines.find((line) => line.productId === product.productId)
  const nextLines = existing
    ? lines.map((line) =>
        line.productId === product.productId ? { ...line, quantity: line.quantity + 1 } : line,
      )
    : [
        ...lines,
        {
          productId: product.productId,
          name: product.productName,
          sku: product.productSKU ?? '',
          unitPrice: Number(product.productPrice) || 0,
          quantity: 1,
          allowZeroStock: Boolean(product.productAllowZeroStock),
          quantityOnHand:
            typeof product.quantityOnHand === 'number' ? product.quantityOnHand : null,
        },
      ]

  return { ok: true, lines: nextLines, history: [...history, product.productId] }
}

export function undoLastScan(lines: QuickSaleLine[], history: string[]) {
  const productId = history[history.length - 1]
  if (!productId) return { lines, history }
  const nextHistory = history.slice(0, -1)
  const nextLines = lines.flatMap((line) => {
    if (line.productId !== productId) return [line]
    if (line.quantity <= 1) return []
    return [{ ...line, quantity: line.quantity - 1 }]
  })
  return { lines: nextLines, history: nextHistory }
}

export function setLineQuantity(lines: QuickSaleLine[], productId: string, quantity: number) {
  if (quantity < 1) return lines.filter((line) => line.productId !== productId)
  const next = Math.floor(quantity)
  return lines.map((line) => (line.productId === productId ? { ...line, quantity: next } : line))
}

export function canChargeQuickSale(input: {
  lines: QuickSaleLine[]
  paymentMethod: string
  cashTendered: number | null
  blocked: boolean
  submitting: boolean
}) {
  if (input.blocked || input.submitting || input.lines.length === 0) return false
  if (input.lines.some(lineStockShortfall)) return false
  const total = ticketTotal(input.lines)
  if (total <= 0) return false
  if (input.paymentMethod === CASH_PAYMENT_METHOD) {
    return input.cashTendered != null && input.cashTendered >= total
  }
  return true
}
