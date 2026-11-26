import { isAxiosError } from 'axios'
import { useId, useRef, useState, type FormEvent } from 'react'
import { createDailySales } from '../../api/dailySales.js'
import { useToast } from '../../context/ToastContext.jsx'
import { getTodayBusinessDate } from '../../utils/businessTime.js'
import { formatClosureDate } from '../../utils/dailySalesUi.js'
import { PRIMARY_BTN } from '../../utils/expenseUiPatterns.js'

type ClosureStatus = {
  error?: string | null
  fechaPendiente?: string | null
  fechasPendientes?: string[]
}

export function pendingClosureDays(status?: ClosureStatus | null): string[] {
  const days = status?.fechasPendientes
  if (Array.isArray(days) && days.length > 0) return [...days].sort()
  return status?.error === 'BLOQUEO_CIERRE_PENDIENTE' && status.fechaPendiente
    ? [status.fechaPendiente]
    : []
}

type SavedClosure = {
  dailySalesId: string
  dailySalesDay: string
  dailySalesCountedCash: number | null
}

type Props = {
  day: string
  timeZone: string
  onCancel: () => void
  onSaved: (closure: SavedClosure | null) => void | Promise<void>
}

export default function DailyClosureForm({ day, timeZone, onCancel, onSaved }: Props) {
  const toast = useToast()
  const titleId = useId()
  const errorId = useId()
  const savingRef = useRef(false)
  const [countedCash, setCountedCash] = useState('')
  const [withoutCashCount, setWithoutCashCount] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const canSkipCount = day < getTodayBusinessDate(timeZone)

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (savingRef.current) return

    const skipCount = canSkipCount && withoutCashCount
    const amount = Number(countedCash)
    if (!skipCount && (!/^\d+$/.test(countedCash.trim()) || amount > 2_147_483_647)) {
      setError('Ingresa el efectivo contado en pesos enteros. Si la caja estaba vacía, ingresa 0.')
      return
    }

    savingRef.current = true
    setSaving(true)
    setError('')
    let closure: SavedClosure | null
    try {
      const { data } = await createDailySales(
        skipCount
          ? { dailySalesDay: day, withoutCashCount: true }
          : { dailySalesDay: day, countedCash: amount },
      )
      closure = data
      toast.success(
        'Cierre realizado',
        skipCount
          ? 'El cierre quedó registrado sin arqueo.'
          : 'El cierre y el efectivo contado quedaron registrados.',
      )
    } catch (failure) {
      const data = isAxiosError<{ code?: string; type?: string; message?: string }>(failure)
        ? failure.response?.data
        : undefined
      if ((data?.code ?? data?.type) !== 'DUPLICATE_DATE') {
        setError(data?.message ?? 'No se pudo guardar el cierre. Intenta nuevamente.')
        setSaving(false)
        savingRef.current = false
        return
      }
      closure = null
      toast.info('Cierre existente', 'Ya existe un cierre registrado para esa fecha.')
    }

    try {
      await onSaved(closure)
    } finally {
      savingRef.current = false
      setSaving(false)
    }
  }

  return (
    <form
      aria-labelledby={titleId}
      onSubmit={save}
      className="rounded-xl border border-gray-200 bg-white p-4 space-y-3"
      noValidate
    >
      <h3 id={titleId} className="text-sm font-semibold text-gray-900">
        Arqueo de {formatClosureDate(day)}
      </h3>
      <p className="text-sm text-gray-600">
        Ingresa el efectivo contado en el cajón al cierre de ese día.
      </p>
      <label className="block text-sm text-gray-700">
        Efectivo contado
        <input
          type="number"
          min="0"
          step="1"
          inputMode="numeric"
          value={countedCash}
          onChange={(event) => {
            setCountedCash(event.target.value)
            setError('')
          }}
          disabled={saving || withoutCashCount}
          required={!withoutCashCount}
          aria-describedby={error ? errorId : undefined}
          className="block mt-1 w-full sm:w-56 h-10 px-3 border border-gray-200 rounded-lg disabled:bg-gray-100"
        />
      </label>
      {canSkipCount && (
        <label className="flex items-center gap-2 text-sm text-gray-700">
          <input
            type="checkbox"
            checked={withoutCashCount}
            disabled={saving}
            onChange={(event) => {
              setWithoutCashCount(event.target.checked)
              setError('')
            }}
          />
          Cerrar sin arqueo
          <span className="text-gray-500">si el efectivo de ese día no se puede comprobar</span>
        </label>
      )}
      {error && (
        <p id={errorId} role="alert" className="text-sm text-red-700">
          {error}
        </p>
      )}
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={onCancel}
          disabled={saving}
          className="px-4 py-2 text-sm border border-gray-200 rounded-lg"
        >
          Cancelar
        </button>
        <button type="submit" disabled={saving} className={PRIMARY_BTN}>
          {saving ? 'Guardando…' : 'Guardar cierre'}
        </button>
      </div>
    </form>
  )
}
