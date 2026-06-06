import { useState, useEffect } from "react";
import { useAuth } from "../context/authContext.jsx";
import { useToast } from "../context/ToastContext.jsx";
import { v4 as uuidv4 } from "uuid";
import { createSubscriptionRequest } from "../api/subscription.js";
import { getPlansRequest } from "../api/plans.js";
import { useNavigate } from "react-router-dom";
import { motion as Motion } from "framer-motion";
import { FaCheck, FaStar, FaArrowRight, FaCreditCard } from "react-icons/fa";
import SelectFloatingComponent from "./inputs/SelectFloatingComponent.jsx";
import { FREE_TRIAL_PLAN_ID } from "../utils/subscriptionAccess.js";

const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.08 } },
};

const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0 },
};

const PAYMENT_OPTIONS = [
    { value: "0", label: "Tarjeta de Débito" },
    { value: "1", label: "Tarjeta de Crédito" },
    { value: "2", label: "Transferencia Bancaria" },
    { value: "3", label: "Otro" },
];

const TRIAL_PLAN = {
    planId: FREE_TRIAL_PLAN_ID,
    planName: "Plan Básico",
    regularPrice: 9990,
    promoPrice: 0,
    promoDuration: 2,
    features: ["5 usuarios", "Compras y Ventas", "Inventario", "Reportes", "Soporte 24/7"],
};

const FALLBACK_PAID_PLAN = {
    planId: "P002",
    planName: "Plan Comercial",
    planPrice: 9990,
    planDuration: 1,
    planFeatures: ["5 usuarios", "Compras y Ventas", "Inventario", "Reportes", "Soporte 24/7"],
};

/**
 * @param {'trial' | 'paid'} offerType
 * - trial: promoción P001 solo para negocios sin historial
 * - paid: plan de pago obligatorio (sin P001)
 */
