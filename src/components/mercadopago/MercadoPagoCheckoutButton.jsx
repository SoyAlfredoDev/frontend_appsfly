import { useCallback } from "react";
import { FaArrowRight, FaCreditCard } from "react-icons/fa";
import { usePaymentModal } from "../../context/paymentModalContext.jsx";
import { isMercadoPagoConfigured } from "../../config/mercadopago/mpConfig.js";
import { checkoutUrlForPlan } from "../../utils/subscriptionCheckoutLinks.ts";

/**
 * Start y Pro abren su link de Mercado Pago. Los demás planes siguen al checkout interno.
 */
export default function MercadoPagoCheckoutButton({
    plan,
    businessId,
    compact = false,
    disabled = false,
    onError,
    onSuccess,
    refreshSubscriptions,
    buttonLabel = "Pagar con Mercado Pago",
    buttonId,
}) {
    const { openCheckoutModal, isPaymentModalOpen } = usePaymentModal();
    const checkoutUrl = checkoutUrlForPlan(plan?.planId, plan?.checkoutUrl);
    const isConfigured = Boolean(checkoutUrl) || isMercadoPagoConfigured();

    const handleOpenPaymentModal = useCallback(() => {
        if (disabled || !isConfigured || isPaymentModalOpen) return;

        openCheckoutModal({
            plan,
            businessId,
            onSuccess,
            onError,
            refreshSubscriptions,
        }).catch(() => {});
    }, [
        disabled,
        isConfigured,
        isPaymentModalOpen,
        openCheckoutModal,
        plan,
        businessId,
        onSuccess,
        onError,
        refreshSubscriptions,
    ]);

    if (checkoutUrl) {
        return (
            <a
                id={buttonId}
                href={disabled ? undefined : checkoutUrl}
                target="_blank"
                rel="noopener noreferrer"
                aria-disabled={disabled}
                className={`group w-full py-2 px-3 rounded-lg font-bold text-xs text-white shadow-md shadow-green-500/20 transition-all duration-200 flex items-center justify-center gap-1.5 ${
                    disabled
                        ? "bg-gray-100 cursor-not-allowed text-gray-400 shadow-none pointer-events-none"
                        : "bg-[#01c676] hover:bg-[#00b067] hover:-translate-y-0.5"
                }`}
            >
                <FaCreditCard />
                {buttonLabel}
                <FaArrowRight className="text-[10px] transition-transform group-hover:translate-x-1" />
            </a>
        );
    }

    return (
        <>
            <button
                id={buttonId}
                type="button"
                onClick={handleOpenPaymentModal}
                disabled={disabled || !isConfigured || isPaymentModalOpen}
                className={`group w-full py-2 px-3 rounded-lg font-bold text-xs text-white shadow-md shadow-green-500/20 transition-all duration-200 flex items-center justify-center gap-1.5 ${
                    disabled || !isConfigured || isPaymentModalOpen
                        ? "bg-gray-100 cursor-not-allowed text-gray-400 shadow-none"
                        : "bg-[#01c676] hover:bg-[#00b067] hover:-translate-y-0.5"
                }`}
            >
                {isPaymentModalOpen ? (
                    "Preparando pago seguro…"
                ) : (
                    <>
                        <FaCreditCard />
                        {buttonLabel}
                        <FaArrowRight className="text-[10px] transition-transform group-hover:translate-x-1" />
                    </>
                )}
            </button>

            {!isConfigured && !compact && (
                <p className="mt-2 text-[10px] text-amber-600 text-center">
                    Mercado Pago no configurado. Revisa VITE_MERCADO_PAGO_PUBLIC_KEY.
                </p>
            )}
        </>
    );
}
