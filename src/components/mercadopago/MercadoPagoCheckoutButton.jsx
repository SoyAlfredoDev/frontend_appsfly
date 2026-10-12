import { useCallback, useState } from "react";
import { FaArrowRight, FaCreditCard, FaSpinner } from "react-icons/fa";
import { v4 as uuidv4 } from "uuid";
import { createSubscriptionCheckout } from "../../api/mercadopago/mpService.js";

/**
 * Start y Pro crean una suscripción propia en Mercado Pago y abren su init_point.
 */
export default function MercadoPagoCheckoutButton({
    plan,
    businessId,
    disabled = false,
    onError,
    buttonLabel = "Pagar con Mercado Pago",
    buttonId,
}) {
    const [redirecting, setRedirecting] = useState(false);
    const unavailable = disabled || !businessId || redirecting;

    const handleSubscribe = useCallback(async () => {
        if (unavailable) return;
        setRedirecting(true);

        try {
            const res = await createSubscriptionCheckout({
                subscriptionId: uuidv4(),
                subscriptionBusinessId: businessId,
                subscriptionPlanId: plan.planId,
            });
            const checkoutUrl = res.data?.checkoutUrl;
            if (!checkoutUrl) {
                throw new Error("Mercado Pago no devolvió el link de suscripción.");
            }
            window.location.assign(checkoutUrl);
        } catch (error) {
            setRedirecting(false);
            onError?.(error);
        }
    }, [unavailable, businessId, plan?.planId, onError]);

    return (
        <>
            <button
                id={buttonId}
                type="button"
                onClick={handleSubscribe}
                disabled={unavailable}
                className={`group w-full py-2 px-3 rounded-lg font-bold text-xs text-white shadow-md shadow-green-500/20 transition-all duration-200 flex items-center justify-center gap-1.5 ${
                    unavailable
                        ? "bg-gray-100 cursor-not-allowed text-gray-400 shadow-none"
                        : "bg-[#01c676] hover:bg-[#00b067] hover:-translate-y-0.5"
                }`}
            >
                {redirecting ? (
                    <>
                        <FaSpinner className="animate-spin" />
                        Abriendo Mercado Pago…
                    </>
                ) : (
                    <>
                        <FaCreditCard />
                        {buttonLabel}
                        <FaArrowRight className="text-[10px] transition-transform group-hover:translate-x-1" />
                    </>
                )}
            </button>
        </>
    );
}
