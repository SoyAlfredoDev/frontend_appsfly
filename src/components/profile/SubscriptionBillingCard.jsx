import { useCallback, useEffect, useMemo, useState } from "react";
import {
    FaCreditCard,
    FaExclamationTriangle,
    FaSync,
    FaCheck,
    FaShieldAlt,
} from "react-icons/fa";
import { useAuth } from "../../context/authContext.jsx";
import { useToast } from "../../context/ToastContext.jsx";
import {
    cancelBusinessSubscriptionRequest,
    getBusinessBillingRequest,
} from "../../api/subscriptionBilling.js";
import { getPlansRequest } from "../../api/plans.js";
import formatCurrency from "../../utils/formatCurrency.js";
import {
    isCancelConfirmationValid,
    SUBSCRIPTION_CANCEL_CONFIRMATION_PHRASE,
} from "../../constants/subscriptionCancel.js";
import {
    canAdminPayNextSubscription,
    getSubscriptionPayActionLabel,
} from "../../utils/subscriptionBillingUi.js";
import { FREE_TRIAL_PLAN_ID } from "../../utils/subscriptionAccess.js";
import { getMercadoPagoStatusMessage } from "../../config/mercadopago/mpStatusMessages.js";
import { isMercadoPagoTestMode } from "../../config/mercadopago/mpConfig.js";
import { MercadoPagoCheckoutButton } from "../mercadopago/index.js";
import ProfileSectionCard from "./ProfileSectionCard.jsx";
import {
    TABLE_WRAPPER,
    KPI_CARD,
    KPI_ICON_PRIMARY,
    KPI_ICON_SECONDARY,
    KPI_ICON_AMBER,
    KPI_LABEL,
    KPI_VALUE,
    PRIMARY_BTN,
} from "../../utils/expenseUiPatterns.js";

const FALLBACK_PAID_PLAN = {
    planId: "P002",
    planName: "Plan Comercial",
    planPrice: 9990,
    planDuration: 1,
    planFeatures: ["5 usuarios", "Compras y Ventas", "Inventario", "Reportes", "Soporte 24/7"],
};

function formatDate(date) {
    if (!date) return "—";
    return new Date(date).toLocaleDateString("es-CL", {
        year: "numeric",
        month: "long",
        day: "numeric",
    });
}

function getRenewalLabel(sub) {
    if (!sub.autoRenewEnabled || sub.subscriptionCancelledAt) {
        return { text: "Cancelada", className: "text-amber-600" };
    }
    if (sub.isPaidRecurring) {
        return { text: "Activa (mensual)", className: "text-primary" };
    }
    return { text: "Periodo pagado", className: "text-slate-600" };
}

function parsePlanFeatures(plan) {
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
}

