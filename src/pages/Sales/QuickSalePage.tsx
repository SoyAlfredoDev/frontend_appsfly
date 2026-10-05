import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { v4 as uuidv4 } from 'uuid'
import { FaChevronLeft, FaMinus, FaPlus, FaUndo } from 'react-icons/fa'
import ExpensePageLayout from '../../components/ui/ExpensePageLayout.jsx'
import BarcodeScanListener from '../../components/scan/BarcodeScanListener.jsx'
import { useToast } from '../../context/ToastContext.jsx'
import { getCustomers } from '../../api/customers.js'
import { getClosureStatus } from '../../api/dailySales.js'
import { getProducts } from '../../api/product.js'
import { resolveScanCode } from '../../api/scan.js'
import { createQuickSale, getQuickSaleBootstrap } from '../../api/quickSale'
import type { QuickSaleBootstrap } from '../../api/quickSale'
import formatCurrency from '../../utils/formatCurrency.js'
import formatName from '../../utils/formatName.js'
import { unwrapListPayload } from '../../utils/listPayload.js'
import useDebouncedValue from '../../hooks/useDebouncedValue.js'
import {
  CASH_PAYMENT_METHOD,
  QUICK_SALE_DOCUMENT_TYPES,
  QUICK_SALE_PAYMENT_METHODS,
  WALK_IN_LABEL,
  addProductToTicket,
  canChargeQuickSale,
  cashChangeDue,
  lineStockShortfall,
  setLineQuantity,
  ticketTotal,
  undoLastScan,
} from '../../utils/quickSale'
import type { QuickSaleLine, QuickSaleProduct } from '../../utils/quickSale'
import { PRIMARY_BTN, PRIMARY_BTN_BLOCK, FLAT_INPUT } from '../../utils/expenseUiPatterns.js'

type NamedCustomer = { customerId: string; label: string }
type ClosureBlock = { blocked?: boolean; message?: string } | null

function messageFromError(error: unknown, fallback: string) {
  if (typeof error === 'object' && error && 'response' in error) {
    const message = (error as { response?: { data?: { message?: string } } }).response?.data
      ?.message
    if (message) return message
  }
  return fallback
}

function customerLabel(customer: { customerFirstName?: string; customerLastName?: string }) {
  return `${formatName(customer.customerFirstName)} ${formatName(customer.customerLastName)}`.trim()
}

