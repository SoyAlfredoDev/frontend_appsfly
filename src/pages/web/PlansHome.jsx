import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { FaCheckCircle } from 'react-icons/fa'
import { getPlansRequest } from '../../api/plans.js'
import { parsePlanFeatures } from '../../utils/planUtils.js'
import { displayedUfPrice } from '../../utils/planCatalog.js'
import GradientText from '../../components/web/GradientText.jsx'

const DISPLAY_IDS = ['OPT-START', 'OPT-STANDARD']
const PRO_PREVIEW = [
  'Hasta 10 usuarios',
  '2 sucursales incluidas',
  'Control e inventario por sucursal',
  'Reportes por vendedor',
  'Soporte prioritario',
]

function PlanCard({
  name,
  features,
  price,
  listPrice,
  featured = false,
  pending = false,
  registerTo,
}) {
  return (
    <article
      className={`flex w-full max-w-[350px] flex-col rounded-3xl border p-7 ${featured ? 'border-primary shadow-xl shadow-primary/10' : 'border-slate-200 bg-white'}`}
    >
      <div className="mb-5">
        <h3 className="text-2xl font-bold text-[#021f41]">{name}</h3>
        {pending && (
          <p className="mt-2 text-sm font-semibold text-slate-500">Contratación en preparación</p>
        )}
        {price && (
          <>
            <p className="mt-2 text-3xl font-extrabold text-primary">
              {price} UF <span className="text-sm font-medium text-slate-500">neto / mes</span>
            </p>
            {listPrice && <p className="text-sm text-slate-500">Precio normal: {listPrice} UF</p>}
            <p className="mt-2 text-xs text-slate-500">
              El total en pesos e IVA se confirmará antes de contratar.
            </p>
          </>
        )}
      </div>
      <ul className="mb-7 flex-grow space-y-2.5">
        {features.map((feature) => (
          <li key={feature} className="flex items-start gap-2.5 text-sm text-slate-700">
            <FaCheckCircle className="mt-0.5 shrink-0 text-primary" />
            <span>{feature}</span>
          </li>
        ))}
      </ul>
      {pending ? (
        <span className="rounded-xl border border-slate-200 px-4 py-3 text-center text-sm font-semibold text-slate-500">
          Disponible próximamente
        </span>
      ) : (
        <Link
          to={registerTo}
          className="rounded-xl bg-[#021f41] px-4 py-3 text-center text-sm font-bold text-white no-underline hover:bg-[#032d5e]"
        >
          Comenzar
        </Link>
      )}
    </article>
  )
}

/** @param {{ registerTo?: string, heading?: import('react').ReactNode, subtitle?: import('react').ReactNode }} props */
export default function PlansHome({ registerTo = '/register', heading = null, subtitle = null }) {
  const [plans, setPlans] = useState([])
  const [state, setState] = useState('loading')

  useEffect(() => {
    let cancelled = false
    getPlansRequest()
      .then((response) => {
        if (cancelled) return
        const list = Array.isArray(response.data) ? response.data : []
        setPlans(list.filter((plan) => DISPLAY_IDS.includes(plan.planId)))
        setState('ready')
      })
      .catch(() => {
        if (!cancelled) setState('error')
      })
    return () => {
      cancelled = true
    }
  }, [])

  const displayPlans = [...plans].sort(
    (a, b) => DISPLAY_IDS.indexOf(a.planId) - DISPLAY_IDS.indexOf(b.planId),
  )

  return (
    <section className="bg-white py-16 md:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="mb-12 text-center">
          <h2 className="mb-3 text-3xl font-bold text-[#021f41] md:text-4xl">
            {heading ?? (
              <>
                Planes <GradientText>para tu óptica</GradientText>
              </>
            )}
          </h2>
          <p className="mx-auto max-w-2xl text-slate-600">
            {subtitle ??
              'Elige Start o Estándar. Los negocios nuevos pueden activar una prueba gratuita de Estándar durante 2 meses, una vez por negocio.'}
          </p>
        </div>
        {state === 'error' && (
          <p role="alert" className="text-center text-sm text-red-700">
            No se pudieron cargar los planes. Intenta nuevamente más tarde.
          </p>
        )}
        {state === 'loading' && (
          <p className="text-center text-sm text-slate-500">Cargando planes…</p>
        )}
        {state === 'ready' && displayPlans.length === 0 && (
          <p className="text-center text-sm text-slate-500">
            Los planes estarán disponibles próximamente.
          </p>
        )}
        {state === 'ready' && displayPlans.length > 0 && (
          <div className="flex flex-wrap justify-center gap-6">
            {displayPlans.map((plan) => {
              const price = displayedUfPrice(plan)
              return (
                <PlanCard
                  key={plan.planId}
                  name={plan.planName}
                  features={parsePlanFeatures(plan.planFeatures)}
                  price={price?.current.toLocaleString('es-CL', { maximumFractionDigits: 3 })}
                  listPrice={
                    price?.promotional
                      ? price.list.toLocaleString('es-CL', { maximumFractionDigits: 3 })
                      : null
                  }
                  featured={plan.planId === 'OPT-STANDARD'}
                  pending={plan.planActive === false}
                  registerTo={registerTo}
                />
              )
            })}
            <PlanCard name="Óptica Pro" features={PRO_PREVIEW} pending registerTo={registerTo} />
          </div>
        )}
      </div>
    </section>
  )
}
