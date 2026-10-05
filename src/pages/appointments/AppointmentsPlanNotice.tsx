import { Link } from 'react-router-dom'
import ExpensePageLayout from '../../components/ui/ExpensePageLayout.jsx'

export default function AppointmentsPlanNotice() {
  return (
    <ExpensePageLayout
      title="Citas"
      subtitle="Un link para que tus clientes reserven una hora sin llamar."
    >
      <section className="max-w-2xl rounded-xl border border-slate-200 bg-white p-6 space-y-4">
        <h2 className="text-base font-semibold text-slate-900">Qué puedes hacer con Citas</h2>
        <p className="text-sm text-slate-600 leading-relaxed">
          Compartes un link público. Tu cliente elige el día y la hora, deja su nombre y su celular,
          y la solicitud aparece en este panel. Tú defines los días disponibles, la duración de cada
          cita, si varias personas pueden reservar la misma hora y si quieres avisarles por correo
          cuando pidan, confirmen, muevan o cancelen la hora.
        </p>
        <p className="text-sm text-slate-800 leading-relaxed">
          Citas está incluido en la prueba y en Pro. En Start esta pantalla explica el módulo. El
          link público y el panel se activan al mejorar el plan.
        </p>
        <Link
          to="/configuration/subscription"
          className="inline-flex items-center rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white no-underline hover:bg-emerald-700"
        >
          Mejorar plan
        </Link>
      </section>
    </ExpensePageLayout>
  )
}
