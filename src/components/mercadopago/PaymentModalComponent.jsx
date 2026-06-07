import { useCallback, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { FaCheckCircle, FaLock, FaTimes, FaShieldAlt } from "react-icons/fa";
import MercadoPagoPaymentBrick from "./MercadoPagoPaymentBrick.jsx";
import { isMercadoPagoTestMode } from "../../config/mercadopago/mpConfig.js";
import formatCurrency from "../../utils/formatCurrency.js";

/**
 * Modal de pago seguro — portal estable sin re-montajes por AnimatePresence.
 */
export default function PaymentModalComponent({
    open,
    success = false,
    onClose,
    loading = false,
    processing = false,
    planName,
    amount,
    currency = "CLP",
    preferenceId,
    paymentId,
    onApproved,
    onError,
    onProcessingStart,
}) {
    const isLocked = loading || processing || success;
    const brickReady = Boolean(paymentId && amount != null);
    const [brickMounted, setBrickMounted] = useState(false);

    useEffect(() => {
        if (brickReady) setBrickMounted(true);
    }, [brickReady]);

    useEffect(() => {
        if (!open) setBrickMounted(false);
    }, [open]);

    useEffect(() => {
        if (!open) return undefined;

        const previousOverflow = document.body.style.overflow;
        document.body.style.overflow = "hidden";

        const handleEscape = (event) => {
            if (event.key === "Escape" && !isLocked) onClose?.();
        };
        window.addEventListener("keydown", handleEscape);

        return () => {
            document.body.style.overflow = previousOverflow;
            window.removeEventListener("keydown", handleEscape);
        };
    }, [open, isLocked, onClose]);

    const handleProcessingStart = useCallback(() => {
        onProcessingStart?.();
    }, [onProcessingStart]);

    if (!open) return null;

    return createPortal(
        <div
            className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6 animate-[fadeIn_0.2s_ease-out]"
            role="presentation"
        >
            <button
                type="button"
                aria-label="Cerrar modal de pago"
                className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm border-0 cursor-default"
                onClick={() => !isLocked && onClose?.()}
            />

            <div
                role="dialog"
                aria-modal="true"
                aria-labelledby="mp-payment-modal-title"
                className="relative z-10 w-full max-w-lg max-h-[min(92vh,720px)] flex flex-col bg-white rounded-2xl border border-slate-200/80 shadow-[0_24px_64px_rgba(2,31,65,0.18)] overflow-hidden animate-[scaleIn_0.22s_ease-out]"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="shrink-0 px-5 sm:px-6 pt-5 pb-4 border-b border-slate-100 bg-gradient-to-b from-slate-50/80 to-white">
                    <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                            <div className="flex items-center gap-2 mb-1.5">
                                <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary">
                                    <FaLock className="text-sm" />
                                </span>
                                <span className="inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-emerald-700">
                                    <FaShieldAlt className="text-[9px]" />
                                    Conexión encriptada SSL
                                </span>
                            </div>
                            <h2
                                id="mp-payment-modal-title"
                                className="font-display text-lg sm:text-xl font-bold text-dark leading-tight"
                            >
                                {success ? "¡Pago confirmado!" : "Pago Seguro con Mercado Pago"}
                            </h2>
                                {planName && !success && (
                                <p className="mt-1 text-xs sm:text-sm text-slate-500">
                                    {planName}
                                    {amount != null && (
                                        <span className="font-semibold text-dark">
                                            {" "}
                                            · {formatCurrency(amount, "es-CL", currency)}/mes
                                        </span>
                                    )}
                                </p>
                            )}
                            {!success && (
                                <p className="mt-2 text-[11px] text-slate-500 leading-relaxed">
                                    Suscripción mensual recurrente. Mercado Pago cobrará este monto cada mes de forma
                                    automática hasta que la canceles desde tu perfil.
                                </p>
                            )}
                        </div>
                        {!success && (
                            <button
                                type="button"
                                onClick={onClose}
                                disabled={isLocked}
                                className="shrink-0 inline-flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 text-slate-400 hover:text-slate-600 hover:bg-slate-50 hover:border-slate-300 transition-colors disabled:opacity-40"
                                aria-label="Cerrar"
                            >
                                <FaTimes />
                            </button>
                        )}
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto px-5 sm:px-6 py-4 sm:py-5">
                    {success ? (
                        <div className="flex flex-col items-center justify-center gap-4 py-12 text-center">
                            <span className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50 text-primary">
                                <FaCheckCircle className="text-3xl" />
                            </span>
                            <div>
                                <p className="text-base font-semibold text-dark">
                                    Tu pago fue procesado correctamente
                                </p>
                                <p className="mt-2 text-sm text-slate-500">
                                    Activando tu suscripción…
                                </p>
                            </div>
                        </div>
                    ) : (
                        <>
                            {isMercadoPagoTestMode() && (
                                <div className="mb-3 space-y-2">
                                    <p className="text-[11px] text-center text-amber-800 bg-amber-50 border border-amber-100 rounded-lg py-2 px-3">
                                        <strong>Modo prueba</strong> — paga con{" "}
                                        <strong>tarjeta</strong> (no con tu cuenta Mercado Pago real).
                                    </p>
                                    <p className="text-[11px] text-center text-slate-600 bg-slate-50 border border-slate-100 rounded-lg py-2 px-3">
                                        Titular: <strong>APRO</strong> ·{" "}
                                        <strong>5031 7557 3453 0604</strong> · CVV <strong>123</strong> ·{" "}
                                        vence <strong>11/30</strong>
                                    </p>
                                </div>
                            )}

                            <div className="relative min-h-[220px]">
                                {brickMounted && brickReady && (
                                    <MercadoPagoPaymentBrick
                                        variant="modal"
                                        amount={amount}
                                        preferenceId={preferenceId}
                                        subscriptionPaymentId={paymentId}
                                        onApproved={onApproved}
                                        onError={onError}
                                        onProcessingStart={handleProcessingStart}
                                    />
                                )}

                                {(loading || !brickReady) && (
                                    <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-3 bg-white rounded-xl">
                                        <span className="h-9 w-9 animate-spin rounded-full border-2 border-primary/25 border-t-primary" />
                                        <p className="text-sm font-medium text-slate-600">
                                            Preparando entorno de pago seguro…
                                        </p>
                                        <p className="text-xs text-slate-400 text-center max-w-xs px-4">
                                            Estableciendo conexión con Mercado Pago. No cierres esta ventana.
                                        </p>
                                    </div>
                                )}
                            </div>
                        </>
                    )}
                </div>

                <div className="shrink-0 px-5 sm:px-6 py-3 border-t border-slate-100 bg-slate-50/60">
                    <p className="text-[10px] sm:text-xs text-center text-slate-400 leading-relaxed">
                        Tus datos están protegidos por Mercado Pago. AppsFly no almacena información de tarjetas.
                    </p>
                </div>
            </div>
        </div>,
        document.body,
    );
}
