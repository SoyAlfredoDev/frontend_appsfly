import { useCallback, useEffect, useMemo, useState } from "react";
import { FaCreditCard, FaExclamationTriangle, FaSync } from "react-icons/fa";
import { useToast } from "../../context/ToastContext.jsx";
import {
    cancelBusinessSubscriptionRequest,
    getBusinessBillingRequest,
} from "../../api/subscriptionBilling.js";
import formatCurrency from "../../utils/formatCurrency.js";
import {
    isCancelConfirmationValid,
    SUBSCRIPTION_CANCEL_CONFIRMATION_PHRASE,
} from "../../constants/subscriptionCancel.js";

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
        return { text: "Activa (mensual)", className: "text-emerald-600" };
    }
    return { text: "Periodo pagado", className: "text-slate-600" };
}

export default function SubscriptionBillingCard({ businessId, isAdmin = false }) {
    const toast = useToast();
    const [billing, setBilling] = useState(null);
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

    if (loading) {
        return (
            <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-5 animate-pulse">
                <div className="h-5 w-40 bg-gray-200 rounded mb-4" />
                <div className="h-4 w-full bg-gray-100 rounded mb-2" />
                <div className="h-4 w-3/4 bg-gray-100 rounded" />
            </div>
        );
    }

    const sub = billing?.subscription;
    const renewalLabel = sub ? getRenewalLabel(sub) : null;

    return (
        <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100 flex flex-col h-full">
            <div className="bg-gradient-to-r from-[#021f41] to-[#094fd1] px-5 py-4">
                <div className="flex items-center gap-3">
                    <div className="bg-white/20 p-2 rounded-full text-white">
                        <FaCreditCard size={18} />
                    </div>
                    <div>
                        <h5 className="text-lg font-bold text-white tracking-wide">Mi Suscripción AppsFly</h5>
                        <p className="text-xs text-blue-100">Facturación y renovación automática</p>
                    </div>
                </div>
            </div>

            <div className="p-5 flex-grow space-y-4">
                {!sub ? (
                    <p className="text-sm text-gray-500">
                        Este negocio no tiene una suscripción registrada actualmente.
                    </p>
                ) : sub.isPromoFreeTrial ? (
                    <>
                        <div className="rounded-lg bg-emerald-50 border border-emerald-100 p-4">
                            <p className="text-sm font-semibold text-emerald-800">Plan promocional activo</p>
                            <p className="text-xs text-emerald-700 mt-1">
                                Prueba gratuita vigente hasta el {formatDate(sub.subscriptionEndDate)}.
                            </p>
                        </div>
                        <p className="text-xs text-gray-500">
                            Al finalizar la promoción, podrás contratar un plan comercial con cobro mensual recurrente.
                        </p>
                    </>
                ) : (
                    <>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div className="rounded-lg bg-slate-50 p-3 border border-slate-100">
                                <p className="text-[10px] uppercase font-bold text-gray-400">Plan</p>
                                <p className="text-sm font-bold text-gray-900">{sub.plan?.planName ?? "—"}</p>
                            </div>
                            <div className="rounded-lg bg-slate-50 p-3 border border-slate-100">
                                <p className="text-[10px] uppercase font-bold text-gray-400">Monto mensual</p>
                                <p className="text-sm font-bold text-gray-900">
                                    {formatCurrency(sub.subscriptionAmount, "es-CL", sub.plan?.planCurrency || "CLP")}
                                </p>
                            </div>
                            <div className="rounded-lg bg-slate-50 p-3 border border-slate-100">
                                <p className="text-[10px] uppercase font-bold text-gray-400">Acceso hasta</p>
                                <p className="text-sm font-bold text-gray-900">{formatDate(sub.subscriptionEndDate)}</p>
                            </div>
                            <div className="rounded-lg bg-slate-50 p-3 border border-slate-100">
                                <p className="text-[10px] uppercase font-bold text-gray-400">Renovación automática</p>
                                <p className={`text-sm font-bold ${renewalLabel?.className ?? "text-gray-900"}`}>
                                    {renewalLabel?.text ?? "—"}
                                </p>
                            </div>
                        </div>

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
                            <div className="pt-3 mt-1 border-t border-gray-100">
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
                                    <div className="rounded-lg border border-red-200 bg-red-50/60 p-4 space-y-4">
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
                                                        : "border-gray-200 focus:ring-blue-200"
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
                                                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200 resize-none"
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
                    </>
                )}

                <button
                    type="button"
                    onClick={loadBilling}
                    className="inline-flex items-center gap-1.5 text-xs text-gray-400 hover:text-gray-600"
                >
                    <FaSync className={loading ? "animate-spin" : ""} />
                    Actualizar estado
                </button>
            </div>
        </div>
    );
}
