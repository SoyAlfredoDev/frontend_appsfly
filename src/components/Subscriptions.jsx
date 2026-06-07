import { useState, useEffect, useCallback } from "react";
import { useAuth } from "../context/authContext.jsx";
import { useToast } from "../context/ToastContext.jsx";
import { getPlansRequest } from "../api/plans.js";
import { motion as Motion } from "framer-motion";
import { FaCheck, FaStar, FaCreditCard } from "react-icons/fa";
import { FREE_TRIAL_PLAN_ID } from "../utils/subscriptionAccess.js";
import { getMercadoPagoStatusMessage } from "../config/mercadopago/mpStatusMessages.js";
import { isMercadoPagoTestMode } from "../config/mercadopago/mpConfig.js";
import {
    MercadoPagoCheckoutButton,
    PromoFreeTrialButton,
} from "./mercadopago/index.js";

const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.08 } },
};

const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0 },
};

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
 * - trial: promoción P001 — sin Mercado Pago
 * - paid: plan comercial — Checkout Pro Mercado Pago Chile
 */
export default function Subscription({ embedded = false, compact = false, offerType = "trial" }) {
    const { businessSelected, refreshSubscriptions, canClaimFreeTrial } = useAuth();
    const [paidPlan, setPaidPlan] = useState(null);
    const toast = useToast();

    const isPaidOffer = offerType === "paid";
    const businessId = businessSelected?.userBusinessBusinessId;

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

    const plan = isPaidOffer ? paidPlan ?? FALLBACK_PAID_PLAN : TRIAL_PLAN;

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

    const handlePromoSuccess = () => {
        toast.success(
            "Prueba activada",
            "Tu trial de 2 meses está activo. Revisa tu correo — te enviamos la bienvenida con los detalles.",
        );
    };

    const handlePaymentError = useCallback((error) => {
        const statusDetail = error.statusDetail || error.message;
        const fromApi = error.response?.data?.message;
        const message = fromApi && !String(fromApi).startsWith("cc_")
            ? fromApi
            : getMercadoPagoStatusMessage(statusDetail, {
                testMode: isMercadoPagoTestMode(),
            });
        toast.error("Error al procesar la suscripción", message);
    }, [toast]);

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
                                    ventas, inventario y reportes de <strong>AppsFly</strong>.
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
                                <div className="rounded-lg border border-blue-100 bg-blue-50/80 px-3 py-2 flex items-center gap-2">
                                    <FaCreditCard className="text-secondary shrink-0 text-sm" />
                                    <p className="text-[11px] text-slate-700 leading-snug">
                                        Pago seguro con Checkout Bricks de{" "}
                                        <strong>Mercado Pago Chile</strong>.
                                    </p>
                                </div>
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
                                                <div className="shrink-0 bg-primary/10 rounded-full p-0.5">
                                                    <FaCheck className="h-2 w-2 text-primary" />
                                                </div>
                                                <span className="text-[11px] text-gray-600 font-medium">
                                                    {feature}
                                                </span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>

                                {isPaidOffer ? (
                                    <MercadoPagoCheckoutButton
                                        plan={plan}
                                        businessId={businessId}
                                        compact={compact}
                                        buttonId="mp-subscription-checkout"
                                        buttonLabel={
                                            compact
                                                ? "Suscripción mensual"
                                                : "Activar suscripción mensual"
                                        }
                                        refreshSubscriptions={refreshSubscriptions}
                                        onSuccess={() => {
                                            toast.success(
                                                "Plan activado",
                                                "Tu suscripción recurrente fue procesada correctamente.",
                                            );
                                        }}
                                        onError={handlePaymentError}
                                    />
                                ) : (
                                    <PromoFreeTrialButton
                                        businessId={businessId}
                                        planId={plan.planId}
                                        disabled={!canClaimFreeTrial}
                                        refreshSubscriptions={refreshSubscriptions}
                                        onSuccess={handlePromoSuccess}
                                        onError={handlePaymentError}
                                    />
                                )}
                            </div>
                        </Motion.div>
                    </div>
                </div>
            </Motion.div>
        </div>
    );
}
