import { useEffect, useState } from 'react'
import { Link, type To } from 'react-router-dom'
import { FaCheck } from 'react-icons/fa'
import { getPlansRequest } from '../../api/plans.js'
import {
  formatPlanClp,
  publicPlanTotal,
  resolvePublicPlans,
  RENEWAL_CONDITIONS,
  TAX_REQUIREMENTS,
  TRIAL_CONDITIONS,
  type PublicPlan,
} from '../../config/publicPlans'

type Props = { registerTo?: To; heading?: string; subtitle?: string }
type LoadState =
  | { status: 'loading' }
  | { status: 'error'; message: string }
  | { status: 'ready'; plans: PublicPlan[] }

export default function PlansHome({
  registerTo = '/register',
  heading = 'Empieza gratis. Elige tu plan después.',
  subtitle = 'Dos meses con las funciones de Pro para conocer AppsFly. Luego elige el plan que necesita tu negocio.',
}: Props) {
  const [state, setState] = useState<LoadState>({ status: 'loading' })
  const [attempt, setAttempt] = useState(0)
  useEffect(() => {
    let cancelled = false
    getPlansRequest()
      .then((response) => {
        const plans = resolvePublicPlans(response.data)
        if (!cancelled) setState({ status: 'ready', plans })
      })
      .catch(() => {
        if (!cancelled)
          setState({
            status: 'error',
            message: 'No pudimos confirmar la disponibilidad de los planes. Vuelve a intentarlo.',
          })
      })
    return () => {
      cancelled = true
    }
  }, [attempt])
  const retry = () => {
    setState({ status: 'loading' })
    setAttempt((value) => value + 1)
  }

  return (
    <section
      aria-label="Planes de AppsFly"
      className="bg-white py-16 font-inter text-[#021f41] md:py-24"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="mx-auto mb-10 max-w-2xl text-center">
          <p className="mb-3 text-xs font-bold uppercase tracking-widest text-[#094fd1]">
            Planes para tu negocio
          </p>
          <h2 className="mb-4 font-display text-3xl font-bold md:text-4xl">{heading}</h2>
          <p className="leading-relaxed text-slate-600">{subtitle}</p>
        </div>
        {state.status === 'loading' && (
          <div role="status" className="rounded-2xl bg-slate-50 p-10 text-center text-slate-600">
            Consultando planes disponibles…
          </div>
        )}
        {state.status === 'error' && (
          <div
            role="alert"
            className="rounded-2xl border border-amber-200 bg-amber-50 p-8 text-center"
          >
            <p>{state.message}</p>
            <button
              type="button"
              onClick={retry}
              className="mt-4 rounded-xl bg-[#021f41] px-6 py-3 font-semibold text-white"
            >
              Volver a consultar
            </button>
          </div>
        )}
        {state.status === 'ready' && state.plans.length === 0 && (
          <p role="status" className="rounded-2xl bg-slate-50 p-10 text-center">
            No hay planes disponibles para nuevas activaciones en este momento.
          </p>
        )}
        {state.status === 'ready' && state.plans.length > 0 && (
          <>
            <div className="grid gap-6 md:grid-cols-3">
              {state.plans.map((plan) => {
                const trial = plan.id === 'P001'
                return (
                  <article
                    key={plan.id}
                    aria-labelledby={`public-plan-${plan.id}`}
                    className={`flex flex-col rounded-3xl border p-6 sm:p-8 ${trial ? 'border-[#01c676] bg-[#f0fcf6] shadow-lg shadow-emerald-100/40' : 'border-slate-200 bg-white'}`}
                  >
                    <p
                      className={`mb-4 text-xs font-bold uppercase tracking-wide ${trial ? 'text-[#021f41]' : 'text-slate-500'}`}
                    >
                      {trial ? 'Tu primer paso · 2 meses gratis' : 'Después de la prueba'}
                    </p>
                    <h3 id={`public-plan-${plan.id}`} className="font-display text-2xl font-bold">
                      {plan.name}
                    </h3>
                    <p className="mt-2 min-h-10 text-sm text-slate-600">{plan.subtitle}</p>
                    <div className="my-6 border-b border-slate-200 pb-6">
                      <p>
                        <span className="font-display text-4xl font-bold">
                          {formatPlanClp(plan.net)}
                        </span>
                        <span className="ml-2 text-sm text-slate-600">
                          {trial ? 'por 2 meses' : 'netos / mes'}
                        </span>
                      </p>
                      <p className="mt-3 text-sm font-semibold">
                        {trial
                          ? 'Sin tarjeta ni cobro al activar'
                          : `${formatPlanClp(publicPlanTotal(plan.net))} al mes con IVA incluido`}
                      </p>
                    </div>
                    <ul className="mb-8 flex-1 space-y-3 text-sm">
                      {plan.features.map((feature) => (
                        <li key={feature} className="flex items-start gap-3">
                          <FaCheck aria-hidden="true" className="mt-1 shrink-0 text-[#094fd1]" />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                    <Link
                      to={registerTo}
                      className={`rounded-xl px-4 py-3 text-center font-semibold ${trial ? 'bg-[#01c676] text-[#021f41] hover:bg-[#00b86d]' : 'bg-[#021f41] text-white hover:bg-[#094fd1]'}`}
                    >
                      {trial
                        ? 'Probar 2 meses gratis'
                        : `Empezar gratis y luego elegir ${plan.name}`}
                    </Link>
                  </article>
                )
              })}
            </div>
            <div className="mt-8 grid gap-6 rounded-2xl bg-slate-50 p-6 md:grid-cols-2">
              <div>
                <h3 className="mb-2 font-semibold">El mismo plan, adaptado a tu rubro</h3>
                <p className="text-sm leading-relaxed text-slate-600">
                  Negocio general: ventas, clientes, abonos e inventario. Tienda de ropa: tallas,
                  colores, SKU y stock por variante. Óptica: recetas OD/OI, órdenes de trabajo,
                  laboratorios y certificados de compra.
                </p>
              </div>
              <div>
                <h3 className="mb-2 font-semibold">Qué necesitas para empezar</h3>
                <p className="text-sm leading-relaxed text-slate-600">{TRIAL_CONDITIONS}</p>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">{RENEWAL_CONDITIONS}</p>
              </div>
            </div>
            <p className="mx-auto mt-5 max-w-4xl text-center text-sm leading-relaxed text-slate-600">
              {TAX_REQUIREMENTS} El asistente permite consultar datos del negocio; no registra
              clientes ni envía mensajes. Las notificaciones automáticas de WhatsApp y la gestión de
              sucursales no están incluidas como funciones disponibles.
            </p>
          </>
        )}
      </div>
    </section>
  )
}