export default function SubscriptionBillingCard({ businessId, isAdmin = false }) {
    const toast = useToast();
    const { refreshSubscriptions } = useAuth();
    const [billing, setBilling] = useState(null);
    const [paidPlan, setPaidPlan] = useState(null);
    const [loading, setLoading] = useState(true);
    const [cancelling, setCancelling] = useState(false);
    const [showCancelForm, setShowCancelForm] = useState(false);
    const [confirmationInput, setConfirmationInput] = useState("");
    const [cancelReason, setCancelReason] = useState("");

    const confirmPhrase =
        billing?.subscription?.cancelConfirmationPhrase
        ?? SUBSCRIPTION_CANCEL_CONFIRMATION_PHRASE;

    const isConfirmationValid = useMemo(
        () => isCancelConfirmationValid(confirmationInput),
        [confirmationInput],
    );

    const loadBilling = useCallback(async () => {
        if (!businessId) {
            setBilling(null);
            setLoading(false);
            return;
        }
        setLoading(true);
        try {
            const res = await getBusinessBillingRequest(businessId);
            setBilling(res.data);
        } catch (error) {
            console.error("Error loading billing:", error);
            setBilling(null);
        } finally {
            setLoading(false);
        }
    }, [businessId]);

    useEffect(() => {
        loadBilling();
    }, [loadBilling]);

    useEffect(() => {
        if (!isAdmin || !businessId) return;
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
    }, [isAdmin, businessId]);

    const resetCancelForm = () => {
        setShowCancelForm(false);
        setConfirmationInput("");
        setCancelReason("");
    };

    const handleCancel = async () => {
        if (!showCancelForm) {
            setShowCancelForm(true);
            return;
        }

        if (!isConfirmationValid) {
            toast.error(
                "Confirmación requerida",
                `Escribe exactamente "${confirmPhrase}" para eliminar la suscripción.`,
            );
            return;
        }

        setCancelling(true);
        try {
            const res = await cancelBusinessSubscriptionRequest(businessId, {
                confirmationPhrase: confirmationInput.trim(),
                cancelReason: cancelReason.trim() || undefined,
            });
            setBilling(res.data.billing);
            resetCancelForm();
            toast.success(
                "Suscripción cancelada",
                res.data.message
                    || "No habrá más cobros mensuales. Tu acceso continúa hasta la fecha de vencimiento.",
            );
        } catch (error) {
            toast.error(
                "No se pudo cancelar",
                error.response?.data?.message || "Intenta nuevamente más tarde.",
            );
        } finally {
            setCancelling(false);
        }
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

    const handlePaymentSuccess = useCallback(async () => {
        toast.success(
            "Suscripción activada",
            "Tu plan comercial fue procesado correctamente.",
        );
        await refreshSubscriptions();
        await loadBilling();
    }, [toast, refreshSubscriptions, loadBilling]);

    const sub = billing?.subscription;
    const renewalLabel = sub ? getRenewalLabel(sub) : null;
    const showPaySection = isAdmin && canAdminPayNextSubscription(billing);
    const payActionLabel = getSubscriptionPayActionLabel(billing);
    const plan = paidPlan ?? FALLBACK_PAID_PLAN;
    const planFeatures = parsePlanFeatures(plan);

    if (loading) {
        return (
            <div className={`${TABLE_WRAPPER} p-6 animate-pulse space-y-4`}>
                <div className="h-5 w-48 bg-gray-200 rounded" />
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
                    {[1, 2, 3, 4].map((item) => (
                        <div key={item} className="h-20 bg-gray-100 rounded-xl" />
                    ))}
                </div>
            </div>
        );
    }

    return (
        <ProfileSectionCard
            title="Suscripción AppsFly"
            subtitle="Facturación, renovación y acceso al sistema"
            icon={FaCreditCard}
            badge={
                isAdmin ? (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-secondary/10 text-secondary border border-secondary/20">
                        <FaShieldAlt className="text-[10px]" />
                        Gestión habilitada
                    </span>
                ) : (
                    <span className="text-xs text-gray-500 bg-gray-50 border border-gray-200 px-2.5 py-1 rounded-full">
                        Solo lectura
                    </span>
                )
            }
        >
            {!sub ? (
                <div className="px-6 py-8 text-center text-sm text-gray-500">
                    Este negocio no tiene una suscripción registrada actualmente.
                </div>
            ) : sub.isPromoFreeTrial ? (
                <div className="px-6 py-5 space-y-4">
                    <div className="rounded-xl border border-primary/20 bg-primary/5 p-4">
                        <p className="text-sm font-semibold text-dark">Plan promocional activo</p>
                        <p className="text-xs text-gray-600 mt-1">
                            Prueba gratuita vigente hasta el {formatDate(sub.subscriptionEndDate)}.
                        </p>
                    </div>
                    <p className="text-xs text-gray-500">
                        Al finalizar la promoción, podrás contratar un plan comercial con cobro mensual recurrente.
                    </p>
                </div>
            ) : (
                <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 p-6 border-b border-gray-100">
                        <div className={KPI_CARD}>
                            <div className={KPI_ICON_PRIMARY}>
                                <FaCreditCard className="text-xl" />
                            </div>
                            <div>
                                <p className={KPI_LABEL}>Plan</p>
                                <p className={KPI_VALUE}>{sub.plan?.planName ?? "—"}</p>
                            </div>
                        </div>
                        <div className={KPI_CARD}>
                            <div className={KPI_ICON_PRIMARY}>
                                <FaCreditCard className="text-xl" />
                            </div>
                            <div>
                                <p className={KPI_LABEL}>Monto mensual</p>
                                <p className={KPI_VALUE}>
                                    {formatCurrency(sub.subscriptionAmount, "es-CL", sub.plan?.planCurrency || "CLP")}
                                </p>
                            </div>
                        </div>
                        <div className={KPI_CARD}>
                            <div className={KPI_ICON_SECONDARY}>
                                <FaCreditCard className="text-xl" />
                            </div>
                            <div>
                                <p className={KPI_LABEL}>Acceso hasta</p>
                                <p className="text-base font-bold text-gray-900">{formatDate(sub.subscriptionEndDate)}</p>
                            </div>
                        </div>
                        <div className={KPI_CARD}>
                            <div className={KPI_ICON_AMBER}>
                                <FaSync className="text-xl" />
                            </div>
                            <div>
                                <p className={KPI_LABEL}>Renovación</p>
                                <p className={`text-base font-bold ${renewalLabel?.className ?? "text-gray-900"}`}>
                                    {renewalLabel?.text ?? "—"}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="px-6 py-4 space-y-3 border-b border-gray-100">
                        {sub.isPaidRecurring && sub.autoRenewEnabled && (
                            <p className="text-xs text-gray-500 leading-relaxed">
                                Mercado Pago cobrará automáticamente el monto del plan cada mes mientras la
                                renovación esté activa. Puedes eliminar la suscripción en cualquier momento;
                                conservarás acceso hasta el {formatDate(sub.subscriptionEndDate)} sin nuevos cobros.
                            </p>
                        )}

                        {sub.isPaidCommercial && !sub.isPaidRecurring && sub.autoRenewEnabled && (
                            <p className="text-xs text-gray-500 leading-relaxed">
                                Tu plan está activo hasta el {formatDate(sub.subscriptionEndDate)}.
                                {" "}Puedes registrar la baja para dejar constancia de que no deseas renovación futura.
                            </p>
                        )}

                        {isAdmin && sub.canCancel && (
                            <div className="pt-1">
                                {!showCancelForm ? (
                                    <button
                                        type="button"
                                        onClick={handleCancel}
                                        disabled={cancelling}
                                        className="inline-flex items-center px-4 py-2 rounded-lg border border-red-200 bg-red-50 text-sm font-semibold text-red-700 hover:bg-red-100 transition-colors"
                                    >
                                        Eliminar suscripción
                                    </button>
                                ) : (
                                    <div className="rounded-xl border border-red-200 bg-red-50/60 p-4 space-y-4">
                                        <div className="flex gap-2 text-red-800">
                                            <FaExclamationTriangle className="shrink-0 mt-0.5" />
                                            <div className="text-sm space-y-1">
                                                <p className="font-semibold">Confirmar eliminación de suscripción</p>
                                                <p>
                                                    No se realizarán más cobros mensuales. Tu acceso permanece
                                                    activo hasta el <strong>{formatDate(sub.subscriptionEndDate)}</strong>
                                                    {" "}(periodo ya pagado).
                                                </p>
                                            </div>
                                        </div>

                                        <div>
                                            <label
                                                htmlFor="cancel-confirm-input"
                                                className="block text-xs font-semibold text-gray-700 mb-1.5"
                                            >
                                                Escribe <span className="font-mono text-red-700">{confirmPhrase}</span> para confirmar
                                            </label>
                                            <input
                                                id="cancel-confirm-input"
                                                type="text"
                                                value={confirmationInput}
                                                onChange={(e) => setConfirmationInput(e.target.value)}
                                                placeholder={confirmPhrase}
                                                autoComplete="off"
                                                className={`w-full rounded-lg border px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 ${
                                                    confirmationInput && !isConfirmationValid
                                                        ? "border-red-300 focus:ring-red-200"
                                                        : "border-gray-200 focus:ring-primary/30"
                                                }`}
                                            />
                                        </div>

                                        <div>
                                            <label
                                                htmlFor="cancel-reason-input"
                                                className="block text-xs font-semibold text-gray-700 mb-1.5"
                                            >
                                                Motivo (opcional)
                                            </label>
                                            <textarea
                                                id="cancel-reason-input"
                                                value={cancelReason}
                                                onChange={(e) => setCancelReason(e.target.value)}
                                                rows={2}
                                                maxLength={500}
                                                placeholder="Cuéntanos por qué cancelas (opcional)"
                                                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none"
                                            />
                                        </div>

                                        <div className="flex flex-wrap gap-2">
                                            <button
                                                type="button"
                                                onClick={handleCancel}
                                                disabled={cancelling || !isConfirmationValid}
                                                className="px-4 py-2 rounded-lg bg-red-600 text-white text-sm font-semibold hover:bg-red-700 disabled:opacity-40 disabled:cursor-not-allowed"
                                            >
                                                {cancelling ? "Eliminando…" : "Confirmar eliminación"}
                                            </button>
                                            <button
                                                type="button"
                                                onClick={resetCancelForm}
                                                disabled={cancelling}
                                                className="px-4 py-2 rounded-lg border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50"
                                            >
                                                Volver
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {isAdmin && sub.isPaidCommercial && !sub.canCancel && !sub.autoRenewEnabled && (
                            <div className="text-xs text-amber-800 bg-amber-50 border border-amber-100 rounded-lg p-3 space-y-1">
                                <p className="font-semibold">Suscripción eliminada — sin cobros futuros</p>
                                <p>
                                    El acceso continúa hasta el {formatDate(sub.subscriptionEndDate)}.
                                    {sub.subscriptionCancelledAt && (
                                        <> Baja registrada el {formatDate(sub.subscriptionCancelledAt)}.</>
                                    )}
                                </p>
                            </div>
                        )}
                    </div>
                </>
            )}

            {showPaySection && (
                <div className="px-6 py-5 border-b border-gray-100 bg-slate-50/50">
                    <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto] gap-5 items-start">
                        <div>
                            <h3 className="text-sm font-semibold text-gray-800">{payActionLabel}</h3>
                            <p className="text-xs text-gray-500 mt-1 max-w-xl">
                                {sub?.isPromoFreeTrial
                                    ? "Contrata el plan comercial para continuar usando AppsFly cuando termine tu prueba gratuita."
                                    : sub && !sub.accessStillValid
                                      ? "Tu suscripción venció. Reactiva el plan comercial para recuperar ventas, inventario y reportes."
                                      : sub && !sub.autoRenewEnabled
                                        ? "La renovación automática está desactivada. Paga el siguiente periodo para mantener el acceso sin interrupciones."
                                        : "Contrata el plan comercial con facturación mensual recurrente vía Mercado Pago."}
                            </p>
                            <ul className="mt-3 space-y-1.5">
                                {planFeatures.slice(0, 5).map((feature) => (
                                    <li key={feature} className="flex items-center gap-2 text-xs text-gray-600">
                                        <FaCheck className="text-primary shrink-0" />
                                        {feature}
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <div className="w-full lg:w-72 rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
                            <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                                {plan.planName}
                            </p>
                            <p className="text-2xl font-bold text-primary mt-1">
                                {formatCurrency(plan.planPrice ?? 0, "es-CL", plan.planCurrency || "CLP")}
                                <span className="text-xs font-medium text-gray-400 ml-1">/ mes</span>
                            </p>
                            <div className="mt-4">
                                <MercadoPagoCheckoutButton
                                    plan={plan}
                                    businessId={businessId}
                                    buttonId="profile-subscription-checkout"
                                    buttonLabel={payActionLabel}
                                    refreshSubscriptions={refreshSubscriptions}
                                    onSuccess={handlePaymentSuccess}
                                    onError={handlePaymentError}
                                />
                            </div>
                            <p className="text-[10px] text-gray-400 mt-2 text-center">
                                Pago seguro con Mercado Pago Chile
                            </p>
                        </div>
                    </div>
                </div>
            )}

            <div className="px-6 py-4 flex items-center justify-between gap-3">
                <button
                    type="button"
                    onClick={loadBilling}
                    className={`${PRIMARY_BTN} !bg-white !text-gray-600 border border-gray-200 hover:!bg-gray-50`}
                >
                    <FaSync className={loading ? "animate-spin" : ""} />
                    Actualizar estado
                </button>
                {!isAdmin && (
                    <p className="text-xs text-gray-400">
                        Solo el administrador del negocio puede gestionar pagos y bajas.
                    </p>
                )}
            </div>
        </ProfileSectionCard>
    );
}
