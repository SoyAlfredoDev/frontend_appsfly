import { useEffect, useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { getGeneralReceivables, type Receivables } from '../../api/generalSales'
import DataErrorPanel from '../../components/ui/DataErrorPanel'
import { PageDataSkeleton } from '../../components/ui/DataSkeleton'
import { useAuth } from '../../context/authContext.jsx'
import formatCurrency from '../../utils/formatCurrency.js'
import formatDate from '../../utils/formatDate.js'

type LoadState = { status: 'loading' | 'error' } | { status: 'ready'; data: Receivables }

function ReceivablesContent({ timeZone }: { timeZone: string | undefined }) {
  const [state, setState] = useState<LoadState>({ status: 'loading' })
  const [filter, setFilter] = useState('')
  const [query, setQuery] = useState('')
  const [page, setPage] = useState(1)
  const [requestNumber, setRequestNumber] = useState(0)

  useEffect(() => {
    const abort = new AbortController()
    getGeneralReceivables(page, query, abort.signal)
      .then(({ data }) => {
        if (!abort.signal.aborted) setState({ status: 'ready', data })
      })
      .catch(() => {
        if (!abort.signal.aborted) setState({ status: 'error' })
      })
    return () => abort.abort()
  }, [page, query, requestNumber])

  function search(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const nextQuery = filter.trim()
    if (page === 1 && nextQuery === query) return
    setState({ status: 'loading' })
    setPage(1)
    setQuery(nextQuery)
  }

  function changePage(next: number) {
    setState({ status: 'loading' })
    setPage(next)
  }

  return (
    <section className="mx-auto max-w-7xl space-y-5 px-4 py-6 sm:px-6">
      <h1 className="text-2xl font-bold text-dark">Cuentas por cobrar</h1>
      <form className="flex flex-wrap items-end gap-3" onSubmit={search}>
        <label className="flex w-full max-w-sm flex-col gap-1 text-sm font-medium">
          Cliente, RUT o número de venta
          <input
            type="search"
            value={filter}
            maxLength={120}
            onChange={(event) => setFilter(event.target.value)}
            className="rounded-lg border border-slate-300 bg-white px-3 py-2"
          />
        </label>
        <button className="rounded-lg bg-primary px-4 py-2 font-semibold text-white" type="submit">
          Buscar
        </button>
      </form>

      {state.status === 'loading' && <PageDataSkeleton label="Cargando cuentas por cobrar" />}
      {state.status === 'error' && (
        <DataErrorPanel
          message="No se pudieron cargar las cuentas por cobrar."
          onRetry={() => {
            setState({ status: 'loading' })
            setRequestNumber((value) => value + 1)
          }}
        />
      )}
      {state.status === 'ready' && (
        <>
          <div className="rounded-xl border border-slate-200 bg-white p-4">
            <p className="text-sm text-slate-600">
              {query ? 'Total pendiente de la búsqueda' : 'Total pendiente'}
            </p>
            <p className="text-2xl font-semibold text-dark">
              {formatCurrency(state.data.totalPending)}
            </p>
          </div>
          {state.data.rows.length > 0 ? (
            <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
              <table className="w-full whitespace-nowrap text-left text-sm">
                <caption className="sr-only">Ventas con saldo pendiente</caption>
                <thead className="bg-slate-50 text-slate-700">
                  <tr>
                    {[
                      'Cliente',
                      'Venta',
                      'Fecha',
                      'Total',
                      'Abonado',
                      'Saldo de la venta',
                      'Saldo del cliente',
                      'Acción',
                    ].map((label) => (
                      <th scope="col" className="px-4 py-3" key={label}>
                        {label}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {state.data.rows.map((row) => (
                    <tr key={row.saleId} className="border-t border-slate-100">
                      <td className="px-4 py-3">
                        {[row.customer.customerFirstName, row.customer.customerLastName]
                          .filter(Boolean)
                          .join(' ')}
                      </td>
                      <td className="px-4 py-3">{row.saleNumber ?? '—'}</td>
                      <td className="px-4 py-3">{formatDate(row.createdAt, timeZone)}</td>
                      <td className="px-4 py-3">{formatCurrency(row.saleTotal)}</td>
                      <td className="px-4 py-3">{formatCurrency(row.saleTotalPayments)}</td>
                      <td className="px-4 py-3 font-semibold">
                        {formatCurrency(row.salePendingAmount)}
                      </td>
                      <td className="px-4 py-3">{formatCurrency(row.customerPendingAmount)}</td>
                      <td className="px-4 py-3">
                        <Link
                          to={`/sales/view/${row.saleId}`}
                          className="font-semibold text-primary underline"
                          aria-label={`Ver y abonar venta ${row.saleNumber ?? row.saleId}`}
                        >
                          Ver y abonar
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="rounded-xl border border-slate-200 bg-white p-5 text-slate-600">
              {query
                ? 'No hay ventas pendientes para esta búsqueda.'
                : 'No hay ventas con saldo pendiente.'}
            </p>
          )}
          {(page > 1 || state.data.pagination.pages > 1) && (
            <nav aria-label="Páginas de cuentas por cobrar" className="flex items-center gap-4">
              <button
                type="button"
                className="rounded-lg border px-3 py-2 disabled:opacity-50"
                disabled={page <= 1}
                onClick={() => changePage(page - 1)}
              >
                Anterior
              </button>
              <span>Página {page}</span>
              <button
                type="button"
                className="rounded-lg border px-3 py-2 disabled:opacity-50"
                disabled={page >= state.data.pagination.pages}
                onClick={() => changePage(page + 1)}
              >
                Siguiente
              </button>
            </nav>
          )}
        </>
      )}
    </section>
  )
}

export default function ReceivablesPage() {
  const { activeBusinessId, business } = useAuth()
  return <ReceivablesContent key={activeBusinessId} timeZone={business?.businessTimezone} />
}
