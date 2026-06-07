import { useCallback, useState } from "react";
import { createSubscriptionCheckout } from "../../api/mercadopago/mpService.js";
import { isMercadoPagoConfigured } from "../../config/mercadopago/mpConfig.js";

/**
 * Hook exclusivo Checkout Bricks — prepara preferencia y expone datos para Payment Brick.
 */
export default function useMercadoPagoCheckout() {
    const [loading, setLoading] = useState(false);
    const [checkoutData, setCheckoutData] = useState(null);
    const [error, setError] = useState(null);

    const startCheckout = useCallback(async ({ subscriptionId, subscriptionBusinessId, subscriptionPlanId }) => {
        if (!isMercadoPagoConfigured()) {
            const msg = "Mercado Pago no está configurado. Revisa VITE_MERCADO_PAGO_PUBLIC_KEY.";
            setError(msg);
            throw new Error(msg);
        }

        setLoading(true);
        setError(null);

        try {
            const res = await createSubscriptionCheckout({
                subscriptionId,
                subscriptionBusinessId,
                subscriptionPlanId,
            });
            setCheckoutData(res.data);
            return res.data;
        } catch (err) {
            const msg =
                err.response?.data?.message
                || err.message
                || "No se pudo iniciar Checkout Bricks.";
            setError(msg);
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    const clearCheckout = useCallback(() => {
        setCheckoutData(null);
        setError(null);
    }, []);

    return {
        loading,
        checkoutData,
        error,
        preferenceId: checkoutData?.preferenceId ?? null,
        paymentId: checkoutData?.paymentId ?? null,
        amount: checkoutData?.amount ?? null,
        currency: checkoutData?.currency ?? "CLP",
        planName: checkoutData?.planName ?? null,
        billingType: checkoutData?.billingType ?? "MONTHLY_RECURRING",
        startCheckout,
        clearCheckout,
        isConfigured: isMercadoPagoConfigured(),
    };
}
