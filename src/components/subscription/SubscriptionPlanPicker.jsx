import { useCallback, useEffect, useMemo, useState } from 'react'
import { FaCheck, FaCreditCard, FaStar } from 'react-icons/fa'
import { getPlansRequest } from '../../api/plans.js'
import { useToast } from '../../context/ToastContext.jsx'
import { useAuth } from '../../context/authContext.jsx'
import { displayedUfPrice, isTrialPlanId, planIdsForBusiness } from '../../utils/planCatalog.js'
import { resolveTenantBusinessId } from '../../utils/resolveTenantBusinessId.js'
import { parsePlanFeatures, normalizePlan } from '../../utils/planUtils.js'
import { getPlanPricing } from '../../utils/planPricing.js'
import { getMercadoPagoStatusMessage } from '../../config/mercadopago/mpStatusMessages.js'
import { isMercadoPagoTestMode } from '../../config/mercadopago/mpConfig.js'
import { MercadoPagoCheckoutButton, PromoFreeTrialButton } from '../mercadopago/index.js'

const PLAN_BADGES = {
  P001: { label: 'Oferta lanzamiento', className: 'bg-[#094fd1]' },
  P002: { label: 'Comercial', className: 'bg-slate-600' },
  P003: { label: 'Más completo', className: 'bg-[#01c676]' },
  'OPT-TRIAL': { label: '2 meses gratis', className: 'bg-[#094fd1]' },
  'OPT-START': { label: 'Start', className: 'bg-slate-600' },
  'OPT-STANDARD': { label: 'Más elegido', className: 'bg-[#01c676]' },
}

const VARIANTS = {
  welcome: {
    title: 'Elige tu plan',
    titleAccent: 'para comenzar',
    description:
      'Puedes activar la prueba de 2 meses o contratar un plan. Los precios son netos y el IVA se suma antes de pagar.',
    gridCols: 'md:grid-cols-3',
  },
  expired: {
    title: 'Renueva tu acceso',
    titleAccent: 'con un plan de pago',
    description:
      'Contrata un plan con Mercado Pago. El precio final y el IVA se muestran antes de pagar.',
    gridCols: 'md:grid-cols-2',
    showMercadoPagoHint: true,
  },
}

function sortPlans(plans, order) {
  return [...plans].sort((a, b) => order.indexOf(a.planId) - order.indexOf(b.planId))
}

function PlanPrice({ plan }) {
  const isTrial = isTrialPlanId(plan.planId)
  const ufPrice = plan.planCurrency === 'UF' ? displayedUfPrice(plan) : null

  if (isTrial) {
    return (
      <div className="mt-2 mb-2.5">
        <div className="flex items-end gap-1.5">
          <span className="text-3xl font-extrabold text-[#01c676] tracking-tight">$0</span>
          <div className="flex flex-col mb-0.5">
            <span className="text-[9px] text-gray-400 font-bold uppercase">Por 2 meses</span>
            <span className="text-gray-500 text-[10px] font-medium">
              Luego eliges un plan de pago
            </span>
          </div>
        </div>
      </div>
    )
  }

  if (ufPrice) {
    return (
      <div className="mt-2 mb-2.5">
        <div className="flex items-end gap-1.5">
          <span className="text-3xl font-extrabold text-[#01c676] tracking-tight">
            {ufPrice.current.toLocaleString('es-CL', { maximumFractionDigits: 3 })} UF
          </span>
          <span className="text-[10px] text-gray-500 font-medium mb-1">neto / mes</span>
        </div>
        {ufPrice.promotional && (
          <p className="text-xs text-slate-500">
            Precio normal: {ufPrice.list.toLocaleString('es-CL', { maximumFractionDigits: 3 })} UF
          </p>
        )}
        <p className="text-[10px] text-slate-600 mt-1">
          El total en CLP y el IVA se calculan con la UF oficial antes de pagar.
        </p>
      </div>
    )
  }

  return (
    <div className="mt-2 mb-2.5">
      {(() => {
        const { net, iva, total } = getPlanPricing(plan.planPrice)
        return (
          <>
            <div className="flex items-end gap-1.5">
              <span className="text-3xl font-extrabold text-[#01c676] tracking-tight">
                ${net.toLocaleString('es-CL')}
              </span>
              <div className="flex flex-col mb-0.5">
                <span className="text-[9px] text-gray-400 font-bold uppercase">Neto / mes</span>
                <span className="text-gray-500 text-[10px] font-medium">
                  + IVA ${iva.toLocaleString('es-CL')}
                </span>
              </div>
            </div>
            <p className="text-[10px] text-slate-600 mt-1 font-medium">
              Total a pagar: ${total.toLocaleString('es-CL')}/mes
            </p>
          </>
        )
      })()}
    </div>
  )
}

/**
 * @param {'welcome' | 'expired'} variant
 * - welcome: P001 trial + P002 + P003
 * - expired: solo P002 y P003 (renovación)
 */
