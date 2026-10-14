import { useState } from 'react'
import { cancelBusinessSubscriptionRequest } from '../../api/subscriptionBilling.js'
import { SUBSCRIPTION_CANCEL_CONFIRMATION_PHRASE } from '../../constants/subscriptionCancel.js'

export type PendingCheckout = {
  planName: string
  firstChargeAt: string | null
  authorized: boolean
  checkoutUrl: string | null
  amount: number
  currency: string
  canCancel: boolean
}

export default function ScheduledSubscriptionCard({
  pending,
  businessId,
  onChange,
}: {
  pending: PendingCheckout
  businessId: string
  onChange: () => Promise<void>
}) {
  const [confirm, setConfirm] = useState(false)
  const [phrase, setPhrase] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const date = pending.firstChargeAt
    ? new Date(pending.firstChargeAt).toLocaleDateString('es-CL', {
        dateStyle: 'long',
        timeZone: 'America/Santiago',
      })
    : null
  async function cancel() {
    setBusy(true)
    setError('')
    try {
      await cancelBusinessSubscriptionRequest(businessId, {
        confirmationPhrase: phrase,
        cancelReason: 'Cancelación de contratación pendiente',
      })
      await onChange()
    } catch {
      setError(
        'No se pudo confirmar la cancelación. Actualiza el estado antes de volver a intentarlo.',
      )
    } finally {
      setBusy(false)
    }
  }
  return (
    <section
      className="m-6 rounded-xl border border-blue-200 bg-blue-50 p-4"
      aria-label="Próxima suscripción"
    >
      <h3 className="font-semibold">
        {pending.authorized ? 'Medio de pago autorizado' : 'Autorización pendiente'} ·{' '}
        {pending.planName}
      </h3>
      <p className="mt-2 text-sm">
        {new Intl.NumberFormat('es-CL', { style: 'currency', currency: pending.currency }).format(
          pending.amount,
        )}{' '}
        al mes, IVA incluido.
      </p>
      <p className="mt-2 text-sm">
        {date
          ? `Primer cobro a partir del ${date}. Tu período vigente se conserva completo.`
          : 'Sin un período vigente, el primer cobro puede realizarse al autorizar la suscripción.'}
      </p>
      <p className="mt-2 text-sm">
        Autorizar la tarjeta no confirma el pago de una mensualidad. Mercado Pago puede realizar una
        validación temporal del medio de pago.
      </p>
      {!pending.authorized && pending.checkoutUrl && (
        <a className="mt-3 inline-block underline" href={pending.checkoutUrl}>
          Continuar en Mercado Pago
        </a>
      )}
      {pending.canCancel && !confirm && (
        <button type="button" className="mt-3 block underline" onClick={() => setConfirm(true)}>
          Cancelar contratación pendiente
        </button>
      )}
      {confirm && (
        <div className="mt-3">
          <label htmlFor="cancel-pending-subscription">
            Escribe {SUBSCRIPTION_CANCEL_CONFIRMATION_PHRASE} para cancelar los cobros futuros.
          </label>
          <input
            id="cancel-pending-subscription"
            value={phrase}
            onChange={(event) => setPhrase(event.target.value)}
            className="mt-2 block rounded border p-2"
          />
          <button
            type="button"
            disabled={busy || phrase.trim() !== SUBSCRIPTION_CANCEL_CONFIRMATION_PHRASE}
            onClick={cancel}
            className="mt-2 rounded bg-red-700 px-3 py-2 text-white disabled:opacity-50"
          >
            {busy ? 'Cancelando…' : 'Confirmar cancelación'}
          </button>
        </div>
      )}
      {error && (
        <p role="alert" className="mt-2 text-red-700">
          {error}
        </p>
      )}
    </section>
  )
}