export default function Subscription({ embedded = false, compact = false, offerType = "trial" }) {
    const { businessSelected, refreshSubscriptions, canClaimFreeTrial } = useAuth();
    const navigate = useNavigate();
    const [subscribingId, setSubscribingId] = useState(null);
    const [paidPlan, setPaidPlan] = useState(null);
    const [paymentMethod, setPaymentMethod] = useState("2");
    const toast = useToast();

    const isPaidOffer = offerType === "paid";

    useEffect(() => {
        if (!isPaidOffer) return;
        let cancelled = false;
        (async () => {
            try {
                const res = await getPlansRequest();
                const plans = Array.isArray(res.data) ? res.data : [];
                const commercial = plans.find(
                    (p) => p.planId !== FREE_TRIAL_PLAN_ID && p.planActive !== false,
                );
                if (!cancelled) setPaidPlan(commercial ?? FALLBACK_PAID_PLAN);
            } catch {
                if (!cancelled) setPaidPlan(FALLBACK_PAID_PLAN);
            }
        })();
        return () => {
            cancelled = true;
        };
    }, [isPaidOffer]);

    const plan = isPaidOffer
        ? paidPlan ?? FALLBACK_PAID_PLAN
        : TRIAL_PLAN;

    const features = isPaidOffer
        ? (() => {
              const raw = plan?.planFeatures ?? FALLBACK_PAID_PLAN.planFeatures;
              if (Array.isArray(raw)) return raw;
              if (typeof raw === "string") {
                  try {
                      const parsed = JSON.parse(raw);
                      return Array.isArray(parsed) ? parsed : FALLBACK_PAID_PLAN.planFeatures;
                  } catch {
                      return FALLBACK_PAID_PLAN.planFeatures;
                  }
              }
              return FALLBACK_PAID_PLAN.planFeatures;
          })()
        : TRIAL_PLAN.features;

    const handleSubscribe = async (selectedPlan) => {
        if (subscribingId) return;

        if (!isPaidOffer && !canClaimFreeTrial) {
            toast.error(
                "Promoción no disponible",
                "La prueba gratuita solo aplica para negocios nuevos sin historial de suscripción.",
            );
            return;
        }

        if (isPaidOffer && !paymentMethod) {
            toast.error("Método de pago requerido", "Selecciona cómo deseas pagar tu plan.");
            return;
        }

        try {
            setSubscribingId(selectedPlan.planId);
            const newSubscription = {
                subscriptionId: uuidv4(),
                subscriptionBusinessId: businessSelected?.userBusinessBusinessId,
                subscriptionPlanId: selectedPlan.planId,
                subscriptionPaymentMethod: isPaidOffer ? paymentMethod : null,
            };
            const res = await createSubscriptionRequest(newSubscription);
            if (res.status === 201) {
                await refreshSubscriptions();
                toast.success(
                    isPaidOffer ? "Plan activado" : "Suscripción exitosa",
                    isPaidOffer
                        ? "Tu acceso operativo ha sido restaurado."
                        : "Tu cuenta ha sido actualizada correctamente.",
                );
                setTimeout(() => navigate("/dashboard"), 2000);
            } else {
                setSubscribingId(null);
                toast.error(
                    "Error al procesar la suscripción",
                    res.data?.message ?? "Reinicia la página e intente nuevamente.",
                );
            }
        } catch (error) {
            setSubscribingId(null);
            console.error(error);
            toast.error(
                "Error al procesar la suscripción",
                error.response?.data?.message ??
                    "Error al procesar la suscripción, reinicia la página e intente nuevamente.",
            );
        }
    };

    const rootClass = embedded
        ? compact
            ? "font-inter text-[#021f41] h-full"
            : "font-inter text-[#021f41]"
        : "bg-gray-50 flex items-center justify-center px-4 sm:px-6 lg:px-8 font-inter text-[#021f41] overflow-hidden min-h-[60vh]";

    const gridClass = compact
        ? "grid grid-cols-1 md:grid-cols-[1fr_auto] gap-3 md:gap-5 items-center h-full px-2 py-2 sm:px-3 sm:py-2.5"
        : "grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-center";

    const titleClass = compact
        ? "text-xl md:text-2xl font-bold mb-1.5 font-display text-[#021f41] leading-tight"
        : "text-3xl md:text-4xl lg:text-5xl font-bold mb-4 font-display text-[#021f41] leading-tight";

    const descClass = compact
        ? "text-[11px] sm:text-xs text-gray-500 mb-0 max-w-xs mx-auto md:mx-0 leading-snug line-clamp-3"
        : "text-base text-gray-500 mb-6 max-w-lg mx-auto lg:mx-0 leading-relaxed";

    const cardClass = compact
        ? "relative w-full max-w-[260px] sm:max-w-[272px] bg-white rounded-lg shadow-md overflow-hidden border border-gray-100"
        : "relative w-full max-w-sm bg-white rounded-xl shadow-xl overflow-hidden border border-gray-100 transform transition-all duration-300 hover:scale-[1.01]";

    const displayPrice = isPaidOffer ? Number(plan?.planPrice ?? 0) : TRIAL_PLAN.promoPrice;
    const priceSuffix = isPaidOffer ? "/ mes" : "Por 2 meses";
    const regularHint = isPaidOffer
        ? "Facturación mensual recurrente"
        : `luego $${TRIAL_PLAN.regularPrice.toLocaleString("es-CL")}`;

    if (isPaidOffer && !paidPlan) {
        return (
            <div className={`${rootClass} flex items-center justify-center py-8`}>
                <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            </div>
        );
    }

    return (
        <div className={rootClass}>
            <Motion.div
                className={compact ? "w-full h-full mx-auto" : "max-w-6xl w-full mx-auto"}
                variants={containerVariants}
                initial="hidden"
                animate="visible"
            >
                <div className={gridClass}>
                    <div className="text-center md:text-left min-w-0">
                        <Motion.h2 variants={itemVariants} className={titleClass}>
                            {isPaidOffer ? (
                                <>
                                    Reactiva tu acceso{" "}
                                    <span className="text-[#094fd1]">con plan comercial</span>
                                </>
                            ) : (
                                <>
                                    Impulsa tu negocio{" "}
                                    {!compact && <br className="hidden lg:block" />}
                                    <span className="text-[#094fd1]">sin costos iniciales</span>
                                </>
                            )}
                        </Motion.h2>

                        <Motion.p variants={itemVariants} className={descClass}>
                            {isPaidOffer ? (
                                <>
                                    Tu periodo anterior finalizó. Contrata el plan de pago para recuperar
                                    ventas, inventario y reportes de{" "}
                                    <strong>AppsFly</strong>.
                                </>
                            ) : (
                                <>
                                    Activa tu prueba de 2 meses gratis y desbloquea{" "}
                                    <strong>AppsFly</strong> para tu negocio.
                                </>
                            )}
                        </Motion.p>

                        {isPaidOffer && compact && (
                            <Motion.div variants={itemVariants} className="mt-2 max-w-xs">
                                <SelectFloatingComponent
                                    label="Método de pago"
                                    name="paymentMethod"
                                    value={paymentMethod}
                                    onChange={(e) => setPaymentMethod(e.target.value)}
                                    options={PAYMENT_OPTIONS}
                                    className="!mb-0"
                                />
                            </Motion.div>
                        )}
                    </div>

                    <div className="flex justify-center md:justify-end shrink-0">
                        <Motion.div key={plan.planId} variants={itemVariants} className={cardClass}>
                            {!isPaidOffer && (
                                <div className="absolute top-0 right-0 bg-[#094fd1] text-white text-[9px] font-bold px-2 py-0.5 rounded-bl-md z-10 uppercase tracking-wide">
                                    Oferta Lanzamiento
                                </div>
                            )}
                            {isPaidOffer && (
                                <div className="absolute top-0 right-0 bg-amber-600 text-white text-[9px] font-bold px-2 py-0.5 rounded-bl-md z-10 uppercase tracking-wide">
                                    Plan de Pago
                                </div>
                            )}

                            <div className={compact ? "p-3.5 sm:p-4" : "p-6"}>
                                <div className="flex items-center justify-between mb-0.5">
                                    <h3 className="text-base font-bold font-display text-[#021f41]">
                                        {plan.planName}
                                    </h3>
                                    <div className={`bg-yellow-50 rounded-full ${compact ? "p-1" : "p-1.5"}`}>
                                        <FaStar className={`text-yellow-400 ${compact ? "text-sm" : "text-lg"}`} />
                                    </div>
                                </div>

                                <div className={compact ? "mt-2 mb-2.5" : "mt-4 mb-5"}>
                                    <div className="flex items-end gap-1.5">
                                        <span className="text-3xl font-extrabold text-[#01c676] tracking-tight">
                                            ${displayPrice.toLocaleString("es-CL")}
                                        </span>
                                        <div className="flex flex-col mb-0.5">
                                            <span className="text-[9px] text-gray-400 font-bold uppercase">
                                                {priceSuffix}
                                            </span>
                                            <span className="text-gray-500 text-[10px] font-medium">
                                                {regularHint}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-gray-50/50 rounded-md p-2.5 mb-3 border border-gray-100">
                                    <ul className="space-y-1">
                                        {features.map((feature, idx) => (
                                            <li key={idx} className="flex items-center gap-2">
                                                <div className="shrink-0 bg-green-100 rounded-full p-0.5">
                                                    <FaCheck className="h-2 w-2 text-[#01c676]" />
                                                </div>
                                                <span className="text-[11px] text-gray-600 font-medium">
                                                    {feature}
                                                </span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>

                                <button
                                    type="button"
                                    onClick={() => handleSubscribe(plan)}
                                    disabled={!!subscribingId || (!isPaidOffer && !canClaimFreeTrial)}
                                    className={`group w-full py-2 px-3 rounded-lg font-bold text-xs text-white shadow-md shadow-green-500/20 transition-all duration-200 flex items-center justify-center gap-1.5 ${
                                        subscribingId || (!isPaidOffer && !canClaimFreeTrial)
                                            ? "bg-gray-100 cursor-not-allowed text-gray-400 shadow-none"
                                            : "bg-[#01c676] hover:bg-[#00b067] hover:-translate-y-0.5"
                                    }`}
                                >
                                    {subscribingId === plan.planId ? (
                                        <>Procesando...</>
                                    ) : isPaidOffer ? (
                                        <>
                                            <FaCreditCard />
                                            Contratar plan
                                            <FaArrowRight className="text-[10px] transition-transform group-hover:translate-x-1" />
                                        </>
                                    ) : (
                                        <>
                                            Obtener 2 meses gratis
                                            <FaArrowRight className="text-[10px] transition-transform group-hover:translate-x-1" />
                                        </>
                                    )}
                                </button>
                            </div>
                        </Motion.div>
                    </div>
                </div>
            </Motion.div>
        </div>
    );
}