export default function SubscriptionPlanPicker({
  variant = 'welcome',
  onActivateTrial,
  activateTrialLoading = false,
  activateTrialDisabled = false,
}) {
  const config = VARIANTS[variant] ?? VARIANTS.welcome
  const { businessSelected, business, refreshSubscriptions, canClaimFreeTrial, activeBusinessId } =
    useAuth()
  const toast = useToast()
  const [plans, setPlans] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  const businessId = activeBusinessId ?? resolveTenantBusinessId({ businessSelected, business })
  const businessType = business?.businessType ?? businessSelected?.Business?.businessType
  const planIds = useMemo(
    () => planIdsForBusiness(businessType, variant === 'expired'),
    [businessType, variant],
  )

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        setLoading(true)
        setError(false)
        const res = await getPlansRequest()
        const list = Array.isArray(res.data) ? res.data : []
        const filtered = list
          .filter((p) => planIds.includes(p.planId) && p.planActive !== false)
          .map(normalizePlan)
        if (!cancelled) {
          setPlans(sortPlans(filtered, planIds))
        }
      } catch {
        if (!cancelled) {
          setPlans([])
          setError(true)
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [planIds])

  const handlePaymentError = useCallback(
    (error) => {
      const statusDetail = error.statusDetail || error.message
      const fromApi = error.response?.data?.message ?? error.response?.data?.error
      const message =
        fromApi && !String(fromApi).startsWith('cc_')
          ? fromApi
          : getMercadoPagoStatusMessage(statusDetail, {
              testMode: isMercadoPagoTestMode(),
            })
      toast.error('Error al procesar la suscripción', message)
    },
    [toast],
  )

  const handlePromoSuccess = useCallback(() => {
    toast.success(
      'Prueba activada',
      'Tu trial de 2 meses está activo. Revisa tu correo — te enviamos la bienvenida con los detalles.',
    )
  }, [toast])

  const handlePaidSuccess = useCallback(() => {
    toast.success('Plan activado', 'Tu suscripción recurrente fue procesada correctamente.')
  }, [toast])

  const displayPlans = useMemo(() => plans, [plans])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-10">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    )
  }

  if (error) {
    return (
      <div role="alert" className="p-5 text-center text-sm text-slate-700">
        No se pudieron cargar los planes. Recarga esta página para intentarlo de nuevo.
      </div>
    )
  }

  if (plans.length === 0) {
    return (
      <div className="p-5 text-center text-sm text-slate-700">
        No hay planes de pago disponibles por ahora. Contacta a soporte para revisar tu renovación.
      </div>
    )
  }

  return (
    <div className="font-inter text-[#021f41] px-2 py-2 sm:px-3 sm:py-2.5">
      <div className="mb-3 text-center md:text-left">
        <h2 className="text-xl md:text-2xl font-bold font-display leading-tight">
          {config.title} <span className="text-[#094fd1]">{config.titleAccent}</span>
        </h2>
        <p className="text-[11px] sm:text-xs text-gray-500 mt-1 max-w-lg leading-snug">
          {config.description}
        </p>
        {config.showMercadoPagoHint && (
          <div className="mt-2 max-w-lg rounded-lg border border-blue-100 bg-blue-50/80 px-3 py-2 flex items-center gap-2">
            <FaCreditCard className="text-secondary shrink-0 text-sm" />
            <p className="text-[11px] text-slate-700 leading-snug">
              Pago seguro con Checkout Bricks de <strong>Mercado Pago Chile</strong>.
            </p>
          </div>
        )}
      </div>

      <div
        className={`flex gap-3 overflow-x-auto pb-2 snap-x snap-mandatory md:grid ${config.gridCols} md:overflow-visible md:pb-0`}
      >
        {displayPlans.map((plan) => {
          const features = parsePlanFeatures(plan.planFeatures)
          const badge = PLAN_BADGES[plan.planId]
          const isTrial = isTrialPlanId(plan.planId)
          const trialDisabled = !canClaimFreeTrial || !businessId || activateTrialDisabled
          const paidDisabled = !businessId

          return (
            <article
              key={plan.planId}
              className="relative shrink-0 w-[min(82vw,260px)] md:w-auto snap-center bg-white rounded-lg shadow-md border border-gray-100 overflow-hidden flex flex-col"
            >
              {badge && (
                <div
                  className={`absolute top-0 right-0 text-white text-[9px] font-bold px-2 py-0.5 rounded-bl-md z-10 uppercase tracking-wide ${badge.className}`}
                >
                  {badge.label}
                </div>
              )}

              <div className="p-3.5 sm:p-4 flex flex-col flex-1">
                <div className="flex items-center justify-between mb-0.5">
                  <h3 className="text-base font-bold font-display pr-6">{plan.planName}</h3>
                  <div className="bg-yellow-50 rounded-full p-1 shrink-0">
                    <FaStar className="text-yellow-400 text-sm" />
                  </div>
                </div>

                <PlanPrice plan={plan} />

                <div className="bg-gray-50/50 rounded-md p-2.5 mb-3 border border-gray-100 flex-1">
                  <ul className="space-y-1">
                    {features.map((feature) => (
                      <li key={feature} className="flex items-center gap-2">
                        <div className="shrink-0 bg-primary/10 rounded-full p-0.5">
                          <FaCheck className="h-2 w-2 text-primary" />
                        </div>
                        <span className="text-[11px] text-gray-600 font-medium">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {isTrial ? (
                  <PromoFreeTrialButton
                    businessId={businessId}
                    planId={plan.planId}
                    disabled={trialDisabled}
                    loading={activateTrialLoading}
                    onActivate={onActivateTrial}
                    refreshSubscriptions={refreshSubscriptions}
                    onSuccess={handlePromoSuccess}
                    onError={handlePaymentError}
                    label="Activar 2 meses gratis"
                  />
                ) : (
                  <MercadoPagoCheckoutButton
                    plan={plan}
                    businessId={businessId}
                    compact
                    disabled={paidDisabled}
                    buttonId={`mp-${variant}-${plan.planId}`}
                    buttonLabel={`Contratar ${plan.planName}`}
                    refreshSubscriptions={refreshSubscriptions}
                    onSuccess={handlePaidSuccess}
                    onError={handlePaymentError}
                  />
                )}
              </div>
            </article>
          )
        })}
      </div>
    </div>
  )
}
