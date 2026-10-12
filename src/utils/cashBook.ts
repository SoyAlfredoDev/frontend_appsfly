export type LedgerRow = {
  transactionTable?: string | null
  transactionRecordId?: string | null
  transactionNewValue?: unknown
}

export function transactionSourcePath(row: LedgerRow): string | null {
  const table = row.transactionTable
  const recordId = String(row.transactionRecordId ?? '')
  const purchaseId = recordId.split(':')[0]
  const value = row.transactionNewValue

  if (table === 'Payment' && value && typeof value === 'object' && 'saleId' in value) {
    const saleId = value.saleId
    return typeof saleId === 'string' && saleId ? `/sales/view/${saleId}` : null
  }
  if (table === 'Purchase' && purchaseId) return `/purchase/view/${purchaseId}`
  if (table === 'Expense') return '/expenses'
  return null
}

export const MANUAL_MOVEMENT_OPTIONS = [
  { id: 'OPENING', label: 'Fondo inicial', direction: 'IN', lockCash: true },
  { id: 'WITHDRAWAL', label: 'Retiro a banco', direction: 'OUT', lockCash: true },
  { id: 'OTHER_INCOME', label: 'Otro ingreso', direction: 'IN', lockCash: false },
  { id: 'ADJUSTMENT', label: 'Ajuste manual', direction: null, lockCash: false },
] as const