export default function QuickSalePage() {
  const toast = useToast()
  const [saleId, setSaleId] = useState(() => uuidv4())
  const [bootstrap, setBootstrap] = useState<QuickSaleBootstrap | null>(null)
  const [loadState, setLoadState] = useState<'loading' | 'ready' | 'error'>('loading')
  const [closure, setClosure] = useState<ClosureBlock>(null)
  const [lines, setLines] = useState<QuickSaleLine[]>([])
  const [history, setHistory] = useState<string[]>([])
  const [paymentMethod, setPaymentMethod] = useState('0')
  const [cashTendered, setCashTendered] = useState('')
  const [selectedCustomer, setSelectedCustomer] = useState<NamedCustomer | null>(null)
  const [customerQuery, setCustomerQuery] = useState('')
  const [customerResults, setCustomerResults] = useState<NamedCustomer[]>([])
  const [productQuery, setProductQuery] = useState('')
  const [productResults, setProductResults] = useState<QuickSaleProduct[]>([])
  const [notice, setNotice] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const debouncedCustomerQuery = useDebouncedValue(customerQuery, 300)
  const debouncedProductQuery = useDebouncedValue(productQuery, 300)
  const blocked = closure?.blocked === true
  const total = ticketTotal(lines)
  const tendered = cashTendered.trim() === '' ? null : Number(cashTendered)
  const changeDue =
    paymentMethod === CASH_PAYMENT_METHOD && tendered != null ? cashChangeDue(total, tendered) : 0
  const documentType = bootstrap?.defaultDocumentType ?? 'RECEIPT'
  const documentLabel =
    QUICK_SALE_DOCUMENT_TYPES.find((item) => item.id === documentType)?.label ??
    'Comprobante interno'

  const readyToCharge = canChargeQuickSale({
    lines,
    paymentMethod,
    cashTendered: Number.isInteger(tendered) ? tendered : null,
    blocked,
    submitting,
  })

  const loadCounter = useCallback(async (signal?: AbortSignal) => {
    setLoadState('loading')
    try {
      const [bootstrapRes, closureRes] = await Promise.all([
        getQuickSaleBootstrap({ signal }),
        getClosureStatus({ signal }),
      ])
      if (signal?.aborted) return
      const data = bootstrapRes.data
      setBootstrap(data)
      setPaymentMethod(data.defaultPaymentMethod || '0')
      setClosure(closureRes.data ?? null)
      setLoadState('ready')
    } catch (error) {
      if (signal?.aborted) return
      setLoadState('error')
      setNotice(messageFromError(error, 'No se pudo abrir la caja rápida.'))
    }
  }, [])

  useEffect(() => {
    const controller = new AbortController()
    void loadCounter(controller.signal)
    return () => controller.abort()
  }, [loadCounter])

  useEffect(() => {
    const query = String(debouncedProductQuery ?? '').trim()
    if (query.length < 2) {
      setProductResults([])
      return undefined
    }
    const controller = new AbortController()
    void getProducts({ q: query, limit: 8 }, { signal: controller.signal })
      .then((response: { data: unknown }) => {
        const rows = unwrapListPayload(response.data).rows as QuickSaleProduct[]
        setProductResults(rows)
      })
      .catch(() => {
        if (!controller.signal.aborted) setProductResults([])
      })
    return () => controller.abort()
  }, [debouncedProductQuery])

  useEffect(() => {
    const query = String(debouncedCustomerQuery ?? '').trim()
    if (query.length < 2) {
      setCustomerResults([])
      return undefined
    }
    const controller = new AbortController()
    void getCustomers({ q: query, limit: 8 }, { signal: controller.signal })
      .then((response: { data: unknown }) => {
        const rows = unwrapListPayload(response.data).rows as {
          customerId: string
          customerFirstName?: string
          customerLastName?: string
        }[]
        setCustomerResults(
          rows.map((row) => ({ customerId: row.customerId, label: customerLabel(row) })),
        )
      })
      .catch(() => {
        if (!controller.signal.aborted) setCustomerResults([])
      })
    return () => controller.abort()
  }, [debouncedCustomerQuery])

  const applyProduct = useCallback(
    (product: QuickSaleProduct) => {
      const result = addProductToTicket(lines, history, product)
      if (!result.ok) {
        setNotice(result.message)
        toast.error('Caja rápida', result.message)
        return
      }
      setLines(result.lines)
      setHistory(result.history)
      setNotice(null)
      setProductQuery('')
      setProductResults([])
    },
    [history, lines, toast],
  )

  const handleScan = useCallback(
    async (code: string) => {
      if (blocked || submitting) return
      try {
        const response = await resolveScanCode(code)
        const product = response.data?.product as QuickSaleProduct | undefined
        if (!product?.productId) {
          setNotice('No hay un producto asociado a ese código.')
          toast.error('Código no encontrado', 'No hay un producto asociado a ese código.')
          return
        }
        applyProduct(product)
      } catch (error) {
        const message = messageFromError(error, 'No se pudo resolver el código escaneado.')
        setNotice(message)
        toast.error('Escaneo', message)
      }
    },
    [applyProduct, blocked, submitting, toast],
  )

  const resetTicket = () => {
    setLines([])
    setHistory([])
    setCashTendered('')
    setSelectedCustomer(null)
    setCustomerQuery('')
    setNotice(null)
    setSaleId(uuidv4())
  }

  const handleCharge = async () => {
    if (!readyToCharge || !bootstrap) return
    setSubmitting(true)
    try {
      const response = await createQuickSale({
        saleId,
        customerId: selectedCustomer?.customerId ?? null,
        paymentMethod,
        documentType,
        cashTendered: paymentMethod === CASH_PAYMENT_METHOD && tendered != null ? tendered : null,
        lines: lines.map((line) => ({ productId: line.productId, quantity: line.quantity })),
      })
      const saleNumber = response.data?.sale?.saleNumber ?? ''
      const returnedChange = Number(response.data?.changeDue ?? 0)
      const changeNote = returnedChange > 0 ? ` Vuelto ${formatCurrency(returnedChange)}.` : ''
      toast.success(`Venta #${saleNumber}`, `Cobro registrado.${changeNote}`)
      if (response.data?.dte && response.data.dte.issued === false) {
        toast.error('Boleta no emitida', response.data.dte.message || 'La venta quedó guardada.')
      }
      resetTicket()
    } catch (error) {
      const message = messageFromError(error, 'No se pudo registrar la venta.')
      setNotice(message)
      toast.error('Caja rápida', message)
    } finally {
      setSubmitting(false)
    }
  }

  const customerName =
    selectedCustomer?.label ?? bootstrap?.walkInCustomer.displayName ?? WALK_IN_LABEL
  const stockProblem = useMemo(() => lines.some(lineStockShortfall), [lines])

  if (loadState === 'loading') {
    return (
      <ExpensePageLayout title="Caja rápida" subtitle="Preparando el mostrador" actions={null}>
        <p role="status">Cargando caja</p>
      </ExpensePageLayout>
    )
  }

  if (loadState === 'error' || !bootstrap) {
    return (
      <ExpensePageLayout
        title="Caja rápida"
        subtitle="No se pudo abrir el mostrador"
        actions={null}
      >
        <div role="alert" className="space-y-3">
          <p>{notice ?? 'No se pudo abrir la caja rápida.'}</p>
          <button type="button" className={PRIMARY_BTN} onClick={() => void loadCounter()}>
            Reintentar
          </button>
        </div>
      </ExpensePageLayout>
    )
  }

  return (
    <ExpensePageLayout
      title="Caja rápida"
      subtitle={`${customerName} · ${documentLabel}`}
      actions={
        <Link to="/sales" className={`${PRIMARY_BTN} bg-white !text-primary border border-primary`}>
          <FaChevronLeft /> Ventas
        </Link>
      }
    >
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_320px]">
        <section className="space-y-3" aria-label="Ticket">
          {blocked && (
            <p
              role="alert"
              className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900"
            >
              {closure?.message ?? 'Hay un cierre diario pendiente. La caja no puede cobrar.'}
            </p>
          )}
          {bootstrap.documentAdjusted && (
            <p className="text-sm text-gray-600">
              La boleta electrónica no está habilitada. Esta caja emite comprobante interno.
            </p>
          )}
          {notice && (
            <p role="status" className="text-sm text-red-700">
              {notice}{' '}
              {notice.includes('orden de trabajo') && (
                <Link to="/sales/register" className="underline">
                  Ir a Nueva Venta
                </Link>
              )}
            </p>
          )}

          <BarcodeScanListener
            enabled={!blocked && !submitting}
            onScan={handleScan}
            placeholder="Escanear barcode / QR / SKU…"
          />

          <label className="block text-sm text-gray-600">
            Buscar producto por nombre
            <input
              className={`${FLAT_INPUT} mt-1 w-full`}
              value={productQuery}
              onChange={(event) => setProductQuery(event.target.value)}
              placeholder="Nombre o SKU"
              disabled={blocked || submitting}
            />
          </label>
          {productResults.length > 0 && (
            <ul className="rounded-md border border-gray-200">
              {productResults.map((product) => (
                <li key={product.productId}>
                  <button
                    type="button"
                    className="flex w-full items-center justify-between px-3 py-2 text-left text-sm hover:bg-gray-50"
                    onClick={() => applyProduct(product)}
                  >
                    <span>{product.productName}</span>
                    <span>{formatCurrency(product.productPrice)}</span>
                  </button>
                </li>
              ))}
            </ul>
          )}

          {lines.length === 0 ? (
            <p className="py-8 text-center text-sm text-gray-500">
              Escanea un producto para empezar la venta.
            </p>
          ) : (
            <ul className="divide-y divide-gray-100 rounded-md border border-gray-200">
              {lines.map((line) => (
                <li key={line.productId} className="flex items-center gap-3 px-3 py-2">
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-gray-900">{line.name}</p>
                    <p className="text-xs text-gray-500">
                      {formatCurrency(line.unitPrice)}
                      {lineStockShortfall(line) ? ' · stock insuficiente' : ''}
                    </p>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      aria-label={`Disminuir ${line.name}`}
                      className="rounded border border-gray-200 px-2 py-1"
                      onClick={() =>
                        setLines((current) =>
                          setLineQuantity(current, line.productId, line.quantity - 1),
                        )
                      }
                    >
                      <FaMinus />
                    </button>
                    <span aria-label={`Cantidad de ${line.name}`}>{line.quantity}</span>
                    <button
                      type="button"
                      aria-label={`Aumentar ${line.name}`}
                      className="rounded border border-gray-200 px-2 py-1"
                      onClick={() =>
                        setLines((current) =>
                          setLineQuantity(current, line.productId, line.quantity + 1),
                        )
                      }
                    >
                      <FaPlus />
                    </button>
                  </div>
                  <span className="w-24 text-right text-sm font-semibold">
                    {formatCurrency(line.unitPrice * line.quantity)}
                  </span>
                </li>
              ))}
            </ul>
          )}
          <button
            type="button"
            className="text-sm text-gray-600 underline disabled:opacity-40"
            disabled={history.length === 0 || submitting}
            onClick={() => {
              const next = undoLastScan(lines, history)
              setLines(next.lines)
              setHistory(next.history)
            }}
          >
            <FaUndo className="mr-1 inline" /> Deshacer último escaneo
          </button>
        </section>

        <aside className="space-y-4 rounded-md border border-gray-200 p-4" aria-label="Cobro">
          <div>
            <p className="text-xs uppercase tracking-wide text-gray-500">Cliente</p>
            <p className="text-base font-semibold text-gray-900">{customerName}</p>
            {selectedCustomer ? (
              <button
                type="button"
                className="mt-1 text-sm text-primary underline"
                onClick={() => setSelectedCustomer(null)}
              >
                Usar consumidor final
              </button>
            ) : (
              <label className="mt-2 block text-sm text-gray-600">
                Identificar cliente
                <input
                  className={`${FLAT_INPUT} mt-1 w-full`}
                  value={customerQuery}
                  onChange={(event) => setCustomerQuery(event.target.value)}
                  placeholder="Nombre o RUT"
                  disabled={blocked || submitting}
                />
              </label>
            )}
            {customerResults.length > 0 && !selectedCustomer && (
              <ul className="mt-2 rounded-md border border-gray-200">
                {customerResults.map((customer) => (
                  <li key={customer.customerId}>
                    <button
                      type="button"
                      className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50"
                      onClick={() => {
                        setSelectedCustomer(customer)
                        setCustomerQuery('')
                        setCustomerResults([])
                      }}
                    >
                      {customer.label}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div>
            <p className="mb-2 text-xs uppercase tracking-wide text-gray-500">Medio de pago</p>
            <div className="grid grid-cols-2 gap-2">
              {QUICK_SALE_PAYMENT_METHODS.map((method) => (
                <button
                  key={method.id}
                  type="button"
                  aria-pressed={paymentMethod === method.id}
                  className={`rounded-md border px-2 py-2 text-sm ${
                    paymentMethod === method.id
                      ? 'border-primary bg-primary text-white'
                      : 'border-gray-200 text-gray-800'
                  }`}
                  onClick={() => setPaymentMethod(method.id)}
                  disabled={blocked || submitting}
                >
                  {method.label}
                </button>
              ))}
            </div>
          </div>

          {paymentMethod === CASH_PAYMENT_METHOD && (
            <div>
              <label className="block text-sm text-gray-600" htmlFor="quick-sale-cash">
                Monto recibido
              </label>
              <input
                id="quick-sale-cash"
                className={`${FLAT_INPUT} mt-1 w-full`}
                inputMode="numeric"
                aria-label="Monto recibido"
                value={cashTendered}
                onChange={(event) => setCashTendered(event.target.value.replace(/[^\d]/g, ''))}
                disabled={blocked || submitting}
              />
              <p className="mt-1 text-sm text-gray-800">
                {tendered != null && tendered < total
                  ? `Falta ${formatCurrency(total - tendered)}`
                  : `Vuelto ${formatCurrency(changeDue)}`}
              </p>
            </div>
          )}

          {stockProblem && (
            <p className="text-sm text-red-700">Hay productos sin stock suficiente.</p>
          )}

          <div className="flex items-end justify-between">
            <span className="text-sm text-gray-500">Total</span>
            <span className="text-2xl font-semibold text-gray-900">{formatCurrency(total)}</span>
          </div>
          <button
            type="button"
            className={PRIMARY_BTN_BLOCK}
            disabled={!readyToCharge}
            onClick={() => void handleCharge()}
          >
            {submitting ? 'Cobrando…' : `Cobrar ${formatCurrency(total)}`}
          </button>
          <Link to="/sales/register" className="block text-center text-sm text-gray-500 underline">
            Venta completa
          </Link>
        </aside>
      </div>
    </ExpensePageLayout>
  )
}
