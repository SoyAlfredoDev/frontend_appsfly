import { useEffect, useRef, useState, type FormEvent } from 'react'
import { isAxiosError } from 'axios'
import { Link } from 'react-router-dom'
import api from '../../api/axios.js'
import { PRIMARY_BTN } from '../../utils/expenseUiPatterns.js'

export type RutCustomer = {
  customerId: string
  customerFirstName: string
  customerLastName: string | null
}

type Props = {
  onNew: (rut: string, documentType: 'rut' | 'other') => void
  onSelect?: (customer: RutCustomer) => void
  actionLabel?: string
  initialMatch?: { rut: string; customers: RutCustomer[] } | null
}

export default function CustomerRutLookup({
  onNew,
  onSelect,
  actionLabel = 'Agregar a la venta',
  initialMatch,
}: Props) {
  const [rut, setRut] = useState(initialMatch?.rut ?? '')
  const [customers, setCustomers] = useState<RutCustomer[]>(initialMatch?.customers ?? [])
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const pending = useRef<AbortController | null>(null)

  useEffect(() => () => pending.current?.abort(), [])

  async function search(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (pending.current || !rut.trim()) return
    const controller = new AbortController()
    pending.current = controller
    setBusy(true)
    setError('')
    setCustomers([])
    try {
      const { data } = await api.post<{ rut: string; customers: RutCustomer[] }>(
        '/customers/rut-lookup',
        { rut },
        { signal: controller.signal },
      )
      if (controller.signal.aborted) return
      if (data.customers.length) setCustomers(data.customers)
      else onNew(data.rut, 'rut')
    } catch (error) {
      if (controller.signal.aborted) return
      const invalid = isAxiosError(error) && error.response?.data?.code === 'INVALID_CUSTOMER_RUT'
      setError(
        invalid
          ? 'Revisa el RUT y su dígito verificador.'
          : 'No se pudo consultar el RUT. Intenta nuevamente.',
      )
    } finally {
      if (pending.current === controller) pending.current = null
      if (!controller.signal.aborted) setBusy(false)
    }
  }

  return (
    <form onSubmit={search} className="p-6 space-y-4 max-h-[65vh] overflow-y-auto">
      <label className="block text-sm font-medium text-slate-800">
        RUT del cliente
        <input
          className="mt-1 block w-full rounded-md border border-slate-300 p-3"
          value={rut}
          onChange={(event) => {
            setRut(event.target.value)
            setCustomers([])
            setError('')
          }}
          maxLength={32}
          autoComplete="off"
          placeholder="12.345.678-5"
          disabled={busy}
        />
      </label>
      {error && (
        <p role="alert" className="text-sm text-red-700">
          {error}
        </p>
      )}
      {customers.length > 0 && (
        <div className="space-y-3 rounded-lg border border-amber-200 bg-amber-50 p-3">
          <p role="status" className="font-medium text-slate-900">
            {customers.length === 1
              ? 'Este cliente ya está registrado'
              : 'Hay varias fichas con este RUT. Revisa el nombre antes de elegir.'}
          </p>
          {customers.map((customer) => (
            <div
              className="flex flex-wrap items-center justify-between gap-2"
              key={customer.customerId}
            >
              <span>
                {customer.customerFirstName} {customer.customerLastName}
              </span>
              {onSelect ? (
                <button className={PRIMARY_BTN} type="button" onClick={() => onSelect(customer)}>
                  {actionLabel}
                </button>
              ) : (
                <Link
                  className={PRIMARY_BTN}
                  to={`/customers/${encodeURIComponent(customer.customerId)}`}
                >
                  Abrir ficha
                </Link>
              )}
            </div>
          ))}
        </div>
      )}
      <div className="flex flex-wrap items-center gap-3">
        <button className={PRIMARY_BTN} type="submit" disabled={busy || !rut.trim()}>
          {busy ? 'Buscando…' : 'Buscar RUT'}
        </button>
        {!customers.length && (
          <button
            type="button"
            disabled={busy || Boolean(rut.trim())}
            onClick={() => onNew('', 'other')}
            className="text-sm text-slate-600 underline disabled:opacity-50"
          >
            Sin RUT o con otro documento
          </button>
        )}
      </div>
    </form>
  )
}
