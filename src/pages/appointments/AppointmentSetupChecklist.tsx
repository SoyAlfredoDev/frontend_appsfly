import { FaCheck, FaRegCircle } from 'react-icons/fa'

type AppointmentSetupChecklistProps = {
  savedAvailability: boolean
  savedEnabled: boolean
  publicLink: string
  onConfigure?: () => void
}

export default function AppointmentSetupChecklist({
  savedAvailability,
  savedEnabled,
  publicLink,
  onConfigure,
}: AppointmentSetupChecklistProps) {
  const shareReady = savedAvailability && savedEnabled && Boolean(publicLink)
  const items = [
    { label: 'Define y guarda tus franjas de atención', complete: savedAvailability },
    { label: 'Guarda la agenda como activa', complete: savedEnabled },
    { label: 'Abre la vista previa y comparte el enlace', complete: false },
  ]

  return (
    <section className="space-y-3 rounded-xl border border-slate-200 bg-white p-5">
      <h2 className="text-base font-semibold text-slate-900">
        {shareReady ? 'Tu agenda está habilitada' : 'Prepara tu agenda para recibir citas'}
      </h2>
      <ol className="space-y-2">
        {items.map(({ label, complete }, index) => {
          const state =
            index === 2
              ? shareReady
                ? 'Disponible'
                : 'Tras activar la agenda'
              : complete
                ? 'Listo'
                : 'Pendiente'
          return (
            <li key={label} className="flex items-center gap-2 text-sm text-slate-700">
              {complete ? (
                <FaCheck className="shrink-0 text-emerald-700" aria-hidden="true" />
              ) : (
                <FaRegCircle
                  className={`shrink-0 ${shareReady ? 'text-emerald-700' : 'text-slate-400'}`}
                  aria-hidden="true"
                />
              )}
              <span className="sr-only">{state}. </span>
              {label}
            </li>
          )
        })}
      </ol>
      {!shareReady && onConfigure && (
        <button
          type="button"
          className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-800 hover:bg-slate-50"
          onClick={onConfigure}
        >
          Configurar agenda
        </button>
      )}
    </section>
  )
}
