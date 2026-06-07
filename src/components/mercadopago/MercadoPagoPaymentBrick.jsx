import { useCallback, useMemo, useRef, useState } from "react";
import { Payment } from "@mercadopago/sdk-react";
import { processSubscriptionPayment } from "../../api/mercadopago/mpService.js";
import { MP_PAYMENT_BRICK_CUSTOMIZATION, MP_BRICK_UI_PHASE } from "./mpBrickConfig.js";
import { isMercadoPagoTestMode } from "../../config/mercadopago/mpConfig.js";
import { getMercadoPagoStatusMessage } from "../../config/mercadopago/mpStatusMessages.js";

/**
 * Payment Brick — Checkout Bricks Mercado Pago Chile.
 * @see https://www.mercadopago.cl/developers/es/docs/checkout-bricks/payment-brick/default-rendering
 */
export default function MercadoPagoPaymentBrick({
    amount,
    preferenceId,
    subscriptionPaymentId,
    onApproved,
    onError,
    onProcessingStart,
    variant = "inline",
}) {
    const [phase, setPhase] = useState(MP_BRICK_UI_PHASE.LOADING);
    const [inlineError, setInlineError] = useState(null);
    const errorNotifiedRef = useRef(false);

    const initialization = useMemo(
        () => ({
            amount: Math.round(Number(amount)),
            preferenceId,
        }),
        [amount, preferenceId],
    );

    const brickSessionKey = preferenceId && subscriptionPaymentId
        ? `${preferenceId}-${subscriptionPaymentId}`
        : "mp-brick-pending";

    const notifyErrorOnce = useCallback(
        (err) => {
            if (errorNotifiedRef.current) return;
            errorNotifiedRef.current = true;
            onError?.(err);
        },
        [onError],
    );

    const handleReady = useCallback(() => {
        setPhase(MP_BRICK_UI_PHASE.READY);
    }, []);

    const handleError = useCallback(
        (error) => {
            setPhase(MP_BRICK_UI_PHASE.ERROR);
            console.error("[MercadoPagoPaymentBrick]", error);
            // Errores del SDK/iframes: no toast en padre (evita loops de re-render).
        },
        [],
    );

    const handleSubmit = useCallback(
        async ({ selectedPaymentMethod, formData }) => {
            setPhase(MP_BRICK_UI_PHASE.PROCESSING);
            setInlineError(null);
            errorNotifiedRef.current = false;
            onProcessingStart?.();

            try {
                const res = await processSubscriptionPayment({
                    subscriptionPaymentId,
                    formData,
                    selectedPaymentMethod,
                });

                if (res.data?.payment?.status === "APPROVED") {
                    setPhase(MP_BRICK_UI_PHASE.APPROVED);
                    onApproved?.(res.data);
                    return;
                }

                const statusDetail = res.data?.mpPayment?.status_detail;
                const message = getMercadoPagoStatusMessage(statusDetail, {
                    testMode: isMercadoPagoTestMode(),
                });

                const err = new Error(message);
                err.statusDetail = statusDetail;
                setInlineError(message);
                setPhase(MP_BRICK_UI_PHASE.ERROR);
                notifyErrorOnce(err);
                throw err;
            } catch (err) {
                setPhase(MP_BRICK_UI_PHASE.ERROR);
                if (!err.statusDetail) {
                    const message =
                        err.response?.data?.message
                        || err.message
                        || "No se pudo procesar el pago.";
                    setInlineError(message);
                    notifyErrorOnce(err);
                }
                throw err;
            }
        },
        [subscriptionPaymentId, onApproved, notifyErrorOnce, onProcessingStart],
    );

    if (!preferenceId || !amount) {
        return null;
    }

    const isModal = variant === "modal";

    return (
        <div className={isModal ? "space-y-3" : "mt-3 space-y-2"}>
            {phase === MP_BRICK_UI_PHASE.PROCESSING && (
                <p className={`text-center text-secondary font-medium animate-pulse ${isModal ? "text-sm" : "text-[11px]"}`}>
                    Procesando pago con Mercado Pago…
                </p>
            )}
            {phase === MP_BRICK_UI_PHASE.APPROVED && (
                <p className={`text-center text-primary font-semibold ${isModal ? "text-sm" : "text-[11px]"}`}>
                    Pago aprobado. Activando suscripción…
                </p>
            )}
            {inlineError && (
                <p className={`text-center text-red-600 bg-red-50 border border-red-100 rounded-lg py-2 px-3 ${isModal ? "text-xs" : "text-[11px]"}`}>
                    {inlineError}
                </p>
            )}
            <div
                className={
                    isModal
                        ? "rounded-xl border border-slate-100 bg-white p-1 min-h-[200px]"
                        : "rounded-lg border border-slate-200 bg-white p-2 min-h-[120px]"
                }
            >
                <Payment
                    key={brickSessionKey}
                    initialization={initialization}
                    customization={MP_PAYMENT_BRICK_CUSTOMIZATION}
                    onSubmit={handleSubmit}
                    onReady={handleReady}
                    onError={handleError}
                />
            </div>
        </div>
    );
}
